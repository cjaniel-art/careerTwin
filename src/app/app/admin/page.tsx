import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { isAdminEmail } from "@/lib/admin";
import {
  getExecutiveDashboardMetrics,
  getOnboardingDashboardMetrics,
  getProductDashboardMetrics,
  getTechnicalDashboardMetrics,
} from "@/infrastructure/database/admin-metrics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExecutiveTab } from "@/features/admin/executive-tab";
import { OnboardingTab } from "@/features/admin/onboarding-tab";
import { ProductTab } from "@/features/admin/product-tab";
import { TechnicalTab } from "@/features/admin/technical-tab";

export const metadata = { title: "Dashboard executivo — CareerTwin" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/admin");
  if (!isAdminEmail(user.email)) redirect("/app/dashboard");

  const [executive, onboarding, product, technical] = await Promise.all([
    getExecutiveDashboardMetrics(),
    getOnboardingDashboardMetrics(),
    getProductDashboardMetrics(),
    getTechnicalDashboardMetrics(),
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
        <TabsList>
          <TabsTrigger value="executivo">Executivo</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="produto">Produto e IA</TabsTrigger>
          <TabsTrigger value="tecnico">Técnico</TabsTrigger>
        </TabsList>

        <TabsContent value="executivo">
          <ExecutiveTab metrics={executive} />
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
