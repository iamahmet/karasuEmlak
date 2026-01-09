-- Create pharmacies table for nöbetçi eczane data
create table if not exists "public"."pharmacies" (
  "id" uuid not null default gen_random_uuid(),
  "name" text not null,
  "address" text not null,
  "phone" text,
  "district" text not null,
  "city" text not null default 'Sakarya'::text,
  "neighborhood" text,
  "latitude" numeric(10,8),
  "longitude" numeric(11,8),
  "is_on_duty" boolean default false,
  "duty_date" date,
  "duty_start_time" time,
  "duty_end_time" time,
  "source" text default 'manual'::text, -- 'manual', 'api', 'scraped'
  "source_url" text,
  "last_verified_at" timestamp with time zone,
  "verified" boolean default false,
  "published" boolean default true,
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),
  "deleted_at" timestamp with time zone,
  primary key ("id")
);

-- Create indexes for efficient queries
create index if not exists "pharmacies_district_idx" on "public"."pharmacies" ("district");
create index if not exists "pharmacies_city_idx" on "public"."pharmacies" ("city");
create index if not exists "pharmacies_is_on_duty_idx" on "public"."pharmacies" ("is_on_duty");
create index if not exists "pharmacies_duty_date_idx" on "public"."pharmacies" ("duty_date");
create index if not exists "pharmacies_published_idx" on "public"."pharmacies" ("published");
create index if not exists "pharmacies_deleted_at_idx" on "public"."pharmacies" ("deleted_at");

-- Create GIN index for full-text search
create index if not exists "pharmacies_name_search_idx" on "public"."pharmacies" using gin (to_tsvector('turkish', "name"));

-- Create pharmacy_duty_logs table for tracking duty history
create table if not exists "public"."pharmacy_duty_logs" (
  "id" uuid not null default gen_random_uuid(),
  "pharmacy_id" uuid not null references "public"."pharmacies"("id") on delete cascade,
  "duty_date" date not null,
  "duty_start_time" time,
  "duty_end_time" time,
  "source" text not null,
  "created_at" timestamp with time zone default now(),
  primary key ("id")
);

create index if not exists "pharmacy_duty_logs_pharmacy_id_idx" on "public"."pharmacy_duty_logs" ("pharmacy_id");
create index if not exists "pharmacy_duty_logs_duty_date_idx" on "public"."pharmacy_duty_logs" ("duty_date");

-- Create pharmacy_api_cache table for caching API responses
create table if not exists "public"."pharmacy_api_cache" (
  "id" uuid not null default gen_random_uuid(),
  "cache_key" text not null unique,
  "cache_data" jsonb not null,
  "expires_at" timestamp with time zone not null,
  "created_at" timestamp with time zone default now(),
  primary key ("id")
);

create index if not exists "pharmacy_api_cache_key_idx" on "public"."pharmacy_api_cache" ("cache_key");
create index if not exists "pharmacy_api_cache_expires_at_idx" on "public"."pharmacy_api_cache" ("expires_at");

-- Enable RLS
alter table "public"."pharmacies" enable row level security;
alter table "public"."pharmacy_duty_logs" enable row level security;
alter table "public"."pharmacy_api_cache" enable row level security;

-- RLS Policies for pharmacies
-- Public can read published pharmacies
create policy "pharmacies_select_published" on "public"."pharmacies"
  for select
  using ("published" = true and "deleted_at" is null);

-- RLS Policies for pharmacy_duty_logs (public read)
create policy "pharmacy_duty_logs_select" on "public"."pharmacy_duty_logs"
  for select
  using (true);

-- RLS Policies for pharmacy_api_cache (no public access - internal only)
create policy "pharmacy_api_cache_no_public" on "public"."pharmacy_api_cache"
  for all
  using (false);

-- Function to update updated_at timestamp
create or replace function "public"."update_pharmacies_updated_at"()
returns trigger as $$
begin
  new."updated_at" = now();
  return new;
end;
$$ language plpgsql;

create trigger "pharmacies_updated_at"
  before update on "public"."pharmacies"
  for each row
  execute function "public"."update_pharmacies_updated_at"();
