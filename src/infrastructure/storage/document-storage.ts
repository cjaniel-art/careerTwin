import type { SupabaseClient } from "@supabase/supabase-js";

export const TEMPORARY_DOCUMENTS_BUCKET = "temporary-documents";

/**
 * Path convention enforced by storage.objects RLS policies (see
 * supabase/migrations/20260101000014_storage_bucket.sql): the first path
 * segment must equal auth.uid(), or the insert/select is rejected by Postgres
 * regardless of what the client claims.
 */
export function documentStoragePath(userId: string, documentId: string, filename: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return `${userId}/${documentId}/${safeName}`;
}

/**
 * Uploads a document to the private bucket using the caller's own
 * (RLS-scoped) Supabase client — never a service-role client. If `userId`
 * doesn't match the session, Postgres rejects the write; the check here is
 * defense in depth, not the actual enforcement boundary.
 */
export async function uploadDocument(
  supabase: SupabaseClient,
  params: { userId: string; documentId: string; filename: string; file: Blob; contentType: string },
): Promise<{ path: string }> {
  const path = documentStoragePath(params.userId, params.documentId, params.filename);
  const { error } = await supabase.storage.from(TEMPORARY_DOCUMENTS_BUCKET).upload(path, params.file, {
    contentType: params.contentType,
    upsert: false,
  });
  if (error) throw error;
  return { path };
}

/** Short-lived signed URL — never a permanent public link (Segurança §11). */
export async function getSignedDownloadUrl(
  supabase: SupabaseClient,
  path: string,
  expiresInSeconds = 120,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(TEMPORARY_DOCUMENTS_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data) throw error ?? new Error("Failed to create signed URL");
  return data.signedUrl;
}

export async function deleteDocument(supabase: SupabaseClient, path: string): Promise<void> {
  const { error } = await supabase.storage.from(TEMPORARY_DOCUMENTS_BUCKET).remove([path]);
  if (error) throw error;
}
