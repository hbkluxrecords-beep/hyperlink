import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const KEY = 'plinks-intro-shown';

const BG = '#0A0A0A';
const INK = '#F2EFE6';
const ACCENT = '#FF4D1F';
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

export default function BrandIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      // Show once per session — sessionStorage so a fresh tab gets it again
      const seen = sessionStorage.getItem(KEY);
      if (!seen) {
        setShow(true);
        sessionStorage.setItem(KEY, '1');
        // Auto-dismiss after animation finishes
        const t = setTimeout(() => setShow(false), 2400);
        return () => clearTimeout(t);
      }
    } catch {
      // SSR or storage blocked - just don't show
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: BG, cursor: 'pointer' }}
          onClick={() => setShow(false)}
        >
          {/* Scanline / grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 3px)',
            }}
          />

          {/* Top corner mark */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute top-6 left-6 text-[10px] tracking-[0.4em] uppercase font-bold"
            style={{ fontFamily: MONO, color: ACCENT }}
          >
            ◆ EST. 2026
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute top-6 right-6 text-[10px] tracking-[0.4em] uppercase font-bold"
            style={{ fontFamily: MONO, color: '#8A8680' }}
          >
            VOL 01
          </motion.div>

          {/* Center — wordmark reveal */}
          <div className="text-center px-6">
            <motion.div
              initial={{ opacity: 0, letterSpacing: '0.5em' }}
              animate={{ opacity: 1, letterSpacing: '-0.02em' }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              className="font-black"
              style={{
                fontFamily: DISPLAY,
                color: INK,
                fontSize: 'clamp(3rem, 13vw, 8rem)',
                lineHeight: 1,
              }}
            >
              PLINKS<span style={{ color: ACCENT }}>.</span>DEV
            </motion.div>

            {/* Underline sweep */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-px mt-4 mx-auto"
              style={{
                background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
                maxWidth: '70%',
                transformOrigin: 'center',
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="text-[10px] tracking-[0.5em] uppercase font-bold mt-4"
              style={{ fontFamily: MONO, color: '#8A8680' }}
            >
              LINK · IN · BIO · FOR · CREATORS
            </motion.div>
          </div>

          {/* Tap to skip hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="absolute bottom-8 text-[9px] tracking-[0.3em] uppercase"
            style={{ fontFamily: MONO, color: '#8A8680' }}
          >
            tap to skip
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
