import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const KEY = 'plinks-cookie-consent';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (!stored) setShow(true);
    } catch {}
  }, []);

  const accept = () => {
    try { localStorage.setItem(KEY, JSON.stringify({ accepted: true, at: Date.now() })); } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-2 left-2 right-2 md:left-auto md:right-4 md:bottom-4 md:max-w-sm z-[90] flex items-center gap-2 px-3 py-2"
        style={{
          background: 'rgba(20,20,20,0.95)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <span className="flex-1 text-[10px] leading-snug" style={{ fontFamily: '"JetBrains Mono", monospace', color: '#D5D2C7' }}>
          Essential cookies only. <Link to="/privacy" style={{ color: '#FF4D1F', textDecoration: 'underline' }}>Privacy</Link>
        </span>
        <button
          onClick={accept}
          className="text-[9px] tracking-[0.25em] uppercase font-bold px-2.5 py-1.5 hover:scale-[1.04] transition-transform shrink-0"
          style={{ background: '#FF4D1F', color: '#0A0A0A', fontFamily: '"JetBrains Mono", monospace' }}
        >
          OK
        </button>
        <button
          onClick={accept}
          aria-label="Dismiss"
          className="text-xs opacity-50 hover:opacity-100 transition-opacity shrink-0 w-5 h-5 flex items-center justify-center"
          style={{ color: '#8A8680' }}
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
