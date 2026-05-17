import { motion } from 'motion/react';

/**
 * Premium animated background. Subtle, not loud — two soft accent-color
 * blobs that drift slowly behind the content. Fixed position, behind everything.
 */
export default function AnimatedBackground({ accent = '#FF4D1F' }) {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Blob 1 - top left, drifts diagonally */}
      <motion.div
        animate={{
          x: ['-10%', '15%', '-10%'],
          y: ['-10%', '12%', '-10%'],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute"
        style={{
          top: 0,
          left: 0,
          width: '60vw',
          height: '60vw',
          maxWidth: 600,
          maxHeight: 600,
          background: `radial-gradient(circle, ${accent}26 0%, ${accent}00 70%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* Blob 2 - bottom right, drifts opposite */}
      <motion.div
        animate={{
          x: ['10%', '-15%', '10%'],
          y: ['10%', '-12%', '10%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute"
        style={{
          bottom: 0,
          right: 0,
          width: '70vw',
          height: '70vw',
          maxWidth: 700,
          maxHeight: 700,
          background: `radial-gradient(circle, ${accent}1f 0%, ${accent}00 70%)`,
          filter: 'blur(80px)',
        }}
      />

      {/* Subtle grain overlay for film texture */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
