import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Official CareerTwin mark: the symbol is the real vector asset exported
 * from the approved Figma file (public/logo-icon.svg) — never redrawn or
 * simulated (see docs/implementation/open-decisions.md #7, resolved
 * 30/07/2026). "CareerTwin" itself is real text (Inter Semibold), not a
 * vectorized wordmark image, for accessibility/selectability/lighter weight.
 */
export function Wordmark({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image src="/logo-icon.svg" alt="" width={28} height={27} className={cn("shrink-0", iconClassName)} />
      <span className="text-lg font-semibold tracking-tight">
        Career<span className="text-primary">Twin</span>
      </span>
    </span>
  );
}
