-- CareerTwin — documents (temporary uploads) and processing jobs.
-- Source: Modelo de Dados §4.9–4.10; PRD 01 §15–20; Arquitetura §4.5–4.6.

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_accounts (user_id) on delete cascade,
  document_type text not null
    check (document_type in ('resume', 'linkedin', 'job_description', 'pasted_text', 'authorized_supporting_document')),
  source_type text not null check (source_type in ('file_upload', 'pasted_text', 'manual_entry')),
  storage_path text, -- private bucket path; never a public URL (Segurança §11)
  original_filename text,
  mime_type text,
  size_bytes bigint,
  content_hash text,
  status text not null default 'awaiting_upload'
    check (status in (
      'awaiting_upload', 'uploading', 'validating', 'queued', 'processing', 'ready',
      'insufficient_content', 'failed_retryable', 'failed_final', 'deleted'
    )),
  page_count integer,
  character_count integer,
  retention_deadline timestamptz,
  processed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger documents_set_updated_at before update on documents
  for each row execute function ct_set_updated_at();
create index on documents (user_id);
create index documents_pending_retention_idx on documents (retention_deadline)
  where deleted_at is null and retention_deadline is not null;

alter table evidences
  add constraint evidences_source_document_fk
  foreign key (source_document_id) references documents (id);

create table if not exists document_extractions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents (id) on delete cascade,
  schema_version text not null,
  prompt_version text not null,
  model_version text not null,
  status text not null default 'complete'
    check (status in ('complete', 'partial', 'insufficient_content', 'failed')),
  validated_payload jsonb,
  warnings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index on document_extractions (document_id);

create table if not exists processing_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_accounts (user_id) on delete cascade,
  job_type text not null
    check (job_type in (
      'resume_extraction', 'linkedin_extraction', 'profile_consolidation',
      'opportunity_structuring', 'profile_analysis', 'target_role_analysis',
      'job_analysis', 'reanalysis', 'document_deletion', 'account_deletion'
    )),
  resource_type text not null,
  resource_id uuid not null,
  analysis_id uuid, -- FK added once analyses table exists
  status text not null default 'queued'
    check (status in ('queued', 'processing', 'completed', 'partially_completed', 'failed', 'cancelled', 'expired')),
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  idempotency_key text not null,
  correlation_id uuid not null default gen_random_uuid(),
  error_code text,
  error_category text
    check (error_category in (
      'validation', 'authorization', 'file_processing', 'provider_timeout',
      'provider_unavailable', 'invalid_schema', 'invalid_model_output',
      'persistence', 'credit', 'retention', 'unknown'
    )),
  error_message_safe text,
  available_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index on processing_jobs (status, available_at);
create index on processing_jobs (job_type, status, available_at);
create index on processing_jobs (correlation_id);

alter table documents enable row level security;
create policy documents_owner on documents
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table document_extractions enable row level security;
create policy document_extractions_owner on document_extractions
  for all using (
    exists (select 1 from documents d where d.id = document_extractions.document_id and d.user_id = auth.uid())
  );

alter table processing_jobs enable row level security;
create policy processing_jobs_owner_select on processing_jobs
  for select using (user_id = auth.uid());
-- Inserts/updates to jobs happen exclusively via service role (worker), never directly by the client.

comment on table processing_jobs is
  'Technical job states only (queued/processing/...). Never substitutes the functional status of the resource it processes (Arquitetura §4.6).';
