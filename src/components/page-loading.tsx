import { Loader2 } from "lucide-react";

/** Suspense fallback shown while a route segment's server data is loading (src/app/**\/loading.tsx). */
export function PageLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm">Carregando…</p>
      </div>
    </main>
  );
}
