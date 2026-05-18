-- Multiple tracks per artist (playlist with skip)
create table if not exists artist_tracks (
  id uuid primary key default gen_random_uuid(),
  artist_handle text not null references artist_profiles(handle) on delete cascade,
  position int default 0,
  title text not null,
  audio_url text,
  cover_url text,
  release_date date,
  presave_url text,
  platforms jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists idx_artist_tracks_handle on artist_tracks(artist_handle);
create index if not exists idx_artist_tracks_position on artist_tracks(artist_handle, position);

alter table artist_tracks enable row level security;

drop policy if exists "tracks_select_all" on artist_tracks;
create policy "tracks_select_all" on artist_tracks for select using (true);

drop policy if exists "tracks_insert_any" on artist_tracks;
create policy "tracks_insert_any" on artist_tracks for insert with check (true);

drop policy if exists "tracks_update_any" on artist_tracks;
create policy "tracks_update_any" on artist_tracks for update using (true);

drop policy if exists "tracks_delete_any" on artist_tracks;
create policy "tracks_delete_any" on artist_tracks for delete using (true);
