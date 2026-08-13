import { CreateJobAnalysisSheet } from "@/features/core-2/create-job-analysis-sheet";

export function DashboardPageHeader({ hasCredits }: { hasCredits: boolean }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Dashboard</h1>
      <div className="shrink-0">
        <CreateJobAnalysisSheet hasCredits={hasCredits} triggerLabel="Analisar nova vaga" />
      </div>
    </div>
  );
}
