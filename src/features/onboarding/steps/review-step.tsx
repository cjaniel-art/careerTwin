import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { ensureProfileDraft, confirmProfileAction } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddExperienceForm } from "./add-experience-form";

export async function ReviewStep({ userId }: { userId: string }) {
  const supabase = await createSupabaseServerClient();

  let { data: profile } = await supabase
    .from("professional_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  let { data: draftVersion } = profile
    ? await supabase
        .from("profile_versions")
        .select("id")
        .eq("profile_id", profile.id)
        .eq("status", "draft")
        .maybeSingle()
    : { data: null };

  if (!profile || !draftVersion) {
    await ensureProfileDraft();
    ({ data: profile } = await supabase.from("professional_profiles").select("id").eq("user_id", userId).single());
    ({ data: draftVersion } = await supabase
      .from("profile_versions")
      .select("id")
      .eq("profile_id", profile!.id)
      .eq("status", "draft")
      .single());
  }

  const { data: experiences } = await supabase
    .from("experiences")
    .select("id, company_name, role_title, description, confirmation_status")
    .eq("profile_version_id", draftVersion!.id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Revise seu perfil</h2>
            <p className="text-sm text-muted-foreground">
              Confirme se estas informações representam corretamente sua trajetória. As próximas análises
              utilizarão esta versão do perfil. Você pode adicionar experiências que não foram identificadas
              automaticamente.
            </p>
          </div>

          {experiences && experiences.length > 0 ? (
            <ul className="space-y-3">
              {experiences.map((exp) => (
                <li key={exp.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {exp.role_title} · {exp.company_name}
                    </p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      {exp.confirmation_status === "added" ? "adicionado por você" : "identificado automaticamente"}
                    </span>
                  </div>
                  {exp.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{exp.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-md bg-secondary p-3 text-sm text-muted-foreground">
              Não identificamos experiências estruturadas automaticamente a partir dos materiais enviados.
              Adicione manualmente abaixo antes de confirmar.
            </p>
          )}
        </CardContent>
      </Card>

      <AddExperienceForm />

      <form action={confirmProfileAction}>
        <Button type="submit" disabled={!experiences || experiences.length === 0}>
          Confirmar perfil
        </Button>
      </form>
    </div>
  );
}
