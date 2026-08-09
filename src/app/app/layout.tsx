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
        // width even though marketing/auth pages stay capped.
        className="w-screen max-w-none relative left-1/2 -translate-x-1/2"
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
