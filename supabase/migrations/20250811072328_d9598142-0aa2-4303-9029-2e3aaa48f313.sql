-- Create realtime aggregate table for admin metrics
create table if not exists public.admin_public_metrics (
  id integer primary key default 1,
  total_registered_voters integer not null default 0,
  total_votes_cast integer not null default 0,
  voter_turnout_percentage numeric not null default 0,
  partywise_votes jsonb not null default '[]'::jsonb,
  hourly_activity jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Enable RLS but allow public read; no write policies to prevent direct edits
alter table public.admin_public_metrics enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'admin_public_metrics' and policyname = 'Anyone can read admin metrics'
  ) then
    create policy "Anyone can read admin metrics"
      on public.admin_public_metrics
      for select
      using (true);
  end if;
end $$;

-- Function to recompute metrics; SECURITY DEFINER to bypass RLS safely
create or replace function public.recompute_admin_public_metrics()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  total_voters integer := 0;
  total_votes integer := 0;
  turnout numeric := 0;
  party_json jsonb := '[]'::jsonb;
  hourly_json jsonb := '[]'::jsonb;
begin
  -- totals
  select count(*) into total_voters from public.users;
  select count(*) into total_votes from public.votes;
  if total_voters = 0 then
    turnout := 0;
  else
    turnout := round((total_votes::numeric / total_voters::numeric) * 100, 2);
  end if;

  -- partywise votes
  select coalesce(
    (select jsonb_agg(x.obj order by (x.obj->>'votes')::int desc)
     from (
       select jsonb_build_object(
         'partyId', v.party_id,
         'partyName', max(v.party_name),
         'votes', count(*)::int,
         'percentage', case when total_votes = 0 then 0 else round((count(*)::numeric / total_votes::numeric) * 100, 2) end
       ) as obj
       from public.votes v
       group by v.party_id
     ) x),
    '[]'::jsonb
  ) into party_json;

  -- hourly activity
  with buckets as (
    select date_trunc('hour', v.timestamp) as hour, count(*)::int as c
    from public.votes v
    group by 1
    order by 1
  )
  select coalesce(
    jsonb_agg(jsonb_build_object(
      'hour', to_char(hour at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      'count', c
    ) order by hour),
    '[]'::jsonb
  )
  into hourly_json
  from buckets;

  -- upsert metrics row
  insert into public.admin_public_metrics (id, total_registered_voters, total_votes_cast, voter_turnout_percentage, partywise_votes, hourly_activity, updated_at)
  values (1, total_voters, total_votes, turnout, party_json, hourly_json, now())
  on conflict (id) do update
    set total_registered_voters = excluded.total_registered_voters,
        total_votes_cast = excluded.total_votes_cast,
        voter_turnout_percentage = excluded.voter_turnout_percentage,
        partywise_votes = excluded.partywise_votes,
        hourly_activity = excluded.hourly_activity,
        updated_at = now();
end;
$$;

-- Triggers to keep metrics up-to-date
create or replace function public.trigger_recompute_admin_public_metrics()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.recompute_admin_public_metrics();
  return null;
end;
$$;

-- Drop existing triggers if they exist, then create
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_votes_recompute_admin_metrics') THEN
    DROP TRIGGER trg_votes_recompute_admin_metrics ON public.votes;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_recompute_admin_metrics') THEN
    DROP TRIGGER trg_users_recompute_admin_metrics ON public.users;
  END IF;
END $$;

create trigger trg_votes_recompute_admin_metrics
after insert or update or delete on public.votes
for each statement execute function public.trigger_recompute_admin_public_metrics();

create trigger trg_users_recompute_admin_metrics
after insert or update or delete on public.users
for each statement execute function public.trigger_recompute_admin_public_metrics();

-- Ensure there is one row and metrics are populated initially
insert into public.admin_public_metrics (id) values (1)
on conflict (id) do nothing;

select public.recompute_admin_public_metrics();