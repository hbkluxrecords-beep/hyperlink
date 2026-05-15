import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import StudioNav from '../components/StudioNav.jsx';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';
import { LUXURY_EASE, fadeUp, staggerContainer, staggerItem } from '../lib/animations.js';

function AnimatedWaveBackground() {
  const bars = 80;
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-[3px] opacity-[0.15] pointer-events-none overflow-hidden">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{ width: 3, background: STUDIO.accent }}
          animate={{
            height: [20, 80 + Math.sin(i) * 40, 20],
          }}
          transition={{
            duration: 2 + (i % 5) * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.03,
          }}
        />
      ))}
    </div>
  );
}

export default function StudioLanding() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }}>
      <StudioNav />

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center px-6 md:px-12 pt-32 pb-20 overflow-hidden">
        <AnimatedWaveBackground />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-6xl mx-auto w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: LUXURY_EASE }}
            className="inline-flex items-center gap-2 mb-8"
            style={{
              padding: '6px 14px',
              border: `1px solid ${STUDIO.border}`,
              fontFamily: STUDIO_FONTS.mono,
              fontSize: 11,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: STUDIO.accent,
            }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: STUDIO.accent }} />
            Plinks Studio · For Artists
          </motion.div>

          <h1
            className="font-black leading-[0.9] tracking-[-0.04em] mb-8"
            style={{
              fontFamily: STUDIO_FONTS.display,
              fontSize: 'clamp(3rem, 10vw, 9rem)',
            }}
          >
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.1 }}
              className="block"
            >
              Built for artists.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.25 }}
              className="block"
              style={{ color: STUDIO.accent, fontStyle: 'italic', fontWeight: 300 }}
            >
              Not influencers.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-2xl text-lg md:text-2xl leading-snug mb-12"
            style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink, opacity: 0.8 }}
          >
            A homepage with audio previews, release countdowns, real analytics, and links to every platform you're on.
            Drop your next track like it deserves.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: LUXURY_EASE }}
            className="flex flex-wrap gap-3"
          >
            <Link
              to="/studio/new"
              className="px-7 py-4 text-sm tracking-[0.25em] uppercase font-bold transition-all hover:scale-[1.02] active:scale-95"
              style={{
                background: STUDIO.accent,
                color: STUDIO.ink,
                fontFamily: STUDIO_FONTS.mono,
              }}
            >
              Claim your studio →
            </Link>
            <Link
              to="/studio/explore"
              className="px-7 py-4 text-sm tracking-[0.25em] uppercase font-bold transition-all hover:scale-[1.02] active:scale-95"
              style={{
                background: 'transparent',
                color: STUDIO.ink,
                fontFamily: STUDIO_FONTS.mono,
                border: `1px solid ${STUDIO.borderStrong}`,
              }}
            >
              Browse artists
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase"
          style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono }}
          animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Scroll ↓
        </motion.div>
      </section>

      {/* Feature trio */}
      <section className="px-6 md:px-12 py-24 md:py-32 relative">
        <motion.div {...fadeUp} className="flex items-center gap-3 mb-16 max-w-6xl mx-auto">
          <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>§ 01 / FEATURES</span>
          <div className="flex-1 h-px" style={{ background: STUDIO.border }} />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-3 gap-px max-w-6xl mx-auto"
          style={{ background: STUDIO.border }}
        >
          {[
            {
              n: '01',
              t: 'Audio previews\nthat actually play',
              b: 'Upload a 30-second preview of your unreleased track. Fans hear it before they presave. No more "click this link to save" with zero context.',
            },
            {
              n: '02',
              t: 'Real analytics,\nnot vanity metrics',
              b: 'See plays, link clicks, presave conversions, top referrers, hourly heatmaps. Know which platforms your fans actually use.',
            },
            {
              n: '03',
              t: 'Countdown to\nthe drop',
              b: 'Split-flap countdown timers build hype. The moment your track drops, the page auto-updates from "Presave" to "Stream Now."',
            },
          ].map((f) => (
            <motion.div
              key={f.n}
              variants={staggerItem}
              className="p-8 md:p-10"
              style={{ background: STUDIO.bg }}
            >
              <div className="text-5xl font-black mb-6" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.accent }}>{f.n}</div>
              <h3 className="text-2xl md:text-3xl font-black leading-tight mb-4 whitespace-pre-line" style={{ fontFamily: STUDIO_FONTS.display }}>{f.t}</h3>
              <p className="text-sm leading-relaxed" style={{ color: STUDIO.muted }}>{f.b}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Comparison */}
      <section className="px-6 md:px-12 py-24 relative" style={{ background: STUDIO.surface }}>
        <motion.div {...fadeUp} className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>§ 02 / VS LINKTREE</span>
            <div className="flex-1 h-px" style={{ background: STUDIO.border }} />
          </div>

          <h2 className="text-4xl md:text-6xl font-black leading-[0.95] tracking-tight mb-12" style={{ fontFamily: STUDIO_FONTS.display }}>
            Linktree is for influencers.<br />
            <span style={{ color: STUDIO.accent, fontStyle: 'italic', fontWeight: 300 }}>This is for you.</span>
          </h2>

          <div className="grid grid-cols-3 gap-px" style={{ background: STUDIO.border }}>
            <div className="p-5" style={{ background: STUDIO.surface }}>
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>Feature</span>
            </div>
            <div className="p-5" style={{ background: STUDIO.surface }}>
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>Linktree</span>
            </div>
            <div className="p-5" style={{ background: STUDIO.surface }}>
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>Plinks Studio</span>
            </div>
            {[
              ['Inline audio preview', '✕', '✓'],
              ['Release countdown', '✕', '✓'],
              ['Real artist analytics', 'Basic', 'Full'],
              ['Editorial design', '✕', '✓'],
              ['Custom domain', 'Paid', 'Free'],
              ['Built for the drop', '✕', '✓'],
            ].map(([feature, lt, ps], i) => (
              <div key={i} style={{ display: 'contents' }}>
                <div className="p-5 text-sm" style={{ background: STUDIO.bg, fontFamily: STUDIO_FONTS.display }}>{feature}</div>
                <div className="p-5 text-sm" style={{ background: STUDIO.bg, fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>{lt}</div>
                <div className="p-5 text-sm font-bold" style={{ background: STUDIO.bg, fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>{ps}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-12 py-32 text-center">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tight mb-8" style={{ fontFamily: STUDIO_FONTS.display }}>
            Your next drop<br />
            <span style={{ color: STUDIO.accent, fontStyle: 'italic', fontWeight: 300 }}>deserves better.</span>
          </h2>
          <p className="text-lg md:text-xl mb-10" style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.display }}>
            Set up your studio in 90 seconds. Free forever.
          </p>
          <Link
            to="/studio/new"
            className="inline-block px-10 py-5 text-sm tracking-[0.3em] uppercase font-bold transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: STUDIO.accent,
              color: STUDIO.ink,
              fontFamily: STUDIO_FONTS.mono,
            }}
          >
            Claim your page →
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 border-t flex flex-wrap items-end justify-between gap-6" style={{ borderColor: STUDIO.border }}>
        <div>
          <div className="text-3xl md:text-4xl font-black leading-none tracking-tighter" style={{ fontFamily: STUDIO_FONTS.display }}>
            plinks<span style={{ color: STUDIO.accent, fontStyle: 'italic', fontWeight: 300 }}>studio</span>
          </div>
          <div className="text-[10px] tracking-[0.3em] uppercase mt-2" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
            for artists who refuse to fit in a link tree
          </div>
        </div>
        <Link to="/" className="text-[10px] tracking-[0.3em] uppercase hover:underline" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
          ← Plinks main site
        </Link>
      </footer>
    </div>
  );
}
