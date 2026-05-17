import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { platformColor } from '../../lib/platformColors.js';
import DropAlertCapture from '../../components/DropAlertCapture.jsx';

const ACCENT = '#FF4D1F';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const SURFACE = '#141414';
const BORDER = 'rgba(255,255,255,0.08)';
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

function formatDropDate(releaseDate) {
  if (!releaseDate) return null;
  const d = new Date(releaseDate);
  const ms = d.getTime() - Date.now();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (ms <= 0) return { label: 'OUT NOW', isOut: true };
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return { label: `DROPS ${months[d.getMonth()].toUpperCase()} ${d.getDate()} · ${days}D`, isOut: false };
}

/**
 * Showcase release layout: big cover, title centered, music services
 * listed as full-width Play buttons below. Inspired by lnk.to / Linkfire.
 */
export default function ShowcaseRelease({
  release,
  artistName,
  handle,
  musicLinks = [],
  isPremium = false,
  accent = ACCENT,
  onPlay,
  onPresaveClick,
  onLinkClick,
}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const hasAudio = !!release.audioPreviewUrl;
  const drop = formatDropDate(release.releaseDate);
  const showPresave = drop && !drop.isOut && release.presaveUrl;

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const onEnded = () => setPlaying(false);
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
      if (onPlay) onPlay();
    }
  };

  return (
    <div className="w-full">
      {hasAudio && <audio ref={audioRef} src={release.audioPreviewUrl} preload="metadata" />}

      {/* Big cover with play overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto"
        style={{
          width: '100%',
          maxWidth: 240,
          aspectRatio: '1 / 1',
          background: '#0A0A0A',
          border: `1px solid ${BORDER}`,
          boxShadow: playing ? `0 0 40px ${accent}30` : `0 6px 24px rgba(0,0,0,0.4)`,
          transition: 'box-shadow 0.5s',
        }}
      >
        {release.coverArtUrl ? (
          <img
            src={release.coverArtUrl}
            alt={release.trackTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-black opacity-20" style={{ fontFamily: DISPLAY, color: INK }}>
              {(release.trackTitle || '?')[0].toUpperCase()}
            </span>
          </div>
        )}

        {/* Play overlay */}
        {hasAudio && (
          <motion.button
            onClick={togglePlay}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            className="absolute inset-0 flex items-center justify-center group"
            style={{ background: playing ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.3)' }}
          >
            <motion.div
              animate={{ scale: playing ? 0.85 : 1 }}
              transition={{ duration: 0.3 }}
              className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
              style={{
                background: accent,
                color: '#0A0A0A',
                boxShadow: `0 0 16px ${accent}80`,
              }}
            >
              {playing ? (
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="2" width="4" height="12" />
                  <rect x="9" y="2" width="4" height="12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 2 L13 8 L3 14 Z" />
                </svg>
              )}
            </motion.div>
          </motion.button>
        )}
      </motion.div>

      {/* Track title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mt-4"
      >
        <h2
          className="text-2xl md:text-3xl font-black tracking-tight leading-tight"
          style={{ fontFamily: DISPLAY, color: INK }}
        >
          {release.trackTitle}
        </h2>
        <div
          className="text-[10px] tracking-[0.35em] uppercase font-bold mt-1"
          style={{ fontFamily: MONO, color: MUTED }}
        >
          {artistName}
        </div>
      </motion.div>

      {/* Drop date label */}
      {drop && (
        <div className="text-center mt-2">
          <span
            className="inline-flex items-center gap-2 text-[9px] tracking-[0.35em] uppercase font-bold px-2.5 py-1"
            style={{
              fontFamily: MONO,
              color: drop.isOut ? '#1DB954' : accent,
              border: `1px solid ${drop.isOut ? '#1DB954' : accent}`,
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: drop.isOut ? '#1DB954' : accent }}
            />
            {drop.label}
          </span>
        </div>
      )}

      {/* Presave CTA */}
      {showPresave && (
        <motion.a
          href={release.presaveUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onPresaveClick}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="block w-full text-center py-3 mt-4"
          style={{
            background: accent,
            color: '#0A0A0A',
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          Presave Now →
        </motion.a>
      )}

      {/* "Choose music service" label */}
      {musicLinks.length > 0 && (
        <div
          className="text-center text-[9px] tracking-[0.35em] uppercase font-bold mt-6 mb-3"
          style={{ fontFamily: MONO, color: MUTED }}
        >
          ◆ Choose music service
        </div>
      )}

      {/* Music service rows */}
      <div className="space-y-2">
        {musicLinks.map((l, i) => {
          const dotColor = l.color || platformColor(l.label || l.url);
          return (
            <motion.a
              key={i}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onLinkClick && onLinkClick(l)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-3 group"
              style={{
                background: SURFACE,
                border: `1px solid ${BORDER}`,
              }}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  background: dotColor,
                  boxShadow: `0 0 8px ${dotColor}40`,
                }}
              />
              <span
                className="flex-1 text-sm font-bold truncate"
                style={{ fontFamily: DISPLAY, color: INK }}
              >
                {l.label}
              </span>
              <span
                className="text-[9px] tracking-[0.3em] uppercase font-bold px-2.5 py-1 shrink-0 group-hover:scale-[1.04] transition-transform"
                style={{
                  background: accent,
                  color: '#0A0A0A',
                  fontFamily: MONO,
                }}
              >
                Play →
              </span>
            </motion.a>
          );
        })}
      </div>

      {/* Premium: drop alerts - secondary, after music services */}
      {isPremium && drop && !drop.isOut && handle && (
        <div className="mt-6">
          <div
            className="text-center text-[9px] tracking-[0.35em] uppercase font-bold mb-2"
            style={{ fontFamily: MONO, color: MUTED }}
          >
            ◆ Get notified
          </div>
          <DropAlertCapture handle={handle} releaseId={release.id} accent={accent} />
        </div>
      )}
    </div>
  );
}
