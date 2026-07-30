import { cn } from "@/lib/utils";

/**
 * Temporary text wordmark — no official CareerTwin logo files exist in the
 * repository (see docs/implementation/open-decisions.md #7, `missing_asset`).
 * Per "Leitura do estilo visual" this is a placeholder only: plain text, no
 * icon/symbol simulation, no attempt to imitate the real mark. Replace with
 * the official SVG/PNG assets (via next/image, object-fit: contain) as soon
 * as they are provided.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("text-lg font-semibold tracking-tight text-foreground", className)}>
      Career<span className="text-primary">Twin</span>
    </span>
  );
}
