// Plinks Auth — password hashing, session, update access
import { supabase } from './storage.js';

const SESSION_KEY = 'plinks-session';
const hasSupabase = !!supabase;

// --- Password hashing (SHA-256 via Web Crypto) ---
// Note: For production we'd want bcrypt/argon2 on a server. This is v1
// client-side hashing + a per-handle salt so rainbow tables don't work.
export async function hashPassword(password, handle) {
  const salt = `plinks:${handle.toLowerCase()}`;
  const text = `${salt}:${password}`;
  const buffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const bytes = Array.from(new Uint8Array(hashBuffer));
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function validatePassword(password) {
  if (!password || password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > 100) return 'Password too long';
  return null;
}

// --- Session management (localStorage) ---
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function isOwnerOf(handle) {
  const s = getSession();
  if (!s || !s.handle || !handle) return false;
  return s.handle.toLowerCase() === handle.toLowerCase();
}

// --- Auth operations ---

/**
 * Check if a handle exists in either profile table and whether it's claimed.
 * Returns { exists, claimed, type } where type is 'artist' | 'creator' | null
 */
export async function checkHandle(handle) {
  const h = handle.toLowerCase().trim();
  if (!hasSupabase) {
    // Fallback: check localStorage
    const studioKey = `plinks-studio:artist:${h}`;
    const mainKey = `hyperlink:profile:${h}`;
    try {
      const studio = localStorage.getItem(studioKey);
      if (studio) {
        const parsed = JSON.parse(studio);
        return { exists: true, claimed: !!parsed.password_hash, type: 'artist' };
      }
      const main = localStorage.getItem(mainKey);
      if (main) {
        const parsed = JSON.parse(main);
        return { exists: true, claimed: !!parsed.password_hash, type: 'creator' };
      }
    } catch {}
    return { exists: false, claimed: false, type: null };
  }

  // Check artist first, then creator
  const { data: artist } = await supabase
    .from('artist_profiles')
    .select('handle, password_hash')
    .eq('handle', h)
    .maybeSingle();
  if (artist) {
    return { exists: true, claimed: !!artist.password_hash, type: 'artist' };
  }

  const { data: creator } = await supabase
    .from('profiles')
    .select('handle, password_hash')
    .eq('handle', h)
    .maybeSingle();
  if (creator) {
    return { exists: true, claimed: !!creator.password_hash, type: 'creator' };
  }

  return { exists: false, claimed: false, type: null };
}

/**
 * Attempt to log in with handle + password.
 * Returns { ok: bool, error?: string, type?: string }
 */
export async function login(handle, password) {
  const h = handle.toLowerCase().trim();
  const check = await checkHandle(h);

  if (!check.exists) {
    return { ok: false, error: 'No profile found with that handle' };
  }
  if (!check.claimed) {
    return { ok: false, error: 'Profile not yet claimed. Sign up first.' };
  }

  const hash = await hashPassword(password, h);

  // Fetch the actual stored hash
  let storedHash = null;
  if (hasSupabase) {
    const table = check.type === 'artist' ? 'artist_profiles' : 'profiles';
    const { data } = await supabase
      .from(table)
      .select('password_hash')
      .eq('handle', h)
      .maybeSingle();
    storedHash = data?.password_hash;
  } else {
    const key = check.type === 'artist' ? `plinks-studio:artist:${h}` : `hyperlink:profile:${h}`;
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      storedHash = parsed?.password_hash;
    } catch {}
  }

  if (!storedHash || storedHash !== hash) {
    return { ok: false, error: 'Wrong password' };
  }

  setSession({ handle: h, type: check.type, loggedInAt: Date.now() });
  return { ok: true, type: check.type };
}

/**
 * Set a password on a profile (for new signup or claiming existing).
 * Used at the END of create flow and on the Claim flow.
 */
export async function setPasswordForHandle(handle, password, type) {
  const h = handle.toLowerCase().trim();
  const hash = await hashPassword(password, h);

  if (!hasSupabase) {
    const key = type === 'artist' ? `plinks-studio:artist:${h}` : `hyperlink:profile:${h}`;
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      parsed.password_hash = hash;
      parsed.claimed_at = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(parsed));
    } catch (e) {
      return { ok: false, error: 'Could not save password locally' };
    }
    setSession({ handle: h, type, loggedInAt: Date.now() });
    return { ok: true };
  }

  const table = type === 'artist' ? 'artist_profiles' : 'profiles';
  const { error } = await supabase
    .from(table)
    .update({ password_hash: hash, claimed_at: new Date().toISOString() })
    .eq('handle', h);

  if (error) {
    return { ok: false, error: error.message };
  }

  setSession({ handle: h, type, loggedInAt: Date.now() });
  return { ok: true };
}

export function logout() {
  clearSession();
}
