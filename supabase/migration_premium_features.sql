-- =============================================================================
-- PLINKS PREMIUM FEATURES — Migration
-- Adds: drop_alerts (email capture), fan_messages (DM inbox),
--       accent_color on profiles (custom theme)
-- Run in Supabase SQL Editor.
-- =============================================================================

-- Custom accent color
alter table profiles add column if not exists accent_color text;
alter table artist_profiles add column if not exists accent_color text;

-- Drop alerts (fans submit email to get notified of releases)
create table if not exists drop_alerts (
  id uuid primary key default gen_random_uuid(),
  handle text not null,
  release_id uuid,
  email text not null,
  created_at timestamptz default now()
);

create index if not exists idx_drop_alerts_handle on drop_alerts(handle);
create unique index if not exists idx_drop_alerts_unique on drop_alerts(handle, email);

alter table drop_alerts enable row level security;

drop policy if exists "anyone can subscribe" on drop_alerts;
create policy "anyone can subscribe" on drop_alerts
  for insert with check (true);

drop policy if exists "anyone can read" on drop_alerts;
create policy "anyone can read" on drop_alerts
  for select using (true);

-- Fan messages (anonymous DMs to artists)
create table if not exists fan_messages (
  id uuid primary key default gen_random_uuid(),
  to_handle text not null,
  from_name text,
  from_email text,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_fan_messages_to_handle on fan_messages(to_handle);
create index if not exists idx_fan_messages_unread on fan_messages(to_handle, is_read);

alter table fan_messages enable row level security;

drop policy if exists "anyone can send" on fan_messages;
create policy "anyone can send" on fan_messages
  for insert with check (true);

drop policy if exists "anyone can read" on fan_messages;
create policy "anyone can read" on fan_messages
  for select using (true);

drop policy if exists "anyone can update" on fan_messages;
create policy "anyone can update" on fan_messages
  for update using (true);
