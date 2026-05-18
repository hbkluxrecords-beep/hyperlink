import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const BG = '#0A0A0A';
const MUTED = '#8A8680';
const MONO = '"JetBrains Mono", monospace';

/**
 * Simple text intro - "LOADING /HANDLE…" centered, fades out.
 * Once per session per handle.
 */
export default function ProfileIntro({ handle }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!handle) return;
    try {
      const key = `plinks-profile-intro-${handle.toLowerCase()}`;
      const seen = sessionStorage.getItem(key);
      if (!seen) {
        setShow(true);
        sessionStorage.setItem(key, '1');
        const t = setTimeout(() => setShow(false), 1200);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [handle]);

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
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-xs tracking-[0.3em] uppercase font-bold"
            style={{ fontFamily: MONO, color: MUTED }}
          >
            LOADING /{handle?.toUpperCase()}…
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
