-- Create price_alerts table for price alert notifications
create table if not exists "public"."price_alerts" (
  "id" uuid not null default gen_random_uuid(),
  "user_id" uuid references auth.users(id) on delete cascade,
  "email" text not null,
  "name" text,
  "filters" jsonb not null, -- {min_price, max_price, property_type, location, etc.}
  "status" text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  "email_notifications" boolean not null default true,
  "push_notifications" boolean not null default false,
  "frequency" text not null default 'daily' check (frequency in ('immediate', 'daily', 'weekly')),
  "last_checked_at" timestamp with time zone,
  "notified_at" timestamp with time zone,
  "matches_count" integer not null default 0,
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now(),
  primary key ("id")
);

-- Create saved_searches table for saved search queries
create table if not exists "public"."saved_searches" (
  "id" uuid not null default gen_random_uuid(),
  "user_id" uuid references auth.users(id) on delete cascade,
  "name" text not null, -- "Karasu Merkez 3+1 Daireler"
  "email" text not null,
  "filters" jsonb not null, -- All search criteria
  "email_notifications" boolean not null default true,
  "push_notifications" boolean not null default false,
  "frequency" text not null default 'daily' check (frequency in ('immediate', 'daily', 'weekly')),
  "last_notified_at" timestamp with time zone,
  "matches_count" integer not null default 0,
  "is_active" boolean not null default true,
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now(),
  primary key ("id")
);

-- Create indexes for efficient queries
create index if not exists "price_alerts_user_id_idx" on "public"."price_alerts" ("user_id");
create index if not exists "price_alerts_email_idx" on "public"."price_alerts" ("email");
create index if not exists "price_alerts_status_idx" on "public"."price_alerts" ("status");
create index if not exists "price_alerts_created_at_idx" on "public"."price_alerts" ("created_at");
create index if not exists "price_alerts_last_checked_at_idx" on "public"."price_alerts" ("last_checked_at");

create index if not exists "saved_searches_user_id_idx" on "public"."saved_searches" ("user_id");
create index if not exists "saved_searches_email_idx" on "public"."saved_searches" ("email");
create index if not exists "saved_searches_is_active_idx" on "public"."saved_searches" ("is_active");
create index if not exists "saved_searches_created_at_idx" on "public"."saved_searches" ("created_at");

-- Create GIN indexes for JSONB filter queries
create index if not exists "price_alerts_filters_idx" on "public"."price_alerts" using gin ("filters");
create index if not exists "saved_searches_filters_idx" on "public"."saved_searches" using gin ("filters");

-- Enable RLS
alter table "public"."price_alerts" enable row level security;
alter table "public"."saved_searches" enable row level security;

-- RLS Policies for price_alerts
-- Users can view their own alerts
create policy "Users can view own price alerts"
  on "public"."price_alerts"
  for select
  using (auth.uid() = user_id or email = (select email from auth.users where id = auth.uid()));

-- Users can insert their own alerts
create policy "Users can insert own price alerts"
  on "public"."price_alerts"
  for insert
  with check (auth.uid() = user_id or email = (select email from auth.users where id = auth.uid()));

-- Users can update their own alerts
create policy "Users can update own price alerts"
  on "public"."price_alerts"
  for update
  using (auth.uid() = user_id or email = (select email from auth.users where id = auth.uid()));

-- Users can delete their own alerts
create policy "Users can delete own price alerts"
  on "public"."price_alerts"
  for delete
  using (auth.uid() = user_id or email = (select email from auth.users where id = auth.uid()));

-- RLS Policies for saved_searches
-- Users can view their own searches
create policy "Users can view own saved searches"
  on "public"."saved_searches"
  for select
  using (auth.uid() = user_id or email = (select email from auth.users where id = auth.uid()));

-- Users can insert their own searches
create policy "Users can insert own saved searches"
  on "public"."saved_searches"
  for insert
  with check (auth.uid() = user_id or email = (select email from auth.users where id = auth.uid()));

-- Users can update their own searches
create policy "Users can update own saved searches"
  on "public"."saved_searches"
  for update
  using (auth.uid() = user_id or email = (select email from auth.users where id = auth.uid()));

-- Users can delete their own searches
create policy "Users can delete own saved searches"
  on "public"."saved_searches"
  for delete
  using (auth.uid() = user_id or email = (select email from auth.users where id = auth.uid()));

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_price_alerts_updated_at
  before update on "public"."price_alerts"
  for each row
  execute function update_updated_at_column();

create trigger update_saved_searches_updated_at
  before update on "public"."saved_searches"
  for each row
  execute function update_updated_at_column();
