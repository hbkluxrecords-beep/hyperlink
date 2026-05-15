import { useState } from 'react';
import { motion } from 'motion/react';
import AudioPlayer from './AudioPlayer.jsx';
import CountdownTimer from './CountdownTimer.jsx';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';
import { LUXURY_EASE } from '../lib/animations.js';

export default function PresaveBlock({ release, artistName, onPlay, onPresaveClick }) {
  const [released, setReleased] = useState(() => {
    if (!release.releaseDate) return true;
    return new Date(release.releaseDate).getTime() <= Date.now();
  });

  const handleExpire = () => setReleased(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: LUXURY_EASE }}
      className="relative overflow-hidden"
      style={{
        background: STUDIO.surface,
        border: `1px solid ${STUDIO.borderStrong}`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Top label strip */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{
          background: STUDIO.bg,
          borderBottom: `1px solid ${STUDIO.border}`,
        }}
      >
        <span
          className="text-[10px] tracking-[0.35em] uppercase font-bold flex items-center gap-2"
          style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}
        >
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: STUDIO.accent }} />
          {released ? 'OUT NOW' : 'COMING SOON'}
        </span>
        {release.releaseDate && (
          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
          >
            {new Date(release.releaseDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        )}
      </div>

      <div className="p-6 md:p-10">
        {/* Countdown */}
        {!released && release.releaseDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
          >
            <div
              className="text-[10px] tracking-[0.3em] uppercase font-bold text-center mb-6"
              style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
            >
              Drops in
            </div>
            <CountdownTimer target={release.releaseDate} onExpire={handleExpire} />
          </motion.div>
        )}

        {/* Audio player */}
        <AudioPlayer
          src={release.audioPreviewUrl}
          title={release.trackTitle}
          artist={artistName}
          coverArtUrl={release.coverArtUrl}
          waveformData={release.waveformData}
          variant="hero"
          onPlay={onPlay}
        />

        {/* Presave/Stream CTA */}
        {release.presaveUrl && (
          <motion.a
            href={release.presaveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onPresaveClick}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="relative block mt-6 text-center py-5 overflow-hidden group"
            style={{
              background: STUDIO.accent,
              color: STUDIO.ink,
              fontFamily: STUDIO_FONTS.mono,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {released ? 'Stream Now' : 'Presave Now'} <span>→</span>
            </span>
            {/* Shimmer */}
            <motion.div
              className="absolute inset-y-0 w-1/4 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
              }}
              animate={{ x: ['-100%', '500%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
            />
          </motion.a>
        )}

        {/* Platforms strip */}
        {release.platforms && release.platforms.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            <span
              className="text-[10px] tracking-[0.3em] uppercase"
              style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
            >
              Available on
            </span>
            {release.platforms.map((p) => (
              <span
                key={p}
                className="text-[10px] tracking-[0.25em] uppercase font-bold"
                style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink }}
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
