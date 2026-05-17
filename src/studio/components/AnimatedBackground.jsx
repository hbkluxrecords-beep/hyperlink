import { motion } from 'motion/react';

/**
 * PREMIUM ANIMATED BACKGROUND — full send.
 * Large drifting accent blobs at high opacity, a complementary purple blob,
 * sweeping diagonal light rays, a slowly-moving grid, film grain, and a
 * vignette to keep content readable.
 */
export default function AnimatedBackground({ accent = '#FF4D1F' }) {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* BLOB 1 — top-left, big, drifts diagonally */}
      <motion.div
        animate={{ x: ['-15%', '25%', '-15%'], y: ['-15%', '20%', '-15%'], scale: [1, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute"
        style={{
          top: '-10%', left: '-10%',
          width: '80vw', height: '80vw', maxWidth: 800, maxHeight: 800,
          background: `radial-gradient(circle, ${accent}80 0%, ${accent}30 35%, ${accent}00 70%)`,
          filter: 'blur(40px)',
        }}
      />

      {/* BLOB 2 — bottom-right, bigger, opposite direction */}
      <motion.div
        animate={{ x: ['15%', '-25%', '15%'], y: ['10%', '-20%', '10%'], scale: [1.1, 0.9, 1.1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute"
        style={{
          bottom: '-15%', right: '-10%',
          width: '90vw', height: '90vw', maxWidth: 900, maxHeight: 900,
          background: `radial-gradient(circle, ${accent}70 0%, ${accent}25 40%, ${accent}00 75%)`,
          filter: 'blur(50px)',
        }}
      />

      {/* BLOB 3 — center, pulses */}
      <motion.div
        animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2"
        style={{
          width: '60vw', height: '60vw', maxWidth: 600, maxHeight: 600,
          marginLeft: '-30vw', marginTop: '-30vw',
          background: `radial-gradient(circle, ${accent}55 0%, ${accent}00 60%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* BLOB 4 — top-right purple complement */}
      <motion.div
        animate={{ x: ['10%', '-10%', '10%'], y: ['-5%', '15%', '-5%'] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute"
        style={{
          top: '-5%', right: '-15%',
          width: '60vw', height: '60vw', maxWidth: 600, maxHeight: 600,
          background: 'radial-gradient(circle, #8B5CF655 0%, #8B5CF620 40%, transparent 70%)',
          filter: 'blur(45px)',
        }}
      />

      {/* SWEEPING DIAGONAL LIGHT RAY */}
      <motion.div
        animate={{ x: ['-100%', '200%'], opacity: [0, 0.5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
        className="absolute top-0 bottom-0"
        style={{
          width: '40%',
          background: `linear-gradient(105deg, transparent 0%, ${accent}40 50%, transparent 100%)`,
          filter: 'blur(20px)',
          transform: 'skewX(-20deg)',
        }}
      />

      {/* SECOND SWEEPING RAY — offset, white-ish */}
      <motion.div
        animate={{ x: ['200%', '-100%'], opacity: [0, 0.35, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear', repeatDelay: 6, delay: 3 }}
        className="absolute top-0 bottom-0"
        style={{
          width: '35%',
          background: 'linear-gradient(105deg, transparent 0%, #FFFFFF25 50%, transparent 100%)',
          filter: 'blur(25px)',
          transform: 'skewX(15deg)',
        }}
      />

      {/* MOVING GRID OVERLAY */}
      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: `linear-gradient(${accent}50 1px, transparent 1px), linear-gradient(90deg, ${accent}50 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* FILM GRAIN */}
      <div
        className="absolute inset-0 opacity-[0.1] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* VIGNETTE — slight dark edge to keep content readable */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(10,10,10,0.45) 100%)',
        }}
      />
    </div>
  );
}
