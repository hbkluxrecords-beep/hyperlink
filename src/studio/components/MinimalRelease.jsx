import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { platformColor } from '../../lib/platformColors.js';
import PlatformIcon from '../../components/PlatformIcon.jsx';
import TextEffect from '../../components/TextEffect.jsx';
import DropAlertCapture from '../../components/DropAlertCapture.jsx';

const ACCENT = '#FF4D1F';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const SURFACE = '#141414';
const BORDER = 'rgba(255,255,255,0.08)';
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatDropDate(d) {
  if (!d) return null;
  const date = new Date(d);
  const ms = date.getTime() - Date.now();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (ms <= 0) return { label: 'OUT NOW', isOut: true };
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return { label: `${months[date.getMonth()]} ${date.getDate()} · ${days}D`, isOut: false };
}

/**
 * Minimal layout — lnk.to style. Tiny cover left, title right, mini progress,
 * music services dominate, email tiny at bottom.
 */
export default function MinimalRelease({
  release, artistName, handle, musicLinks = [],
  isPremium = false, accent = ACCENT, hideReleaseDate = false, textEffect = 'none',
  onPlay, onPresaveClick, onLinkClick,
}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [emailOpen, setEmailOpen] = useState(false);

  const hasAudio = !!release.audioPreviewUrl;
  const drop = formatDropDate(release.releaseDate);
  const showPresave = drop && !drop.isOut && release.presaveUrl;

  useEffect(() => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    const t = () => setCurrentTime(a.currentTime);
    const l = () => setDuration(a.duration);
    const e = () => { setPlaying(false); setCurrentTime(0); };
    a.addEventListener('timeupdate', t);
    a.addEventListener('loadedmetadata', l);
    a.addEventListener('ended', e);
    return () => {
      a.removeEventListener('timeupdate', t);
      a.removeEventListener('loadedmetadata', l);
      a.removeEventListener('ended', e);
    };
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); onPlay && onPlay(); }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      {hasAudio && <audio ref={audioRef} src={release.audioPreviewUrl} preload="metadata" />}

      {/* Header row: tiny cover + title + artist */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3"
      >
        <div
          className="shrink-0 w-20 h-20 overflow-hidden"
          style={{ background: '#0A0A0A', border: `1px solid ${BORDER}` }}
        >
          {release.coverArtUrl ? (
            <img src={release.coverArtUrl} alt={release.trackTitle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl font-black opacity-20" style={{ fontFamily: DISPLAY, color: INK }}>
                {(release.trackTitle || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-xl md:text-2xl font-black leading-tight line-clamp-2"
            style={{ fontFamily: DISPLAY, color: INK }}
          >
            <TextEffect effect={isPremium ? textEffect : 'none'} accent={accent} style={{ color: INK }}>
              {release.trackTitle}
            </TextEffect>
          </div>
          <div
            className="text-[10px] tracking-[0.3em] uppercase font-bold mt-1 truncate"
            style={{ fontFamily: MONO, color: MUTED }}
          >
            {artistName}
          </div>
        </div>
      </motion.div>

      {/* Mini player bar */}
      {hasAudio && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-3 mt-4 px-3 py-2.5"
          style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
        >
          <motion.button
            onClick={toggle}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.06 }}
            animate={isPremium && (textEffect === 'pulse' || textEffect === 'glow') ? {
              boxShadow: [
                `0 0 12px ${accent}80, 0 0 24px ${accent}40`,
                `0 0 24px ${accent}cc, 0 0 48px ${accent}80`,
                `0 0 12px ${accent}80, 0 0 24px ${accent}40`,
              ],
            } : {}}
            transition={isPremium && textEffect === 'pulse' ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: accent,
              color: '#0A0A0A',
              boxShadow: isPremium && textEffect === 'glow' ? `0 0 20px ${accent}aa, 0 0 40px ${accent}55` : undefined,
            }}
          >
            {playing ? (
              <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                <rect x="3" y="2" width="4" height="12" />
                <rect x="9" y="2" width="4" height="12" />
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 2 L13 8 L3 14 Z" />
              </svg>
            )}
          </motion.button>
          <div className="flex-1 h-[3px] relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="absolute inset-y-0 left-0" style={{ background: accent, width: `${progress}%` }} />
          </div>
          <span className="text-[9px] tabular-nums shrink-0" style={{ fontFamily: MONO, color: MUTED }}>
            {formatTime(currentTime)}/{formatTime(duration)}
          </span>
        </motion.div>
      )}

      {/* Drop date */}
      {drop && !hideReleaseDate && (
        <div className="mt-3 flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: drop.isOut ? '#1DB954' : accent }} />
          <span style={{ color: drop.isOut ? '#1DB954' : accent }}>{drop.label}</span>
        </div>
      )}

      {/* Music services - DOMINANT */}
      {musicLinks.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {musicLinks.map((l, i) => {
            const dot = l.color || platformColor(l.label || l.url);
            return (
              <motion.a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onLinkClick && onLinkClick(l)}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.04 }}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-4 py-3.5 group"
                style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
              >
                <PlatformIcon label={l.label} url={l.url} size={22} />
                <span className="flex-1 text-sm font-bold truncate" style={{ fontFamily: DISPLAY, color: INK }}>
                  {l.label}
                </span>
                <span className="text-base shrink-0 transition-transform group-hover:translate-x-1" style={{ color: MUTED }}>›</span>
              </motion.a>
            );
          })}
        </div>
      )}

      {/* Presave button (smaller, secondary) */}
      {showPresave && (
        <motion.a
          href={release.presaveUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onPresaveClick}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="block w-full text-center py-2.5 mt-3"
          style={{
            background: accent, color: '#0A0A0A', fontFamily: MONO,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase',
          }}
        >
          Presave →
        </motion.a>
      )}

      {/* Email signup - tiny, collapsed */}
      {isPremium && drop && !drop.isOut && handle && (
        <div className="mt-4">
          {!emailOpen ? (
            <button
              onClick={() => setEmailOpen(true)}
              className="w-full text-center text-[10px] tracking-[0.3em] uppercase font-bold py-2 hover:opacity-80 transition-opacity"
              style={{ fontFamily: MONO, color: MUTED }}
            >
              ✉ Get notified on drop →
            </button>
          ) : (
            <DropAlertCapture handle={handle} releaseId={release.id} accent={accent} />
          )}
        </div>
      )}
    </div>
  );
}
