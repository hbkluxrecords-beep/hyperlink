import { Link } from 'react-router-dom';
import { Grain } from '../components/Primitives.jsx';
import { ACCENT, INK, PAPER } from '../lib/design.js';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative" style={{ background: PAPER, color: INK }}>
      <Grain />
      <div className="text-center max-w-md relative z-10">
        <div className="text-8xl font-black mb-4" style={{ fontFamily: '"Fraunces", serif', color: ACCENT }}>404</div>
        <h2 className="text-3xl font-black mb-3" style={{ fontFamily: '"Fraunces", serif' }}>Page not found</h2>
        <Link to="/" className="inline-block mt-4 px-6 py-3 text-xs tracking-[0.25em] uppercase font-bold border-2" style={{ borderColor: INK, background: ACCENT, color: PAPER, fontFamily: '"JetBrains Mono", monospace' }}>
          ← Back home
        </Link>
      </div>
    </div>
  );
}
