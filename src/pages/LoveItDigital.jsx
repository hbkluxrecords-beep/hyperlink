import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import StudioNav from '../studio/components/StudioNav.jsx';
import { STUDIO, STUDIO_FONTS } from '../studio/lib/studioDesign.js';
import { LUXURY_EASE } from '../studio/lib/animations.js';
import { capturePartner, getPartnerDeal, formatMoney } from '../lib/partners.js';

const PARTNER_CODE = 'loveit';

export default function LoveItDigital() {
  const deal = getPartnerDeal(PARTNER_CODE);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // First-touch attribution: anyone who lands here is tagged to the deal.
  useEffect(() => {
    capturePartner(PARTNER_CODE);
  }, []);

  const steps = [
    {
      n: '01',
      title: 'Claim your artist page',
      body: 'A full plinks artist page — music, drops, presaves, fan inbox, the works. Built for musicians, not generic link lists.',
    },
    {
      n: '02',
      title: 'Get your own domain',
      body: 'Love It Digital registers and wires up your custom domain so your page lives at yourname.com — not a shared link.',
    },
    {
      n: '03',
      title: 'Go live & promote',
      body: 'Your page goes live on your domain. Drop the link everywhere — it looks like a label-grade artist site.',
    },
  ];

  const includes = [
    'Music player with 30-sec previews',
    'Presave countdowns for upcoming drops',
    'Drop-alert email capture',
    'Fan DM inbox',
    'Discography & release pages',
    'Your own custom domain',
  ];

  return (
    <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }}>
      <StudioNav minimal />

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center px-6 md:px-12 pt-32 pb-20 overflow-hidden"
      >
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto w-full">
          {/* Co-brand badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: LUXURY_EASE }}
            className="inline-flex items-center gap-3 mb-8"
            style={{
              padding: '8px 16px',
              border: `1px solid ${STUDIO.border}`,
              fontFamily: STUDIO_FONTS.mono,
              fontSize: 11,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: STUDIO.accent,
            }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: STUDIO.accent }} />
            Love It Digital × plinks
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.1 }}
            className="font-black leading-[0.9] tracking-[-0.04em] mb-8"
            style={{ fontFamily: STUDIO_FONTS.display, fontSize: 'clamp(2.6rem, 9vw, 7rem)' }}
          >
            Your music.
            <br />
            <span style={{ color: STUDIO.accent }}>Your domain.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.2 }}
            className="max-w-xl text-lg md:text-xl mb-10 leading-relaxed"
            style={{ color: 'rgba(242,239,230,0.7)' }}
          >
            A label-grade artist page on your own custom domain. Built on plinks, set up by
            Love It Digital — done for you, start to finish.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link
              to="/studio/new?partner=loveit"
              className="inline-flex items-center justify-center font-bold transition-transform hover:scale-[1.02]"
              style={{
                background: STUDIO.accent,
                color: '#fff',
                padding: '16px 32px',
                fontFamily: STUDIO_FONTS.mono,
                fontSize: 13,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Claim your page →
            </Link>
            <div
              className="flex items-baseline gap-2"
              style={{ fontFamily: STUDIO_FONTS.mono }}
            >
              <span className="font-black text-3xl" style={{ fontFamily: STUDIO_FONTS.display }}>
                {formatMoney(deal.listPriceCents)}
              </span>
              <span className="text-xs uppercase tracking-widest" style={{ color: STUDIO.muted }}>
                one-time · domain included
              </span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 py-24" style={{ borderTop: `1px solid ${STUDIO.border}` }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="font-black mb-16 tracking-[-0.02em]"
            style={{ fontFamily: STUDIO_FONTS.display, fontSize: 'clamp(1.8rem, 5vw, 3.5rem)' }}
          >
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, ease: LUXURY_EASE, delay: i * 0.1 }}
                style={{ borderTop: `2px solid ${STUDIO.accent}`, paddingTop: 20 }}
              >
                <div
                  className="font-black mb-4"
                  style={{ fontFamily: STUDIO_FONTS.mono, fontSize: 13, color: STUDIO.accent, letterSpacing: '0.2em' }}
                >
                  {s.n}
                </div>
                <h3 className="font-bold text-xl mb-3" style={{ fontFamily: STUDIO_FONTS.display }}>
                  {s.title}
                </h3>
                <p className="leading-relaxed" style={{ color: 'rgba(242,239,230,0.6)' }}>
                  {s.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="px-6 md:px-12 py-24" style={{ borderTop: `1px solid ${STUDIO.border}` }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="font-black mb-12 tracking-[-0.02em]"
            style={{ fontFamily: STUDIO_FONTS.display, fontSize: 'clamp(1.8rem, 5vw, 3.5rem)' }}
          >
            What you get
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-5">
            {includes.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: LUXURY_EASE, delay: i * 0.05 }}
                className="flex items-center gap-4 py-3"
                style={{ borderBottom: `1px solid ${STUDIO.border}` }}
              >
                <span style={{ color: STUDIO.accent, fontFamily: STUDIO_FONTS.mono }}>✓</span>
                <span className="text-lg">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-12 py-28 text-center" style={{ borderTop: `1px solid ${STUDIO.border}` }}>
        <div className="max-w-2xl mx-auto">
          <h2
            className="font-black mb-6 tracking-[-0.02em]"
            style={{ fontFamily: STUDIO_FONTS.display, fontSize: 'clamp(2rem, 6vw, 4rem)' }}
          >
            Ready to drop?
          </h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(242,239,230,0.7)' }}>
            Claim your page now. Love It Digital handles the domain and setup — you just bring the music.
          </p>
          <Link
            to="/studio/new?partner=loveit"
            className="inline-flex items-center justify-center font-bold transition-transform hover:scale-[1.02]"
            style={{
              background: STUDIO.accent,
              color: '#fff',
              padding: '18px 40px',
              fontFamily: STUDIO_FONTS.mono,
              fontSize: 14,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Claim your page →
          </Link>
          <p className="mt-8 text-xs uppercase tracking-[0.25em]" style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono }}>
            Powered by plinks · Set up by Love It Digital
          </p>
        </div>
      </section>
    </div>
  );
}
