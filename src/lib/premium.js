import { supabase } from './storage.js';
import { getSession } from './auth.js';

const hasSupabase = !!supabase;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function isPremium(handle) {
  if (!handle) return false;
  const h = handle.toLowerCase().trim();
  if (!hasSupabase) return false;

  const { data: artist } = await supabase.from('artist_profiles').select('is_premium').eq('handle', h).maybeSingle();
  if (artist?.is_premium) return true;

  const { data: creator } = await supabase.from('profiles').select('is_premium').eq('handle', h).maybeSingle();
  return !!creator?.is_premium;
}

export const PRICING = {
  intro:   { price: 3,  label: '$3',  period: 'first month', tier: '3' },
  monthly: { price: 7,  label: '$7',  period: 'per month',   tier: '7' },
  yearly:  { price: 60, label: '$60', period: 'per year',    tier: '60', savings: 'Save $24' },
};

/**
 * Kick off Stripe Checkout for the logged-in user.
 * Requires an active session (from auth.js).
 * Redirects to the Stripe-hosted page on success.
 */
export async function startCheckout(tier) {
  const session = getSession();
  if (!session?.handle) {
    window.location.href = '/login';
    return;
  }

  if (!SUPABASE_URL) {
    alert('Checkout unavailable — Supabase URL missing.');
    return;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON}`,
      },
      body: JSON.stringify({ handle: session.handle, tier }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || 'Could not start checkout');
    }
  } catch (err) {
    console.error('checkout error', err);
    alert('Could not start checkout. Try again.');
  }
}
