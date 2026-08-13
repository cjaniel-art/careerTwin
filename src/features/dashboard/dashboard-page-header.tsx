import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardPageHeader() {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Dashboard</h1>
      <Button asChild size="lg" className="shrink-0">
        <Link href="/app/aderencia">
          <Plus className="size-4" aria-hidden />
          Analisar nova vaga
        </Link>
      </Button>
    </div>
  );
}
