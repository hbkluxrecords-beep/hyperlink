-- =============================================================================
-- HYPERLINK — Supabase schema
-- Run this entire file inside the Supabase SQL Editor for your new project.
-- It creates the profiles table, locks down writes with RLS, and exposes
-- read + insert (no update/delete) to the anon key used by the frontend.
-- =============================================================================

create table if not exists profiles (
  id           bigserial primary key,
  handle       text unique not null check (handle ~ '^[a-z0-9_-]{3,24}$'),
  display_name text not null,
  bio          text default '',
  category     text not null check (category in ('streamer','musician','creator','developer')),
  pinned       jsonb,
  links        jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists profiles_created_at_idx on profiles (created_at desc);

-- Row Level Security
alter table profiles enable row level security;

-- Anyone can READ any profile (these are public pages)
drop policy if exists "public can read profiles" on profiles;
create policy "public can read profiles"
  on profiles for select
  using (true);

-- Anyone can INSERT a profile (no auth required for v1)
-- Unique constraint on `handle` prevents collisions.
drop policy if exists "public can insert profiles" on profiles;
create policy "public can insert profiles"
  on profiles for insert
  with check (true);

-- Intentionally no UPDATE or DELETE policy — write-once until you add auth.
