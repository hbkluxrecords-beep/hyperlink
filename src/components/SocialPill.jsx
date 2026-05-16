import { motion } from 'motion/react';

export default function SocialPill({ label, url, onClick, theme = 'dark' }) {
  const isDark = theme === 'dark';
  const ink = isDark ? '#F2EFE6' : '#0A0A0A';
  const border = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.2)';

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="text-[10px] tracking-[0.3em] uppercase font-bold px-4 py-2 border inline-block"
      style={{
        borderColor: border,
        color: ink,
        fontFamily: '"JetBrains Mono", monospace',
      }}
    >
      {label} ↗
    </motion.a>
  );
}
