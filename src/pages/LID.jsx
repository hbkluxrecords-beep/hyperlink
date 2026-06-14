import { getPartnerDeal, formatMoney } from '../lib/partners.js';

const PARTNER_CODE = 'loveit';
const CONTACT_URL = 'https://loveitdigital.com/contact';

const C = {
  bg: '#FDF4F8',
  card: '#FFFFFF',
  ink: '#1B1A1E',
  pink: '#EC4899',
  pinkSoft: '#FCE7F1',
  ember: '#FF4D1F',
  muted: '#897F86',
  line: 'rgba(27,26,30,0.10)',
};

const SERIF = '"Fraunces", ui-serif, Georgia, serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';

export default function LID() {
  const deal = getPartnerDeal(PARTNER_CODE);

  const Btn = ({ children, big = false, variant = 'pink' }) => {
    const styles = {
      pink: { background: C.pink, color: '#fff', border: 'none', shadow: '0 6px 0 rgba(190,24,93,0.35)' },
      ink: { background: C.ink, color: '#fff', border: 'none', shadow: '0 6px 0 rgba(27,26,30,0.25)' },
      outline: { background: 'transparent', color: C.ink, border: `2px solid ${C.ink}`, shadow: 'none' },
    }[variant];
    return (
      <a
        href={CONTACT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center transition-transform hover:-translate-y-0.5 active:translate-y-0"
        style={{
          background: styles.background, color: styles.color, border: styles.border, boxShadow: styles.shadow,
          fontFamily: MONO, fontWeight: 700, fontSize: big ? 14 : 12, letterSpacing: '0.06em',
          textTransform: 'uppercase', padding: big ? '18px 36px' : '12px 22px', borderRadius: 999, textDecoration: 'none',
        }}
      >
        {children}
      </a>
    );
  };

  const chips = ['Artist pages', 'Full websites', 'Online stores', 'Presave funnels', 'Domains', 'Marketing'];

  const services = [
    ['🎤', 'Artist pages', 'A pro music page on your own domain — drops, presaves, discography, fan inbox. Powered by plinks.'],
    ['🌐', 'Full websites', 'From a one-page landing site to a full multi-page build — designed around your brand.'],
    ['🛍️', 'Online stores', 'Sell merch, beats, and tickets with a storefront wired up and ready to take orders.'],
    ['📈', 'Marketing & SEO', 'Get found and grow — SEO, ads, and strategy that move real numbers for your career.'],
    ['⏱️', 'Presave funnels', 'Countdown pages and email capture that turn hype into streams on drop day.'],
    ['🛠️', 'Maintenance', 'Updates, backups, security, and content edits so your site never lets you down.'],
  ];

  const steps = [
    ['01', 'Reach out', 'Tell Love It Digital about you, your music, and what you want built.', C.pink],
    ['02', 'We build it', 'They design and build it for you — and register your custom domain.', C.ember],
    ['03', 'You go live', 'Your site launches on your own domain. Share it everywhere — it looks pro.', C.pink],
  ];

  return (
    <div style={{ background: C.bg, color: C.ink, minHeight: '100vh' }}>
      {/* Top bar — co-brand + instant contact */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ background: 'rgba(253,244,248,0.88)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2.5" style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>
          <span style={{ color: C.pink, fontSize: 18 }}>&#9829;</span>
          <span>Love It</span>
          <span style={{ color: C.muted }}>&times;</span>
          <span>plinks<span style={{ color: C.ember }}>.</span></span>
        </div>
        <Btn variant="ink">Contact &rarr;</Btn>
      </nav>

      {/* HERO — full screen (minus the sticky nav) */}
      <header className="flex items-center px-6 md:px-12" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-4xl mx-auto w-full py-10">
          <div
            className="inline-flex items-center gap-2 mb-7"
            style={{
              background: C.pinkSoft, color: C.pink, padding: '8px 18px', borderRadius: 999,
              fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
            }}
          >
            <span>&#9829;</span> Love It Digital &times; plinks
          </div>

          <h1
            style={{
              fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(2.6rem, 8vw, 5.4rem)',
              lineHeight: 0.98, letterSpacing: '-0.03em', marginBottom: 22, maxWidth: 900,
            }}
          >
            We build anything for your{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: C.pink }}>music career.</span>
          </h1>

          <p style={{ maxWidth: 600, fontSize: 'clamp(1.1rem,2.6vw,1.4rem)', color: C.muted, lineHeight: 1.55, marginBottom: 20 }}>
            Artist sites, landing pages, online stores, presave funnels, full websites &mdash; designed and built
            for you on your own custom domain. Powered by plinks where it counts.
          </p>

          <div className="flex flex-wrap gap-2 mb-9">
            {chips.map((x) => (
              <span
                key={x}
                style={{
                  background: C.card, border: `1px solid ${C.line}`, color: C.ink,
                  fontFamily: MONO, fontSize: 11.5, fontWeight: 600, padding: '7px 14px', borderRadius: 999,
                }}
              >
                {x}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Btn big variant="pink">Tell us what you need &rarr;</Btn>
            <div style={{ borderLeft: `2px solid ${C.pinkSoft}`, paddingLeft: 20 }}>
              <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 26, lineHeight: 1 }}>
                from {formatMoney(deal.listPriceCents)}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
                domain included
              </div>
            </div>
          </div>

          {/* scroll cue */}
          <div className="mt-16 flex items-center gap-2" style={{ fontFamily: MONO, fontSize: 11, color: C.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            <span>Scroll to see what we do</span>
            <span style={{ color: C.pink }}>&darr;</span>
          </div>
        </div>
      </header>

      {/* SERVICES — revealed on scroll */}
      <section className="px-6 md:px-12 py-20" style={{ background: C.card, borderTop: `1px solid ${C.line}` }}>
        <div className="max-w-5xl mx-auto">
          <h2 style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(1.9rem,5vw,3rem)', letterSpacing: '-0.02em', marginBottom: 6 }}>
            What we build
          </h2>
          <p style={{ color: C.muted, fontSize: 16, marginBottom: 40 }}>Whatever your career needs — just ask.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(([icon, t, b]) => (
              <div
                key={t}
                style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24 }}
              >
                <div
                  className="flex items-center justify-center mb-4"
                  style={{ width: 52, height: 52, borderRadius: 14, background: C.pinkSoft, fontSize: 24 }}
                >
                  {icon}
                </div>
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{t}</h3>
                <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.5 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 md:px-12 py-20" style={{ borderTop: `1px solid ${C.line}` }}>
        <div className="max-w-5xl mx-auto">
          <h2 style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(1.9rem,5vw,3rem)', letterSpacing: '-0.02em', marginBottom: 40 }}>
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map(([n, t, b, col]) => (
              <div key={n} style={{ borderTop: `3px solid ${col}`, paddingTop: 18 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: col, letterSpacing: '0.2em', marginBottom: 12 }}>{n}</div>
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 21, marginBottom: 8 }}>{t}</h3>
                <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.55 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 md:px-12 py-24 text-center" style={{ background: C.pink }}>
        <div className="max-w-2xl mx-auto">
          <h2 style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(2rem,6vw,3.6rem)', letterSpacing: '-0.02em', color: '#fff', marginBottom: 16 }}>
            Ready to drop?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 30 }}>
            Tell Love It Digital what you need and they&rsquo;ll build it from scratch.
          </p>
          <a
            href={CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center transition-transform hover:-translate-y-0.5"
            style={{
              background: '#fff', color: C.pink, fontFamily: MONO, fontWeight: 700, fontSize: 15,
              letterSpacing: '0.06em', textTransform: 'uppercase', padding: '18px 40px', borderRadius: 999,
              boxShadow: '0 6px 0 rgba(0,0,0,0.15)', textDecoration: 'none',
            }}
          >
            Get yours built &rarr;
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 11, color: C.muted, background: C.card }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ color: C.pink }}>&#9829; Love It Digital</span>
          <span>&times;</span>
          <span style={{ color: C.ink }}>plinks<span style={{ color: C.ember }}>.</span>dev</span>
        </div>
        <div className="uppercase tracking-wider">Built by Love It &middot; Powered by plinks &middot; Midland, TX</div>
      </footer>
    </div>
  );
}
