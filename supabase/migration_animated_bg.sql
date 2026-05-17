-- Animated background premium feature
alter table artist_profiles add column if not exists animated_bg boolean default false;
alter table profiles add column if not exists animated_bg boolean default false;
