import { motion } from 'motion/react';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';

export default function MusicLinkButton({ label, url, color, index = 0, onClick }) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, scale: 1.005 }}
      whileTap={{ scale: 0.98 }}
      className="block relative overflow-hidden group"
      style={{
        background: STUDIO.surface,
        border: `1px solid ${STUDIO.border}`,
        padding: '18px 22px',
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ background: color || STUDIO.accent }}
          />
          <span
            className="font-bold text-lg truncate"
            style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}
          >
            {label}
          </span>
        </div>
        <motion.span
          className="shrink-0"
          style={{ color: STUDIO.muted, fontSize: 18 }}
          whileHover={{ x: 4, color: STUDIO.ink }}
        >
          →
        </motion.span>
      </div>
      {/* Hover accent line */}
      <div
        className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
        style={{ background: color || STUDIO.accent }}
      />
    </motion.a>
  );
}
