-- Hotfix: replace the submit function left partially installed by the original migration.
-- Safe to run when the assessment tables already exist.

create or replace function public.submit_assessment(
  p_id uuid,
  p_name text,
  p_email text,
  p_weight numeric,
  p_answers jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  answer_item record;
  answer_count bigint;
begin
  if length(trim(p_name)) not between 2 and 150 then
    raise exception 'Nome inválido';
  end if;

  if p_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'E-mail inválido';
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'Respostas inválidas';
  end if;

  select count(*)
    into answer_count
    from jsonb_each(p_answers);

  if answer_count > 60 then
    raise exception 'Respostas inválidas';
  end if;

  insert into public.assessments(
    id,
    student_name,
    email,
    current_weight,
    status,
    completed_at
  )
  values(
    p_id,
    left(trim(p_name), 150),
    left(lower(trim(p_email)), 254),
    p_weight,
    'completed',
    now()
  );

  for answer_item in
    select key, value from jsonb_each(p_answers)
  loop
    if length(answer_item.key) between 1 and 80 then
      insert into public.assessment_answers(
        assessment_id,
        question_key,
        question,
        answer
      )
      values(
        p_id,
        answer_item.key,
        answer_item.key,
        answer_item.value
      );
    end if;
  end loop;

  return p_id;
end
$$;

revoke all on function public.submit_assessment(uuid, text, text, numeric, jsonb) from public;
grant execute on function public.submit_assessment(uuid, text, text, numeric, jsonb) to anon;

select pg_notify('pgrst', 'reload schema');
