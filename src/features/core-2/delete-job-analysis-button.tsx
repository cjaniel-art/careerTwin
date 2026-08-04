"use client";

import { useRef } from "react";
import { Trash2 } from "lucide-react";
import { deleteJobAnalysisAction } from "./actions";

export function DeleteJobAnalysisButton({ analysisId }: { analysisId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={deleteJobAnalysisAction}>
      <input type="hidden" name="analysisId" value={analysisId} />
      <button
        type="submit"
        aria-label="Excluir análise"
        className="text-destructive hover:opacity-80"
        onClick={(e) => {
          if (!window.confirm("Excluir esta análise? Essa ação não pode ser desfeita.")) {
            e.preventDefault();
          }
        }}
      >
        <Trash2 className="size-6" />
      </button>
    </form>
  );
}
