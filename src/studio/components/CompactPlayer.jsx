import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import DropAlertCapture from '../../components/DropAlertCapture.jsx';

const ACCENT = '#FF4D1F';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const SURFACE = '#141414';
const BORDER = 'rgba(255,255,255,0.08)';
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDropDate(releaseDate) {
  if (!releaseDate) return null;
  const d = new Date(releaseDate);
  const now = Date.now();
  const ms = d.getTime() - now;
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));

  if (ms <= 0) return { label: 'OUT NOW', isOut: true };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = `${months[d.getMonth()]} ${d.getDate()}`;
  return { label: `Drops ${dateStr} · ${days}d`, isOut: false };
}

/**
 * Compact horizontal music player.
 * ~96px tall. Cover left, title+artist+waveform middle, play button right.
 * Below: presave button + drop-date line + platforms.
 *
 * Replaces ReleaseCover + AudioPlayer + PresaveBlock from v2.
 */
export default function CompactPlayer({ release, artistName, handle, isPremium = false, accent, onPlay, onPresaveClick }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const hasAudio = !!release.audioPreviewUrl;
  const drop = formatDropDate(release.releaseDate);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => { setPlaying(false); setCurrentTime(0); };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
    };
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Coming Soon = future date. Render presave UI. Else render stream UI.
  const showPresave = drop && !drop.isOut && release.presaveUrl;

  return (
    <div className="w-full">
      {hasAudio && (
        <audio ref={audioRef} src={release.audioPreviewUrl} preload="metadata" />
      )}

      {/* THE PLAYER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-4 p-3"
        style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
      >
        {/* Cover */}
        <div
          className="shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden relative"
          style={{ background: '#0A0A0A', border: `1px solid ${BORDER}` }}
        >
          {release.coverArtUrl ? (
            <img
              src={release.coverArtUrl}
              alt={release.trackTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span
                className="text-2xl font-black opacity-30"
                style={{ fontFamily: DISPLAY, color: INK }}
              >
                {(release.trackTitle || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
          {playing && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: `inset 0 0 24px ${ACCENT}` }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Middle: title, artist, progress */}
        <div className="flex-1 min-w-0">
          <div
            className="text-base md:text-lg font-bold leading-tight truncate"
            style={{ fontFamily: DISPLAY, color: INK }}
          >
            {release.trackTitle}
          </div>
          <div
            className="text-[10px] tracking-[0.25em] uppercase mt-0.5 truncate"
            style={{ fontFamily: MONO, color: MUTED }}
          >
            {artistName}
          </div>
          {hasAudio && (
            <div className="mt-2.5 flex items-center gap-2">
              <div
                className="flex-1 h-[3px] relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0"
                  style={{ background: ACCENT, width: `${progress}%` }}
                  transition={{ ease: 'linear', duration: 0.1 }}
                />
              </div>
              <span
                className="text-[9px] tabular-nums shrink-0"
                style={{ fontFamily: MONO, color: MUTED }}
              >
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          )}
        </div>

        {/* Play button */}
        {hasAudio && (
          <motion.button
            onClick={togglePlay}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.06 }}
            className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center"
            style={{ background: ACCENT, color: '#0A0A0A' }}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="3" y="2" width="4" height="12" rx="0.5" />
                <rect x="9" y="2" width="4" height="12" rx="0.5" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 2 L13 8 L3 14 Z" />
              </svg>
            )}
          </motion.button>
        )}
      </motion.div>

      {/* Drop info line */}
      {drop && (
        <div
          className="flex items-center gap-2 mt-3 text-[10px] tracking-[0.3em] uppercase font-bold"
          style={{ fontFamily: MONO }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: drop.isOut ? '#1DB954' : ACCENT }}
          />
          <span style={{ color: drop.isOut ? '#1DB954' : ACCENT }}>{drop.label}</span>
          {release.platforms && release.platforms.length > 0 && (
            <>
              <span style={{ color: MUTED }}>·</span>
              <span className="truncate" style={{ color: MUTED }}>
                {release.platforms.slice(0, 3).join(' · ')}
              </span>
            </>
          )}
        </div>
      )}

      {/* CTA: presave or stream */}
      {showPresave && (
        <motion.a
          href={release.presaveUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onPresaveClick}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="block w-full text-center py-3.5 mt-3 relative overflow-hidden"
          style={{
            background: accent || ACCENT,
            color: '#0A0A0A',
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          <span className="relative z-10">Presave Now →</span>
        </motion.a>
      )}
      {drop?.isOut && release.presaveUrl && (
        <motion.a
          href={release.presaveUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onPresaveClick}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="block w-full text-center py-3.5 mt-3"
          style={{
            background: accent || ACCENT,
            color: '#0A0A0A',
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          Stream Now →
        </motion.a>
      )}

      {/* Premium feature: drop alerts email capture */}
      {isPremium && drop && !drop.isOut && handle && (
        <DropAlertCapture handle={handle} releaseId={release.id} accent={accent || ACCENT} />
      )}
    </div>
  );
}
