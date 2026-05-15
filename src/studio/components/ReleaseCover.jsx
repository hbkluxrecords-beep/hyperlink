import { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ProceduralCover from './ProceduralCover.jsx';
import { STUDIO } from '../lib/studioDesign.js';

// Album cover w/ 3D tilt on hover/gyro. NO spinning vinyl bullshit.
// When playing: film grain shimmer + accent glow pulse. No rotation.
export default function ReleaseCover({ src, trackTitle, playing = false, size = 280 }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Mouse-follow 3D tilt (desktop)
  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  };
  const onLeave = () => setTilt({ x: 0, y: 0 });

  // Device tilt (mobile gyro)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('DeviceOrientationEvent' in window)) return;
    const handler = (e) => {
      if (e.beta == null || e.gamma == null) return;
      const x = Math.max(-6, Math.min(6, (e.beta - 45) / 8));
      const y = Math.max(-6, Math.min(6, e.gamma / 8));
      setTilt({ x: -x, y });
    };
    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, []);

  return (
    <div className="relative" style={{ perspective: 1000, width: size, height: size }}>
      <motion.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onLeave}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        style={{
          width: size,
          height: size,
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {/* Glow when playing */}
        {playing && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: `0 0 80px 12px ${STUDIO.accent}, 0 0 30px 4px ${STUDIO.accent}`,
              borderRadius: 2,
            }}
            animate={{ opacity: [0.4, 0.75, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Cover */}
        {src ? (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: `1px solid ${STUDIO.borderStrong}`,
            }}
          />
        ) : (
          <div className="absolute inset-0">
            <ProceduralCover trackTitle={trackTitle} size={size} />
          </div>
        )}

        {/* Film grain shimmer (only when playing) */}
        {playing && (
          <motion.div
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='1' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
              opacity: 0.25,
            }}
            animate={{ x: [0, 6, -4, 0], y: [0, -3, 5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Corner stamp - bottom right - vol/issue */}
        <div
          className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[7px] tracking-[0.3em] uppercase font-bold"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            color: STUDIO.ink,
            background: 'rgba(10,10,10,0.85)',
            border: `1px solid ${STUDIO.border}`,
            transform: 'rotate(-2deg)',
          }}
        >
          A · SIDE
        </div>
      </motion.div>
    </div>
  );
}
