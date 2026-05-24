import { supabase } from './storage.js';

const REWARD_PER_CONVERSION_CENTS = 100; // $1 per active premium referral / month equivalent
const REF_STORAGE_KEY = 'plinks-referred-by';

/**
 * Reward model (safe, never pay out more than we take in):
 * - A referral that converts to premium accrues $1 (100 cents) reward to the referrer.
 * - Premium is $7/mo, so a $1 bounty per conversion keeps margin healthy.
 * - Tracked as owed; paid manually via payout requests until Stripe Connect is added.
 */

// Called on any page load with ?ref= or /r/:handle — stash the referrer
export function captureReferrer(handle) {
  if (!handle) return;
  try {
    const clean = handle.toLowerCase().trim();
    // Don't overwrite an existing capture (first-touch attribution)
    if (!localStorage.getItem(REF_STORAGE_KEY)) {
      localStorage.setItem(REF_STORAGE_KEY, clean);
    }
  } catch {}
}

export function getStoredReferrer() {
  try {
    return localStorage.getItem(REF_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function clearStoredReferrer() {
  try {
    localStorage.removeItem(REF_STORAGE_KEY);
  } catch {}
}

/**
 * Record a new referral when a user signs up.
 * Called after a successful profile creation.
 */
export async function recordReferral(referredHandle, referredType = 'creator') {
  if (!supabase) return { ok: false };
  const referrer = getStoredReferrer();
  if (!referrer) return { ok: false, reason: 'no-referrer' };

  const referred = referredHandle.toLowerCase().trim();
  // Can't refer yourself
  if (referrer === referred) {
    clearStoredReferrer();
    return { ok: false, reason: 'self-referral' };
  }

  try {
    // Verify the referrer actually exists (in either table)
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from('profiles').select('handle').eq('handle', referrer).maybeSingle(),
      supabase.from('artist_profiles').select('handle').eq('handle', referrer).maybeSingle(),
    ]);
    if (!p && !a) {
      clearStoredReferrer();
      return { ok: false, reason: 'referrer-not-found' };
    }

    // Insert the referral (unique index prevents dupes)
    const { error } = await supabase.from('referrals').insert({
      referrer_handle: referrer,
      referred_handle: referred,
      referred_type: referredType,
      status: 'pending',
      reward_cents: 0,
    });

    // Tag the profile too
    const table = referredType === 'artist' ? 'artist_profiles' : 'profiles';
    await supabase.from(table).update({ referred_by: referrer }).eq('handle', referred);

    clearStoredReferrer();
    return { ok: !error, error: error?.message };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Mark a referral as converted when the referred user goes premium.
 * Call this from the premium-activation flow (or webhook later).
 */
export async function markReferralConverted(referredHandle) {
  if (!supabase) return { ok: false };
  const referred = referredHandle.toLowerCase().trim();
  try {
    const { data: ref } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_handle', referred)
      .maybeSingle();
    if (!ref || ref.status === 'converted') return { ok: true }; // nothing to do

    const { error } = await supabase
      .from('referrals')
      .update({
        status: 'converted',
        reward_cents: REWARD_PER_CONVERSION_CENTS,
        converted_at: new Date().toISOString(),
      })
      .eq('id', ref.id);
    return { ok: !error, error: error?.message };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Get a referrer's full stats for their dashboard.
 */
export async function getReferralStats(handle) {
  if (!supabase) return { total: 0, converted: 0, pending: 0, earnedCents: 0, referrals: [] };
  const h = handle.toLowerCase().trim();
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_handle', h)
      .order('created_at', { ascending: false });
    if (error || !data) return { total: 0, converted: 0, pending: 0, earnedCents: 0, referrals: [] };

    const converted = data.filter((r) => r.status === 'converted').length;
    const pending = data.filter((r) => r.status === 'pending').length;
    const earnedCents = data.reduce((sum, r) => sum + (r.reward_cents || 0), 0);

    return {
      total: data.length,
      converted,
      pending,
      earnedCents,
      referrals: data,
    };
  } catch {
    return { total: 0, converted: 0, pending: 0, earnedCents: 0, referrals: [] };
  }
}

/**
 * Request a payout of accrued earnings.
 */
export async function requestPayout(handle, amountCents, method, destination) {
  if (!supabase) return { ok: false };
  try {
    const { error } = await supabase.from('payout_requests').insert({
      handle: handle.toLowerCase().trim(),
      amount_cents: amountCents,
      method,
      destination,
      status: 'requested',
    });
    return { ok: !error, error: error?.message };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export function formatMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
