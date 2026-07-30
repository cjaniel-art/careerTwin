-- CareerTwin — extensions and shared helper functions
-- Source: Modelo de Dados §1 (conventions). Enums are modeled as `text` + CHECK
-- constraints (not native Postgres ENUM types) so that adding/removing allowed
-- values is a plain, reversible migration instead of an ALTER TYPE operation.

create extension if not exists "pgcrypto";

-- Shared "updated_at" trigger, reused by every table that has the column.
create or replace function ct_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function ct_set_updated_at() is
  'Sets updated_at = now() on every UPDATE. Attached per-table via trigger.';
