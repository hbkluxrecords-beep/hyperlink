import { AnimatePresence, motion } from 'motion/react';
import { useLocation, Routes } from 'react-router-dom';

// Expo-out — the curve that feels luxurious. Quick start, soft settle.
const EASE = [0.22, 1, 0.36, 1];

/**
 * Seamless crossfade transitions.
 *
 * Strategy:
 *  - Both old and new pages absolutely-positioned, layered.
 *  - New page enters with opacity 0 → 1 + subtle scale 1.02 → 1
 *    (microscopic zoom feels expensive, not jarring).
 *  - Old page exits with opacity 1 → 0 (no movement on exit — that's what
 *    causes the empty-screen feel).
 *  - Both animations run simultaneously — no `mode="wait"` so there's never
 *    a gap between them.
 *  - Wrapper is BLACK so any sub-millisecond render gap stays dark, never white.
 */
export default function RouteTransitions({ children }) {
  const location = useLocation();

  return (
    <div style={{ position: 'relative', background: '#0A0A0A', minHeight: '100vh' }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, scale: 1.015 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.22, ease: EASE },
            scale: { duration: 0.35, ease: EASE },
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
          }}
        >
          <Routes location={location}>{children}</Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
