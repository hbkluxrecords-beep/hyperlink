// Shared motion variants — luxury watch precision easings
export const LUXURY_EASE = [0.16, 1, 0.3, 1];

export const pageEnter = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: LUXURY_EASE },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: LUXURY_EASE } },
};

export const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.2 } },
  whileTap: { scale: 0.97, transition: { duration: 0.1 } },
};

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.7, ease: LUXURY_EASE },
};

export const drawLine = {
  initial: { scaleX: 0, originX: 0 },
  whileInView: { scaleX: 1 },
  viewport: { once: true },
  transition: { duration: 1.2, ease: LUXURY_EASE },
};
