-- Restricted fallback for staff when direct RLS reads return no answer rows.
-- It does not expose answers publicly and does not modify existing policies.
create or replace function public.get_assessment_answers_admin(p_assessment_id uuid)
returns setof public.assessment_answers
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_xc_staff() then
    raise exception 'Acesso não autorizado';
  end if;

  return query
    select answer.*
    from public.assessment_answers answer
    where answer.assessment_id = p_assessment_id
    order by answer.created_at, answer.id;
end
$$;

revoke all on function public.get_assessment_answers_admin(uuid) from public;
grant execute on function public.get_assessment_answers_admin(uuid) to authenticated;

select pg_notify('pgrst', 'reload schema');
