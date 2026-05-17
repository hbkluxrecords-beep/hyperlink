import { supabase } from './storage.js';
import { getSession, setSession } from './auth.js';

const hasSupabase = !!supabase;
const IMPERSONATE_KEY = 'plinks-admin-original';

export const ADMIN_HANDLE = 'hbk';

export function isAdmin() {
  // True if current session OR the original (pre-impersonate) session is hbk
  const cur = getSession();
  if (cur?.handle?.toLowerCase() === ADMIN_HANDLE) return true;
  try {
    const orig = JSON.parse(localStorage.getItem(IMPERSONATE_KEY) || 'null');
    return orig?.handle?.toLowerCase() === ADMIN_HANDLE;
  } catch {
    return false;
  }
}

export function isImpersonating() {
  try {
    return !!localStorage.getItem(IMPERSONATE_KEY);
  } catch {
    return false;
  }
}

export function getOriginalAdmin() {
  try {
    return JSON.parse(localStorage.getItem(IMPERSONATE_KEY) || 'null');
  } catch {
    return null;
  }
}

/**
 * Swap session to another user. Only runs if current user is admin.
 * Stores the original admin session so we can swap back.
 */
export function impersonate(handle, type) {
  const cur = getSession();
  if (cur?.handle?.toLowerCase() !== ADMIN_HANDLE && !isImpersonating()) return false;
  // Save original admin session (only if not already impersonating)
  if (!isImpersonating() && cur) {
    try { localStorage.setItem(IMPERSONATE_KEY, JSON.stringify(cur)); } catch {}
  }
  setSession({ handle: handle.toLowerCase(), type });
  return true;
}

export function stopImpersonating() {
  try {
    const raw = localStorage.getItem(IMPERSONATE_KEY);
    if (!raw) return;
    const orig = JSON.parse(raw);
    setSession(orig);
    localStorage.removeItem(IMPERSONATE_KEY);
  } catch {}
}

export async function getAdminStats() {
  if (!hasSupabase) return null;
  const [artists, creators, premArt, premCre, msgs, subs] = await Promise.all([
    supabase.from('artist_profiles').select('handle', { count: 'exact', head: true }),
    supabase.from('profiles').select('handle', { count: 'exact', head: true }),
    supabase.from('artist_profiles').select('handle', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('profiles').select('handle', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('fan_messages').select('id', { count: 'exact', head: true }),
    supabase.from('drop_alerts').select('id', { count: 'exact', head: true }),
  ]);
  return {
    artists: artists.count || 0,
    creators: creators.count || 0,
    premiumArtists: premArt.count || 0,
    premiumCreators: premCre.count || 0,
    totalMessages: msgs.count || 0,
    totalSubscribers: subs.count || 0,
  };
}

export async function listAllProfiles() {
  if (!hasSupabase) return { artists: [], creators: [] };
  const [a, c] = await Promise.all([
    supabase.from('artist_profiles').select('handle, artist_name, is_premium, is_featured, created_at').order('created_at', { ascending: false }),
    supabase.from('profiles').select('handle, display_name, category, is_premium, is_featured, created_at').order('created_at', { ascending: false }),
  ]);
  return {
    artists: a.data || [],
    creators: c.data || [],
  };
}

export async function toggleFeatured(handle, type, isFeatured) {
  if (!hasSupabase) return { ok: false };
  const table = type === 'artist' ? 'artist_profiles' : 'profiles';
  const { error } = await supabase.from(table).update({ is_featured: isFeatured }).eq('handle', handle.toLowerCase());
  return { ok: !error, error: error?.message };
}

export async function listFeatured() {
  if (!hasSupabase) return [];
  const [a, c] = await Promise.all([
    supabase.from('artist_profiles').select('*').eq('is_featured', true).limit(8),
    supabase.from('profiles').select('*').eq('is_featured', true).limit(4),
  ]);

  // Pull latest release per artist for preview audio
  const artistHandles = (a.data || []).map((r) => r.handle);
  let releasesByHandle = {};
  if (artistHandles.length > 0) {
    const { data: releases } = await supabase
      .from('presave_releases')
      .select('artist_handle, track_title, cover_art_url, audio_preview_url, created_at')
      .in('artist_handle', artistHandles)
      .order('created_at', { ascending: false });
    for (const r of releases || []) {
      if (!releasesByHandle[r.artist_handle]) {
        releasesByHandle[r.artist_handle] = r;
      }
    }
  }

  const artistRows = (a.data || []).map((r) => {
    const rel = releasesByHandle[r.handle];
    return {
      handle: r.handle,
      name: r.artist_name,
      type: 'artist',
      photoUrl: r.photo_url,
      genres: r.genre_tags || [],
      trackTitle: rel?.track_title || null,
      coverArtUrl: rel?.cover_art_url || null,
      audioPreviewUrl: rel?.audio_preview_url || null,
    };
  });
  const creatorRows = (c.data || []).map((r) => ({
    handle: r.handle,
    name: r.display_name,
    type: 'creator',
    category: r.category,
  }));
  return [...artistRows, ...creatorRows];
}
