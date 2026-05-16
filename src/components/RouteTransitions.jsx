import { AnimatePresence, motion } from 'motion/react';
import { useLocation, Routes } from 'react-router-dom';

const EASE = [0.16, 1, 0.3, 1];

/**
 * Page transitions WITHOUT white flash.
 *
 * Two principles:
 *   1. The wrapper is locked to the dark page bg (#0A0A0A) so when the page
 *      fades, the browser never reveals a white body underneath.
 *   2. We use opacity-only fades (no y translate, no scale) so the transition
 *      feels instant and clean, not slidey.
 *
 *   3. Light-themed pages (Landing, Explore, etc) paint their own bg over the
 *      dark wrapper, so they look correct AND there's no flash going to/from them.
 */
export default function RouteTransitions({ children }) {
  const location = useLocation();

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <Routes location={location}>{children}</Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
