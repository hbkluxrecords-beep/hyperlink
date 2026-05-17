-- Adds release_layout preference to profiles.
-- Values: 'compact' (default, mini player at top) or 'showcase' (big cover, lnk.to style)

alter table artist_profiles add column if not exists release_layout text default 'compact';
alter table profiles add column if not exists release_layout text default 'compact';
