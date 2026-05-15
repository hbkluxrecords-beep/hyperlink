-- ============================================================================
-- PLINKS STUDIO — Supabase migration
-- Run this in the Supabase SQL Editor for your project.
-- 100% additive — does NOT touch the existing `profiles` table.
-- Existing site at plinks.dev will keep working regardless.
-- ============================================================================

-- ARTIST PROFILES
create table if not exists artist_profiles (
  id           bigserial primary key,
  handle       text unique not null check (handle ~ '^[a-z0-9_-]{3,24}$'),
  artist_name  text not null,
  bio          text default '',
  genre_tags   jsonb default '[]'::jsonb,
  location     text default '',
  photo_url    text,
  links        jsonb default '[]'::jsonb,
  tour_dates   jsonb default '[]'::jsonb,
  socials      jsonb default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists artist_profiles_created_at_idx on artist_profiles (created_at desc);

alter table artist_profiles enable row level security;

drop policy if exists "public can read artist_profiles" on artist_profiles;
create policy "public can read artist_profiles" on artist_profiles for select using (true);

drop policy if exists "public can insert artist_profiles" on artist_profiles;
create policy "public can insert artist_profiles" on artist_profiles for insert with check (true);

-- PRESAVE RELEASES
create table if not exists presave_releases (
  id                bigserial primary key,
  artist_handle     text not null references artist_profiles(handle) on delete cascade,
  track_title       text not null,
  release_date      timestamptz,
  cover_art_url     text,
  audio_preview_url text,
  waveform_data     jsonb,
  presave_url       text not null,
  platforms         jsonb default '[]'::jsonb,
  is_active         boolean default true,
  created_at        timestamptz not null default now()
);

create index if not exists presave_releases_handle_idx on presave_releases (artist_handle, created_at desc);

alter table presave_releases enable row level security;

drop policy if exists "public can read presave_releases" on presave_releases;
create policy "public can read presave_releases" on presave_releases for select using (true);

drop policy if exists "public can insert presave_releases" on presave_releases;
create policy "public can insert presave_releases" on presave_releases for insert with check (true);

-- STUDIO EVENTS (analytics)
create table if not exists studio_events (
  id            bigserial primary key,
  artist_handle text not null,
  event_type    text not null check (event_type in ('view','link_click','audio_play','presave_click','video_play')),
  metadata      jsonb default '{}'::jsonb,
  referrer      text default 'direct',
  session_id    text,
  created_at    timestamptz not null default now()
);

create index if not exists studio_events_handle_time_idx on studio_events (artist_handle, created_at desc);
create index if not exists studio_events_session_idx on studio_events (session_id);

alter table studio_events enable row level security;

drop policy if exists "public can read studio_events" on studio_events;
create policy "public can read studio_events" on studio_events for select using (true);

drop policy if exists "public can insert studio_events" on studio_events;
create policy "public can insert studio_events" on studio_events for insert with check (true);

-- ============================================================================
-- STORAGE BUCKETS
-- After running this SQL, go to Storage section in Supabase and create:
--   1. audio-previews (public, 5MB limit)
--   2. artist-photos  (public, 5MB limit)
--   3. cover-art      (public, 5MB limit)
-- Or run these inserts (Supabase Storage API):
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('audio-previews', 'audio-previews', true, 5242880, array['audio/mpeg','audio/mp3','audio/m4a','audio/x-m4a','audio/mp4']),
  ('artist-photos',  'artist-photos',  true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('cover-art',      'cover-art',      true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Public upload policies for storage
drop policy if exists "public upload audio-previews" on storage.objects;
create policy "public upload audio-previews" on storage.objects
  for insert with check (bucket_id = 'audio-previews');

drop policy if exists "public upload artist-photos" on storage.objects;
create policy "public upload artist-photos" on storage.objects
  for insert with check (bucket_id = 'artist-photos');

drop policy if exists "public upload cover-art" on storage.objects;
create policy "public upload cover-art" on storage.objects
  for insert with check (bucket_id = 'cover-art');

drop policy if exists "public read studio buckets" on storage.objects;
create policy "public read studio buckets" on storage.objects
  for select using (bucket_id in ('audio-previews','artist-photos','cover-art'));
