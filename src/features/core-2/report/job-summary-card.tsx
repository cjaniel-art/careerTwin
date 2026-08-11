import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function initialsFor(company: string): string {
  const parts = company.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0]![0]! + (parts[1]?.[0] ?? "")).toUpperCase();
}

export interface JobSummary {
  title: string;
  company: string;
  companyLogo?: string;
  location?: string;
  workModel?: string;
  url?: string;
  date?: string;
}

/**
 * §3 — location/workModel são opcionais porque o schema de estruturação da
 * vaga (opportunityStructureSchema) não os extrai hoje; o card só renderiza
 * o que existir, sem inventar dado ausente. `url` vem de
 * opportunity_versions.reference_url (nulo no fluxo de colar texto atual).
 */
export function JobSummaryCard({ job, date }: { job: JobSummary; date: string | null }) {
  const subtitle = [job.location, job.workModel].filter(Boolean).join(" · ");

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-11 rounded-lg">
            {job.companyLogo ? <AvatarImage src={job.companyLogo} alt="" /> : null}
            <AvatarFallback className="rounded-lg text-sm font-semibold">{initialsFor(job.company)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-semibold text-foreground">{job.title}</p>
            <p className="text-sm text-muted-foreground">
              {job.company}
              {subtitle ? ` · ${subtitle}` : null}
            </p>
            {job.url ? (
              <Link
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {job.url}
                <ExternalLink className="size-3" aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {date ? (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Data da vaga</p>
              <p className="text-sm font-medium text-foreground">{date}</p>
            </div>
          ) : null}
          {job.url ? (
            <Button asChild variant="secondary" size="sm">
              <Link href={job.url} target="_blank" rel="noopener noreferrer">
                Ver vaga original
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
