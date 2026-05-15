import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grain, Stamp } from '../components/Primitives.jsx';
import { ACCENT, INK, PAPER } from '../lib/design.js';

export default function Lookup() {
  const navigate = useNavigate();
  const [h, setH] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => {
    const clean = h.toLowerCase().trim();
    if (clean) navigate(`/${clean}`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: PAPER, color: INK }}>
      <Grain />
      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b-2" style={{ borderColor: INK }}>
        <Link to="/" className="text-xs tracking-[0.2em] uppercase font-bold hover:underline" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          ← HYPERLINK
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          <Stamp rotate={-2}>LOOKUP</Stamp>
          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mt-3 mb-10" style={{ fontFamily: '"Fraunces", serif' }}>
            Find a <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>page</span>.
          </h1>
          <div className="flex items-center gap-4 border-b-2 pb-3" style={{ borderColor: INK }}>
            <span className="text-3xl md:text-5xl font-black opacity-40" style={{ fontFamily: '"Fraunces", serif' }}>/</span>
            <input
              ref={inputRef}
              value={h}
              onChange={(e) => setH(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="handle"
              autoCapitalize="off"
              autoCorrect="off"
              className="flex-1 text-3xl md:text-5xl font-black bg-transparent outline-none min-w-0"
              style={{ fontFamily: '"Fraunces", serif' }}
            />
            <button onClick={submit} className="px-4 py-2 border-2 text-xs tracking-[0.25em] uppercase font-bold" style={{ borderColor: INK, background: ACCENT, color: PAPER, fontFamily: '"JetBrains Mono", monospace' }}>
              Go →
            </button>
          </div>
          <p className="mt-4 text-xs tracking-[0.2em] uppercase opacity-50" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Hit enter when ready
          </p>
        </div>
      </div>
    </div>
  );
}
