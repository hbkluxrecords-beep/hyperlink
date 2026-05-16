import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Tap-to-expand section row for compact edit forms.
 * Default collapsed. Shows label + summary value + chevron.
 * Expanded shows the children (inputs).
 */
export default function CollapsibleSection({
  label,
  summary,
  children,
  defaultOpen = false,
  theme = 'dark',
}) {
  const [open, setOpen] = useState(defaultOpen);

  const isDark = theme === 'dark';
  const bg = isDark ? '#141414' : '#F2EFE6';
  const bgOpen = isDark ? '#0F0F0F' : '#F2EFE6';
  const ink = isDark ? '#F2EFE6' : '#0A0A0A';
  const muted = isDark ? '#8A8680' : '#666';
  const accent = '#FF4D1F';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';

  return (
    <div style={{ background: open ? bgOpen : bg, border: `1px solid ${border}` }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:opacity-90 transition-opacity"
      >
        <div className="flex-1 min-w-0">
          <div
            className="text-[10px] tracking-[0.3em] uppercase font-bold mb-0.5"
            style={{ fontFamily: '"JetBrains Mono", monospace', color: open ? accent : muted }}
          >
            {label}
          </div>
          {summary && !open && (
            <div
              className="text-sm truncate"
              style={{ fontFamily: '"Fraunces", serif', color: ink }}
            >
              {summary}
            </div>
          )}
        </div>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          style={{ color: open ? accent : muted, fontSize: 14 }}
        >
          →
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
