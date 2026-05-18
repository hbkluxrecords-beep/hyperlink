import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TopNav from '../components/TopNav.jsx';

const BG = '#0A0A0A';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const ACCENT = '#FF4D1F';
const BORDER = 'rgba(255,255,255,0.12)';
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

const SECTIONS = [
  {
    label: 'GETTING STARTED',
    items: [
      {
        q: 'What is plinks.dev?',
        a: 'A link-in-bio platform for artists, creators, and devs. You get plinks.dev/yourname as your personal page. Add your links, social handles, photos, audio previews, and we render it as a clean dark-editorial profile you can share anywhere — Instagram bio, TikTok, email signatures.',
      },
      {
        q: 'How do I sign up?',
        a: 'Click "Start" from the home page. Pick whether you\'re an artist (musician/producer) or creator (anything else — dev, designer, photographer, podcaster). Pick a handle. That\'s it — no email required to start. You can add an email later when you upgrade to premium.',
      },
      {
        q: 'Artist vs Creator — which one am I?',
        a: 'Pick Artist if you release music and want presaves, release pages, drop alerts, audio previews, and the music-service buttons (Spotify, Apple, SoundCloud, etc). Pick Creator for anything else — dev portfolio embeds, content creator links, photographer galleries, podcaster show notes. You can switch between them later in Edit if you change your mind.',
      },
      {
        q: 'How do I share my page?',
        a: 'Your URL is plinks.dev/yourhandle. Copy that into your Instagram bio, TikTok profile, X bio, email signature, business card. There\'s also a "Share" button on your profile that copies the URL to your clipboard.',
      },
    ],
  },
  {
    label: 'FEATURES',
    items: [
      {
        q: 'Pinned link — what does it do?',
        a: 'Pinned shows as the first, biggest link on your profile with a "★ PINNED" tag. Use it for whatever is most important right now — your latest release, your shop, your newsletter.',
      },
      {
        q: 'Audio previews + trimmer',
        a: 'Artists can upload any song file (mp3, wav, m4a, up to 50MB). Drag the handles to pick the exact 30 seconds you want fans to hear, preview it, and we save just that clip. Fans hear it inline on your profile without leaving the page.',
      },
      {
        q: 'Drop alerts',
        a: 'Fans enter their email to get notified when your next track drops. You see all the emails in your Subscribers list. You can export them as CSV and email them yourself through any tool (Mailchimp, Loops, ConvertKit, etc).',
      },
      {
        q: 'Fan DMs',
        a: 'Fans can send you private messages from your profile. They show up in your inbox. You see who sent it (if they shared their handle) and the message text.',
      },
      {
        q: 'Live portfolio embeds (devs)',
        a: 'Add a URL to your portfolio site and we render a live preview directly on your profile, so people can see your work without leaving plinks.',
      },
      {
        q: 'Layouts',
        a: 'Artists get 3 release layouts: Compact (info block + buttons), Showcase (direct lnk.to-style landing page hiding everything above the release), Minimal (tiny cover + dominant music service rows). Creators get 2 profile layouts: Editorial (big magazine aura with VOL tag) and Minimal (tight, fits one screen).',
      },
    ],
  },
  {
    label: 'PREMIUM',
    items: [
      {
        q: 'What does premium unlock?',
        a: '◆ Premium badge on your profile. ◆ Custom accent color (replace orange with any hex you want). ◆ Animated backgrounds — drifting accent blobs, sweeping light rays, grid, grain, vignette. ◆ Text effects on song titles (glow, pulse, shimmer, glitch). ◆ Glowing buttons — pick which elements glow (pinned, links, bio) with independent colors for each. ◆ All future premium features as we add them.',
      },
      {
        q: 'How much is it?',
        a: '$3 your first month, then $7/month or $60/year. Cancel anytime via the "Manage subscription" button on /upgrade.',
      },
      {
        q: 'How do I cancel?',
        a: 'Go to /upgrade. If you have an active subscription, you\'ll see a "Manage subscription" button at the top — click it to open the Stripe portal where you can cancel, update your card, or view invoices. Cancellation takes effect at the end of your current billing period.',
      },
      {
        q: 'Refunds?',
        a: 'No refunds by default — when you cancel, you keep premium until the period ends, then it stops. If you were charged in error, email plinksbiz@proton.me within 14 days and we\'ll sort it out.',
      },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      {
        q: 'How do I edit my profile?',
        a: 'Log in, then either tap the EDIT button on your own profile, or go directly to /{yourhandle}/edit.',
      },
      {
        q: 'Forgot password?',
        a: 'Email plinksbiz@proton.me with your handle and we\'ll help you reset it. We don\'t currently have automated password reset emails — coming soon.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Edit → scroll to bottom → Danger zone → "Permanently delete account". This wipes your profile, releases, audio files, and subscriber data. Cannot be undone. Cancel any active subscription first.',
      },
      {
        q: 'My data',
        a: 'Want a copy of your data, or a deletion request? Email plinksbiz@proton.me with your handle. We respond within 30 days.',
      },
    ],
  },
];

export default function Help() {
  const [open, setOpen] = useState({});
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  return (
    <div style={{ background: BG, color: INK, minHeight: '100vh' }}>
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 pt-24 md:pt-32 pb-20">
        <div className="text-[10px] tracking-[0.35em] uppercase font-bold mb-4" style={{ fontFamily: MONO, color: ACCENT }}>
          PLINKS · MANUAL
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3" style={{ fontFamily: DISPLAY }}>
          How it works
        </h1>
        <p className="text-base leading-relaxed opacity-70 mb-10" style={{ fontFamily: DISPLAY }}>
          Everything you need to set up, customize, and run your plinks page. Tap any question to expand.
        </p>

        {SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO, color: ACCENT }}>
                § 0{sIdx + 1}
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO, color: MUTED }}>
                {section.label}
              </span>
              <div className="flex-1 h-px" style={{ background: BORDER }} />
            </div>
            <div className="space-y-2">
              {section.items.map((item, iIdx) => {
                const key = `${sIdx}-${iIdx}`;
                const isOpen = !!open[key];
                return (
                  <div key={iIdx} style={{ borderTop: `1px solid ${BORDER}` }}>
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between gap-3 py-4 text-left"
                    >
                      <span className="text-base font-bold" style={{ fontFamily: DISPLAY, color: INK }}>
                        {item.q}
                      </span>
                      <span
                        className="text-lg shrink-0 transition-transform"
                        style={{ color: ACCENT, transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                      >
                        +
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <p className="pb-5 text-sm leading-relaxed" style={{ fontFamily: DISPLAY, color: '#D5D2C7' }}>
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-12 p-5" style={{ background: 'rgba(255,77,31,0.08)', border: `1px solid ${ACCENT}` }}>
          <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2" style={{ fontFamily: MONO, color: ACCENT }}>
            ◆ STILL STUCK?
          </div>
          <p className="text-sm leading-relaxed" style={{ fontFamily: DISPLAY }}>
            Email <a href="mailto:plinksbiz@proton.me" style={{ color: ACCENT, textDecoration: 'underline' }}>plinksbiz@proton.me</a> with your handle and the problem. Usually respond within 24h.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t" style={{ borderColor: BORDER }}>
          <Link to="/" className="text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70" style={{ fontFamily: MONO, color: ACCENT }}>
            ← Back to plinks.dev
          </Link>
        </div>
      </div>
    </div>
  );
}
