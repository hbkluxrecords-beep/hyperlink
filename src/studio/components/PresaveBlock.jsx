import { useState } from 'react';
import { motion } from 'motion/react';
import AudioPlayer from './AudioPlayer.jsx';
import CountdownTimer from './CountdownTimer.jsx';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';
import { LUXURY_EASE } from '../lib/animations.js';

function formatReleaseDate(date) {
  if (!date) return null;
  const d = new Date(date);
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return {
    month: months[d.getMonth()],
    day: d.getDate(),
    year: d.getFullYear(),
  };
}

export default function PresaveBlock({ release, artistName, onPlay, onPresaveClick }) {
  const [released, setReleased] = useState(() => {
    if (!release.releaseDate) return true;
    return new Date(release.releaseDate).getTime() <= Date.now();
  });
  const dateParts = formatReleaseDate(release.releaseDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: LUXURY_EASE }}
      className="relative"
    >
      {/* Status banner — only show if pre-release */}
      {!released && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-3 mb-4 px-3 py-2"
          style={{ background: STUDIO.surface, borderLeft: `2px solid ${STUDIO.accent}` }}
        >
          <motion.span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: STUDIO.accent }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span
            className="text-[10px] tracking-[0.35em] uppercase font-bold"
            style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}
          >
            Coming Soon
          </span>
          <div className="flex-1 h-px" style={{ background: STUDIO.border }} />
          {dateParts && (
            <span
              className="text-[10px] tracking-[0.3em] uppercase"
              style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
            >
              {dateParts.month} {dateParts.day} · {dateParts.year}
            </span>
          )}
        </motion.div>
      )}

      {/* Hero release block */}
      <div
        className="relative overflow-hidden"
        style={{
          background: STUDIO.surface,
          border: `1px solid ${STUDIO.borderStrong}`,
        }}
      >
        {/* Diagonal date stamp - bottom right, like film negative date */}
        {dateParts && !released && (
          <motion.div
            initial={{ scale: 1.3, opacity: 0, rotate: -8 }}
            whileInView={{ scale: 1, opacity: 1, rotate: -8 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.4 }}
            className="absolute top-4 right-4 z-10 px-3 py-1.5 pointer-events-none"
            style={{
              background: STUDIO.accent,
              color: STUDIO.ink,
              fontFamily: STUDIO_FONTS.mono,
              fontSize: 10,
              letterSpacing: '0.3em',
              fontWeight: 700,
              textTransform: 'uppercase',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            {dateParts.month} {dateParts.day} · {dateParts.year}
          </motion.div>
        )}

        <div className="p-6 md:p-8">
          <AudioPlayer
            src={release.audioPreviewUrl}
            title={release.trackTitle}
            artist={artistName}
            coverArtUrl={release.coverArtUrl}
            waveformData={release.waveformData}
            variant="hero"
            onPlay={onPlay}
          />

          {/* Countdown inline below player */}
          {!released && release.releaseDate && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 pt-6 border-t flex items-center justify-between flex-wrap gap-4"
              style={{ borderColor: STUDIO.border }}
            >
              <span
                className="text-[10px] tracking-[0.3em] uppercase font-bold"
                style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
              >
                Drops in
              </span>
              <CountdownTimer target={release.releaseDate} onExpire={() => setReleased(true)} />
            </motion.div>
          )}

          {/* CTA */}
          {release.presaveUrl && (
            <motion.a
              href={release.presaveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onPresaveClick}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="relative block mt-6 text-center py-5 overflow-hidden group"
              style={{
                background: STUDIO.accent,
                color: STUDIO.ink,
                fontFamily: STUDIO_FONTS.mono,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {released ? 'Stream Now' : 'Presave Now'} <span>→</span>
              </span>
              <motion.div
                className="absolute inset-y-0 w-1/4 pointer-events-none"
                style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)` }}
                animate={{ x: ['-100%', '500%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
              />
            </motion.a>
          )}

          {release.platforms && release.platforms.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
              <span
                className="text-[9px] tracking-[0.3em] uppercase"
                style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
              >
                Available on
              </span>
              {release.platforms.map((p, i) => (
                <span key={p} className="flex items-center gap-3">
                  {i > 0 && <span style={{ color: STUDIO.border }}>·</span>}
                  <span
                    className="text-[10px] tracking-[0.25em] uppercase font-bold"
                    style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink }}
                  >
                    {p}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
