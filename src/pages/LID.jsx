import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { capturePartner, getPartnerDeal, formatMoney } from '../lib/partners.js';

const PARTNER_CODE = 'loveit';

// Co-brand palette: warm cream base (friendly, Love It energy) +
// plinks ember accent + editorial serif. Its OWN look, not a copy of either site.
const C = {
  cream: '#FBF7F0',
  card: '#FFFFFF',
  ink: '#1C1A17',
  ember: '#FF4D1F',
  pink: '#EC4899',
  muted: '#7A726A',
  line: 'rgba(28,26,23,0.12)',
};

const SERIF = '"Fraunces", ui-serif, Georgia, serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';

export default function LID() {
  const deal = getPartnerDeal(PARTNER_CODE);

  useEffect(() => {
    capturePartner(PARTNER_CODE);
  }, []);

  const Btn = ({ to, children, big = false }) => (
    <Link
      to={to}
      className="inline-flex items-center justify-center transition-all hover:opacity-90"
      style={{
        background: C.ink,
        color: C.cream,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: big ? 14 : 12,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: big ? '18px 36px' : '13px 24px',
        borderRadius: 4,
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  );

  return (
    <div style={{ background: C.cream, color: C.ink, minHeight: '100vh' }}>
      {/* Top bar — equal co-brand lockup */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3" style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>
          <span style={{ color: C.pink }}>&#9829; Love It</span>
          <span style={{ color: C.muted }}>&times;</span>
          <span>plinks<span style={{ color: C.ember }}>.</span></span>
        </div>
        <a
          href="https://loveitdigital.com"
          style={{ fontFamily: MONO, fontSize: 11, color: C.muted, textDecoration: 'none', letterSpacing: '0.1em' }}
          className="uppercase hover:opacity-70"
        >
          loveitdigital.com &#8599;
        </a>
      </nav>

      {/* Hero */}
      <header className="px-6 md:px-12 pt-14 pb-20 max-w-5xl mx-auto">
        <div
          className="inline-flex items-center gap-2 mb-8"
          style={{
            border: `1px solid ${C.line}`,
            padding: '7px 16px',
            borderRadius: 999,
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: C.muted,
          }}
        >
          <span style={{ color: C.ember }}>&#9679;</span> A Love It Digital &times; plinks collab
        </div>

        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 900,
            fontSize: 'clamp(2.8rem, 8.5vw, 6rem)',
            lineHeight: 0.98,
            letterSpacing: '-0.03em',
            marginBottom: 26,
            maxWidth: 900,
          }}
        >
          Your own artist site, <span style={{ fontStyle: 'italic', fontWeight: 300, color: C.ember }}>done for you.</span>
        </h1>

        <p style={{ maxWidth: 580, fontSize: 'clamp(1.05rem,2.4vw,1.3rem)', color: C.muted, lineHeight: 1.6, marginBottom: 36 }}>
          A pro music page on your <strong style={{ color: C.ink }}>own custom domain</strong> &mdash; drops, presaves,
          a fan inbox, the works. plinks builds the page, Love It Digital registers your domain and launches it.
        </p>

        <div className="flex flex-wrap items-center gap-6">
          <Btn to="/studio/new?partner=loveit" big>Claim your page &rarr;</Btn>
          <div style={{ borderLeft: `1px solid ${C.line}`, paddingLeft: 20 }}>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 30, lineHeight: 1 }}>
              {formatMoney(deal.listPriceCents)}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
              one-time &middot; domain included
            </div>
          </div>
        </div>
      </header>

      {/* What you get */}
      <section className="px-6 md:px-12 py-16 max-w-5xl mx-auto" style={{ borderTop: `1px solid ${C.line}` }}>
        <div className="grid md:grid-cols-[200px_1fr] gap-8 md:gap-16">
          <h2 style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,2.4rem)', letterSpacing: '-0.02em' }}>
            What you get
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-7">
            {[
              ['Music, front & center', '30-second previews, your discography, and release pages built for artists.'],
              ['Drops & presaves', 'Countdown timers and drop-alert email capture so fans never miss a release.'],
              ['Fan inbox', 'A built-in DM inbox so listeners can reach you straight from your page.'],
              ['Your own domain', 'Love It Digital registers yourname.com and wires it to your page — truly yours.'],
            ].map(([t, b]) => (
              <div key={t}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: C.ember, fontFamily: MONO, fontSize: 13 }}>&#10022;</span>
                  <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19 }}>{t}</h3>
                </div>
                <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.55, paddingLeft: 22 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 py-16" style={{ background: C.card, borderTop: `1px solid ${C.line}` }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="mb-12" style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,2.4rem)', letterSpacing: '-0.02em' }}>
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              ['01', 'You claim your page', 'Set up your artist page on plinks — music, links, drops, all of it.', C.ember],
              ['02', 'Love It wires the domain', 'Love It Digital registers your custom domain and connects it.', C.pink],
              ['03', 'You go live', 'Your site launches on your domain. Share it everywhere — it looks pro.', C.ember],
            ].map(([n, t, b, col]) => (
              <div key={n} style={{ borderTop: `2px solid ${col}`, paddingTop: 18 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: col, letterSpacing: '0.2em', marginBottom: 12 }}>
                  {n}
                </div>
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 21, marginBottom: 8 }}>{t}</h3>
                <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.55 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-12 py-24 text-center" style={{ borderTop: `1px solid ${C.line}` }}>
        <h2 style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(2rem,6vw,3.6rem)', letterSpacing: '-0.02em', marginBottom: 16 }}>
          Ready to drop?
        </h2>
        <p style={{ color: C.muted, fontSize: 18, maxWidth: 480, margin: '0 auto 32px' }}>
          Claim your page now — we'll take care of the rest.
        </p>
        <Btn to="/studio/new?partner=loveit" big>Claim your page &rarr;</Btn>
      </section>

      {/* Footer */}
      <footer
        className="px-6 md:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 12, color: C.muted }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: C.pink }}>&#9829; Love It Digital</span>
          <span>&times;</span>
          <span style={{ color: C.ink }}>plinks<span style={{ color: C.ember }}>.</span>dev</span>
        </div>
        <div className="uppercase tracking-wider" style={{ fontSize: 11 }}>
          Pages by plinks &middot; Domains by Love It &middot; Midland, TX
        </div>
      </footer>
    </div>
  );
}
