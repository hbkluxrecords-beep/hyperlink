-- =============================================================================
-- PLINKS PREMIUM — Migration
-- Run in Supabase SQL Editor.
-- =============================================================================

alter table profiles add column if not exists is_premium boolean default false;
alter table profiles add column if not exists stripe_customer_id text;
alter table profiles add column if not exists subscription_status text;
alter table profiles add column if not exists premium_since timestamptz;

alter table artist_profiles add column if not exists is_premium boolean default false;
alter table artist_profiles add column if not exists stripe_customer_id text;
alter table artist_profiles add column if not exists subscription_status text;
alter table artist_profiles add column if not exists premium_since timestamptz;

create index if not exists idx_profiles_premium on profiles(is_premium) where is_premium = true;
create index if not exists idx_artist_profiles_premium on artist_profiles(is_premium) where is_premium = true;
