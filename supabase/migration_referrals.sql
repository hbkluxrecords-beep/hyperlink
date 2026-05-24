-- Referral system
-- Each profile can have a referrer (who brought them) tracked at signup.
-- Earnings accrue when a referred user becomes premium.

-- Add referral columns to both profile tables
alter table profiles add column if not exists referred_by text;
alter table artist_profiles add column if not exists referred_by text;

-- Referral earnings ledger — one row per referred user per referrer
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_handle text not null,
  referred_handle text not null,
  referred_type text default 'creator',     -- 'creator' | 'artist'
  status text default 'pending',             -- 'pending' (signed up) | 'converted' (went premium) | 'churned'
  reward_cents int default 0,                -- accrued reward owed to referrer
  converted_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_referrals_referrer on referrals(referrer_handle);
create unique index if not exists idx_referrals_unique on referrals(referred_handle);

alter table referrals enable row level security;

drop policy if exists "referrals_select_all" on referrals;
create policy "referrals_select_all" on referrals for select using (true);

drop policy if exists "referrals_insert_any" on referrals;
create policy "referrals_insert_any" on referrals for insert with check (true);

drop policy if exists "referrals_update_any" on referrals;
create policy "referrals_update_any" on referrals for update using (true);

-- Payout requests — when a referrer cashes out
create table if not exists payout_requests (
  id uuid primary key default gen_random_uuid(),
  handle text not null,
  amount_cents int not null,
  method text,                               -- 'cashapp' | 'paypal' | 'venmo'
  destination text,                          -- their $cashtag / email / etc
  status text default 'requested',           -- 'requested' | 'paid' | 'rejected'
  created_at timestamptz default now(),
  paid_at timestamptz
);

create index if not exists idx_payout_requests_handle on payout_requests(handle);

alter table payout_requests enable row level security;

drop policy if exists "payouts_select_all" on payout_requests;
create policy "payouts_select_all" on payout_requests for select using (true);

drop policy if exists "payouts_insert_any" on payout_requests;
create policy "payouts_insert_any" on payout_requests for insert with check (true);
