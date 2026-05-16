// Supabase Edge Function: stripe-webhook
// Receives subscription events from Stripe and flips is_premium on profile rows.
//
// Deploy:
//   supabase functions deploy stripe-webhook --no-verify-jwt
//
// Then in Stripe Dashboard → Developers → Webhooks:
//   Endpoint URL: https://<your-project>.supabase.co/functions/v1/stripe-webhook
//   Events: checkout.session.completed,
//           customer.subscription.updated,
//           customer.subscription.deleted
//
// Required env:
//   STRIPE_SECRET_KEY        sk_...
//   STRIPE_WEBHOOK_SECRET    whsec_...  (from the webhook config page)
//   SUPABASE_URL             auto-provided
//   SUPABASE_SERVICE_ROLE_KEY auto-provided

import Stripe from 'https://esm.sh/stripe@14?target=denonext';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

/**
 * Update is_premium on whichever profile table holds this handle.
 */
async function setPremium(handle: string, isPremium: boolean, customerId?: string, status?: string) {
  const h = handle.toLowerCase();
  const update: Record<string, unknown> = {
    is_premium: isPremium,
    subscription_status: status || null,
  };
  if (customerId) update.stripe_customer_id = customerId;
  if (isPremium) update.premium_since = new Date().toISOString();

  // Try artist_profiles first
  const { data: artist } = await supabase.from('artist_profiles').select('handle').eq('handle', h).maybeSingle();
  if (artist) {
    await supabase.from('artist_profiles').update(update).eq('handle', h);
    return;
  }
  // Otherwise creator profiles
  await supabase.from('profiles').update(update).eq('handle', h);
}

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('no signature', { status: 400 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('signature verification failed', err);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const handle = session.metadata?.handle;
        if (handle) {
          await setPremium(handle, true, session.customer as string, 'active');
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const handle = sub.metadata?.handle;
        if (handle) {
          const isActive = sub.status === 'active' || sub.status === 'trialing';
          await setPremium(handle, isActive, sub.customer as string, sub.status);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const handle = sub.metadata?.handle;
        if (handle) await setPremium(handle, false, sub.customer as string, 'canceled');
        break;
      }
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});
