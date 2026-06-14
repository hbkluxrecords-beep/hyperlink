import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { capturePartner, getPartnerDeal, formatMoney } from '../lib/partners.js';

const PARTNER_CODE = 'loveit';

// Love It Digital brand palette (matches loveitdigital.com)
const BRAND = {
  bg: '#FDF2F8',          // soft pink-white
  bgAlt: '#FFFFFF',
  ink: '#1A1A1A',         // near-black text/buttons
  pink: '#EC4899',        // hot pink accent
  pinkSoft: '#FBCFE8',    // light pink chips
  amber: '#F5B942',       // the amber icon tile on their site
  muted: '#6B6B6B',
  shadow: '6px 6px 0 #1A1A1A',
  round: '999px',
};

const ROUND_FONT = '"Baloo 2", "Nunito", system-ui, sans-serif';

export default function LID() {
  const deal = getPartnerDeal(PARTNER_CODE);

  // First-touch attribution + load their rounded font once
  useEffect(() => {
    capturePartner(PARTNER_CODE);
    const id = 'lid-baloo-font';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const Btn = ({ to, children, filled = true, big = false }) => (
    <Link
      to={to}
      className="inline-flex items-center justify-center font-extrabold transition-transform hover:-translate-y-0.5 active:translate-y-0"
      style={{
        background: filled ? BRAND.pink : BRAND.ink,
        color: '#fff',
        fontFamily: ROUND_FONT,
        fontWeight: 800,
        fontSize: big ? 19 : 16,
        padding: big ? '18px 34px' : '14px 26px',
        borderRadius: BRAND.round,
        boxShadow: BRAND.shadow,
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  );

  const Card = ({ icon, iconBg, title, blurb, items }) => (
    <div
      style={{
        background: BRAND.bgAlt,
        border: `2px solid ${BRAND.ink}`,
        borderRadius: 28,
        boxShadow: BRAND.shadow,
        padding: 28,
      }}
    >
      <div
        className="flex items-center justify-center mb-6"
        style={{ width: 64, height: 64, borderRadius: 18, background: iconBg, fontSize: 30 }}
      >
        {icon}
      </div>
      <h3 style={{ fontFamily: ROUND_FONT, fontWeight: 800, fontSize: 26, color: BRAND.ink, marginBottom: 10 }}>
        {title}
      </h3>
      <p style={{ color: BRAND.muted, fontSize: 16, lineHeight: 1.5, marginBottom: items ? 18 : 0 }}>{blurb}</p>
      {items && (
        <ul className="space-y-2.5">
          {items.map((it) => (
            <li key={it} className="flex items-center gap-3" style={{ color: BRAND.ink, fontSize: 16 }}>
              <span style={{ color: BRAND.pink, fontWeight: 800 }}>✓</span>
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div style={{ background: BRAND.bg, color: BRAND.ink, minHeight: '100vh', fontFamily: ROUND_FONT }}>
      {/* Top bar — co-brand */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ background: 'rgba(253,242,248,0.9)', backdropFilter: 'blur(12px)' }}
      >
        <a
          href="https://loveitdigital.com"
          className="flex items-center gap-2"
          style={{ textDecoration: 'none', color: BRAND.ink }}
        >
          <span style={{ color: BRAND.pink, fontSize: 26 }}>♥</span>
          <span style={{ fontFamily: ROUND_FONT, fontWeight: 800, fontSize: 22 }}>Love It</span>
        </a>
        <span
          className="hidden sm:block"
          style={{ fontFamily: ROUND_FONT, fontWeight: 700, fontSize: 14, color: BRAND.muted }}
        >
          × plinks
        </span>
      </nav>

      {/* Hero */}
      <header className="px-6 md:px-12 pt-12 pb-20 max-w-5xl mx-auto text-center">
        <div
          className="inline-flex items-center gap-2 mb-7"
          style={{
            background: BRAND.pinkSoft,
            color: BRAND.pink,
            padding: '8px 18px',
            borderRadius: BRAND.round,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <span>♥</span> Love It Digital × plinks
        </div>

        <h1
          style={{
            fontFamily: ROUND_FONT,
            fontWeight: 800,
            fontSize: 'clamp(2.6rem, 8vw, 5.5rem)',
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            marginBottom: 22,
          }}
        >
          Your own artist site.
          <br />
          <span style={{ color: BRAND.pink }}>Built with love.</span>
        </h1>

        <p
          className="mx-auto"
          style={{ maxWidth: 620, fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)', color: BRAND.muted, lineHeight: 1.55, marginBottom: 34 }}
        >
          A professional music page on your <strong style={{ color: BRAND.ink }}>own custom domain</strong> —
          music, drops, presaves, and a fan inbox. We design it, register your domain, and launch it for you.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-5">
          <Btn to="/studio/new?partner=loveit" big>
            Claim your page →
          </Btn>
          <div className="text-left">
            <div style={{ fontFamily: ROUND_FONT, fontWeight: 800, fontSize: 30, color: BRAND.ink, lineHeight: 1 }}>
              {formatMoney(deal.listPriceCents)}
            </div>
            <div style={{ fontSize: 13, color: BRAND.muted, fontWeight: 600 }}>one-time · domain included</div>
          </div>
        </div>
      </header>

      {/* What you get */}
      <section className="px-6 md:px-12 py-4 pb-20 max-w-5xl mx-auto">
        <h2
          className="text-center mb-3"
          style={{ fontFamily: ROUND_FONT, fontWeight: 800, fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}
        >
          What you get
        </h2>
        <p className="text-center mb-12" style={{ color: BRAND.muted, fontSize: 17 }}>
          A label-grade page, done for you.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <Card
            icon="🎵"
            iconBg={BRAND.pinkSoft}
            title="Your music, front & center"
            blurb="A player with 30-second previews, your discography, and release pages that actually look the part."
          />
          <Card
            icon="🚀"
            iconBg="#D1FAE5"
            title="Drops & presaves"
            blurb="Countdown timers for upcoming releases and drop-alert email capture so fans never miss a drop."
          />
          <Card
            icon="🌐"
            iconBg="#FEF3C7"
            title="Your own domain"
            blurb="We register and wire up yourname.com so your page isn't just another shared link — it's truly yours."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 py-16" style={{ background: BRAND.bgAlt }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-center mb-14"
            style={{ fontFamily: ROUND_FONT, fontWeight: 800, fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}
          >
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              ['1', 'Claim your page', 'Set up your artist page on plinks — music, links, drops, all of it.'],
              ['2', 'We handle the domain', 'Love It Digital registers your custom domain and connects it to your page.'],
              ['3', 'Go live & promote', 'Your site launches on your domain. Share it everywhere — it looks pro.'],
            ].map(([n, t, b]) => (
              <div key={n} className="text-center">
                <div
                  className="mx-auto flex items-center justify-center mb-5"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: BRAND.round,
                    background: BRAND.pink,
                    color: '#fff',
                    fontFamily: ROUND_FONT,
                    fontWeight: 800,
                    fontSize: 24,
                    boxShadow: BRAND.shadow,
                  }}
                >
                  {n}
                </div>
                <h3 style={{ fontFamily: ROUND_FONT, fontWeight: 800, fontSize: 22, marginBottom: 8 }}>{t}</h3>
                <p style={{ color: BRAND.muted, fontSize: 16, lineHeight: 1.5 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-12 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 style={{ fontFamily: ROUND_FONT, fontWeight: 800, fontSize: 'clamp(2rem, 6vw, 3.6rem)', marginBottom: 16 }}>
            Ready to drop?
          </h2>
          <p style={{ color: BRAND.muted, fontSize: 18, marginBottom: 30 }}>
            Claim your page now — we'll take care of the rest.
          </p>
          <Btn to="/studio/new?partner=loveit" big>
            Claim your page →
          </Btn>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 md:px-12 py-10 text-center"
        style={{ borderTop: `2px solid ${BRAND.ink}`, background: BRAND.bgAlt }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span style={{ color: BRAND.pink, fontSize: 22 }}>♥</span>
          <span style={{ fontFamily: ROUND_FONT, fontWeight: 800, fontSize: 18 }}>Love It</span>
        </div>
        <p style={{ color: BRAND.muted, fontSize: 14 }}>
          Artist pages powered by plinks · Set up by{' '}
          <a href="https://loveitdigital.com" style={{ color: BRAND.pink, fontWeight: 700, textDecoration: 'none' }}>
            Love It Digital
          </a>
        </p>
        <p style={{ color: BRAND.muted, fontSize: 13, marginTop: 8 }}>Based in Midland, TX</p>
      </footer>
    </div>
  );
}
