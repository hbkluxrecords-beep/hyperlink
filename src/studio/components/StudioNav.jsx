import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import AuthButton from '../../components/AuthButton.jsx';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';

export default function StudioNav({ minimal = false }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      animate={{
        backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.85)' : 'rgba(10, 10, 10, 0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottomColor: scrolled ? STUDIO.border : 'transparent',
      }}
      style={{ borderBottom: '1px solid transparent', transition: 'all 0.3s ease' }}
    >
      <motion.div
        animate={{ height: scrolled ? 56 : 80 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 md:px-12 flex items-center justify-between"
      >
        <Link to="/studio" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: -8 }}
            className="w-8 h-8 flex items-center justify-center font-black"
            style={{
              background: STUDIO.ink,
              color: STUDIO.bg,
              fontFamily: STUDIO_FONTS.mono,
              fontSize: 14,
            }}
          >
            P
          </motion.div>
          <span
            className="font-black text-lg md:text-xl tracking-tight"
            style={{ color: STUDIO.ink, fontFamily: STUDIO_FONTS.display }}
          >
            plinks<span style={{ color: STUDIO.accent, fontStyle: 'italic', fontWeight: 300 }}>studio</span>
          </span>
        </Link>

        {!minimal && (
          <div className="flex items-center gap-3 md:gap-6">
            <Link
              to="/studio/explore"
              className="hidden md:block text-xs tracking-[0.25em] uppercase font-bold hover:opacity-70 transition-opacity"
              style={{ color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }}
            >
              Explore
            </Link>
            <Link
              to="/"
              className="hidden md:block text-xs tracking-[0.25em] uppercase font-bold hover:opacity-70 transition-opacity"
              style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono }}
            >
              ← main
            </Link>
            <AuthButton theme="dark" variant="minimal" />
            <Link
              to="/studio/new"
              className="px-4 py-2 text-xs tracking-[0.25em] uppercase font-bold border transition-all hover:scale-[1.02] active:scale-95"
              style={{
                borderColor: STUDIO.ink,
                background: STUDIO.accent,
                color: STUDIO.ink,
                fontFamily: STUDIO_FONTS.mono,
              }}
            >
              Claim →
            </Link>
          </div>
        )}
      </motion.div>
    </motion.nav>
  );
}
