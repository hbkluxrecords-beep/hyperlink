// Supabase Edge Function: stripe-webhook
// Receives Stripe events, flips is_premium on profile rows.
//
// IMPORTANT: This function uses manual HMAC signature verification rather than
// the Stripe SDK's constructEventAsync, because the SDK's crypto helpers can
// be flaky in Deno edge runtime. Manual verification is more reliable here.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

const encoder = new TextEncoder();

/**
 * Manually verify the Stripe webhook signature using HMAC-SHA256.
 * Stripe sends a header like: t=1234567890,v1=abc123...
 * We compute HMAC(secret, `${t}.${body}`) and compare to v1.
 */
async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts = sigHeader.split(',').reduce((acc, p) => {
    const [k, v] = p.split('=');
    if (k && v) acc[k] = v;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts.t;
  const sig = parts.v1;
  if (!timestamp || !sig) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const macBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expected = Array.from(new Uint8Array(macBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return expected === sig;
}

async function setPremium(handle: string, isPremium: boolean, customerId?: string, status?: string) {
  const h = handle.toLowerCase();
  const update: Record<string, unknown> = {
    is_premium: isPremium,
    subscription_status: status || null,
  };
  if (customerId) update.stripe_customer_id = customerId;
  if (isPremium) update.premium_since = new Date().toISOString();

  const { data: artist } = await supabase
    .from('artist_profiles')
    .select('handle')
    .eq('handle', h)
    .maybeSingle();
  if (artist) {
    await supabase.from('artist_profiles').update(update).eq('handle', h);
  } else {
    await supabase.from('profiles').update(update).eq('handle', h);
  }

  // If they just went premium and were referred, accrue the referrer's reward
  if (isPremium) {
    const { data: ref } = await supabase
      .from('referrals')
      .select('id, status')
      .eq('referred_handle', h)
      .maybeSingle();
    if (ref && ref.status !== 'converted') {
      await supabase
        .from('referrals')
        .update({
          status: 'converted',
          reward_cents: 100,
          converted_at: new Date().toISOString(),
        })
        .eq('id', ref.id);
    }
  }
}

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return new Response('no signature', { status: 400 });
  }

  const body = await req.text();

  // Verify signature
  const verified = await verifyStripeSignature(body, sig, WEBHOOK_SECRET);
  if (!verified) {
    console.error('signature verification failed');
    return new Response('invalid signature', { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response('invalid json', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const handle = session.metadata?.handle;
        if (handle) {
          await setPremium(handle, true, session.customer, 'active');
          console.log(`✓ premium ON for ${handle}`);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const handle = sub.metadata?.handle;
        if (handle) {
          const isActive = sub.status === 'active' || sub.status === 'trialing';
          await setPremium(handle, isActive, sub.customer, sub.status);
          console.log(`✓ subscription updated for ${handle}, premium=${isActive}`);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const handle = sub.metadata?.handle;
        if (handle) {
          await setPremium(handle, false, sub.customer, 'canceled');
          console.log(`✓ premium OFF for ${handle}`);
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('webhook handler error:', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
