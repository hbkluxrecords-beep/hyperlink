import { useEffect, useState } from 'react';
import { isImpersonating, stopImpersonating, getOriginalAdmin } from '../lib/admin.js';
import { getSession } from '../lib/auth.js';

export default function ImpersonateBanner() {
  const [active, setActive] = useState(false);
  const [targetHandle, setTargetHandle] = useState('');

  useEffect(() => {
    setActive(isImpersonating());
    const s = getSession();
    setTargetHandle(s?.handle || '');
  }, []);

  if (!active) return null;

  const orig = getOriginalAdmin();

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-2 px-3 py-1.5"
      style={{
        background: '#FF4D1F',
        color: '#0A0A0A',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontWeight: 800,
      }}
    >
      <span className="truncate">◆ ADMIN · @{targetHandle}</span>
      <button
        onClick={() => {
          stopImpersonating();
          window.location.href = '/admin';
        }}
        className="border px-2 py-1 hover:bg-black hover:text-white transition-colors whitespace-nowrap shrink-0"
        style={{ borderColor: '#0A0A0A', fontSize: 9 }}
      >
        ← Exit
      </button>
    </div>
  );
}
