-- ============================================================
-- PARTNERS / BRAND COLLAB TRACKING
-- Love It Digital x Plinks: artist pages on their own domain.
-- LID sells at $75/artist. Split: plinks owner $25, LID $50.
-- A handful of high-influence artists get onboarded FREE first
-- as launch partners (they promote on drop day).
-- ============================================================

-- Tag artist profiles that came through a partner channel
alter table artist_profiles add column if not exists partner_code text;
alter table profiles add column if not exists partner_code text;

-- One row per artist onboarded through a partner deal.
create table if not exists partner_signups (
  id uuid primary key default gen_random_uuid(),
  partner_code text not null default 'loveit',     -- which partner deal
  artist_handle text not null,                     -- the plinks artist handle
  artist_name text,                                -- display name (convenience)
  custom_domain text,                              -- e.g. drake.com (LID registers it)
  tier text not null default 'paid',               -- 'paid' ($75) or 'launch' (free influencer)
  -- money is tracked in cents, owner = the plinks side ($25), partner = LID side ($50)
  owner_cut_cents int not null default 2500,       -- what YOU are owed
  partner_cut_cents int not null default 5000,     -- what Oziel/LID keeps
  amount_collected_cents int not null default 0,   -- what the client actually paid ($75 = 7500; free = 0)
  status text not null default 'pending',          -- pending | live | paid_out | cancelled
  owner_paid_out boolean not null default false,   -- has YOUR $25 been settled to you
  notes text,
  created_at timestamptz default now(),
  went_live_at timestamptz
);

create index if not exists idx_partner_signups_code on partner_signups(partner_code);
create index if not exists idx_partner_signups_handle on partner_signups(artist_handle);
create unique index if not exists idx_partner_signups_unique on partner_signups(partner_code, artist_handle);

alter table partner_signups enable row level security;

-- Public can read aggregate-ish rows (dashboard is gated in-app by a code, not RLS).
-- Insert/update open so the signup flow + the shared partner dashboard both work
-- without service-role. Money columns are not user-editable in the UI.
create policy "partner_signups_select_all" on partner_signups for select using (true);
create policy "partner_signups_insert_any" on partner_signups for insert with check (true);
create policy "partner_signups_update_any" on partner_signups for update using (true);

-- Optional: a tiny table to hold partner deal config so terms aren't hardcoded forever.
create table if not exists partners (
  code text primary key,                  -- 'loveit'
  name text not null,                     -- 'Love It Digital'
  owner_cut_cents int not null default 2500,
  partner_cut_cents int not null default 5000,
  list_price_cents int not null default 7500,
  active boolean not null default true,
  created_at timestamptz default now()
);

insert into partners (code, name, owner_cut_cents, partner_cut_cents, list_price_cents)
values ('loveit', 'Love It Digital', 2500, 5000, 7500)
on conflict (code) do nothing;

alter table partners enable row level security;
create policy "partners_select_all" on partners for select using (true);
