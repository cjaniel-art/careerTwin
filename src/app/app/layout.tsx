import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <ThemeProvider>
      <SidebarProvider
        // Breaks out of the root layout's `mx-auto max-w-content` (1440px cap,
        // src/app/layout.tsx) — the app shell should use the full viewport
        // width even though marketing/auth pages stay capped. Uses a
        // margin-based full-bleed (not `transform`/`translate`): a transform
        // on this ancestor would create a new containing block for its
        // `position: fixed` sidebar descendant, breaking the sidebar's fixed
        // positioning and making it scroll away with the page.
        className="w-screen max-w-none ml-[calc(50%-50vw)]"
        style={
          {
            "--sidebar-width": "226px",
            "--sidebar-width-icon": "82px",
          } as React.CSSProperties
        }
      >
        <AppSidebar userEmail={user.email ?? ""} variant="sidebar" />
        <SidebarInset>
          <AppHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
