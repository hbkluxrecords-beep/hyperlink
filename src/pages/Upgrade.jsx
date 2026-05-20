import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import AuthButton from '../components/AuthButton.jsx';
import TopNav from '../components/TopNav.jsx';
import { startCheckout, openCustomerPortal } from '../lib/premium.js';
import { getSession } from '../lib/auth.js';
import { loadProfile } from '../lib/storage.js';
import { loadArtist } from '../studio/lib/studioStorage.js';

const BG = '#0A0A0A';
const SURFACE = '#141414';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const ACCENT = '#FF4D1F';
const BORDER = 'rgba(255,255,255,0.08)';
const BORDER_STRONG = 'rgba(255,255,255,0.18)';
const DISPLAY = '"Fraunces", serif';
const MONO = '"JetBrains Mono", monospace';

const FREE = [
  'Unlimited links',
  'Audio previews + 30s trimmer',
  'Presave countdowns',
  'Drop-alert email capture',
  'Fan DM inbox',
  'Basic analytics',
  'No ads, no Plinks branding',
];

const PREMIUM = [
  'Everything in Free',
  'Custom accent color',
  'Animated backgrounds',
  'Glowing buttons (pick what glows)',
  'Text effects on titles',
  'Premium badge on profile',
  'Promo Lab idea generator',
];

function Tier({ name, price, period, sub, features, cta, highlighted, savings }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 md:p-8 flex flex-col relative"
      style={{
        background: highlighted ? ACCENT : SURFACE,
        color: highlighted ? '#0A0A0A' : INK,
        border: `1px solid ${highlighted ? ACCENT : BORDER_STRONG}`,
      }}
    >
      {highlighted && (
        <div
          className="absolute -top-3 left-6 px-3 py-1 text-[9px] tracking-[0.3em] uppercase font-bold"
          style={{ background: '#0A0A0A', color: ACCENT, fontFamily: MONO }}
        >
          ★ Best value
        </div>
      )}
      {savings && (
        <div
          className="absolute top-6 right-6 px-2 py-1 text-[9px] tracking-[0.2em] uppercase font-bold"
          style={{ background: '#0A0A0A', color: ACCENT, fontFamily: MONO }}
        >
          {savings}
        </div>
      )}
      <div
        className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2 opacity-70"
        style={{ fontFamily: MONO }}
      >
        {name}
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-5xl md:text-6xl font-black tracking-tighter" style={{ fontFamily: DISPLAY }}>
          {price}
        </span>
        <span className="text-sm opacity-70" style={{ fontFamily: MONO }}>{period}</span>
      </div>
      {sub && (
        <div className="text-xs opacity-60 mb-6" style={{ fontFamily: MONO }}>
          {sub}
        </div>
      )}
      <ul className="space-y-2.5 mb-8 flex-1">
        {features.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm"
            style={{ fontFamily: DISPLAY }}
          >
            <span style={{ color: highlighted ? '#0A0A0A' : ACCENT, marginTop: 2 }}>◆</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => !cta.disabled && cta.tier && startCheckout(cta.tier)}
        disabled={cta.disabled}
        className="w-full px-5 py-3.5 text-xs tracking-[0.25em] uppercase font-bold hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: cta.disabled ? 'transparent' : (highlighted ? '#0A0A0A' : ACCENT),
          color: cta.disabled ? (highlighted ? '#0A0A0A' : INK) : (highlighted ? ACCENT : '#0A0A0A'),
          border: cta.disabled ? `1px solid ${highlighted ? '#0A0A0A' : BORDER_STRONG}` : 'none',
          fontFamily: MONO,
        }}
      >
        {cta.label}
      </button>
    </motion.div>
  );
}

export default function Upgrade() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (s?.handle) {
      const loader = s.type === 'artist' ? loadArtist : loadProfile;
      loader(s.handle).then(setProfile).catch(() => {});
    }
  }, []);

  return (
    <div style={{ background: BG, color: INK, minHeight: '100vh' }}>
      <TopNav />

      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-24 md:pt-32 pb-20">

        {/* Manage subscription banner - shown if user has active subscription */}
        {profile?.isPremium && profile?.stripeCustomerId && (
          <div className="mb-10 p-5" style={{ background: 'rgba(255,77,31,0.1)', border: `2px solid ${ACCENT}` }}>
            <div className="flex items-start gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-1" style={{ fontFamily: MONO, color: ACCENT }}>
                  ★ PREMIUM ACTIVE
                </div>
                <div className="text-sm" style={{ fontFamily: DISPLAY, color: INK }}>
                  Manage your subscription, update payment method, or cancel anytime.
                </div>
              </div>
              <button
                onClick={() => openCustomerPortal(profile.stripeCustomerId)}
                className="text-[10px] tracking-[0.3em] uppercase font-bold px-4 py-2.5 hover:scale-[1.02] transition-transform"
                style={{ background: ACCENT, color: BG, fontFamily: MONO }}
              >
                Manage subscription →
              </button>
            </div>
          </div>
        )}
        <div className="text-center mb-16">
          <div className="text-[10px] tracking-[0.35em] uppercase font-bold mb-4" style={{ fontFamily: MONO, color: ACCENT }}>
            PRICING · 2026
          </div>
          <h1 className="font-black leading-[0.85] tracking-tighter mb-6" style={{ fontFamily: DISPLAY, fontSize: 'clamp(3rem, 9vw, 5.5rem)' }}>
            Free, <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>forever.</span>
          </h1>
          <p className="text-base md:text-lg opacity-75 max-w-xl mx-auto" style={{ fontFamily: DISPLAY }}>
            Most link-in-bio platforms charge monthly fees and take a cut of every sale. Plinks is free, takes 0% of your sales — premium is $7/mo or $30/year.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <Tier
            name="Free"
            price="$0"
            period="forever"
            sub="No card. No catch."
            features={FREE}
            cta={{ label: 'Already on it', disabled: true }}
          />
          <Tier
            name="Premium Monthly"
            price="$7"
            period="/month"
            sub="Cancel anytime"
            features={PREMIUM}
            cta={{ label: 'Start for $7 →', disabled: false, tier: 'monthly' }}
          />
          <Tier
            name="Premium Yearly"
            price="$30"
            period="/year"
            sub="$2.50/mo · best value"
            features={PREMIUM}
            cta={{ label: 'Lock in $30 →', disabled: false, tier: 'yearly' }}
            highlighted
            savings="Save $54"
          />
        </div>

        <div className="mt-20 pt-12 border-t" style={{ borderColor: BORDER }}>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-8" style={{ fontFamily: DISPLAY }}>
            Why <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>different.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2" style={{ fontFamily: MONO, color: ACCENT }}>
                TYPICAL LINK-IN-BIO PLATFORMS
              </div>
              <ul className="space-y-2 text-base opacity-80" style={{ fontFamily: DISPLAY }}>
                <li>· Monthly fees that scale up by tier</li>
                <li>· A percentage cut of each sale on most plans</li>
                <li>· Their branding on your profile unless you pay</li>
              </ul>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2" style={{ fontFamily: MONO, color: ACCENT }}>
                PLINKS
              </div>
              <ul className="space-y-2 text-base opacity-80" style={{ fontFamily: DISPLAY }}>
                <li>· $0 forever · $7/mo premium tops out the cost</li>
                <li>· We never take a cut — we don't touch your sales</li>
                <li>· Your name, your URL, no branding</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Billing disclosure - required for legal compliance */}
        <div className="mt-16 p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-3" style={{ fontFamily: MONO, color: MUTED }}>
            ◆ BILLING DETAILS
          </div>
          <ul className="text-xs leading-relaxed space-y-1.5 opacity-80" style={{ fontFamily: DISPLAY, color: INK }}>
            <li>· $3 first-month rate auto-renews at $7/month after the first 30 days unless cancelled.</li>
            <li>· $7/month plan billed every 30 days. $60/year plan billed once per year.</li>
            <li>· Cancel anytime from the "Manage subscription" button. Cancellation takes effect at the end of the current billing period.</li>
            <li>· Payments processed by Stripe. plinks.dev never sees your full card number.</li>
            <li>· See full <Link to="/terms" style={{ color: ACCENT, textDecoration: 'underline' }}>Terms</Link> and <Link to="/privacy" style={{ color: ACCENT, textDecoration: 'underline' }}>Privacy Policy</Link>.</li>
          </ul>
        </div>

        <div className="mt-12 text-center text-[10px] tracking-[0.3em] uppercase opacity-60" style={{ fontFamily: MONO }}>
          plinks.dev · built independent in 2026
        </div>
      </div>
    </div>
  );
}
