-- Adds only restrictive staff read access to existing assessment tables.
-- No table is created or duplicated by this migration.
create or replace function public.is_xc_staff()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  profile_role text;
  claim_role text;
begin
  claim_role := lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'app_metadata' ->> 'user_role', ''));
  if claim_role in ('admin', 'trainer', 'treinador') then return true; end if;

  if to_regclass('public.profiles') is not null then
    execute $query$
      select lower(coalesce(to_jsonb(p) ->> 'role', to_jsonb(p) ->> 'user_role', to_jsonb(p) ->> 'type', ''))
      from public.profiles p
      where coalesce(to_jsonb(p) ->> 'id', to_jsonb(p) ->> 'user_id') = $1
      limit 1
    $query$ into profile_role using auth.uid()::text;
  end if;
  return coalesce(profile_role, '') in ('admin', 'trainer', 'treinador');
end;
$$;

revoke all on function public.is_xc_staff() from public;
grant execute on function public.is_xc_staff() to authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','clients','assessments','assessment_answers','assessment_photos'] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      if not exists (select 1 from pg_policies where schemaname='public' and tablename=table_name and policyname='xc_staff_can_read') then
        execute format('create policy xc_staff_can_read on public.%I for select to authenticated using (public.is_xc_staff())', table_name);
      end if;
    end if;
  end loop;
end $$;

do $$
begin
  if to_regclass('storage.objects') is not null and not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='xc_staff_can_read_assessment_photos'
  ) then
    create policy xc_staff_can_read_assessment_photos on storage.objects
      for select to authenticated
      using (bucket_id in ('assessment-photos', 'assessment_photos') and public.is_xc_staff());
  end if;
end $$;
