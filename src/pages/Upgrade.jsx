import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import AuthButton from '../components/AuthButton.jsx';

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
  'Audio previews on releases',
  'Presave countdowns',
  'Basic analytics',
  'No Plinks branding on your page',
  '0% transaction fees',
];

const PREMIUM = [
  'Everything in Free',
  'Cinematic page transitions',
  'Custom font + accent color',
  'Hover-preview audio on links',
  'Live presence indicator',
  'Unlimited fan DMs',
  'Drop-alert email capture',
  'CSV subscriber export',
  'Premium badge on profile',
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
        onClick={() => alert('Stripe checkout coming soon.')}
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
  return (
    <div style={{ background: BG, color: INK, minHeight: '100vh' }}>
      <nav className="px-6 py-5 flex items-center justify-between">
        <Link to="/" className="text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70" style={{ fontFamily: MONO, color: MUTED }}>
          ← HYPERLINK
        </Link>
        <AuthButton theme="dark" variant="badge" />
      </nav>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <div className="text-center mb-16">
          <div className="text-[10px] tracking-[0.35em] uppercase font-bold mb-4" style={{ fontFamily: MONO, color: ACCENT }}>
            PRICING · 2026
          </div>
          <h1 className="font-black leading-[0.85] tracking-tighter mb-6" style={{ fontFamily: DISPLAY, fontSize: 'clamp(3rem, 9vw, 5.5rem)' }}>
            Free, <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>forever.</span>
          </h1>
          <p className="text-base md:text-lg opacity-75 max-w-xl mx-auto" style={{ fontFamily: DISPLAY }}>
            Linktree charges $35/mo and takes 9% of every sale. Plinks is free, 0% fees — premium adds detail no other link site has.
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
            price="$3"
            period="first month"
            sub="$7/mo after"
            features={PREMIUM}
            cta={{ label: 'Start for $3 →', disabled: false }}
          />
          <Tier
            name="Premium Yearly"
            price="$60"
            period="per year"
            sub="$5/mo · best value"
            features={PREMIUM}
            cta={{ label: 'Lock in $60 →', disabled: false }}
            highlighted
            savings="Save $24"
          />
        </div>

        <div className="mt-20 pt-12 border-t" style={{ borderColor: BORDER }}>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-8" style={{ fontFamily: DISPLAY }}>
            Why <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>different.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2" style={{ fontFamily: MONO, color: ACCENT }}>
                THE COMPETITION
              </div>
              <ul className="space-y-2 text-base opacity-80" style={{ fontFamily: DISPLAY }}>
                <li>· Linktree: $8–$35/mo + 9–12% per sale</li>
                <li>· Beacons: $10–$90/mo + 9% per sale</li>
                <li>· Their branding on YOUR profile</li>
              </ul>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2" style={{ fontFamily: MONO, color: ACCENT }}>
                PLINKS
              </div>
              <ul className="space-y-2 text-base opacity-80" style={{ fontFamily: DISPLAY }}>
                <li>· $0 forever, $7/mo premium tops</li>
                <li>· 0% transaction fees, ever</li>
                <li>· Your name, your URL, no branding</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center text-[10px] tracking-[0.3em] uppercase opacity-60" style={{ fontFamily: MONO }}>
          plinks.dev · built independent in 2026
        </div>
      </div>
    </div>
  );
}
