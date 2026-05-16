import { supabase } from './storage.js';

const hasSupabase = !!supabase;

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
  monthlyIntro: { price: 3, label: '$3', period: 'first month', stripePriceId: null },
  monthly: { price: 7, label: '$7', period: 'per month', stripePriceId: null },
  yearly: { price: 60, label: '$60', period: 'per year', savings: 'Save $24', stripePriceId: null },
};
