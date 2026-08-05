"use server";

import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { uploadDocument } from "@/infrastructure/storage/document-storage";
import { ONBOARDING_CONFIG } from "@/config/engine/onboarding";
import { personalDataSchema, targetContextSchema } from "./schemas";
import { isAccountDeletionPending } from "@/lib/account-status";
import { trackEvent } from "@/infrastructure/analytics";
import { ANALYTICS_EVENTS } from "@/infrastructure/analytics/events";

export interface OnboardingActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/onboarding");
  return { supabase, user };
}

export async function savePersonalDataAction(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const parsed = personalDataSchema.safeParse({
    fullName: formData.get("fullName"),
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return { fieldErrors: { fullName: flat.fullName?.[0] ?? "" } };
  }

  const { supabase, user } = await requireUser();
  // Personal data is stored separately from professional data (RN-ONB-014)
  // and is never sent to the AI or used in scoring (RN-ONB-004).
  const { error } = await supabase.from("personal_data").upsert(
    {
      user_id: user.id,
      full_name: parsed.data.fullName,
      city: parsed.data.city ?? null,
      state: parsed.data.state ?? null,
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: "Não foi possível salvar seus dados agora. Tente novamente." };

  revalidatePath("/onboarding");
  redirect("/onboarding");
}

/** RF-ONB-021..038 / RF-ONB-039..051 — résumé and LinkedIn upload share one path. */
export async function uploadDocumentAction(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const documentType = formData.get("documentType");
  if (documentType !== "resume" && documentType !== "linkedin") {
    return { error: "Tipo de documento inválido." };
  }

  const file = formData.get("file");
  const pastedText = formData.get("pastedText");
  const hasFile = file instanceof File && file.size > 0;
  const hasText = typeof pastedText === "string" && pastedText.trim().length > 0;

  if (!hasFile && !hasText) {
    return { error: "Envie um arquivo ou cole o conteúdo em texto." };
  }

  const { supabase, user } = await requireUser();

  if (await isAccountDeletionPending(supabase, user.id)) {
    return { error: "Sua conta está em processo de exclusão. Não é possível enviar novos documentos." };
  }

  const documentId = randomUUID();

  let storagePath: string | null = null;
  let contentHash: string;
  let mimeType: string;
  let sizeBytes: number;
  let originalFilename: string | null = null;
  let sourceType: "file_upload" | "pasted_text";

  if (hasFile) {
    const uploadedFile = file as File;
    const extension = uploadedFile.name.split(".").pop()?.toLowerCase() ?? "";
    const allowedExtensions: readonly string[] = ONBOARDING_CONFIG.documents.allowedExtensions;
    if (!allowedExtensions.includes(extension)) {
      return { error: "Formato de arquivo não suportado. Envie PDF, DOCX ou cole o conteúdo em texto." };
    }
    if (uploadedFile.size > ONBOARDING_CONFIG.documents.maxFileSizeMb * 1024 * 1024) {
      return { error: `O arquivo excede o limite de ${ONBOARDING_CONFIG.documents.maxFileSizeMb} MB.` };
    }
    const buffer = Buffer.from(await uploadedFile.arrayBuffer());
    contentHash = createHash("sha256").update(buffer).digest("hex");
    mimeType = uploadedFile.type || "application/octet-stream";
    sizeBytes = uploadedFile.size;
    originalFilename = uploadedFile.name.slice(0, ONBOARDING_CONFIG.documents.maxOriginalFileNameCharacters);
    sourceType = "file_upload";

    const { path } = await uploadDocument(supabase, {
      userId: user.id,
      documentId,
      filename: originalFilename,
      file: new Blob([buffer], { type: mimeType }),
      contentType: mimeType,
    });
    storagePath = path;
  } else {
    const text = (pastedText as string).slice(0, ONBOARDING_CONFIG.documents.maxPastedTextCharacters);
    contentHash = createHash("sha256").update(text).digest("hex");
    mimeType = "text/plain";
    sizeBytes = Buffer.byteLength(text);
    sourceType = "pasted_text";

    // Pasted text goes to storage like any upload: extraction runs in a later
    // request now, so in-memory content from this one is no longer reachable.
    const { path } = await uploadDocument(supabase, {
      userId: user.id,
      documentId,
      filename: "conteudo-colado.txt",
      file: new Blob([text], { type: mimeType }),
      contentType: mimeType,
    });
    storagePath = path;
  }

  // Replacing a document creates a new row rather than mutating an existing
  // one, matching RF-ONB-034/048 ("substituição registra nova origem
  // documental") — the old row is superseded, never rewritten in place.
  await supabase
    .from("documents")
    .update({ status: "deleted", deleted_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("document_type", documentType)
    .neq("status", "deleted");

  const { error: insertError } = await supabase.from("documents").insert({
    id: documentId,
    user_id: user.id,
    document_type: documentType,
    source_type: sourceType,
    storage_path: storagePath,
    original_filename: originalFilename,
    mime_type: mimeType,
    size_bytes: sizeBytes,
    content_hash: contentHash,
    status: "queued",
  });
  if (insertError) return { error: "Não foi possível registrar o documento agora. Tente novamente." };

  trackEvent(documentType === "resume" ? ANALYTICS_EVENTS.resumeUploaded : ANALYTICS_EVENTS.linkedinUploaded, {
    userId: user.id,
    properties: { documentType },
  });

  // No extraction here: the upload steps only persist, so the user advances
  // immediately. Processing runs through features/onboarding/pipeline.ts —
  // started in the background by BackgroundPrewarm as soon as the next step
  // renders, and finished by the completion screen.
  revalidatePath("/onboarding");
  redirect("/onboarding");
}

export async function saveTargetContextAction(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const parsed = targetContextSchema.safeParse({
    targetArea: formData.get("targetArea"),
    targetRole: formData.get("targetRole"),
    desiredSeniority: formData.get("desiredSeniority"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      fieldErrors: {
        targetArea: flat.targetArea?.[0] ?? "",
        targetRole: flat.targetRole?.[0] ?? "",
        desiredSeniority: flat.desiredSeniority?.[0] ?? "",
      },
    };
  }

  const { supabase, user } = await requireUser();
  let { data: targetContext } = await supabase
    .from("target_contexts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!targetContext) {
    const { data: created } = await supabase
      .from("target_contexts")
      .insert({ user_id: user.id, status: "draft" })
      .select("id")
      .single();
    targetContext = created;
  }
  if (!targetContext) return { error: "Não foi possível salvar seu contexto-alvo agora." };

  const { count } = await supabase
    .from("target_context_versions")
    .select("id", { count: "exact", head: true })
    .eq("target_context_id", targetContext.id);

  const { data: version } = await supabase
    .from("target_context_versions")
    .insert({
      target_context_id: targetContext.id,
      version_number: (count ?? 0) + 1,
      target_area: parsed.data.targetArea,
      target_role: parsed.data.targetRole,
      desired_seniority: parsed.data.desiredSeniority,
      confirmation_status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (version) {
    await supabase
      .from("target_contexts")
      .update({ status: "confirmed", current_version_id: version.id })
      .eq("id", targetContext.id);
    trackEvent(ANALYTICS_EVENTS.targetRoleDefined, { userId: user.id });
  }

  revalidatePath("/onboarding");
  redirect("/onboarding");
}
