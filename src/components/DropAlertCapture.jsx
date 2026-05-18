import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeToAlerts } from '../lib/premiumFeatures.js';

const ACCENT = '#FF4D1F';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const BORDER = 'rgba(255,255,255,0.18)';
const MONO = '"JetBrains Mono", monospace';

export default function DropAlertCapture({ handle, releaseId, accent = ACCENT }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    const r = await subscribeToAlerts(handle, email, releaseId);
    if (r.ok) {
      setStatus('done');
    } else {
      setStatus('error');
      setErrorMsg(r.error || 'Failed');
    }
  };

  return (
    <div className="mt-3">
      <AnimatePresence mode="wait">
        {status === 'done' ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-3 text-center"
            style={{ border: `1px solid ${accent}`, color: accent, fontFamily: MONO, fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 800 }}
          >
            ✓ You're in. We'll email when it drops.
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={submit}
            className="flex items-stretch"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm"
              style={{ color: INK, fontFamily: MONO }}
              required
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="px-4 text-[10px] tracking-[0.25em] uppercase font-bold disabled:opacity-50"
              style={{ background: accent, color: '#0A0A0A', fontFamily: MONO }}
            >
              {status === 'sending' ? '…' : 'Get Alert'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      {status === 'error' && (
        <div className="mt-2 text-xs" style={{ color: accent, fontFamily: MONO }}>⚠ {errorMsg}</div>
      )}
      {status === 'idle' && (
        <div className="mt-2 text-[9px] tracking-[0.15em] opacity-50" style={{ fontFamily: MONO, color: MUTED }}>
          By subscribing, you agree to receive drop alerts for this release. Unsubscribe anytime. See our{' '}
          <a href="/privacy" target="_blank" style={{ textDecoration: 'underline' }}>privacy policy</a>.
        </div>
      )}
    </div>
  );
}
