import { redirect } from "next/navigation";
import { BarChart3, UserPlus, Sparkles, Wrench } from "lucide-react";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { isAdminEmail } from "@/lib/admin";
import {
  getExecutiveDashboardMetrics,
  getOnboardingDashboardMetrics,
  getProductDashboardMetrics,
  getTechnicalDashboardMetrics,
} from "@/infrastructure/database/admin-metrics";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AdminTabsList, AdminTabsTrigger } from "@/features/admin/admin-ui";
import { ExecutiveTab } from "@/features/admin/executive-tab";
import { OnboardingTab } from "@/features/admin/onboarding-tab";
import { ProductTab } from "@/features/admin/product-tab";
import { TechnicalTab } from "@/features/admin/technical-tab";
import { PeriodFilter } from "@/features/admin/period-filter";
import { daysForPeriod, labelForPeriod, type PeriodValue } from "@/features/admin/period";

export const metadata = { title: "Dashboard executivo — CareerTwin" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/admin");
  if (!isAdminEmail(user.email)) redirect("/app/dashboard");

  const { period } = await searchParams;
  const days = daysForPeriod(period);

  const [executive, onboarding, product, technical] = await Promise.all([
    getExecutiveDashboardMetrics(days),
    getOnboardingDashboardMetrics(days),
    getProductDashboardMetrics(days),
    getTechnicalDashboardMetrics(days),
  ]);

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboards administrativos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dados agregados do banco operacional — não usa eventos de analytics como fonte (ver Analytics §2).
        </p>
      </div>

      <Tabs defaultValue="executivo" className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 border-b border-border">
          <AdminTabsList className="w-auto flex-1 border-b-0">
            <AdminTabsTrigger value="executivo">
              <BarChart3 className="size-4" aria-hidden />
              Executivo
            </AdminTabsTrigger>
            <AdminTabsTrigger value="onboarding">
              <UserPlus className="size-4" aria-hidden />
              Onboarding
            </AdminTabsTrigger>
            <AdminTabsTrigger value="produto">
              <Sparkles className="size-4" aria-hidden />
              Produto e IA
            </AdminTabsTrigger>
            <AdminTabsTrigger value="tecnico">
              <Wrench className="size-4" aria-hidden />
              Técnico
            </AdminTabsTrigger>
          </AdminTabsList>
          <PeriodFilter value={(period as PeriodValue) ?? "month"} />
        </div>

        <TabsContent value="executivo">
          <ExecutiveTab metrics={executive} periodLabel={labelForPeriod(period)} />
        </TabsContent>
        <TabsContent value="onboarding">
          <OnboardingTab metrics={onboarding} />
        </TabsContent>
        <TabsContent value="produto">
          <ProductTab metrics={product} />
        </TabsContent>
        <TabsContent value="tecnico">
          <TechnicalTab metrics={technical} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
