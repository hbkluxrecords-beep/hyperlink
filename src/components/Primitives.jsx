import { INK } from '../lib/design.js';

export function Grain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 opacity-[0.18] mix-blend-multiply z-50"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}

export function Halftone({ className = '' }) {
  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{
        backgroundImage: `radial-gradient(${INK} 1px, transparent 1.2px)`,
        backgroundSize: '8px 8px',
      }}
    />
  );
}

export function Stamp({ children, rotate = -2, color = INK, bg = 'transparent' }) {
  return (
    <span
      className="inline-block px-2 py-[2px] text-[10px] tracking-[0.25em] uppercase font-bold border-2"
      style={{
        transform: `rotate(${rotate}deg)`,
        color,
        borderColor: color,
        background: bg,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      }}
    >
      {children}
    </span>
  );
}
