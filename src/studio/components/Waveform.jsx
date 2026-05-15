import { motion } from 'motion/react';
import { STUDIO } from '../lib/studioDesign.js';

export default function Waveform({ data, progress = 0, height = 60, onSeek }) {
  const bars = data && data.length > 0 ? data : Array.from({ length: 60 }, () => 0.3 + Math.random() * 0.5);
  const total = bars.length;
  const playedCount = Math.floor(progress * total);

  const handleClick = (e) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    onSeek(ratio);
  };

  return (
    <div
      onClick={handleClick}
      className="w-full flex items-center gap-[2px] cursor-pointer select-none"
      style={{ height }}
      role="slider"
      aria-label="Audio scrubber"
    >
      {bars.map((amp, i) => {
        const played = i <= playedCount;
        const barHeight = Math.max(4, amp * height);
        return (
          <motion.div
            key={i}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: i * 0.008, ease: [0.16, 1, 0.3, 1] }}
            style={{
              flex: 1,
              height: barHeight,
              background: played ? STUDIO.accent : STUDIO.muted,
              borderRadius: 1,
              transition: 'background 0.15s',
              transformOrigin: 'center',
            }}
          />
        );
      })}
    </div>
  );
}
