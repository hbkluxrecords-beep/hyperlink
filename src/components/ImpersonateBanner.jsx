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
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 px-4 py-2"
      style={{
        background: '#FF4D1F',
        color: '#0A0A0A',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        fontWeight: 800,
      }}
    >
      <span>◆ ADMIN MODE · Editing as @{targetHandle}</span>
      <button
        onClick={() => {
          stopImpersonating();
          window.location.href = '/admin';
        }}
        className="border px-2 py-1 hover:bg-black hover:text-white transition-colors"
        style={{ borderColor: '#0A0A0A' }}
      >
        ← Return to admin
      </button>
    </div>
  );
}
