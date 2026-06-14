import { getPartnerDeal, formatMoney } from '../lib/partners.js';

const PARTNER_CODE = 'loveit';
const CONTACT_URL = 'https://loveitdigital.com/contact';

// True 50/50 blend, Love It-flavored:
// Love It side -> soft pink bg, pink as a primary color, rounded friendly buttons w/ soft shadow.
// plinks side  -> Fraunces serif headline, ember accent on a couple details, clean structure.
const C = {
  bg: '#FDF4F8',          // soft pink-cream (Love It warmth)
  card: '#FFFFFF',
  ink: '#1B1A1E',
  pink: '#EC4899',        // Love It primary
  pinkSoft: '#FCE7F1',    // pink chips/tints
  ember: '#FF4D1F',       // plinks accent (used on a few details)
  muted: '#897F86',
  line: 'rgba(27,26,30,0.10)',
};

const SERIF = '"Fraunces", ui-serif, Georgia, serif';   // plinks display
const MONO = '"JetBrains Mono", ui-monospace, monospace'; // plinks mono

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
          background: styles.background,
          color: styles.color,
          border: styles.border,
          boxShadow: styles.shadow,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: big ? 14 : 12,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: big ? '18px 36px' : '12px 22px',
          borderRadius: 999,
          textDecoration: 'none',
        }}
      >
        {children}
      </a>
    );
  };

  return (
    <div style={{ background: C.bg, color: C.ink, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar — co-brand + instant contact */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2.5" style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>
          <span style={{ color: C.pink, fontSize: 18 }}>&#9829;</span>
          <span>Love It</span>
          <span style={{ color: C.muted }}>&times;</span>
          <span>plinks<span style={{ color: C.ember }}>.</span></span>
        </div>
        <Btn variant="ink">Contact &rarr;</Btn>
      </nav>

      {/* Hero — whole pitch, one screen */}
      <header className="flex-1 flex items-center px-6 md:px-12 py-10">
        <div className="max-w-4xl mx-auto w-full">
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

          {/* capability chips — pink tinted */}
          <div className="flex flex-wrap gap-2 mb-9">
            {['Artist pages', 'Full websites', 'Online stores', 'Presave funnels', 'Domains', 'Marketing'].map((x) => (
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
        </div>
      </header>

      {/* Footer */}
      <footer
        className="px-6 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 11, color: C.muted }}
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
