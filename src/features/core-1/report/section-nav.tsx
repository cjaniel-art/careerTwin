"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  ListChecks,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReportSection {
  id: string;
  label: string;
}

/**
 * Ícones resolvidos por id DENTRO do client component — nunca via prop vinda de um
 * Server Component: referências de função/componente não sobrevivem à serialização
 * do RSC boundary (chegavam como `undefined` no cliente quando passadas em `sections`).
 */
const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "visao-geral": ArrowLeftRight,
  dimensoes: BarChart3,
  forcas: Sparkles,
  lacunas: AlertTriangle,
  recomendacoes: ListChecks,
  "plano-evolucao": TrendingUp,
  inconsistencias: ShieldAlert,
};

/** §5 — navegação secundária por âncoras (com ícone + label), destaque sutil da seção visível (scroll spy). */
export function SectionNav({ sections }: { sections: ReportSection[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {sections.map((s) => {
        const Icon = SECTION_ICONS[s.id];
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={cn(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active === s.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon ? <Icon className="size-4" aria-hidden /> : null}
            {s.label}
          </a>
        );
      })}
    </nav>
  );
}
