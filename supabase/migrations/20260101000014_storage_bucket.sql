-- Private storage bucket for temporary documents (résumé, LinkedIn export, job
-- postings). Source: Arquitetura §4.5, Segurança §11.
-- "Nenhuma URL pública permanente" — bucket is private; access only via
-- short-lived signed URLs generated server-side, and only for the owning user.
insert into storage.buckets (id, name, public)
values ('temporary-documents', 'temporary-documents', false)
on conflict (id) do nothing;

-- Path convention: temporary-documents/{user_id}/{document_id}/{filename}
-- RLS on storage.objects: a user may only read/write objects under their own
-- user_id prefix. Never trust a client-supplied path beyond this check.
create policy "temporary_documents_owner_select"
  on storage.objects for select
  using (
    bucket_id = 'temporary-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "temporary_documents_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'temporary-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "temporary_documents_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'temporary-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
