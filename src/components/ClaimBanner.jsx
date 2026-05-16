import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const DISMISS_KEY = 'plinks-claim-dismiss';

function isDismissed(handle) {
  try {
    const raw = sessionStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissed = JSON.parse(raw);
    return dismissed.includes(handle.toLowerCase());
  } catch { return false; }
}

function setDismissed(handle) {
  try {
    const raw = sessionStorage.getItem(DISMISS_KEY);
    const dismissed = raw ? JSON.parse(raw) : [];
    if (!dismissed.includes(handle.toLowerCase())) {
      dismissed.push(handle.toLowerCase());
      sessionStorage.setItem(DISMISS_KEY, JSON.stringify(dismissed));
    }
  } catch {}
}

export default function ClaimBanner({ handle, onClaim, theme = 'light' }) {
  const [visible, setVisible] = useState(!isDismissed(handle));
  const isDark = theme === 'dark';
  const accent = '#FF4D1F';
  const ink = isDark ? '#F2EFE6' : '#0A0A0A';
  const paper = isDark ? '#0A0A0A' : '#F2EFE6';

  const dismiss = () => {
    setDismissed(handle);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4 }}
          className="sticky top-0 z-40 overflow-hidden"
          style={{ background: accent, color: '#0A0A0A' }}
        >
          <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-3 flex-wrap">
            <motion.span
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-2xl"
            >
              🔒
            </motion.span>
            <div className="flex-1 min-w-0">
              <div
                className="text-[10px] tracking-[0.3em] uppercase font-black"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                Unclaimed profile · /{handle}
              </div>
              <div
                className="text-sm md:text-base font-bold mt-0.5"
                style={{ fontFamily: '"Fraunces", serif' }}
              >
                Is this yours? Lock it down before someone else does.
              </div>
            </div>
            <button
              onClick={onClaim}
              className="px-4 py-2.5 text-[11px] tracking-[0.25em] uppercase font-black hover:scale-[1.04] transition-transform shrink-0"
              style={{
                background: '#0A0A0A',
                color: '#F2EFE6',
                fontFamily: '"JetBrains Mono", monospace',
                boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
              }}
            >
              Claim it now →
            </button>
            <button
              onClick={dismiss}
              className="text-lg opacity-50 hover:opacity-100 shrink-0 px-2"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
