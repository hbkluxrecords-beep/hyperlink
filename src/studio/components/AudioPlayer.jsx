import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Waveform from './Waveform.jsx';
import ReleaseCover from './ReleaseCover.jsx';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';
import { formatTime } from '../lib/audioUtils.js';

// Global registry so only one player plays at a time
const activePlayers = new Set();
function pauseAllOthers(current) {
  activePlayers.forEach((p) => {
    if (p !== current && p.pause) p.pause();
  });
}

export default function AudioPlayer({
  src,
  title,
  artist,
  coverArtUrl,
  waveformData,
  variant = 'inline', // 'inline' or 'hero'
  onPlay,
}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [reportedPlay, setReportedPlay] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration > 0) setProgress(audio.currentTime / audio.duration);
    };
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
      audio.currentTime = 0;
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);

    const handle = {
      pause: () => {
        audio.pause();
        setPlaying(false);
      },
    };
    activePlayers.add(handle);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
      activePlayers.delete(handle);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      const me = { pause: () => { audio.pause(); setPlaying(false); } };
      pauseAllOthers(me);
      audio.play().then(() => {
        setPlaying(true);
        if (!reportedPlay && onPlay) {
          onPlay();
          setReportedPlay(true);
        }
      }).catch(() => {});
    }
  };

  const seek = (ratio) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = ratio * duration;
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  const isHero = variant === 'hero';

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: STUDIO.surface,
        border: `1px solid ${STUDIO.border}`,
        padding: isHero ? '32px' : '20px',
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className={`flex ${isHero ? 'flex-col md:flex-row gap-6 md:gap-8' : 'flex-row gap-4'} items-center`}>
        <ReleaseCover
          src={coverArtUrl}
          trackTitle={title || 'Untitled'}
          playing={playing}
          size={isHero ? 240 : 80}
        />

        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-baseline justify-between gap-4 mb-2">
            <div className="min-w-0">
              <div
                className="font-black truncate"
                style={{
                  fontFamily: STUDIO_FONTS.display,
                  color: STUDIO.ink,
                  fontSize: isHero ? 'clamp(1.5rem, 4vw, 2.5rem)' : '1.125rem',
                  lineHeight: 1.1,
                }}
              >
                {title || 'Untitled'}
              </div>
              {artist && (
                <div
                  className="truncate"
                  style={{
                    fontFamily: STUDIO_FONTS.mono,
                    color: STUDIO.muted,
                    fontSize: 11,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginTop: 4,
                  }}
                >
                  {artist}
                </div>
              )}
            </div>
            <div
              className="tabular-nums shrink-0"
              style={{
                fontFamily: STUDIO_FONTS.mono,
                color: STUDIO.muted,
                fontSize: 11,
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <Waveform data={waveformData} progress={progress} height={isHero ? 56 : 36} onSeek={seek} />

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={togglePlay}
              disabled={!src}
              className="relative flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40"
              style={{
                width: isHero ? 64 : 44,
                height: isHero ? 64 : 44,
                borderRadius: '50%',
                background: STUDIO.accent,
                color: STUDIO.ink,
              }}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              <AnimatePresence mode="wait">
                {playing ? (
                  <motion.svg
                    key="pause"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    width={isHero ? 22 : 16}
                    height={isHero ? 22 : 16}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="play"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    width={isHero ? 22 : 16}
                    height={isHero ? 22 : 16}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ marginLeft: 3 }}
                  >
                    <path d="M8 5v14l11-7z" />
                  </motion.svg>
                )}
              </AnimatePresence>
              {!playing && src && (
                <motion.div
                  className="absolute inset-0"
                  style={{ borderRadius: '50%', border: `2px solid ${STUDIO.accent}` }}
                  animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="text-xs tracking-[0.2em] uppercase font-bold opacity-60 hover:opacity-100 transition-opacity"
              style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink }}
            >
              {muted ? '◔ MUTED' : '◐ SOUND'}
            </button>
          </div>
        </div>
      </div>

      {!src && (
        <div
          className="text-center text-xs mt-3 tracking-[0.2em] uppercase"
          style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono }}
        >
          Preview not available
        </div>
      )}
    </div>
  );
}
