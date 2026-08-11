import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { getOnboardingState } from "@/features/onboarding/get-state";
import {
  runAnalysisStage,
  runDocumentStage,
  runProfileStage,
  runProfileReconsolidationStage,
  type PipelineStage,
} from "@/features/onboarding/pipeline";

export const dynamic = "force-dynamic";
// Server Actions inherit their page segment's limit; a Route Handler needs its
// own. 60s is the Hobby-plan ceiling.
export const maxDuration = 60;

const DOCUMENT_STAGES: PipelineStage[] = ["resume", "linkedin"];
const VALID_STAGES: PipelineStage[] = [...DOCUMENT_STAGES, "profile", "profile_reconsolidation", "analysis"];

/**
 * Drives one stage of the onboarding pipeline.
 *
 * A Route Handler rather than a Server Action so the browser can fire it
 * without awaiting (background prewarming during data collection) and run the
 * résumé and LinkedIn stages concurrently — Next serializes Server Actions per
 * client, which would defeat both.
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, done: false }, { status: 401 });

  let stage: unknown;
  try {
    ({ stage } = await request.json());
  } catch {
    return NextResponse.json({ ok: false, done: false }, { status: 400 });
  }
  if (typeof stage !== "string" || !VALID_STAGES.includes(stage as PipelineStage)) {
    return NextResponse.json({ ok: false, done: false }, { status: 400 });
  }

  try {
    if (stage === "resume" || stage === "linkedin") {
      // Document stages are the only ones safe to run mid-collection: they touch
      // one document each and nothing downstream. The rest require the full
      // onboarding to be complete.
      return NextResponse.json(await runDocumentStage(supabase, user.id, stage));
    }

    // Preconditions re-checked server-side, never trusted from the client.
    const state = await getOnboardingState(supabase, user.id);
    if (state.step !== "completed") return NextResponse.json({ ok: false, done: false }, { status: 409 });

    if (stage === "profile") return NextResponse.json(await runProfileStage(supabase, user.id));
    if (stage === "profile_reconsolidation") return NextResponse.json(await runProfileReconsolidationStage(supabase, user.id));
    return NextResponse.json(await runAnalysisStage());
  } catch (error) {
    console.error(`onboarding stage "${stage}" failed:`, error);
    return NextResponse.json({ ok: false, done: false });
  }
}
