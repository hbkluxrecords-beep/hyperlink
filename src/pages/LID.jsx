import { getPartnerDeal, formatMoney } from '../lib/partners.js';

const PARTNER_CODE = 'loveit';
const CONTACT_URL = 'https://loveitdigital.com/contact';

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

  const Btn = ({ children, big = false, outline = false }) => (
    <a
      href={CONTACT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center transition-all hover:opacity-90"
      style={{
        background: outline ? 'transparent' : C.ember,
        color: outline ? C.ink : '#fff',
        border: outline ? `1px solid ${C.ink}` : 'none',
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: big ? 15 : 12,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding: big ? '20px 40px' : '13px 24px',
        borderRadius: 4,
        textDecoration: 'none',
      }}
    >
      {children}
    </a>
  );

  return (
    <div style={{ background: C.cream, color: C.ink, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar — co-brand + instant contact */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3" style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>
          <span style={{ color: C.pink }}>&#9829; Love It</span>
          <span style={{ color: C.muted }}>&times;</span>
          <span>plinks<span style={{ color: C.ember }}>.</span></span>
        </div>
        <a
          href={CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: C.ink, color: C.cream, fontFamily: MONO, fontWeight: 700, fontSize: 11,
            letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 18px', borderRadius: 4, textDecoration: 'none',
          }}
          className="transition-opacity hover:opacity-90"
        >
          Contact &rarr;
        </a>
      </nav>

      {/* Hero — the whole pitch, one screen */}
      <header className="flex-1 flex items-center px-6 md:px-12 py-10">
        <div className="max-w-4xl mx-auto w-full">
          <div
            className="inline-flex items-center gap-2 mb-7"
            style={{
              border: `1px solid ${C.line}`, padding: '7px 16px', borderRadius: 999,
              fontFamily: MONO, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.muted,
            }}
          >
            <span style={{ color: C.ember }}>&#9679;</span> Love It Digital &times; plinks
          </div>

          <h1
            style={{
              fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(2.6rem, 8vw, 5.4rem)',
              lineHeight: 0.98, letterSpacing: '-0.03em', marginBottom: 22, maxWidth: 880,
            }}
          >
            We build anything for your <span style={{ fontStyle: 'italic', fontWeight: 300, color: C.ember }}>music career.</span>
          </h1>

          <p style={{ maxWidth: 600, fontSize: 'clamp(1.1rem,2.6vw,1.4rem)', color: C.muted, lineHeight: 1.55, marginBottom: 18 }}>
            Artist sites, landing pages, online stores, presave funnels, full websites &mdash; designed and built
            for you, on your own custom domain. Powered by plinks where it counts.
          </p>

          {/* compact capability row */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-9" style={{ fontFamily: MONO, fontSize: 12, color: C.ink }}>
            {['Artist pages', 'Full websites', 'Online stores', 'Presave funnels', 'Domains', 'Marketing'].map((x, i) => (
              <span key={x} className="flex items-center gap-2">
                {i > 0 && <span style={{ color: C.line }}>/</span>}
                <span>{x}</span>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Btn big>Tell us what you need &rarr;</Btn>
            <div style={{ borderLeft: `1px solid ${C.line}`, paddingLeft: 20 }}>
              <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 26, lineHeight: 1 }}>
                from {formatMoney(deal.listPriceCents)}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
                domain included
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Footer */}
      <footer
        className="px-6 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 11, color: C.muted }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: C.pink }}>&#9829; Love It Digital</span>
          <span>&times;</span>
          <span style={{ color: C.ink }}>plinks<span style={{ color: C.ember }}>.</span>dev</span>
        </div>
        <div className="uppercase tracking-wider">Built by Love It &middot; Powered by plinks &middot; Midland, TX</div>
      </footer>
    </div>
  );
}
