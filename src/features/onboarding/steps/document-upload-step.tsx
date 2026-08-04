"use client";

import { useActionState, useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { uploadDocumentAction, type OnboardingActionState } from "../actions";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { OnboardingStepHeader } from "../onboarding-step-header";
import { OnboardingStepFooter } from "../onboarding-step-footer";
import type { OnboardingStepId } from "../step-config";
import type { DocumentSummary } from "../get-state";

const initialState: OnboardingActionState = {};

export function DocumentUploadStep({
  documentType,
  activeStep,
  backHref,
  completedSteps,
  heading,
  subheading,
  dropzoneTitle,
  contentLabel,
  contentPlaceholder,
  existingDocument,
}: {
  documentType: "resume" | "linkedin";
  activeStep: OnboardingStepId;
  backHref: string;
  completedSteps: OnboardingStepId[];
  heading: string;
  subheading: string;
  dropzoneTitle: string;
  contentLabel: string;
  contentPlaceholder: string;
  existingDocument: DocumentSummary | null;
}) {
  const [state, formAction] = useActionState(uploadDocumentAction, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const displayedFileName = fileName ?? (pastedText ? null : existingDocument?.originalFilename ?? null);
  const hasNewInput = Boolean(fileName || pastedText.trim());

  function assignFile(file: File) {
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
    }
    setFileName(file.name);
    setPastedText("");
  }

  function clearFile() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFileName(null);
  }

  return (
    <>
      <OnboardingStepHeader activeStep={activeStep} completedSteps={completedSteps} backHref={backHref} />
      <form action={formAction} className="flex flex-1 flex-col" noValidate>
        <input type="hidden" name="documentType" value={documentType} />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-extrabold leading-8 text-foreground">{heading}</h1>
            <p className="text-base leading-6 text-foreground">{subheading}</p>
          </div>

          {state.error ? (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) assignFile(file);
            }}
            className={`flex h-[231px] flex-col items-center justify-center gap-6 rounded-lg border border-dashed p-12 transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <input
              ref={fileInputRef}
              id="file"
              name="file"
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) assignFile(file);
              }}
            />
            {displayedFileName ? (
              <div className="flex w-full max-w-[384px] items-center gap-3 rounded-md border border-border bg-background px-4 py-3">
                <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="flex-1 truncate text-sm text-foreground">{displayedFileName}</span>
                <button
                  type="button"
                  onClick={clearFile}
                  aria-label="Remover arquivo"
                  className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex w-full max-w-[384px] flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Upload className="size-6" aria-hidden />
                  </div>
                  <p className="text-lg font-medium text-card-foreground">{dropzoneTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    Arraste o arquivo para esta área
                    <br />
                    ou selecione-o no seu dispositivo.
                  </p>
                  <p className="text-xs text-muted-foreground">PDF ou DOCX, até 10 MB.</p>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Selecionar arquivo
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="px-2 text-xs text-muted-foreground">ou cole o conteúdo abaixo</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            <Label htmlFor="pastedText">{contentLabel}</Label>
            <textarea
              id="pastedText"
              name="pastedText"
              maxLength={100_000}
              value={pastedText}
              onChange={(e) => {
                setPastedText(e.target.value);
                if (e.target.value) clearFile();
              }}
              className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder={contentPlaceholder}
            />
          </div>
        </div>

        <OnboardingStepFooter
          backHref={backHref}
          continueSlot={
            hasNewInput || !existingDocument ? (
              <SubmitButton className="h-9 flex-1 rounded-lg">Continuar</SubmitButton>
            ) : (
              // Plain <a> (not next/link Link): forces a full navigation so the router cache can't
              // serve a stale RSC payload from before this step's data was saved.
              <Button asChild className="h-9 flex-1 rounded-lg">
                <a href="/onboarding">Continuar</a>
              </Button>
            )
          }
        />
      </form>
    </>
  );
}
