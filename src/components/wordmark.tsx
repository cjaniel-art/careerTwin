import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Official CareerTwin logo — the exact vector files provided by the Product
 * Owner (public/logo-light.svg, public/logo-dark.svg), never redrawn or
 * simulated (docs/implementation/open-decisions.md #7, resolved 30/07/2026).
 * Two variants because the mark is a single flattened asset (symbol +
 * wordmark), not separable layers: "light" (white text) for dark
 * backgrounds, "dark" (black text) for light backgrounds.
 */
export function Wordmark({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const src = variant === "light" ? "/logo-light.svg" : "/logo-dark.svg";
  const [width, height] = variant === "light" ? [276, 67] : [232, 56];
  return (
    <Image
      src={src}
      alt="CareerTwin"
      width={width}
      height={height}
      className={cn("h-8 w-auto", className)}
    />
  );
}
