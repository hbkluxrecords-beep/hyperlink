import { supabase } from './storage.js';

const hasSupabase = !!supabase;

/**
 * Subscribe an email to drop alerts for a handle.
 */
export async function subscribeToAlerts(handle, email, releaseId = null) {
  if (!hasSupabase) return { ok: false, error: 'Database not configured' };
  const h = handle.toLowerCase().trim();
  const e = email.toLowerCase().trim();

  if (!e || !e.includes('@')) return { ok: false, error: 'Invalid email' };

  const { error } = await supabase.from('drop_alerts').insert({
    handle: h,
    email: e,
    release_id: releaseId,
  });

  if (error) {
    if (error.code === '23505') return { ok: true, alreadySubscribed: true };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * List all subscribers for a handle (artist's own list).
 */
export async function listSubscribers(handle) {
  if (!hasSupabase) return [];
  const h = handle.toLowerCase().trim();
  const { data } = await supabase
    .from('drop_alerts')
    .select('email, created_at, release_id')
    .eq('handle', h)
    .order('created_at', { ascending: false });
  return data || [];
}

/**
 * Convert subscriber list to CSV blob, return download URL.
 */
export function subscribersToCSV(subscribers) {
  const rows = [['email', 'subscribed_at']];
  subscribers.forEach((s) => {
    rows.push([s.email, new Date(s.created_at).toISOString()]);
  });
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  return URL.createObjectURL(blob);
}

/**
 * Send a fan message to an artist.
 */
export async function sendFanMessage(handle, { fromName, fromEmail, message }) {
  if (!hasSupabase) return { ok: false, error: 'Database not configured' };
  const h = handle.toLowerCase().trim();

  if (!message || !message.trim()) return { ok: false, error: 'Message required' };
  if (message.length > 1000) return { ok: false, error: 'Message too long' };

  const { error } = await supabase.from('fan_messages').insert({
    to_handle: h,
    from_name: fromName?.trim() || null,
    from_email: fromEmail?.trim() || null,
    message: message.trim(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * List messages for an artist's inbox.
 */
export async function listMessages(handle) {
  if (!hasSupabase) return [];
  const h = handle.toLowerCase().trim();
  const { data } = await supabase
    .from('fan_messages')
    .select('*')
    .eq('to_handle', h)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function markMessageRead(messageId) {
  if (!hasSupabase) return { ok: false };
  const { error } = await supabase
    .from('fan_messages')
    .update({ is_read: true })
    .eq('id', messageId);
  return { ok: !error };
}

/**
 * Save the accent color preference for a profile.
 */
export async function saveAccentColor(handle, color, type) {
  if (!hasSupabase) return { ok: false };
  const h = handle.toLowerCase().trim();
  const table = type === 'artist' ? 'artist_profiles' : 'profiles';
  const { error } = await supabase.from(table).update({ accent_color: color }).eq('handle', h);
  return { ok: !error };
}

export async function saveReleaseLayout(handle, layout, type) {
  if (!hasSupabase) return { ok: false };
  const h = handle.toLowerCase().trim();
  const table = type === 'artist' ? 'artist_profiles' : 'profiles';
  const { error } = await supabase.from(table).update({ release_layout: layout }).eq('handle', h);
  return { ok: !error };
}

export const PREMIUM_PALETTE = [
  { name: 'Plinks Orange', value: '#FF4D1F' },
  { name: 'Hot Pink', value: '#FF3D7F' },
  { name: 'Electric Cyan', value: '#00F0FF' },
  { name: 'Acid Green', value: '#B3FF1A' },
  { name: 'Royal Purple', value: '#9D4EDD' },
  { name: 'Gold', value: '#FFB800' },
  { name: 'Crimson', value: '#FF0040' },
  { name: 'Mint', value: '#1FFFA8' },
];
