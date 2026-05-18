import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

/**
 * Map artist genres to a visual theme for the intro.
 * Hard rap / drill / trap / metal / punk → BLOODY (red/black, glitch, gritty)
 * Melodic rap / R&B / soul → SMOKE (purple/pink, soft blur, smoky)
 * Electronic / house / techno → GLITCH (cyan, RGB split, scanlines)
 * Ambient / lo-fi / classical / jazz → MIST (soft white, slow fade)
 * Default (pop, indie, rock, afrobeats, etc) → EDITORIAL (orange, magazine vibe)
 */
export function pickTheme(genres = []) {
  const g = (genres || []).map((x) => x.toUpperCase());
  if (g.some((x) => ['DRILL', 'TRAP', 'METAL', 'PUNK'].includes(x))) return 'BLOODY';
  if (g.some((x) => ['HIP-HOP'].includes(x)) && !g.some((x) => ['R&B', 'SOUL'].includes(x))) return 'BLOODY';
  if (g.some((x) => ['R&B', 'SOUL', 'FUNK'].includes(x))) return 'SMOKE';
  if (g.some((x) => ['ELECTRONIC', 'HOUSE', 'TECHNO', 'EXPERIMENTAL'].includes(x))) return 'GLITCH';
  if (g.some((x) => ['AMBIENT', 'LO-FI', 'CLASSICAL', 'JAZZ'].includes(x))) return 'MIST';
  return 'EDITORIAL';
}

const THEMES = {
  BLOODY: {
    bg: '#0A0000',
    name: '#FFF',
    accent: '#FF0019',
    accentSoft: '#8B0000',
    tagline: 'NO PRISONERS',
    bgFx: 'bloody',
  },
  SMOKE: {
    bg: '#0E0814',
    name: '#F2EFE6',
    accent: '#C77FFF',
    accentSoft: '#7B2FB8',
    tagline: 'SLOW BURN',
    bgFx: 'smoke',
  },
  GLITCH: {
    bg: '#000814',
    name: '#F2EFE6',
    accent: '#00E5FF',
    accentSoft: '#0099AA',
    tagline: 'SYSTEM ONLINE',
    bgFx: 'glitch',
  },
  MIST: {
    bg: '#0A0A0A',
    name: '#F2EFE6',
    accent: '#D5D2C7',
    accentSoft: '#8A8680',
    tagline: 'IN MOTION',
    bgFx: 'mist',
  },
  EDITORIAL: {
    bg: '#0A0A0A',
    name: '#F2EFE6',
    accent: '#FF4D1F',
    accentSoft: '#8A8680',
    tagline: 'VOLUME 01',
    bgFx: 'editorial',
  },
};

function BloodyFx({ accent }) {
  return (
    <>
      {/* dripping red gradient */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0.6 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top, ${accent}40 0%, transparent 60%), linear-gradient(180deg, ${accent}20 0%, transparent 30%, transparent 70%, #4d0008 100%)`,
          transformOrigin: 'top',
        }}
      />
      {/* blood drips */}
      {[15, 35, 55, 75, 88].map((left, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: ['0%', `${40 + i * 8}%`, `${40 + i * 8}%`] }}
          transition={{ duration: 1.6, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
          className="absolute top-0 pointer-events-none"
          style={{
            left: `${left}%`,
            width: i % 2 === 0 ? 3 : 2,
            background: `linear-gradient(180deg, ${accent}, ${accent}80, transparent)`,
            filter: 'blur(0.5px)',
          }}
        />
      ))}
      {/* heavy grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50 mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-radial-gradient(circle at 30% 40%, rgba(255,0,25,0.04) 0, rgba(255,0,25,0.04) 1px, transparent 1px, transparent 3px)',
        }}
      />
    </>
  );
}

function SmokeFx({ accent }) {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.6, x: -100 + i * 80, y: 100 - i * 40 }}
          animate={{ opacity: [0, 0.5, 0.3], scale: [0.6, 1.4, 1.6], x: 0, y: 0 }}
          transition={{ duration: 2.2, delay: i * 0.2, ease: 'easeOut' }}
          className="absolute pointer-events-none rounded-full"
          style={{
            width: '50vw',
            height: '50vw',
            background: `radial-gradient(circle, ${accent}40 0%, transparent 60%)`,
            filter: 'blur(60px)',
            left: i === 1 ? '10%' : i === 2 ? '40%' : '60%',
            top: i === 1 ? '20%' : i === 2 ? '50%' : '30%',
          }}
        />
      ))}
    </>
  );
}

function GlitchFx({ accent }) {
  return (
    <>
      {/* scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,229,255,0.08) 2px, rgba(0,229,255,0.08) 3px)',
        }}
      />
      {/* sweeping cyan line */}
      <motion.div
        initial={{ y: '-100%' }}
        animate={{ y: '120%' }}
        transition={{ duration: 1.6, ease: 'linear', repeat: 1 }}
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          boxShadow: `0 0 20px ${accent}`,
        }}
      />
      {/* RGB grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            `linear-gradient(${accent}30 1px, transparent 1px), linear-gradient(90deg, ${accent}30 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
    </>
  );
}

function MistFx() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0.3] }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 70%)',
        }}
      />
    </>
  );
}

function EditorialFx({ accent }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-30"
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 3px)',
      }}
    />
  );
}

/**
 * Genre-themed artist intro. Blocks render until done.
 * onComplete called when intro finishes (or user taps to skip).
 */
export default function ArtistIntro({ name, handle, genres = [], onComplete }) {
  const [visible, setVisible] = useState(true);
  const theme = pickTheme(genres);
  const t = THEMES[theme];

  useEffect(() => {
    if (!name || !handle) {
      setVisible(false);
      onComplete?.();
      return;
    }
    try {
      const key = `plinks-intro-${handle.toLowerCase()}`;
      const seen = sessionStorage.getItem(key);
      if (seen) {
        setVisible(false);
        onComplete?.();
        return;
      }
      sessionStorage.setItem(key, '1');
    } catch {}
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [name, handle]); // eslint-disable-line

  const skip = () => {
    setVisible(false);
    onComplete?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden"
          style={{ background: t.bg, cursor: 'pointer' }}
          onClick={skip}
        >
          {t.bgFx === 'bloody' && <BloodyFx accent={t.accent} />}
          {t.bgFx === 'smoke' && <SmokeFx accent={t.accent} />}
          {t.bgFx === 'glitch' && <GlitchFx accent={t.accent} />}
          {t.bgFx === 'mist' && <MistFx />}
          {t.bgFx === 'editorial' && <EditorialFx accent={t.accent} />}

          {/* Top tag */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="absolute top-6 left-6 text-[10px] tracking-[0.4em] uppercase font-bold"
            style={{ fontFamily: MONO, color: t.accent }}
          >
            ◆ PLINKS PRESENTS
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute top-6 right-6 text-[10px] tracking-[0.4em] uppercase font-bold"
            style={{ fontFamily: MONO, color: t.accentSoft }}
          >
            /{handle}
          </motion.div>

          {/* Center stack */}
          <div className="text-center px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-[10px] tracking-[0.45em] uppercase font-bold mb-4"
              style={{ fontFamily: MONO, color: t.accent }}
            >
              {t.tagline}
            </motion.div>

            {theme === 'GLITCH' ? (
              <GlitchName name={name} accent={t.accent} color={t.name} />
            ) : (
              <motion.h1
                initial={{ opacity: 0, scale: theme === 'BLOODY' ? 1.1 : 1.04, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: theme === 'BLOODY' ? 0.7 : 1.0, ease: [0.22, 1, 0.36, 1] }}
                className="font-black tracking-tight break-words leading-[0.9]"
                style={{
                  fontFamily: DISPLAY,
                  color: t.name,
                  fontSize: 'clamp(2.5rem, 12vw, 7rem)',
                  textShadow:
                    theme === 'BLOODY'
                      ? `0 0 30px ${t.accent}80, 0 0 60px ${t.accent}40`
                      : theme === 'SMOKE'
                      ? `0 0 40px ${t.accent}60`
                      : 'none',
                }}
              >
                {name}
              </motion.h1>
            )}

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="h-px mt-5 mx-auto"
              style={{
                background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`,
                maxWidth: '60%',
                transformOrigin: 'center',
              }}
            />
          </div>

          {/* skip hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="absolute bottom-8 text-[9px] tracking-[0.3em] uppercase"
            style={{ fontFamily: MONO, color: t.accentSoft }}
          >
            tap to skip
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GlitchName({ name, accent, color }) {
  return (
    <motion.h1
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="font-black tracking-tight break-words leading-[0.9] relative inline-block"
      style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.5rem, 12vw, 7rem)', color }}
    >
      <span
        className="absolute inset-0"
        style={{ color: '#FF00B0', transform: 'translate(2px, 0)', mixBlendMode: 'screen' }}
        aria-hidden
      >
        {name}
      </span>
      <span
        className="absolute inset-0"
        style={{ color: accent, transform: 'translate(-2px, 0)', mixBlendMode: 'screen' }}
        aria-hidden
      >
        {name}
      </span>
      <span className="relative">{name}</span>
    </motion.h1>
  );
}
