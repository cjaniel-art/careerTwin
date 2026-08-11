"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, FileText, Loader2, RefreshCw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetCircleClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  uploadReanalysisDocumentAction,
  saveReanalysisTargetContextAction,
  type OnboardingActionState,
} from "@/features/onboarding/actions";
import { TARGET_AREA_OPTIONS, SENIORITY_OPTIONS } from "@/features/onboarding/schemas";
import { runStageToCompletion, ANALYSIS_STAGE_POLL_OPTIONS } from "@/features/onboarding/run-stage";

const EMPTY_STATE: OnboardingActionState = {};

type SheetStep = "resume" | "linkedin" | "target-context" | "processing";

const STEP_TITLES: Record<SheetStep, string> = {
  resume: "Atualizar currículo",
  linkedin: "Atualizar LinkedIn",
  "target-context": "Objetivo profissional",
  processing: "Reanalisando seu perfil",
};

type SheetFormStep = Exclude<SheetStep, "processing">;

const STEP_ORDER: SheetFormStep[] = ["resume", "linkedin", "target-context"];
const STEP_LABELS: Record<SheetFormStep, string> = {
  resume: "Currículo",
  linkedin: "LinkedIn",
  "target-context": "Objetivo",
};

/** Mesmo padrão visual do stepper numerado do onboarding (ver OnboardingStepHeader/StepsRow), com 3 passos em vez de 4. */
function SheetStepsRow({ step }: { step: SheetStep }) {
  const activeIndex = STEP_ORDER.findIndex((s) => s === step);
  if (activeIndex === -1) return null;
  return (
    <ol className="flex shrink-0 items-start" aria-hidden>
      {STEP_ORDER.map((s, index) => {
        const isActive = index === activeIndex;
        const isDone = index < activeIndex;
        return (
          <li key={s} className="flex items-start">
            <div className="flex flex-col items-center gap-[3px]">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                  isDone && "bg-success text-success-foreground",
                  isActive && "bg-primary text-primary-foreground",
                  !isDone && !isActive && "border border-border text-muted-foreground",
                )}
              >
                {isDone ? <Check className="size-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-xs",
                  isDone && "text-success",
                  isActive && "font-medium text-primary",
                  !isDone && !isActive && "text-muted-foreground",
                )}
              >
                {STEP_LABELS[s]}
              </span>
            </div>
            {index < STEP_ORDER.length - 1 ? (
              <div className="flex w-8 flex-col items-start px-1.5 pb-2 pt-[15px]">
                <div className={cn("h-px w-full", isDone ? "bg-success" : "bg-border")} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

interface ExistingDocument {
  originalFilename: string | null;
}

/**
 * Currículo/LinkedIn — mesma persistência do onboarding (uploadReanalysisDocumentAction,
 * que reaproveita performDocumentUpload sem o redirect fixo para /onboarding), com o
 * miolo (dropzone + colar texto) copiado de DocumentUploadStep sem o header/footer de
 * wizard em tela cheia, que não cabe num Sheet estreito.
 */
function DocumentStepPanel({
  documentType,
  heading,
  subheading,
  dropzoneTitle,
  contentLabel,
  contentPlaceholder,
  existing,
  onNext,
}: {
  documentType: "resume" | "linkedin";
  heading: string;
  subheading: string;
  dropzoneTitle: string;
  contentLabel: string;
  contentPlaceholder: string;
  existing: ExistingDocument | null;
  onNext: () => void;
}) {
  const [state, formAction] = useActionState(uploadReanalysisDocumentAction, EMPTY_STATE);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!submittedRef.current) return;
    submittedRef.current = false;
    if (!state.error) onNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

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
    <form action={formAction} onSubmit={() => (submittedRef.current = true)} className="flex flex-1 flex-col gap-4" noValidate>
      <input type="hidden" name="documentType" value={documentType} />
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
        <p className="text-sm text-muted-foreground">{subheading}</p>
        {existing?.originalFilename ? (
          <p className="text-xs text-muted-foreground">Atual: {existing.originalFilename}</p>
        ) : null}
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
        className={cn(
          "flex h-48 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border",
        )}
      >
        <input
          ref={fileInputRef}
          id={`file-${documentType}`}
          name="file"
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) assignFile(file);
          }}
        />
        {fileName ? (
          <div className="flex w-full max-w-80 items-center gap-3 rounded-md border border-border bg-background px-4 py-3">
            <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="flex-1 truncate text-sm text-foreground">{fileName}</span>
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
          <div className="flex w-full max-w-80 flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Upload className="size-5" aria-hidden />
              </div>
              <p className="text-sm font-medium text-card-foreground">{dropzoneTitle}</p>
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

      <div className="space-y-2">
        <Label htmlFor={`pastedText-${documentType}`}>{contentLabel}</Label>
        <textarea
          id={`pastedText-${documentType}`}
          name="pastedText"
          maxLength={100_000}
          value={pastedText}
          onChange={(e) => {
            setPastedText(e.target.value);
            if (e.target.value) clearFile();
          }}
          className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder={contentPlaceholder}
        />
      </div>

      <div className="mt-auto border-t border-border pt-4">
        <SubmitButton className="h-9 w-full rounded-lg" disabled={!hasNewInput}>
          Continuar
        </SubmitButton>
      </div>
    </form>
  );
}

interface TargetContextDefaults {
  targetArea: string;
  targetRole: string;
  desiredSeniority: string;
}

function SegmentedField({
  name,
  options,
  defaultValue,
}: {
  name: string;
  options: readonly { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <div className="inline-flex flex-wrap">
      {options.map((option, index) => (
        <label
          key={option.value}
          className={cn(
            "flex h-9 cursor-pointer items-center justify-center border border-border px-3 text-sm font-medium text-foreground transition-colors",
            "has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground",
            index === 0 && "rounded-l-md",
            index === options.length - 1 && "rounded-r-md",
            index > 0 && "-ml-px",
          )}
        >
          <input type="radio" name={name} value={option.value} defaultChecked={defaultValue === option.value} required className="sr-only" />
          {option.label}
        </label>
      ))}
    </div>
  );
}

/**
 * Só chama saveReanalysisTargetContextAction (que sempre cria uma nova versão)
 * quando algo de fato mudou — mantendo o "reanalisar sem mudança real volta
 * para a mesma análise" (ver startProfileAnalysisAction) em vez de criar uma
 * versão nova a cada abertura do Sheet.
 */
function TargetContextStepPanel({ defaults, onNext }: { defaults: TargetContextDefaults | null; onNext: () => void }) {
  const [state, formAction] = useActionState(saveReanalysisTargetContextAction, EMPTY_STATE);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!submittedRef.current) return;
    submittedRef.current = false;
    if (!state.error && !state.fieldErrors) onNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const unchanged =
      defaults &&
      formData.get("targetArea") === defaults.targetArea &&
      formData.get("targetRole") === defaults.targetRole &&
      formData.get("desiredSeniority") === defaults.desiredSeniority;
    if (unchanged) {
      e.preventDefault();
      onNext();
      return;
    }
    submittedRef.current = true;
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold text-foreground">Defina seu objetivo profissional</h2>
        <p className="text-sm text-muted-foreground">
          Confirme ou ajuste o contexto usado nesta análise. Alterar aqui não muda as informações já confirmadas
          do seu perfil.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-6">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium leading-none text-foreground">Área de interesse</legend>
          <SegmentedField name="targetArea" options={TARGET_AREA_OPTIONS} defaultValue={defaults?.targetArea} />
          {state.fieldErrors?.targetArea ? <p className="text-xs text-destructive">{state.fieldErrors.targetArea}</p> : null}
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="targetRole">Cargo-alvo</Label>
          <Input
            id="targetRole"
            name="targetRole"
            placeholder="Ex.: Product Manager"
            required
            defaultValue={defaults?.targetRole}
            aria-invalid={Boolean(state.fieldErrors?.targetRole)}
          />
          {state.fieldErrors?.targetRole ? <p className="text-xs text-destructive">{state.fieldErrors.targetRole}</p> : null}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium leading-none text-foreground">Nível de senioridade</legend>
          <SegmentedField name="desiredSeniority" options={SENIORITY_OPTIONS} defaultValue={defaults?.desiredSeniority} />
          {state.fieldErrors?.desiredSeniority ? <p className="text-xs text-destructive">{state.fieldErrors.desiredSeniority}</p> : null}
        </fieldset>
      </div>

      <div className="mt-auto border-t border-border pt-4">
        <SubmitButton variant="success" className="h-9 w-full rounded-lg">
          Concluir e reanalisar
        </SubmitButton>
      </div>
    </form>
  );
}

type ProcessingStepId = "resume" | "linkedin" | "profile" | "analysis";
type ProcessingStepState = "pending" | "active" | "done" | "error";

const PROCESSING_STEPS: { id: ProcessingStepId; label: string }[] = [
  { id: "resume", label: "Lendo currículo" },
  { id: "linkedin", label: "Lendo LinkedIn" },
  { id: "profile", label: "Consolidando seu perfil" },
  { id: "analysis", label: "Gerando a nova análise" },
];

const INITIAL_PROCESSING_STATE: Record<ProcessingStepId, ProcessingStepState> = {
  resume: "pending",
  linkedin: "pending",
  profile: "pending",
  analysis: "pending",
};

function ProcessingStepRow({ label, state }: { label: string; state: ProcessingStepState }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full",
          state === "done" && "bg-success text-success-foreground",
          state === "active" && "text-primary",
          state === "error" && "bg-destructive text-destructive-foreground",
          state === "pending" && "border border-border",
        )}
      >
        {state === "done" ? <Check className="size-3.5" /> : null}
        {state === "active" ? <Loader2 className="size-4 animate-spin" /> : null}
        {state === "error" ? <span className="text-xs leading-none">!</span> : null}
      </span>
      <span
        className={cn(
          "leading-tight",
          state === "pending" && "text-muted-foreground",
          state === "done" && "text-foreground",
          state === "active" && "font-medium text-foreground",
          state === "error" && "text-destructive",
        )}
      >
        {label}
      </span>
    </li>
  );
}

/**
 * resume/linkedin/analysis reaproveitam exatamente as mesmas stages do
 * pipeline de onboarding (runStageToCompletion, ver CompletionStep). O ponto
 * novo é "profile", que chama runProfileReconsolidationStage — necessário
 * porque runProfileStage (usado no onboarding inicial) não faz nada quando o
 * perfil já está confirmado. Como Currículo e LinkedIn são sempre reenviados
 * neste fluxo (ver DocumentStepPanel — não há opção de "manter o atual"),
 * sempre há conteúdo novo para consolidar, então essa stage roda sem guarda.
 */
function ProcessingStepPanel({ onDone }: { onDone: (redirectTo: string) => void }) {
  const [steps, setSteps] = useState<Record<ProcessingStepId, ProcessingStepState>>(INITIAL_PROCESSING_STATE);
  const [failed, setFailed] = useState(false);
  const startedRef = useRef(false);

  const setStep = useCallback((id: ProcessingStepId, state: ProcessingStepState) => {
    setSteps((prev) => ({ ...prev, [id]: state }));
  }, []);

  const run = useCallback(async () => {
    setFailed(false);
    try {
      setStep("resume", "active");
      setStep("linkedin", "active");
      const [resumeResult, linkedinResult] = await Promise.all([
        runStageToCompletion("resume").then((r) => {
          setStep("resume", r.ok ? "done" : "error");
          return r;
        }),
        runStageToCompletion("linkedin").then((r) => {
          setStep("linkedin", r.ok ? "done" : "error");
          return r;
        }),
      ]);
      if (!resumeResult.ok || !linkedinResult.ok) {
        setFailed(true);
        return;
      }

      setStep("profile", "active");
      const profileResult = await runStageToCompletion("profile_reconsolidation");
      setStep("profile", profileResult.ok ? "done" : "error");
      if (!profileResult.ok) {
        setFailed(true);
        return;
      }

      setStep("analysis", "active");
      const analysisResult = await runStageToCompletion("analysis", undefined, ANALYSIS_STAGE_POLL_OPTIONS);
      if (!analysisResult.ok || !analysisResult.redirectTo) {
        setStep("analysis", "error");
        setFailed(true);
        return;
      }
      setStep("analysis", "done");
      onDone(analysisResult.redirectTo);
    } catch {
      setFailed(true);
    }
  }, [setStep, onDone]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void run();
  }, [run]);

  const doneCount = PROCESSING_STEPS.filter((s) => steps[s.id] === "done").length;
  const progressPercent = Math.round((doneCount / PROCESSING_STEPS.length) * 100);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <Image
        src={failed ? "/onboarding/analysis-error-icon.svg" : "/onboarding/analysis-loading-icon.svg"}
        alt=""
        width={160}
        height={156}
        className="h-[156px] w-[160px]"
      />
      <div className="flex max-w-80 flex-col gap-1.5">
        <p className="text-lg font-semibold text-foreground">
          {failed ? "Não foi possível concluir a reanálise" : "Reanalisando seu perfil"}
        </p>
        <p className="text-sm text-muted-foreground">
          {failed
            ? "Encontramos um problema durante o processamento das suas informações."
            : "Estamos atualizando seu perfil e gerando uma nova análise. Isso pode levar até 2 minutos."}
        </p>
      </div>
      <div className="w-full max-w-80 rounded-xl border border-border bg-background p-5 text-left">
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-primary/20">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${failed ? progressPercent : Math.max(progressPercent, 6)}%` }}
          />
        </div>
        <ol className="flex flex-col gap-3">
          {PROCESSING_STEPS.map((step) => (
            <ProcessingStepRow key={step.id} label={step.label} state={steps[step.id]} />
          ))}
        </ol>
      </div>
      {failed ? (
        <Button size="sm" onClick={() => void run()}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}

export function ReanalysisSheet({
  existingResumeDocument,
  existingLinkedinDocument,
  targetContextDefaults,
}: {
  existingResumeDocument: ExistingDocument | null;
  existingLinkedinDocument: ExistingDocument | null;
  targetContextDefaults: TargetContextDefaults | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<SheetStep>("resume");
  const [sheetKey, setSheetKey] = useState(0);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setStep("resume");
          setSheetKey((k) => k + 1);
        }
      }}
    >
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm">
          <RefreshCw className="size-4" aria-hidden />
          Reanalisar perfil
        </Button>
      </SheetTrigger>
      <SheetContent showCloseButton={false} className="w-full gap-0 border-none bg-transparent p-0 sm:w-[45%] sm:max-w-none">
        <div className="flex h-full items-start" key={sheetKey}>
          <SheetCircleClose />
          <div className="flex h-full flex-1 flex-col bg-card px-8">
            {step !== "processing" ? (
              <div className="flex items-start justify-between gap-4 border-b border-border py-4">
                <div>
                  <p className="text-xs text-muted-foreground">Reanalisar perfil</p>
                  <p className="text-2xl font-semibold text-foreground">{STEP_TITLES[step]}</p>
                </div>
                <SheetStepsRow step={step} />
              </div>
            ) : null}

            <div className="flex flex-1 flex-col overflow-y-auto py-6">
              {step === "resume" ? (
                <DocumentStepPanel
                  documentType="resume"
                  heading="Atualize seu currículo"
                  subheading="Envie a versão mais recente em PDF ou DOCX. Também é possível colar o conteúdo em texto."
                  dropzoneTitle="Adicione seu currículo atualizado"
                  contentLabel="Conteúdo do currículo"
                  contentPlaceholder="Cole aqui o texto completo do seu currículo atualizado"
                  existing={existingResumeDocument}
                  onNext={() => setStep("linkedin")}
                />
              ) : null}
              {step === "linkedin" ? (
                <DocumentStepPanel
                  documentType="linkedin"
                  heading="Atualize seu perfil do LinkedIn"
                  subheading="Envie o PDF exportado do LinkedIn ou cole abaixo as informações atualizadas do seu perfil."
                  dropzoneTitle="Adicione seu perfil atualizado"
                  contentLabel="Conteúdo do LinkedIn"
                  contentPlaceholder="Cole aqui as informações atualizadas do seu perfil do LinkedIn"
                  existing={existingLinkedinDocument}
                  onNext={() => setStep("target-context")}
                />
              ) : null}
              {step === "target-context" ? (
                <TargetContextStepPanel defaults={targetContextDefaults} onNext={() => setStep("processing")} />
              ) : null}
              {step === "processing" ? (
                <ProcessingStepPanel
                  onDone={(redirectTo) => {
                    setOpen(false);
                    router.push(redirectTo);
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
