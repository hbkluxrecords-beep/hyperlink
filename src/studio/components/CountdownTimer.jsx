import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';

function timeLeft(target) {
  const now = Date.now();
  const t = new Date(target).getTime();
  const diff = Math.max(0, t - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    mins: Math.floor((diff / 60000) % 60),
    secs: Math.floor((diff / 1000) % 60),
    expired: diff === 0,
  };
}

function Unit({ value, label, primary = false }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <div
        className="relative overflow-hidden tabular-nums"
        style={{
          fontFamily: STUDIO_FONTS.display,
          fontSize: primary ? 'clamp(1.75rem, 5vw, 2.5rem)' : 'clamp(1.25rem, 3.5vw, 1.75rem)',
          fontWeight: 900,
          color: STUDIO.ink,
          lineHeight: 1,
          minWidth: primary ? '1.2em' : '1em',
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="block"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span
        className="text-[9px] tracking-[0.3em] uppercase"
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
    <div className="flex items-center gap-3 md:gap-5 flex-wrap">
      <Unit value={t.days} label="Days" primary />
      <span style={{ color: STUDIO.border, fontSize: '1rem' }}>·</span>
      <Unit value={t.hours} label="Hrs" />
      <span style={{ color: STUDIO.border, fontSize: '1rem' }}>·</span>
      <Unit value={t.mins} label="Min" />
      <span style={{ color: STUDIO.border, fontSize: '1rem' }}>·</span>
      <Unit value={t.secs} label="Sec" />
    </div>
  );
}
