import { AnimatePresence, motion } from 'motion/react';
import { useLocation, Routes } from 'react-router-dom';

const EASE = [0.16, 1, 0.3, 1];

/**
 * Seamless route transitions.
 *
 * Pages are stacked absolutely so they crossfade in place — the next page
 * fades in over the current page, no gap, no dark/white flash between.
 *
 * Quick 180ms opacity-only transition. Feels instant but smooth.
 */
export default function RouteTransitions({ children }) {
  const location = useLocation();

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: EASE }}
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
