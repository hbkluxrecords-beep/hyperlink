import { supabase } from './storage.js';

const hasSupabase = !!supabase;

/**
 * Convert a creator profile to an artist profile in-place.
 * Copies handle, name, bio, premium status, then deletes the creators row.
 */
export async function convertToArtist(handle) {
  if (!hasSupabase) return { ok: false, error: 'No DB connection' };
  const h = handle.toLowerCase().trim();

  // Check if already an artist
  const { data: existingArtist } = await supabase
    .from('artist_profiles')
    .select('handle')
    .eq('handle', h)
    .maybeSingle();
  if (existingArtist) return { ok: true, message: 'Already an artist' };

  // Load creator row
  const { data: creator, error: loadErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', h)
    .maybeSingle();
  if (loadErr || !creator) return { ok: false, error: 'Profile not found' };

  // Insert into artist_profiles
  const { error: insertErr } = await supabase.from('artist_profiles').insert({
    handle: h,
    artist_name: creator.display_name || h,
    bio: creator.bio || '',
    is_premium: !!creator.is_premium,
    is_featured: !!creator.is_featured,
    stripe_customer_id: creator.stripe_customer_id || null,
    subscription_status: creator.subscription_status || null,
    premium_since: creator.premium_since || null,
    password_hash: creator.password_hash || null,
    claimed_at: creator.claimed_at || null,
    accent_color: creator.accent_color || null,
    socials: creator.links ? creator.links.reduce((acc, l) => {
      const key = (l.label || '').toLowerCase();
      if (key) acc[key] = l.url;
      return acc;
    }, {}) : {},
  });
  if (insertErr) return { ok: false, error: insertErr.message };

  // Delete creator row
  const { error: delErr } = await supabase.from('profiles').delete().eq('handle', h);
  if (delErr) return { ok: false, error: delErr.message };

  return { ok: true };
}

/**
 * Convert an artist profile to a creator profile in-place.
 */
export async function convertToCreator(handle, category = 'creator') {
  if (!hasSupabase) return { ok: false, error: 'No DB connection' };
  const h = handle.toLowerCase().trim();

  // Check if already a creator
  const { data: existingCreator } = await supabase
    .from('profiles')
    .select('handle')
    .eq('handle', h)
    .maybeSingle();
  if (existingCreator) return { ok: true, message: 'Already a creator' };

  const { data: artist, error: loadErr } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('handle', h)
    .maybeSingle();
  if (loadErr || !artist) return { ok: false, error: 'Profile not found' };

  // Insert into profiles
  const { error: insertErr } = await supabase.from('profiles').insert({
    handle: h,
    display_name: artist.artist_name || h,
    bio: artist.bio || '',
    category,
    is_premium: !!artist.is_premium,
    is_featured: !!artist.is_featured,
    stripe_customer_id: artist.stripe_customer_id || null,
    subscription_status: artist.subscription_status || null,
    premium_since: artist.premium_since || null,
    password_hash: artist.password_hash || null,
    claimed_at: artist.claimed_at || null,
    accent_color: artist.accent_color || null,
    links: artist.socials ? Object.entries(artist.socials).map(([label, url]) => ({ label, url })) : [],
  });
  if (insertErr) return { ok: false, error: insertErr.message };

  // Delete artist row
  const { error: delErr } = await supabase.from('artist_profiles').delete().eq('handle', h);
  if (delErr) return { ok: false, error: delErr.message };

  return { ok: true };
}
