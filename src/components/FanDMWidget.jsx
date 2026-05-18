import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sendFanMessage } from '../lib/premiumFeatures.js';

const INK = '#F2EFE6';
const MUTED = '#8A8680';
const BORDER = 'rgba(255,255,255,0.08)';
const BORDER_STRONG = 'rgba(255,255,255,0.18)';
const SURFACE = '#141414';
const DISPLAY = '"Fraunces", serif';
const MONO = '"JetBrains Mono", monospace';

export default function FanDMWidget({ handle, accent }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState('idle');

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const r = await sendFanMessage(handle, { fromName: name, fromEmail: email, message: msg });
    if (r.ok) {
      setStatus('done');
      setName(''); setEmail(''); setMsg('');
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="mt-6">
      {!open ? (
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-3 text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-90 transition-opacity"
          style={{ background: SURFACE, border: `1px solid ${BORDER_STRONG}`, color: INK, fontFamily: MONO }}
        >
          ✉ Send a message →
        </motion.button>
      ) : (
        <AnimatePresence mode="wait">
          {status === 'done' ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-5 text-center"
              style={{ border: `1px solid ${accent}`, color: accent, fontFamily: MONO, fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 800 }}
            >
              ✓ Message sent
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={submit}
              className="p-4 space-y-3"
              style={{ background: SURFACE, border: `1px solid ${BORDER_STRONG}` }}
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO, color: accent }}>
                  SEND A MESSAGE
                </div>
                <button type="button" onClick={() => setOpen(false)} className="text-xs opacity-60" style={{ color: MUTED }}>✕</button>
              </div>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (optional)"
                className="w-full bg-transparent outline-none text-sm pb-1"
                style={{ borderBottom: `1px solid ${BORDER}`, color: INK, fontFamily: MONO }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional, for replies)"
                className="w-full bg-transparent outline-none text-sm pb-1"
                style={{ borderBottom: `1px solid ${BORDER}`, color: INK, fontFamily: MONO }}
              />
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Your message…"
                rows={3}
                maxLength={1000}
                required
                className="w-full bg-transparent outline-none text-sm pb-1 resize-none"
                style={{ borderBottom: `1px solid ${BORDER}`, color: INK, fontFamily: DISPLAY }}
              />
              <div className="text-[10px] tracking-[0.2em] uppercase opacity-50 text-right" style={{ fontFamily: MONO, color: MUTED }}>
                {msg.length} / 1000
              </div>

              <button
                type="submit"
                disabled={status === 'sending' || !msg.trim()}
                className="w-full py-3 text-[10px] tracking-[0.3em] uppercase font-bold disabled:opacity-40"
                style={{ background: accent, color: '#0A0A0A', fontFamily: MONO }}
              >
                {status === 'sending' ? 'Sending…' : 'Send →'}
              </button>
              {status === 'error' && (
                <div className="text-xs text-center" style={{ color: accent, fontFamily: MONO }}>⚠ Failed to send</div>
              )}
              <div className="text-[9px] tracking-[0.15em] opacity-50 text-center" style={{ fontFamily: MONO, color: MUTED }}>
                Be respectful. Messages are anonymous unless you share your handle. See <a href="/privacy" target="_blank" style={{ textDecoration: 'underline' }}>privacy</a>.
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
