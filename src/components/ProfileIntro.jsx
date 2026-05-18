import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const BG = '#0A0A0A';
const INK = '#F2EFE6';
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

/**
 * Profile intro - reveals artist/creator name like a movie title card.
 * Shows once per session per handle so it doesn't get annoying on refreshes.
 */
export default function ProfileIntro({ name, handle, accent = '#FF4D1F', category }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!name || !handle) return;
    try {
      const key = `plinks-profile-intro-${handle.toLowerCase()}`;
      const seen = sessionStorage.getItem(key);
      if (!seen) {
        setShow(true);
        sessionStorage.setItem(key, '1');
        const t = setTimeout(() => setShow(false), 2000);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [handle, name]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: BG, cursor: 'pointer' }}
          onClick={() => setShow(false)}
        >
          {/* film grain */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 3px)',
            }}
          />

          {/* top tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="absolute top-6 left-6 text-[10px] tracking-[0.4em] uppercase font-bold"
            style={{ fontFamily: MONO, color: accent }}
          >
            ◆ PLINKS PRESENTS
          </motion.div>

          {/* handle micro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="absolute top-6 right-6 text-[10px] tracking-[0.4em] uppercase font-bold"
            style={{ fontFamily: MONO, color: '#8A8680' }}
          >
            /{handle}
          </motion.div>

          {/* center stack */}
          <div className="text-center px-6">
            {category && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-[10px] tracking-[0.45em] uppercase font-bold mb-4"
                style={{ fontFamily: MONO, color: accent }}
              >
                {category}
              </motion.div>
            )}
            <motion.h1
              initial={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="font-black tracking-tight break-words leading-[0.9]"
              style={{
                fontFamily: DISPLAY,
                color: INK,
                fontSize: 'clamp(2.5rem, 12vw, 7rem)',
              }}
            >
              {name}
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="h-px mt-5 mx-auto"
              style={{
                background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                maxWidth: '60%',
                transformOrigin: 'center',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
