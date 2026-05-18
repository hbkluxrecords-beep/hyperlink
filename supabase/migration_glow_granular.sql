-- Granular glow controls for creator profiles
alter table profiles add column if not exists glow_pinned boolean default false;
alter table profiles add column if not exists glow_links boolean default false;
alter table profiles add column if not exists glow_bio boolean default false;
alter table profiles add column if not exists glow_pinned_color text;
alter table profiles add column if not exists glow_links_color text;
alter table profiles add column if not exists glow_bio_color text;

-- Backfill from existing single toggle if it was set
update profiles set glow_pinned = true, glow_links = true where glow_buttons = true;
