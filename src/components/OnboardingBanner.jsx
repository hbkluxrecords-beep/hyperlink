import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const ACCENT = '#FF4D1F';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

const STEPS = [
  { num: '01', title: 'Set your display name', body: 'How fans see you — different from your handle/URL.' },
  { num: '02', title: 'Write a bio', body: '1-2 sentences. Genre, location, what you make. Keep it sharp.' },
  { num: '03', title: 'Pick a pinned link', body: 'Your #1 most important link — latest release, shop, newsletter.' },
  { num: '04', title: 'Add your social handles', body: 'Spotify, Instagram, TikTok, X — we render real platform logos.' },
  { num: '05', title: 'Hit save', body: "That's it. Share plinks.dev/yourhandle anywhere." },
];

export default function OnboardingBanner({ handle, type = 'creator' }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const key = `plinks-onboarded-${handle?.toLowerCase()}`;
      if (!localStorage.getItem(key)) setShow(true);
    } catch {}
  }, [handle]);

  const dismiss = () => {
    try { localStorage.setItem(`plinks-onboarded-${handle?.toLowerCase()}`, '1'); } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(255,77,31,0.08), rgba(255,77,31,0.02))',
          border: `1px solid ${ACCENT}`,
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-1" style={{ fontFamily: MONO, color: ACCENT }}>
              ◆ WELCOME TO PLINKS
            </div>
            <div className="text-lg font-black tracking-tight" style={{ fontFamily: DISPLAY, color: INK }}>
              Let's get your page live in 5 steps.
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="text-lg opacity-50 hover:opacity-100 shrink-0 leading-none"
            style={{ color: MUTED }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold shrink-0 mt-0.5" style={{ fontFamily: MONO, color: ACCENT }}>
                {s.num}
              </span>
              <div>
                <div className="text-sm font-bold leading-snug" style={{ fontFamily: DISPLAY, color: INK }}>
                  {s.title}
                </div>
                <div className="text-xs opacity-70 leading-snug" style={{ fontFamily: DISPLAY }}>
                  {s.body}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={dismiss}
            className="text-[10px] tracking-[0.3em] uppercase font-bold px-4 py-2.5"
            style={{ background: ACCENT, color: '#0A0A0A', fontFamily: MONO }}
          >
            Got it → start editing
          </button>
          <Link
            to="/help"
            className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-70 hover:opacity-100"
            style={{ fontFamily: MONO, color: INK }}
          >
            Full manual →
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
