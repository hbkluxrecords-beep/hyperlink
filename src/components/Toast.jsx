import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const ToastCtx = createContext(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // Fallback so toasts don't break if provider missing
    return {
      show: (msg) => console.log('[toast]', msg),
      success: (msg) => console.log('[toast success]', msg),
      error: (msg) => console.log('[toast error]', msg),
    };
  }
  return ctx;
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const push = useCallback((text, kind = 'info') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, text, kind }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const api = {
    show: (msg) => push(msg, 'info'),
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed bottom-4 left-1/2 z-[300] pointer-events-none" style={{ transform: 'translateX(-50%)' }}>
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mb-2 px-4 py-3 min-w-[240px] max-w-sm text-sm pointer-events-auto"
              style={{
                background: 'rgba(20,20,20,0.95)',
                border: `1px solid ${t.kind === 'error' ? '#FF0044' : t.kind === 'success' ? '#1DB954' : 'rgba(255,255,255,0.15)'}`,
                color: '#F2EFE6',
                fontFamily: '"JetBrains Mono", monospace',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ color: t.kind === 'error' ? '#FF0044' : t.kind === 'success' ? '#1DB954' : '#FF4D1F' }}>
                  {t.kind === 'error' ? '✕' : t.kind === 'success' ? '✓' : '◆'}
                </span>
                <span className="text-xs leading-snug" style={{ fontFamily: '"Fraunces", serif' }}>{t.text}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
