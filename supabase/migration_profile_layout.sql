-- Creator profile layout: editorial (big aura) or minimal (tight)
alter table profiles add column if not exists profile_layout text default 'minimal';
