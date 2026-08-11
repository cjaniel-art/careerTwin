import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAnalysisHistory } from "@/features/history/get-history";

export const metadata = { title: "Histórico — CareerTwin" };
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/historico");

  const history = await getAnalysisHistory(supabase, user.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Histórico de análises</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Todas as suas análises de perfil e diagnósticos de aderência, mais recentes primeiro. Análises
        concluídas são imutáveis.
      </p>

      <div className="mt-6 space-y-3">
        {history.length > 0 ? (
          history.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.dateLabel} · {item.statusLabel}
                    {item.scoreLabel ? ` · ${item.scoreLabel}` : null}
                  </p>
                </div>
                {item.isCompleted ? (
                  <Button asChild size="sm" variant="secondary">
                    <Link href={item.href}>Ver resultado</Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma análise ainda.</p>
        )}
      </div>
    </main>
  );
}
