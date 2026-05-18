import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// We allow the app to run without env vars in local dev — it falls back to
// localStorage so you can demo the UI even before wiring Supabase.
const hasSupabase = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
export const supabase = hasSupabase ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// =============================================================================
// LOCAL FALLBACK — used when Supabase env vars are missing
// =============================================================================
const LS_PREFIX = 'hyperlink:';
const lsGet = (k) => {
  try {
    const v = localStorage.getItem(LS_PREFIX + k);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
};
const lsSet = (k, v) => {
  try { localStorage.setItem(LS_PREFIX + k, JSON.stringify(v)); } catch {}
};

// =============================================================================
// PROFILES API
// =============================================================================

/**
 * Load a single profile by handle (lowercased automatically).
 * Returns null if not found.
 */
export async function loadProfile(handle) {
  const h = handle.toLowerCase().trim();
  if (!h) return null;

  if (!hasSupabase) {
    return lsGet(`profile:${h}`);
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', h)
    .maybeSingle();

  if (error || !data) return null;
  return rowToProfile(data);
}

/**
 * Check whether a handle is already taken. Used during the create flow.
 */
export async function isHandleTaken(handle) {
  const profile = await loadProfile(handle);
  return !!profile;
}

/**
 * Check whether a handle is taken in EITHER table (creator or artist).
 * Used for cross-namespace collision prevention.
 * Returns { taken: bool, type: 'creator' | 'artist' | null }
 */
export async function isHandleTakenAnywhere(handle) {
  const h = handle.toLowerCase().trim();

  if (!hasSupabase) {
    // localStorage fallback
    const creatorKey = `hyperlink:profile:${h}`;
    const artistKey = `plinks-studio:artist:${h}`;
    try {
      if (localStorage.getItem(creatorKey)) return { taken: true, type: 'creator' };
      if (localStorage.getItem(artistKey)) return { taken: true, type: 'artist' };
    } catch {}
    return { taken: false, type: null };
  }

  // Check artist first
  const { data: artist } = await supabase
    .from('artist_profiles')
    .select('handle')
    .eq('handle', h)
    .maybeSingle();
  if (artist) return { taken: true, type: 'artist' };

  // Then creator
  const { data: creator } = await supabase
    .from('profiles')
    .select('handle')
    .eq('handle', h)
    .maybeSingle();
  if (creator) return { taken: true, type: 'creator' };

  return { taken: false, type: null };
}

/**
 * Save a profile. Inserts on first publish, fails on conflict so we never
 * silently overwrite someone else's handle. Returns { ok: bool, error?: string }.
 */
export async function saveProfile(profile) {
  const h = profile.handle.toLowerCase().trim();
  const record = {
    handle: h,
    display_name: profile.displayName?.trim() || h,
    bio: profile.bio?.trim() || '',
    category: profile.category,
    pinned: profile.pinned || null,
    links: profile.links || [],
  };

  if (!hasSupabase) {
    const existing = lsGet(`profile:${h}`);
    lsSet(`profile:${h}`, {
      ...(existing || {}),
      ...record,
      displayName: record.display_name,
      createdAt: existing?.createdAt || Date.now(),
    });
    const idx = lsGet('index') || [];
    if (!idx.includes(h)) lsSet('index', [h, ...idx].slice(0, 100));
    return { ok: true };
  }

  const { error } = await supabase.from('profiles').upsert(record, { onConflict: 'handle' });
  if (error) {
    console.error('saveProfile error:', error);
    return { ok: false, error: error.message || error.details || 'Failed to save' };
  }
  return { ok: true };
}

/**
 * Load the most recent N profiles for the directory page.
 */
export async function loadRecentProfiles(limit = 24) {
  if (!hasSupabase) {
    const idx = lsGet('index') || [];
    return idx.slice(0, limit).map((h) => lsGet(`profile:${h}`)).filter(Boolean);
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(rowToProfile);
}

// =============================================================================
// Helpers
// =============================================================================
function rowToProfile(row) {
  return {
    handle: row.handle,
    displayName: row.display_name,
    bio: row.bio,
    category: row.category,
    pinned: row.pinned,
    links: row.links || [],
    isPremium: !!row.is_premium,
    stripeCustomerId: row.stripe_customer_id || null,
    subscriptionStatus: row.subscription_status || null,
    accentColor: row.accent_color || null,
    isFeatured: !!row.is_featured,
    glowButtons: !!row.glow_buttons,
    glowPinned: !!row.glow_pinned,
    glowLinks: !!row.glow_links,
    glowBio: !!row.glow_bio,
    glowPinnedColor: row.glow_pinned_color || null,
    glowLinksColor: row.glow_links_color || null,
    glowBioColor: row.glow_bio_color || null,
    portfolioUrl: row.portfolio_url || null,
    profileLayout: row.profile_layout || 'minimal',
    createdAt: row.created_at,
  };
}

export const usingSupabase = hasSupabase;
