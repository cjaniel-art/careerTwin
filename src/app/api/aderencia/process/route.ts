import { NextResponse } from "next/server";
import { runJobAnalysisStage } from "@/features/core-2/actions";

export const dynamic = "force-dynamic";
// Server Actions inherit their page segment's limit; a Route Handler needs its
// own. Only used to dispatch/poll — never runs the AI call itself.
export const maxDuration = 60;

/** Client-side polling for the Core 2 "Criar análise" Sheet — mirrors /api/onboarding/process. */
export async function POST(request: Request) {
  let analysisId: unknown;
  try {
    ({ analysisId } = await request.json());
  } catch {
    return NextResponse.json({ ok: false, done: false }, { status: 400 });
  }
  if (typeof analysisId !== "string" || analysisId.length === 0) {
    return NextResponse.json({ ok: false, done: false }, { status: 400 });
  }

  try {
    return NextResponse.json(await runJobAnalysisStage(analysisId));
  } catch (error) {
    console.error("aderencia stage failed:", error);
    return NextResponse.json({ ok: false, done: false });
  }
}
