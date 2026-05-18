import { supabase } from '../../lib/storage.js';
import { getSessionId } from './audioUtils.js';

const hasSupabase = !!supabase;

// ============================================================================
// LOCAL FALLBACK
// ============================================================================
const LS_PREFIX = 'plinks-studio:';
const lsGet = (k) => {
  try {
    const v = localStorage.getItem(LS_PREFIX + k);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
};
const lsSet = (k, v) => {
  try { localStorage.setItem(LS_PREFIX + k, JSON.stringify(v)); } catch {}
};

// ============================================================================
// ARTIST PROFILES
// ============================================================================
export async function loadArtist(handle) {
  const h = handle.toLowerCase().trim();
  if (!h) return null;

  if (!hasSupabase) {
    const profile = lsGet(`artist:${h}`);
    if (!profile) return null;
    const releases = lsGet(`releases:${h}`) || [];
    return { ...profile, releases };
  }

  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('handle', h)
    .maybeSingle();
  if (error || !data) return null;

  const { data: releases } = await supabase
    .from('presave_releases')
    .select('*')
    .eq('artist_handle', h)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return rowToArtist(data, releases || []);
}

export async function isArtistHandleTaken(handle) {
  const a = await loadArtist(handle);
  return !!a;
}

export async function saveArtist(profile) {
  const h = profile.handle.toLowerCase().trim();
  const record = {
    handle: h,
    artist_name: profile.artistName?.trim() || h,
    bio: profile.bio?.trim() || '',
    genre_tags: profile.genres || [],
    location: profile.location?.trim() || '',
    photo_url: profile.photoUrl || null,
    links: profile.links || [],
    tour_dates: profile.tourDates || [],
    socials: profile.socials || {},
  };

  if (!hasSupabase) {
    const existing = lsGet(`artist:${h}`);
    lsSet(`artist:${h}`, {
      ...(existing || {}),
      ...record,
      artistName: record.artist_name,
      createdAt: existing?.createdAt || Date.now(),
    });
    const idx = lsGet('artist-index') || [];
    if (!idx.includes(h)) lsSet('artist-index', [h, ...idx].slice(0, 100));
    return { ok: true };
  }

  const { error } = await supabase.from('artist_profiles').upsert(record, { onConflict: 'handle' });
  if (error) {
    console.error('saveArtist error:', error);
    return { ok: false, error: error.message || error.details || 'Failed to save' };
  }
  return { ok: true };
}

export async function savePresaveRelease(handle, release) {
  const h = handle.toLowerCase().trim();
  const record = {
    artist_handle: h,
    track_title: release.trackTitle,
    release_date: release.releaseDate || null,
    cover_art_url: release.coverArtUrl || null,
    audio_preview_url: release.audioPreviewUrl || null,
    waveform_data: release.waveformData || null,
    presave_url: release.presaveUrl,
    platforms: release.platforms || [],
    is_active: true,
  };

  if (!hasSupabase) {
    const list = lsGet(`releases:${h}`) || [];
    list.unshift({ ...record, id: Date.now(), created_at: new Date().toISOString() });
    lsSet(`releases:${h}`, list);
    return { ok: true };
  }

  const { error } = await supabase.from('presave_releases').insert(record);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updatePresaveRelease(handle, releaseId, fields) {
  const h = handle.toLowerCase().trim();
  const update = {};
  if (fields.trackTitle !== undefined) update.track_title = fields.trackTitle;
  if (fields.releaseDate !== undefined) update.release_date = fields.releaseDate || null;
  if (fields.coverArtUrl !== undefined) update.cover_art_url = fields.coverArtUrl;
  if (fields.audioPreviewUrl !== undefined) update.audio_preview_url = fields.audioPreviewUrl;
  if (fields.waveformData !== undefined) update.waveform_data = fields.waveformData;
  if (fields.presaveUrl !== undefined) update.presave_url = fields.presaveUrl;
  if (fields.platforms !== undefined) update.platforms = fields.platforms;

  if (!hasSupabase) {
    const list = lsGet(`releases:${h}`) || [];
    const idx = list.findIndex((r) => String(r.id) === String(releaseId));
    if (idx === -1) return { ok: false, error: 'Release not found' };
    list[idx] = { ...list[idx], ...update };
    lsSet(`releases:${h}`, list);
    return { ok: true };
  }

  const { error } = await supabase.from('presave_releases').update(update).eq('id', releaseId).eq('artist_handle', h);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function loadRecentArtists(limit = 24) {
  if (!hasSupabase) {
    const idx = lsGet('artist-index') || [];
    return idx.slice(0, limit).map((h) => {
      const p = lsGet(`artist:${h}`);
      return p ? { ...p, releases: lsGet(`releases:${h}`) || [] } : null;
    }).filter(Boolean);
  }

  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((row) => rowToArtist(row, []));
}

// ============================================================================
// FILE UPLOADS (Supabase Storage)
// ============================================================================
export async function uploadFile(bucket, file, handle) {
  if (!hasSupabase) {
    // local fallback: convert to data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ ok: true, url: reader.result });
      reader.onerror = () => resolve({ ok: false, error: 'Read failed' });
      reader.readAsDataURL(file);
    });
  }

  const ext = file.name.split('.').pop().toLowerCase();
  const path = `${handle}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

// ============================================================================
// ANALYTICS EVENTS
// ============================================================================
export async function trackEvent(handle, eventType, metadata = {}) {
  if (!handle || !eventType) return;
  const record = {
    artist_handle: handle.toLowerCase().trim(),
    event_type: eventType,
    metadata,
    referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct',
    session_id: getSessionId(),
  };

  if (!hasSupabase) {
    const events = lsGet(`events:${record.artist_handle}`) || [];
    events.push({ ...record, created_at: new Date().toISOString() });
    lsSet(`events:${record.artist_handle}`, events.slice(-500));
    return;
  }

  try {
    await supabase.from('studio_events').insert(record);
  } catch (e) {
    // Silent — analytics shouldn't break the UI
  }
}

export async function loadAnalytics(handle) {
  const h = handle.toLowerCase().trim();

  if (!hasSupabase) {
    return lsGet(`events:${h}`) || [];
  }

  const { data, error } = await supabase
    .from('studio_events')
    .select('*')
    .eq('artist_handle', h)
    .order('created_at', { ascending: false })
    .limit(5000);
  if (error || !data) return [];
  return data;
}

// ============================================================================
// HELPERS
// ============================================================================
function rowToArtist(row, releases) {
  return {
    handle: row.handle,
    artistName: row.artist_name || row.handle,
    bio: row.bio,
    genres: row.genre_tags || [],
    location: row.location,
    photoUrl: row.photo_url,
    links: row.links || [],
    tourDates: row.tour_dates || [],
    socials: row.socials || {},
    releases: releases.map((r) => ({
      id: r.id,
      trackTitle: r.track_title,
      releaseDate: r.release_date,
      coverArtUrl: r.cover_art_url,
      audioPreviewUrl: r.audio_preview_url,
      waveformData: r.waveform_data,
      presaveUrl: r.presave_url,
      platforms: r.platforms || [],
    })),
    isPremium: !!row.is_premium,
    stripeCustomerId: row.stripe_customer_id || null,
    subscriptionStatus: row.subscription_status || null,
    accentColor: row.accent_color || null,
    releaseLayout: row.release_layout || 'compact',
    isFeatured: !!row.is_featured,
    animatedBg: !!row.animated_bg,
    hideReleaseDate: !!row.hide_release_date,
    textEffect: row.text_effect || 'none',
    createdAt: row.created_at,
  };
}

export const usingSupabase = hasSupabase;
