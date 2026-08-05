"use client";

import { useEffect } from "react";
import { postStage, type ClientStage } from "./run-stage";

/**
 * Starts extracting a document as soon as it has been uploaded, while the user
 * is still filling in the remaining steps. Nothing here is awaited and nothing
 * blocks the UI: this only moves work into time the user was going to spend
 * anyway.
 *
 * Safe to fire repeatedly — the server claims each document atomically, so a
 * duplicate call from a re-render returns immediately instead of extracting
 * twice. And it is only an optimisation: the completion screen runs the same
 * stages, so if these requests are cancelled or fail, nothing is lost beyond
 * the head start.
 */
export function BackgroundPrewarm({ stages }: { stages: ClientStage[] }) {
  const key = stages.join(",");

  useEffect(() => {
    for (const stage of key ? (key.split(",") as ClientStage[]) : []) {
      void postStage(stage).catch(() => {});
    }
  }, [key]);

  return null;
}
