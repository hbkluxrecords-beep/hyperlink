import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { claimAudio, releaseAudio, subscribe } from '../lib/audioBus.js';

const ACCENT = '#FF4D1F';
const BG = '#0A0A0A';
const MUTED = '#8A8680';
const BORDER = 'rgba(255,255,255,0.08)';
const MONO = '"JetBrains Mono", monospace';

/**
 * Compact preview block: 80px cover + 56px play/pause button.
 * Lives inside featured cards. Caps preview at 30s.
 */
export default function MiniPreviewPlayer({ id, coverUrl, audioUrl, trackTitle }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Subscribe to global audio bus - pause when another card claims audio
  useEffect(() => {
    const unsub = subscribe((activeId) => {
      if (activeId !== id && playing) {
        audioRef.current?.pause();
        setPlaying(false);
      }
    });
    return unsub;
  }, [id, playing]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      const ct = a.currentTime;
      // Cap at 30s
      if (ct >= 30) {
        a.pause();
        a.currentTime = 0;
        setPlaying(false);
        setProgress(0);
        releaseAudio(id);
        return;
      }
      setProgress((ct / Math.min(a.duration || 30, 30)) * 100);
    };
    const onEnd = () => { setPlaying(false); setProgress(0); releaseAudio(id); };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnd);
    };
  }, [id]);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      releaseAudio(id);
    } else {
      claimAudio(id);
      a.play().catch(() => {});
      setPlaying(true);
    }
  };

  const hasAudio = !!audioUrl;

  // Layout: cover on left, button on right. Track title below.
  return (
    <div
      className="flex items-center gap-3 p-2.5"
      style={{ background: BG, border: `1px solid ${BORDER}` }}
      onClick={(e) => e.stopPropagation()}
    >
      {hasAudio && <audio ref={audioRef} src={audioUrl} preload="none" />}

      {/* Cover */}
      <div
        className="shrink-0 w-12 h-12 overflow-hidden"
        style={{ background: '#000', borderRadius: 4 }}
      >
        {coverUrl ? (
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: MUTED }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        )}
      </div>

      {/* Title + progress */}
      <div className="flex-1 min-w-0">
        <div
          className="text-[10px] tracking-[0.1em] font-bold truncate"
          style={{ fontFamily: MONO, color: hasAudio ? '#F2EFE6' : MUTED }}
        >
          {trackTitle || (hasAudio ? 'Preview' : 'No preview')}
        </div>
        {hasAudio && (
          <div className="h-[2px] mt-1 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full transition-all" style={{ background: ACCENT, width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* Play button */}
      {hasAudio && (
        <motion.button
          onClick={toggle}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.06 }}
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: ACCENT, color: BG }}
          aria-label={playing ? 'Pause' : 'Play preview'}
        >
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="4" height="12" />
              <rect x="9" y="2" width="4" height="12" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 2 L13 8 L3 14 Z" />
            </svg>
          )}
        </motion.button>
      )}
    </div>
  );
}
