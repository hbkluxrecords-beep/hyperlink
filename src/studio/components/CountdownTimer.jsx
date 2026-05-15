import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';

function timeLeft(target) {
  const now = Date.now();
  const t = new Date(target).getTime();
  const diff = Math.max(0, t - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const mins = Math.floor((diff / 60000) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return { days, hours, mins, secs, expired: diff === 0 };
}

function FlipDigit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative overflow-hidden tabular-nums"
        style={{
          fontFamily: STUDIO_FONTS.display,
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 900,
          color: STUDIO.ink,
          lineHeight: 1,
          minWidth: '1.5em',
          textAlign: 'center',
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="block"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span
        className="text-[10px] tracking-[0.3em] uppercase mt-2"
        style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono }}
      >
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer({ target, onExpire }) {
  const [t, setT] = useState(() => timeLeft(target));

  useEffect(() => {
    setT(timeLeft(target));
    const id = setInterval(() => {
      const next = timeLeft(target);
      setT(next);
      if (next.expired && onExpire) onExpire();
    }, 1000);
    return () => clearInterval(id);
  }, [target, onExpire]);

  if (t.expired) return null;

  return (
    <div className="flex items-center gap-4 md:gap-8 justify-center">
      <FlipDigit value={t.days} label="Days" />
      <span style={{ color: STUDIO.accent, fontSize: '3rem', fontFamily: STUDIO_FONTS.display, lineHeight: 1 }}>:</span>
      <FlipDigit value={t.hours} label="Hrs" />
      <span style={{ color: STUDIO.accent, fontSize: '3rem', fontFamily: STUDIO_FONTS.display, lineHeight: 1 }}>:</span>
      <FlipDigit value={t.mins} label="Min" />
      <span style={{ color: STUDIO.accent, fontSize: '3rem', fontFamily: STUDIO_FONTS.display, lineHeight: 1 }}>:</span>
      <FlipDigit value={t.secs} label="Sec" />
    </div>
  );
}
