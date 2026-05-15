import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grain, Stamp } from '../components/Primitives.jsx';
import { ACCENT, INK, PAPER } from '../lib/design.js';
import { login } from '../lib/auth.js';

export default function Login() {
  const navigate = useNavigate();
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    if (!handle || !password) {
      setError('Enter handle and password');
      return;
    }
    setLoading(true);
    try {
      const result = await login(handle, password);
      if (!result.ok) {
        setError(result.error || 'Login failed');
        setLoading(false);
        return;
      }
      // Redirect to their profile (router will pick the right one)
      const cleanHandle = handle.toLowerCase().trim();
      if (result.type === 'artist') {
        navigate(`/studio/${cleanHandle}`);
      } else {
        navigate(`/${cleanHandle}`);
      }
    } catch (e) {
      setError(e.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: PAPER, color: INK }}>
      <Grain />
      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b-2" style={{ borderColor: INK }}>
        <Link to="/" className="text-xs tracking-[0.2em] uppercase font-bold hover:underline" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          ← HYPERLINK
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          <Stamp rotate={-2}>LOGIN</Stamp>
          <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter mt-3 mb-8" style={{ fontFamily: '"Fraunces", serif' }}>
            Welcome <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>back.</span>
          </h1>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Handle
              </label>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="yourname"
                autoCapitalize="off"
                autoCorrect="off"
                className="w-full text-2xl md:text-3xl font-black bg-transparent border-b-2 pb-2 outline-none"
                style={{ borderColor: INK, fontFamily: '"Fraunces", serif' }}
              />
            </div>

            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="••••••"
                className="w-full text-2xl bg-transparent border-b-2 pb-2 outline-none"
                style={{ borderColor: INK, fontFamily: '"Fraunces", serif' }}
              />
            </div>

            {error && (
              <div className="px-3 py-2 border-2 text-xs font-bold flex items-center gap-2" style={{ borderColor: ACCENT, color: ACCENT, background: 'rgba(255,77,31,0.06)', fontFamily: '"JetBrains Mono", monospace' }}>
                <span>⚠</span><span>{error}</span>
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className="w-full px-6 py-4 text-xs tracking-[0.25em] uppercase font-bold border-2 transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ borderColor: INK, background: ACCENT, color: PAPER, fontFamily: '"JetBrains Mono", monospace' }}
            >
              {loading ? 'Logging in…' : 'Log in →'}
            </button>

            <div className="text-center text-[10px] tracking-[0.25em] uppercase pt-4" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Don't have a profile?{' '}
              <Link to="/new" className="font-bold hover:underline" style={{ color: ACCENT }}>Claim one →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
