create extension if not exists pgcrypto;
create or replace function public.is_xc_staff() returns boolean language plpgsql stable security definer set search_path=public as $$
declare profile_role text;claim_role text;
begin
 if auth.uid()='eb84c124-f09c-4d28-a0a0-b75af9e50d56'::uuid then return true; end if;
 claim_role:=lower(coalesce(auth.jwt()->'app_metadata'->>'role',auth.jwt()->'app_metadata'->>'user_role',''));
 if claim_role in('admin','trainer','treinador') then return true; end if;
 if to_regclass('public.profiles') is not null then
  execute $query$ select lower(coalesce(to_jsonb(p)->>'role',to_jsonb(p)->>'user_role',to_jsonb(p)->>'type','')) from public.profiles p where coalesce(to_jsonb(p)->>'id',to_jsonb(p)->>'user_id')=$1 limit 1 $query$ into profile_role using auth.uid()::text;
 end if;
 return coalesce(profile_role,'') in('admin','trainer','treinador');
end $$;
revoke all on function public.is_xc_staff() from public;
grant execute on function public.is_xc_staff() to authenticated;
create table if not exists public.assessments (id uuid primary key default gen_random_uuid(),client_id uuid null,student_name text not null,email text not null,current_weight numeric(7,2),status text not null default 'in_progress' check(status in('not_started','in_progress','completed')),created_at timestamptz not null default now(),completed_at timestamptz);
create table if not exists public.assessment_answers (id uuid primary key default gen_random_uuid(),assessment_id uuid not null references public.assessments(id) on delete cascade,question_key text not null,question text not null,answer jsonb not null,created_at timestamptz not null default now(),unique(assessment_id,question_key));
create table if not exists public.assessment_photos (id uuid primary key default gen_random_uuid(),assessment_id uuid not null references public.assessments(id) on delete cascade,position text not null check(position in('front','side','back')),bucket text not null default 'assessment-photos',storage_path text not null,created_at timestamptz not null default now(),unique(assessment_id,position));
create index if not exists assessments_created_at_idx on public.assessments(created_at desc);
create index if not exists assessment_answers_assessment_idx on public.assessment_answers(assessment_id);
create index if not exists assessment_photos_assessment_idx on public.assessment_photos(assessment_id);
alter table public.assessments enable row level security;
alter table public.assessment_answers enable row level security;
alter table public.assessment_photos enable row level security;
revoke all on public.assessments,public.assessment_answers,public.assessment_photos from anon;
grant select on public.assessments,public.assessment_answers,public.assessment_photos to authenticated;
drop policy if exists "xc_staff_can_read" on public.assessments;
drop policy if exists "xc_staff_can_read" on public.assessment_answers;
drop policy if exists "xc_staff_can_read" on public.assessment_photos;
create policy "xc_staff_can_read" on public.assessments for select to authenticated using(public.is_xc_staff());
create policy "xc_staff_can_read" on public.assessment_answers for select to authenticated using(public.is_xc_staff());
create policy "xc_staff_can_read" on public.assessment_photos for select to authenticated using(public.is_xc_staff());

create or replace function public.submit_assessment(p_id uuid,p_name text,p_email text,p_weight numeric,p_answers jsonb) returns uuid language plpgsql security definer set search_path=public as $$
declare answer_item record;
begin
 if length(trim(p_name)) not between 2 and 150 then raise exception 'Nome inválido'; end if;
 if p_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then raise exception 'E-mail inválido'; end if;
 if jsonb_typeof(p_answers)<>'object' or jsonb_object_length(p_answers)>60 then raise exception 'Respostas inválidas'; end if;
 insert into public.assessments(id,student_name,email,current_weight,status,completed_at) values(p_id,left(trim(p_name),150),left(lower(trim(p_email)),254),p_weight,'completed',now());
 for answer_item in select key,value from jsonb_each(p_answers) loop
  if length(answer_item.key) between 1 and 80 then insert into public.assessment_answers(assessment_id,question_key,question,answer) values(p_id,answer_item.key,answer_item.key,answer_item.value); end if;
 end loop;
 return p_id;
end $$;
revoke all on function public.submit_assessment(uuid,text,text,numeric,jsonb) from public;
grant execute on function public.submit_assessment(uuid,text,text,numeric,jsonb) to anon;

create or replace function public.can_upload_assessment_photo(object_name text) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.assessments a where a.id::text=split_part(object_name,'/',1) and a.created_at>now()-interval '1 hour' and object_name~('^'||a.id::text||'/(front|side|back)-[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$'));
$$;
revoke all on function public.can_upload_assessment_photo(text) from public;
grant execute on function public.can_upload_assessment_photo(text) to anon,authenticated;
create or replace function public.register_assessment_photo(p_assessment_id uuid,p_position text,p_path text) returns void language plpgsql security definer set search_path=public as $$
begin
 if p_position not in('front','side','back') or not public.can_upload_assessment_photo(p_path) then raise exception 'Foto inválida'; end if;
 if split_part(p_path,'/',1)<>p_assessment_id::text then raise exception 'Caminho inválido'; end if;
 insert into public.assessment_photos(assessment_id,position,bucket,storage_path) values(p_assessment_id,p_position,'assessment-photos',p_path);
end $$;
revoke all on function public.register_assessment_photo(uuid,text,text) from public;
grant execute on function public.register_assessment_photo(uuid,text,text) to anon;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('assessment-photos','assessment-photos',false,10485760,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "public_can_upload_assessment_photos" on storage.objects;
drop policy if exists "xc_staff_can_read_assessment_photos" on storage.objects;
create policy "public_can_upload_assessment_photos" on storage.objects for insert to anon with check(bucket_id='assessment-photos' and public.can_upload_assessment_photo(name));
create policy "xc_staff_can_read_assessment_photos" on storage.objects for select to authenticated using(bucket_id='assessment-photos' and public.is_xc_staff());
select pg_notify('pgrst','reload schema');
