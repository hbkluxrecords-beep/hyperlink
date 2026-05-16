import { AnimatePresence, motion } from 'motion/react';
import { useLocation, Routes } from 'react-router-dom';

const LUXURY_EASE = [0.16, 1, 0.3, 1];

export default function RouteTransitions({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.4, ease: LUXURY_EASE }}
        style={{ minHeight: '100vh' }}
      >
        <Routes location={location}>{children}</Routes>
      </motion.div>
    </AnimatePresence>
  );
}
