import { useMemo } from 'react';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';

// Hash a string to a stable integer
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Test-pressing style placeholder cover when no art uploaded
export default function ProceduralCover({ trackTitle = 'Untitled', size = 280, status = 'TEST PRESSING' }) {
  const seed = useMemo(() => hash(trackTitle), [trackTitle]);

  // Generate geometric pattern based on hash
  const shapes = useMemo(() => {
    const out = [];
    const rng = (n) => {
      const x = Math.sin(seed + n) * 10000;
      return x - Math.floor(x);
    };
    for (let i = 0; i < 5; i++) {
      out.push({
        type: rng(i * 7) > 0.5 ? 'circle' : 'square',
        x: 15 + rng(i * 3) * 70,
        y: 15 + rng(i * 5) * 70,
        size: 4 + rng(i * 11) * 8,
        rotate: rng(i * 13) * 360,
      });
    }
    return out;
  }, [seed]);

  const trackNumber = String((seed % 99) + 1).padStart(2, '0');

  return (
    <div
      className="relative overflow-hidden shrink-0"
      style={{
        width: size,
        height: size,
        background: STUDIO.bg,
        border: `1px solid ${STUDIO.borderStrong}`,
      }}
    >
      {/* Diagonal track number bg */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none"
        style={{
          fontFamily: STUDIO_FONTS.display,
          fontSize: size * 0.6,
          fontWeight: 900,
          color: STUDIO.ink,
          opacity: 0.92,
          transform: 'rotate(-12deg)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}
      >
        {trackTitle.split(' ').slice(0, 2).join(' ').toLowerCase()}.
      </div>

      {/* Geometric accents */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" style={{ pointerEvents: 'none' }}>
        {shapes.map((s, i) => (
          s.type === 'circle' ? (
            <circle key={i} cx={s.x} cy={s.y} r={s.size / 2} fill={STUDIO.accent} opacity="0.85" />
          ) : (
            <rect key={i} x={s.x - s.size / 2} y={s.y - s.size / 2} width={s.size} height={s.size}
              fill="none" stroke={STUDIO.accent} strokeWidth="0.5"
              transform={`rotate(${s.rotate} ${s.x} ${s.y})`} />
          )
        ))}
      </svg>

      {/* Top right: status stamp */}
      <div
        className="absolute top-3 right-3 px-2 py-1 text-[8px] tracking-[0.3em] uppercase font-bold"
        style={{
          fontFamily: STUDIO_FONTS.mono,
          color: STUDIO.accent,
          border: `1px solid ${STUDIO.accent}`,
          background: 'rgba(10,10,10,0.8)',
        }}
      >
        {status}
      </div>

      {/* Bottom left: track number */}
      <div
        className="absolute bottom-3 left-3 text-[10px] tracking-[0.3em] font-bold"
        style={{
          fontFamily: STUDIO_FONTS.mono,
          color: STUDIO.muted,
        }}
      >
        № {trackNumber}
      </div>
    </div>
  );
}
