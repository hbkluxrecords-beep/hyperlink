import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

/**
 * Compact playlist player: shows current track cover + title, play/pause,
 * prev/next, and a tracklist drawer to skip to any track.
 */
export default function PlaylistPlayer({ tracks = [], accent = '#FF4D1F', initialIndex = 0 }) {
  const [index, setIndex] = useState(Math.min(initialIndex, tracks.length - 1));
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showList, setShowList] = useState(false);
  const audioRef = useRef(null);

  const current = tracks[index] || null;

  // Reset audio when track changes
  useEffect(() => {
    if (!audioRef.current || !current) return;
    audioRef.current.pause();
    audioRef.current.load();
    setProgress(0);
    if (playing) {
      audioRef.current.play().catch(() => setPlaying(false));
    }
  }, [index]); // eslint-disable-line

  const onLoaded = () => setDuration(audioRef.current?.duration || 0);
  const onTime = () => setProgress(audioRef.current?.currentTime || 0);
  const onEnded = () => {
    if (index < tracks.length - 1) setIndex(index + 1);
    else setPlaying(false);
  };

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const seek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    audioRef.current.currentTime = (x / rect.width) * duration;
  };

  const prev = () => setIndex(Math.max(0, index - 1));
  const next = () => setIndex(Math.min(tracks.length - 1, index + 1));

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  if (!tracks.length || !current) return null;

  return (
    <div className="w-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Hidden audio el */}
      {current.audioUrl && (
        <audio
          ref={audioRef}
          src={current.audioUrl}
          onLoadedMetadata={onLoaded}
          onTimeUpdate={onTime}
          onEnded={onEnded}
          preload="metadata"
        />
      )}

      {/* Main row */}
      <div className="flex items-center gap-3 p-3">
        {/* Cover */}
        <div className="w-14 h-14 shrink-0 overflow-hidden relative" style={{ background: '#1F1F1F' }}>
          {current.coverUrl ? (
            <img src={current.coverUrl} alt={current.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">♪</div>
          )}
        </div>

        {/* Info + progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-sm font-bold truncate" style={{ fontFamily: DISPLAY }}>
              {current.title}
            </div>
            <div className="text-[9px] tracking-[0.2em] opacity-60 shrink-0" style={{ fontFamily: MONO }}>
              {index + 1}/{tracks.length}
            </div>
          </div>
          {/* Progress bar */}
          <div
            onClick={seek}
            className="h-1 cursor-pointer relative"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{ background: accent, width: duration ? `${(progress / duration) * 100}%` : '0%' }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-[9px] opacity-50" style={{ fontFamily: MONO }}>
            <span>{fmt(progress)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={prev}
            disabled={index === 0}
            aria-label="Previous"
            className="w-9 h-9 flex items-center justify-center disabled:opacity-30 hover:scale-110 transition-transform"
            style={{ color: '#F2EFE6' }}
          >
            ◄◄
          </button>
          <button
            onClick={toggle}
            aria-label={playing ? 'Pause' : 'Play'}
            className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform rounded-full"
            style={{ background: accent, color: '#0A0A0A' }}
          >
            {playing ? '❚❚' : '►'}
          </button>
          <button
            onClick={next}
            disabled={index === tracks.length - 1}
            aria-label="Next"
            className="w-9 h-9 flex items-center justify-center disabled:opacity-30 hover:scale-110 transition-transform"
            style={{ color: '#F2EFE6' }}
          >
            ►►
          </button>
        </div>
      </div>

      {/* Track list toggle */}
      {tracks.length > 1 && (
        <button
          onClick={() => setShowList((v) => !v)}
          className="w-full px-3 py-2 text-[9px] tracking-[0.3em] uppercase font-bold opacity-70 hover:opacity-100 flex items-center justify-between border-t"
          style={{ borderColor: 'rgba(255,255,255,0.08)', fontFamily: MONO, color: '#F2EFE6' }}
        >
          <span>{showList ? '▾ HIDE TRACKLIST' : '▸ ALL TRACKS'}</span>
          <span style={{ color: accent }}>{tracks.length}</span>
        </button>
      )}

      <AnimatePresence>
        {showList && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {tracks.map((t, i) => (
                <button
                  key={t.id || i}
                  onClick={() => { setIndex(i); setPlaying(true); }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors"
                  style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                >
                  <span
                    className="text-[9px] tracking-[0.2em] w-5 text-left"
                    style={{ fontFamily: MONO, color: i === index ? accent : 'rgba(255,255,255,0.4)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-8 h-8 shrink-0 overflow-hidden" style={{ background: '#1F1F1F' }}>
                    {t.coverUrl ? (
                      <img src={t.coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <span
                    className="flex-1 text-left text-sm truncate"
                    style={{ fontFamily: DISPLAY, color: i === index ? accent : '#F2EFE6', fontWeight: i === index ? 700 : 400 }}
                  >
                    {t.title}
                  </span>
                  {i === index && playing && (
                    <span className="text-xs animate-pulse" style={{ color: accent }}>♪</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
