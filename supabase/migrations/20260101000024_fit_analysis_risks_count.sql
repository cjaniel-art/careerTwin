-- The AI's P-009 output already classifies risks (risks[] — type, severity,
-- mitigableBeforeApplication), but nothing persisted a count of them; the
-- "Aderência à Vaga" list page (Figma node 162:3768/162:4454) needs a
-- "Riscos" column. Storing just the count here, not the full risk objects —
-- that level of detail belongs on the result page's calculation_snapshot,
-- already captured, not on a summary list column.
alter table public.fit_analysis_results add column if not exists risks_count smallint not null default 0;
