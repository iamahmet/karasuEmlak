-- Create prayer_times table for programmatic SEO pages (imsakiye/iftar/countdown)
-- Source: Diyanet (via API integration), stored as daily rows per district.

create table if not exists public.prayer_times (
  id uuid primary key default gen_random_uuid(),
  district_id integer not null,
  district_name text,
  state_id integer,
  state_name text,
  country_id integer,
  country_name text,
  date date not null,
  imsak time not null,
  gunes time not null,
  ogle time not null,
  ikindi time not null,
  aksam time not null,
  yatsi time not null,
  source text not null default 'imsakiyem_diyanet',
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists prayer_times_district_date_uniq
  on public.prayer_times (district_id, date);

create index if not exists prayer_times_date_idx
  on public.prayer_times (date);

create index if not exists prayer_times_district_idx
  on public.prayer_times (district_id);

alter table public.prayer_times enable row level security;

-- Public read access (times are not sensitive).
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'prayer_times'
      and policyname = 'Public can read prayer times'
  ) then
    create policy "Public can read prayer times"
      on public.prayer_times
      for select
      using (true);
  end if;
end $$;

