import { supabase } from './storage.js';

/**
 * PARTNER / BRAND COLLAB tracking — Love It Digital x Plinks.
 *
 * Deal (default 'loveit'):
 *  - Love It Digital sells an artist page on the artist's own domain for $75.
 *  - Split: plinks owner gets $25, LID keeps $50 (domain reg + build).
 *  - A few high-influence artists are onboarded FREE first ('launch' tier)
 *    so they all promote on drop day.
 *
 * First-touch attribution, same as referrals: a ?partner=loveit param or the
 * /love-it-digital page stashes the code, and signup tags the new artist.
 */

const PARTNER_STORAGE_KEY = 'plinks-partner-code';

// Static fallback so the UI works even before the partners table is read.
export const PARTNER_DEALS = {
  loveit: {
    code: 'loveit',
    name: 'Love It Digital',
    ownerCutCents: 2500,
    partnerCutCents: 5000,
    listPriceCents: 7500,
  },
};

export function getPartnerDeal(code = 'loveit') {
  return PARTNER_DEALS[code] || PARTNER_DEALS.loveit;
}

// Stash a partner code on landing (first-touch).
export function capturePartner(code) {
  if (!code) return;
  try {
    const clean = code.toLowerCase().trim();
    if (!localStorage.getItem(PARTNER_STORAGE_KEY)) {
      localStorage.setItem(PARTNER_STORAGE_KEY, clean);
    }
  } catch {}
}

export function getStoredPartner() {
  try {
    return localStorage.getItem(PARTNER_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function clearStoredPartner() {
  try {
    localStorage.removeItem(PARTNER_STORAGE_KEY);
  } catch {}
}

/**
 * Record a partner signup when an artist creates their page through the deal.
 * Call after a successful artist profile creation.
 *
 * @param {string} artistHandle
 * @param {string} artistName
 * @param {'paid'|'launch'} tier  'launch' = free influencer, $0 collected
 */
export async function recordPartnerSignup(artistHandle, artistName, tier = 'paid') {
  if (!supabase) return { ok: false };
  const code = getStoredPartner();
  if (!code) return { ok: false, reason: 'no-partner' };

  const deal = getPartnerDeal(code);
  const handle = artistHandle.toLowerCase().trim();
  const isLaunch = tier === 'launch';

  try {
    const { error } = await supabase.from('partner_signups').insert({
      partner_code: code,
      artist_handle: handle,
      artist_name: artistName || handle,
      tier,
      owner_cut_cents: deal.ownerCutCents,
      partner_cut_cents: deal.partnerCutCents,
      amount_collected_cents: isLaunch ? 0 : deal.listPriceCents,
      status: 'pending',
    });

    // Tag the artist profile too
    await supabase.from('artist_profiles').update({ partner_code: code }).eq('handle', handle);

    clearStoredPartner();
    return { ok: !error, error: error?.message };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Stats for the partner dashboard — what's been signed up and what you're owed.
 */
export async function getPartnerStats(code = 'loveit') {
  const empty = {
    total: 0,
    paid: 0,
    launch: 0,
    live: 0,
    ownerOwedCents: 0,
    ownerPaidOutCents: 0,
    collectedCents: 0,
    signups: [],
  };
  if (!supabase) return empty;

  try {
    const { data, error } = await supabase
      .from('partner_signups')
      .select('*')
      .eq('partner_code', code)
      .order('created_at', { ascending: false });
    if (error || !data) return empty;

    const paid = data.filter((r) => r.tier === 'paid').length;
    const launch = data.filter((r) => r.tier === 'launch').length;
    const live = data.filter((r) => r.status === 'live' || r.status === 'paid_out').length;

    // You're owed your cut on every PAID signup that isn't already settled.
    const ownerOwedCents = data
      .filter((r) => r.tier === 'paid' && !r.owner_paid_out)
      .reduce((s, r) => s + (r.owner_cut_cents || 0), 0);

    const ownerPaidOutCents = data
      .filter((r) => r.owner_paid_out)
      .reduce((s, r) => s + (r.owner_cut_cents || 0), 0);

    const collectedCents = data.reduce((s, r) => s + (r.amount_collected_cents || 0), 0);

    return {
      total: data.length,
      paid,
      launch,
      live,
      ownerOwedCents,
      ownerPaidOutCents,
      collectedCents,
      signups: data,
    };
  } catch {
    return empty;
  }
}

/** Mark a signup live (domain wired up, page is up). */
export async function markSignupLive(id) {
  if (!supabase) return { ok: false };
  try {
    const { error } = await supabase
      .from('partner_signups')
      .update({ status: 'live', went_live_at: new Date().toISOString() })
      .eq('id', id);
    return { ok: !error, error: error?.message };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/** Mark YOUR $25 cut as settled for a signup. */
export async function markOwnerPaidOut(id) {
  if (!supabase) return { ok: false };
  try {
    const { error } = await supabase
      .from('partner_signups')
      .update({ owner_paid_out: true, status: 'paid_out' })
      .eq('id', id);
    return { ok: !error, error: error?.message };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export function formatMoney(cents) {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}
