-- Featured artist/profile flag for admin promotion
alter table artist_profiles add column if not exists is_featured boolean default false;
alter table profiles add column if not exists is_featured boolean default false;

create index if not exists idx_artist_featured on artist_profiles(is_featured) where is_featured = true;
create index if not exists idx_profile_featured on profiles(is_featured) where is_featured = true;
