import { motion } from 'motion/react';
import { platformColor } from '../lib/platformColors.js';

/**
 * Dark card link with platform-color dot on left, name center, arrow right.
 * The clean Spotify/Apple Music vibe from the user's reference screenshot.
 */
export default function PlatformLinkCard({ label, url, color, index = 0, onClick, theme = 'dark' }) {
  const isDark = theme === 'dark';
  const bg = isDark ? '#141414' : '#F2EFE6';
  const bgHover = isDark ? '#1F1F1F' : '#E6E2D5';
  const ink = isDark ? '#F2EFE6' : '#0A0A0A';
  const muted = isDark ? '#8A8680' : '#666';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
  const dotColor = color || platformColor(label || url);

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, background: bgHover }}
      whileTap={{ scale: 0.98 }}
      className="block w-full px-5 py-4 group transition-colors"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color: ink,
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
          style={{
            background: dotColor,
            boxShadow: `0 0 8px ${dotColor}40`,
          }}
        />
        <span
          className="flex-1 text-lg font-bold truncate"
          style={{ fontFamily: '"Fraunces", serif' }}
        >
          {label}
        </span>
        <span
          className="shrink-0 text-xl transition-transform group-hover:translate-x-1"
          style={{ color: muted }}
        >
          →
        </span>
      </div>
    </motion.a>
  );
}
