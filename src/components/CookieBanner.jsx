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
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-3 left-3 right-3 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[90]"
        style={{
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: 16,
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2" style={{ fontFamily: '"JetBrains Mono", monospace', color: '#FF4D1F' }}>
          ◆ COOKIES
        </div>
        <p className="text-sm leading-relaxed mb-3" style={{ fontFamily: '"Fraunces", serif', color: '#F2EFE6' }}>
          plinks.dev uses essential first-party cookies to keep you logged in. No tracking, no ads, no third-party cookies. By using the site you agree to our{' '}
          <Link to="/privacy" style={{ color: '#FF4D1F', textDecoration: 'underline' }}>privacy policy</Link>.
        </p>
        <button
          onClick={accept}
          className="w-full py-2.5 text-[10px] tracking-[0.3em] uppercase font-bold hover:scale-[1.01] transition-transform"
          style={{ background: '#FF4D1F', color: '#0A0A0A', fontFamily: '"JetBrains Mono", monospace' }}
        >
          Got it
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
