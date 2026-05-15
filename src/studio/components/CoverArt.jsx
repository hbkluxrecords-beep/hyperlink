import { motion } from 'motion/react';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';

export default function CoverArt({ src, alt, playing = false, size = 120 }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      <motion.div
        animate={playing ? { rotate: 360 } : { rotate: 0 }}
        transition={
          playing
            ? { duration: 30, ease: 'linear', repeat: Infinity }
            : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
        }
        className="absolute inset-0"
        style={{
          background: src ? `url(${src}) center/cover` : STUDIO.surfaceElevated,
          borderRadius: '50%',
        }}
      >
        {!src && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono, fontSize: 10, letterSpacing: '0.3em' }}
          >
            NO ART
          </div>
        )}
      </motion.div>
      {/* Vinyl center hole */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: size * 0.15,
          height: size * 0.15,
          background: STUDIO.bg,
          borderRadius: '50%',
          border: `2px solid ${STUDIO.border}`,
        }}
      />
    </div>
  );
}
