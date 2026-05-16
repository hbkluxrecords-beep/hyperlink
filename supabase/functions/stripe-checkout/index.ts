// Supabase Edge Function: stripe-checkout
// Creates a Stripe Checkout session for the Plinks premium tiers.
//
// Deploy:
//   supabase functions deploy stripe-checkout --no-verify-jwt
//
// Required env (Supabase Dashboard → Edge Functions → Secrets):
//   STRIPE_SECRET_KEY   sk_test_... or sk_live_...
//   SITE_URL            https://plinks.dev  (used for success/cancel redirects)
//
// Request body: { handle: string, tier: '3' | '7' | '60' }
// Response: { url: string }  (the Stripe-hosted checkout URL)

import Stripe from 'https://esm.sh/stripe@14?target=denonext';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') || 'https://plinks.dev';

const PRICE_IDS = {
  '3':  'price_1TXkisL84FmP5exbseEtC1gV',   // $3 intro
  '7':  'price_1TXkjwL84FmP5exbLHLlpBK0',   // $7/mo
  '60': 'price_1TXkkxL84FmP5exbDVoGGUwW',   // $60/yr
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  try {
    const { handle, tier } = await req.json();
    if (!handle || !tier) {
      return new Response(JSON.stringify({ error: 'handle and tier required' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const priceId = PRICE_IDS[tier as keyof typeof PRICE_IDS];
    if (!priceId) {
      return new Response(JSON.stringify({ error: 'invalid tier' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/${handle}?upgraded=1`,
      cancel_url: `${SITE_URL}/upgrade?canceled=1`,
      metadata: { handle, tier },
      subscription_data: { metadata: { handle, tier } },
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
