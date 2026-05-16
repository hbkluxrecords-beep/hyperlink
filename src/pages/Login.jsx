import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grain, Stamp } from '../components/Primitives.jsx';
import { ACCENT, INK, PAPER } from '../lib/design.js';
import { login, checkHandle, setPasswordForHandle, validatePassword } from '../lib/auth.js';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'claim'
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [profileType, setProfileType] = useState(null); // 'artist' | 'creator'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    if (!handle) { setError('Enter your handle'); return; }
    if (!password) { setError('Enter your password'); return; }

    setLoading(true);

    try {
      if (mode === 'login') {
        // First, check if this handle exists and is claimed
        const status = await checkHandle(handle);

        if (!status.exists) {
          setError('No profile with that handle. Want to create one?');
          setLoading(false);
          return;
        }

        if (!status.claimed) {
          // Profile exists but isn't claimed — switch to claim mode
          setMode('claim');
          setProfileType(status.type);
          setError('');
          setLoading(false);
          return;
        }

        // Normal login
        const result = await login(handle, password);
        if (!result.ok) {
          setError(result.error || 'Login failed');
          setLoading(false);
          return;
        }
        const clean = handle.toLowerCase().trim();
        navigate(result.type === 'artist' ? `/studio/${clean}` : `/${clean}`);
      } else {
        // Claim mode: set password
        const pwErr = validatePassword(password);
        if (pwErr) { setError(pwErr); setLoading(false); return; }
        if (password !== confirm) { setError("Passwords don't match"); setLoading(false); return; }

        const result = await setPasswordForHandle(handle, password, profileType);
        if (!result.ok) {
          setError(result.error || 'Failed to claim');
          setLoading(false);
          return;
        }
        const clean = handle.toLowerCase().trim();
        navigate(profileType === 'artist' ? `/studio/${clean}` : `/${clean}`);
      }
    } catch (e) {
      setError(e.message || 'Something went wrong');
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
        {mode === 'claim' && (
          <button
            onClick={() => { setMode('login'); setError(''); setConfirm(''); }}
            className="text-[10px] tracking-[0.3em] uppercase font-bold hover:underline"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            ← Back
          </button>
        )}
      </header>
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          {mode === 'login' ? (
            <>
              <Stamp rotate={-2}>LOG IN</Stamp>
              <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter mt-3 mb-8" style={{ fontFamily: '"Fraunces", serif' }}>
                Welcome <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>back.</span>
              </h1>
            </>
          ) : (
            <>
              <Stamp rotate={-2}>CLAIM PROFILE</Stamp>
              <h1 className="text-4xl md:text-6xl font-black leading-[0.9] tracking-tighter mt-3 mb-2" style={{ fontFamily: '"Fraunces", serif' }}>
                Lock down<br />
                <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>/{handle}</span>
              </h1>
              <p className="text-sm opacity-75 mb-8" style={{ fontFamily: '"Fraunces", serif' }}>
                This profile hasn't been claimed yet. Set a password to become the owner.
              </p>
            </>
          )}

          <div className="space-y-6">
            {mode === 'login' && (
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
            )}

            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {mode === 'claim' ? 'New password · 6+ characters' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && mode === 'login' && submit()}
                placeholder="••••••"
                className="w-full text-2xl bg-transparent border-b-2 pb-2 outline-none"
                style={{ borderColor: INK, fontFamily: '"Fraunces", serif' }}
              />
            </div>

            {mode === 'claim' && (
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="••••••"
                  className="w-full text-2xl bg-transparent border-b-2 pb-2 outline-none"
                  style={{ borderColor: INK, fontFamily: '"Fraunces", serif' }}
                />
              </div>
            )}

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
              {loading ? (mode === 'claim' ? 'Claiming…' : 'Logging in…') : (mode === 'claim' ? 'Claim profile →' : 'Continue →')}
            </button>

            {mode === 'login' && (
              <div className="text-center text-[10px] tracking-[0.25em] uppercase pt-4" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Don't have a profile?{' '}
                <Link to="/new" className="font-bold hover:underline" style={{ color: ACCENT }}>Create one →</Link>
              </div>
            )}

            {mode === 'claim' && (
              <div className="text-center text-[9px] tracking-[0.25em] uppercase pt-2 opacity-60" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Save your password — no recovery yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
