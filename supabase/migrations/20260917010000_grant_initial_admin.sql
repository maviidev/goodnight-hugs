-- Grants the initial owner account administrative access by immutable Auth UUID.
create or replace function public.is_xc_staff()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare profile_role text; claim_role text;
begin
  if auth.uid() = 'eb84c124-f09c-4d28-a0a0-b75af9e50d56'::uuid then return true; end if;
  claim_role := lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'app_metadata' ->> 'user_role', ''));
  if claim_role in ('admin', 'trainer', 'treinador') then return true; end if;
  if to_regclass('public.profiles') is not null then
    execute $query$ select lower(coalesce(to_jsonb(p) ->> 'role', to_jsonb(p) ->> 'user_role', to_jsonb(p) ->> 'type', '')) from public.profiles p where coalesce(to_jsonb(p) ->> 'id', to_jsonb(p) ->> 'user_id') = $1 limit 1 $query$ into profile_role using auth.uid()::text;
  end if;
  return coalesce(profile_role, '') in ('admin', 'trainer', 'treinador');
end;
$$;
revoke all on function public.is_xc_staff() from public;
grant execute on function public.is_xc_staff() to authenticated;
