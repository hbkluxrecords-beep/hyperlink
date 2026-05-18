import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import StudioNav from '../components/StudioNav.jsx';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';
import { loadArtist } from '../lib/studioStorage.js';
import { isOwnerOf } from '../../lib/auth.js';
import { PLATFORMS, IDEAS, pickRandomIdea } from '../lib/promoIdeas.js';
import { useToast } from '../../components/Toast.jsx';

const EASE = [0.22, 1, 0.36, 1];

export default function StudioPromoIdeas() {
  const { handle } = useParams();
  const toast = useToast();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [platform, setPlatform] = useState('tiktok');
  const [idea, setIdea] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [recentHooks, setRecentHooks] = useState([]);

  useEffect(() => {
    loadArtist(handle).then((a) => {
      setArtist(a);
      setLoading(false);
      setIsOwner(isOwnerOf(handle));
    });
  }, [handle]);

  const spin = () => {
    setSpinning(true);
    setIdea(null);
    // Fake "thinking" delay for the wow factor
    const delay = 1400 + Math.random() * 600;
    setTimeout(() => {
      const picked = pickRandomIdea({
        platform,
        genres: artist?.genres || [],
        exclude: recentHooks,
      });
      if (picked) {
        setIdea(picked);
        setRecentHooks((prev) => [...prev.slice(-4), picked.hook]);
      } else {
        toast.error('No more ideas for this platform — try another');
      }
      setSpinning(false);
    }, delay);
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied'));
  };

  if (loading) {
    return (
      <div style={{ background: STUDIO.bg, minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-[10px] tracking-[0.3em] uppercase opacity-50" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
          Loading…
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="flex items-center justify-center px-6">
        <StudioNav minimal />
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-black mb-3" style={{ fontFamily: STUDIO_FONTS.display }}>Not your studio</h2>
          <p className="opacity-70" style={{ fontFamily: STUDIO_FONTS.display }}>Only the artist can use the promo generator.</p>
          <Link to={`/studio/${handle}`} className="inline-block mt-6 text-[10px] tracking-[0.3em] uppercase font-bold underline" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
            ← Back to profile
          </Link>
        </div>
      </div>
    );
  }

  const ideasForPlatform = IDEAS.filter((i) => i.platform === platform).length;

  return (
    <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="pb-32">
      <StudioNav />

      <div className="max-w-2xl mx-auto px-5 pt-24 md:pt-28 pb-10">
        {/* Header */}
        <div className="mb-8">
          <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
            ◆ STUDIO · PROMO LAB
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.95]" style={{ fontFamily: STUDIO_FONTS.display }}>
            Generate a <span style={{ fontStyle: 'italic', fontWeight: 300, color: STUDIO.accent }}>viral idea</span>.
          </h1>
          <p className="mt-3 text-sm opacity-70 max-w-md" style={{ fontFamily: STUDIO_FONTS.display }}>
            Hand-curated promotion concepts engineered for 2026 algorithms. Pick a platform, hit spin, get a complete plan.
          </p>
        </div>

        {/* Platform picker */}
        <div className="mb-6">
          <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-3 opacity-70" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
            Platform
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setPlatform(p.id); setIdea(null); setRecentHooks([]); }}
                className="px-3 py-3 text-[10px] tracking-[0.3em] uppercase font-bold transition-all"
                style={{
                  background: platform === p.id ? 'rgba(255,77,31,0.1)' : 'transparent',
                  border: `2px solid ${platform === p.id ? STUDIO.accent : STUDIO.border}`,
                  color: platform === p.id ? STUDIO.accent : STUDIO.ink,
                  fontFamily: STUDIO_FONTS.mono,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spinner button */}
        <button
          onClick={spin}
          disabled={spinning}
          className="w-full py-5 text-sm tracking-[0.3em] uppercase font-bold disabled:opacity-60 hover:scale-[1.01] transition-transform"
          style={{ background: STUDIO.accent, color: STUDIO.bg, fontFamily: STUDIO_FONTS.mono }}
        >
          {spinning ? '◆ ANALYZING TRENDS…' : idea ? '↻ Spin again' : '◆ Spin idea'}
        </button>

        <div className="text-[9px] tracking-[0.25em] uppercase opacity-50 mt-3 text-center" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
          {ideasForPlatform} concepts in current rotation · personalized to your genres
        </div>

        {/* Spinning state - thinking animation */}
        <AnimatePresence mode="wait">
          {spinning && (
            <motion.div
              key="spinning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 p-8 text-center"
              style={{ background: STUDIO.surface, border: `1px solid ${STUDIO.border}` }}
            >
              <ThinkingDots />
              <div className="text-[10px] tracking-[0.3em] uppercase font-bold mt-4 opacity-70" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                <CyclingStatus />
              </div>
            </motion.div>
          )}

          {idea && !spinning && (
            <motion.div
              key={idea.hook}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-8 space-y-4"
            >
              {/* Idea card */}
              <div className="p-5" style={{ background: STUDIO.surface, border: `1px solid ${STUDIO.border}` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
                    THE HOOK
                  </span>
                  <div className="flex-1 h-px" style={{ background: STUDIO.border }} />
                  <span
                    className="text-[9px] tracking-[0.25em] uppercase font-bold px-2 py-1"
                    style={{
                      background: idea.difficulty === 'Easy' ? 'rgba(29,185,84,0.15)' : 'rgba(255,215,0,0.15)',
                      color: idea.difficulty === 'Easy' ? '#1DB954' : '#FFD700',
                      fontFamily: STUDIO_FONTS.mono,
                    }}
                  >
                    {idea.difficulty}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight mb-3" style={{ fontFamily: STUDIO_FONTS.display }}>
                  {idea.hook}
                </h2>
                <p className="text-sm leading-relaxed opacity-90" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}>
                  {idea.concept}
                </p>
              </div>

              {/* Shot list */}
              <Section title="HOW TO FILM" content={idea.shotList} />

              {/* Why it works */}
              <Section title="WHY IT WORKS" content={idea.why} accent />

              {/* Caption */}
              <div className="p-5" style={{ background: STUDIO.surface, border: `1px solid ${STUDIO.border}` }}>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="text-[9px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                    SUGGESTED CAPTION
                  </span>
                  <button
                    onClick={() => copy(idea.caption)}
                    className="text-[9px] tracking-[0.25em] uppercase font-bold px-2 py-1 hover:scale-[1.04] transition-transform"
                    style={{ border: `1px solid ${STUDIO.accent}`, color: STUDIO.accent, fontFamily: STUDIO_FONTS.mono }}
                  >
                    Copy
                  </button>
                </div>
                <div className="text-base font-bold" style={{ fontFamily: STUDIO_FONTS.display }}>"{idea.caption}"</div>
                {idea.hashtags && idea.hashtags !== 'none' && (
                  <div className="text-xs mt-2 opacity-60" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                    {idea.hashtags}
                  </div>
                )}
              </div>

              {/* Save reminder */}
              <div className="text-[9px] tracking-[0.25em] uppercase opacity-50 text-center pt-2" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                Screenshot this — ideas don't save between spins
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!idea && !spinning && (
          <div className="mt-12 text-center opacity-40">
            <div className="text-6xl mb-2">◆</div>
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
              Awaiting input
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, content, accent }) {
  return (
    <div className="p-5" style={{ background: STUDIO.surface, border: `1px solid ${STUDIO.border}` }}>
      <div className="text-[9px] tracking-[0.3em] uppercase font-bold mb-2" style={{ fontFamily: STUDIO_FONTS.mono, color: accent ? STUDIO.accent : STUDIO.muted }}>
        ◆ {title}
      </div>
      <p className="text-sm leading-relaxed opacity-90" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}>
        {content}
      </p>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: STUDIO.accent }}
        />
      ))}
    </div>
  );
}

function CyclingStatus() {
  const messages = [
    'Scanning current trends',
    'Cross-referencing your genres',
    'Checking 2026 algorithm patterns',
    'Optimizing for engagement',
    'Synthesizing concept',
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 350);
    return () => clearInterval(t);
  }, []);
  return <span>{messages[idx]}…</span>;
}
