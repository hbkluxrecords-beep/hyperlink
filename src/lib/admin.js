import { supabase } from './storage.js';
import { getSession } from './auth.js';

const hasSupabase = !!supabase;

export const ADMIN_HANDLE = 'hbk';

export function isAdmin() {
  const s = getSession();
  return s?.handle?.toLowerCase() === ADMIN_HANDLE;
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
  const artistRows = (a.data || []).map((r) => ({
    handle: r.handle,
    name: r.artist_name,
    type: 'artist',
    photoUrl: r.photo_url,
    genres: r.genre_tags || [],
  }));
  const creatorRows = (c.data || []).map((r) => ({
    handle: r.handle,
    name: r.display_name,
    type: 'creator',
    category: r.category,
  }));
  return [...artistRows, ...creatorRows];
}
