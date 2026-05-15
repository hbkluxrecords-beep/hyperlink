import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { setPasswordForHandle, validatePassword } from '../lib/auth.js';

export default function ClaimModal({ handle, type, onClose, onClaimed, theme = 'light' }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isDark = theme === 'dark';
  const bg = isDark ? '#0A0A0A' : '#F2EFE6';
  const ink = isDark ? '#F2EFE6' : '#0A0A0A';
  const accent = '#FF4D1F';
  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.18)';

  const submit = async () => {
    setError('');
    const pwErr = validatePassword(password);
    if (pwErr) { setError(pwErr); return; }
    if (password !== confirm) { setError('Passwords don\'t match'); return; }
    setLoading(true);
    const result = await setPasswordForHandle(handle, password, type);
    if (!result.ok) {
      setError(result.error || 'Failed to claim');
      setLoading(false);
      return;
    }
    onClaimed && onClaimed();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm p-7 relative"
          style={{ background: bg, color: ink, border: `1px solid ${border}` }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-xl opacity-50 hover:opacity-100"
            style={{ color: ink }}
          >
            ✕
          </button>

          <div
            className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2"
            style={{ fontFamily: '"JetBrains Mono", monospace', color: accent }}
          >
            CLAIM PROFILE
          </div>
          <h2
            className="text-3xl md:text-4xl font-black leading-[0.95] tracking-tight mb-4"
            style={{ fontFamily: '"Fraunces", serif' }}
          >
            Lock down<br />
            <span style={{ fontStyle: 'italic', fontWeight: 300, color: accent }}>/{handle}</span>
          </h2>
          <p className="text-sm opacity-75 mb-6" style={{ fontFamily: '"Fraunces", serif' }}>
            Set a password to become this profile's owner. Only you'll be able to edit it.
          </p>

          <div className="space-y-4">
            <div>
              <label
                className="text-[9px] tracking-[0.3em] uppercase font-bold block mb-1.5"
                style={{ fontFamily: '"JetBrains Mono", monospace', opacity: 0.7 }}
              >
                Password · 6+ characters
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                placeholder="••••••"
                className="w-full text-xl bg-transparent border-b pb-1.5 outline-none"
                style={{ borderColor: ink, fontFamily: '"Fraunces", serif', color: ink }}
              />
            </div>

            <div>
              <label
                className="text-[9px] tracking-[0.3em] uppercase font-bold block mb-1.5"
                style={{ fontFamily: '"JetBrains Mono", monospace', opacity: 0.7 }}
              >
                Confirm
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="••••••"
                className="w-full text-xl bg-transparent border-b pb-1.5 outline-none"
                style={{ borderColor: ink, fontFamily: '"Fraunces", serif', color: ink }}
              />
            </div>

            {error && (
              <div
                className="px-3 py-2 border text-xs font-bold flex items-center gap-2"
                style={{ borderColor: accent, color: accent, background: 'rgba(255,77,31,0.06)', fontFamily: '"JetBrains Mono", monospace' }}
              >
                <span>⚠</span><span>{error}</span>
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className="w-full px-5 py-3 text-xs tracking-[0.25em] uppercase font-bold disabled:opacity-40 hover:scale-[1.01] transition-transform mt-2"
              style={{ background: accent, color: '#0A0A0A', fontFamily: '"JetBrains Mono", monospace' }}
            >
              {loading ? 'Claiming…' : 'Claim profile →'}
            </button>

            <div className="text-[9px] tracking-[0.25em] uppercase opacity-50 text-center pt-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Save your password — no recovery yet
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
