-- Hide release date toggle, text glow effect, portfolio embed
alter table artist_profiles add column if not exists hide_release_date boolean default false;
alter table artist_profiles add column if not exists text_effect text default 'none';
alter table profiles add column if not exists glow_buttons boolean default false;
alter table profiles add column if not exists portfolio_url text;
