import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getSession } from '../lib/auth.js';
import { isAdmin } from '../lib/admin.js';

const INK = '#F2EFE6';
const MUTED = '#8A8680';
const ACCENT = '#FF4D1F';
const BORDER = 'rgba(255,255,255,0.08)';
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

const TABS = [
  { to: '/', label: 'HOME', match: (p) => p === '/' },
  { to: '/studio', label: 'ARTISTS', match: (p) => p.startsWith('/studio') && !p.includes('/studio/') },
  { to: '/explore', label: 'DIRECTORY', match: (p) => p === '/explore' || p === '/studio/explore' },
  { to: '/upgrade', label: 'PRICING', match: (p) => p === '/upgrade' },
];

export default function TopNav() {
  const loc = useLocation();
  const [session, setSession] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setAdmin(isAdmin());
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [menuOpen]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      animate={{
        backgroundColor: scrolled ? 'rgba(10,10,10,0.85)' : 'rgba(10,10,10,0.55)',
      }}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? `1px solid ${BORDER}` : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 flex items-center justify-center font-black"
            style={{ background: INK, color: '#0A0A0A', fontFamily: MONO, fontSize: 12 }}
          >
            P
          </div>
          <span className="font-black text-base md:text-lg tracking-tight hidden sm:inline" style={{ fontFamily: DISPLAY, color: INK }}>
            plinks<span style={{ color: ACCENT, fontStyle: 'italic', fontWeight: 300 }}>.dev</span>
          </span>
        </Link>

        {/* Tabs */}
        <div className="flex-1 flex items-center gap-1 md:gap-3 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => {
            const active = t.match(loc.pathname);
            return (
              <Link
                key={t.to}
                to={t.to}
                className="text-[10px] tracking-[0.25em] uppercase font-bold px-2 py-1.5 whitespace-nowrap transition-opacity"
                style={{
                  fontFamily: MONO,
                  color: active ? ACCENT : MUTED,
                  borderBottom: active ? `1px solid ${ACCENT}` : '1px solid transparent',
                }}
              >
                {t.label}
              </Link>
            );
          })}
          {admin && (
            <Link
              to="/admin"
              className="text-[10px] tracking-[0.25em] uppercase font-bold px-2 py-1.5 whitespace-nowrap"
              style={{
                fontFamily: MONO,
                color: loc.pathname === '/admin' ? ACCENT : ACCENT,
                borderBottom: loc.pathname === '/admin' ? `1px solid ${ACCENT}` : '1px solid transparent',
              }}
            >
              ◆ ADMIN
            </Link>
          )}
        </div>

        {/* Auth button */}
        <div className="shrink-0">
          {!session ? (
            <Link
              to="/login"
              className="text-[10px] tracking-[0.3em] uppercase font-bold border px-2.5 py-1.5 hover:scale-[1.02] transition-transform whitespace-nowrap"
              style={{ fontFamily: MONO, borderColor: 'rgba(255,255,255,0.2)', color: INK }}
            >
              Log in →
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
                className="text-[10px] tracking-[0.3em] uppercase font-bold border px-2.5 py-1.5 hover:scale-[1.02] transition-transform whitespace-nowrap"
                style={{ fontFamily: MONO, borderColor: 'rgba(255,255,255,0.2)', color: INK }}
              >
                @{session.handle} ▾
              </button>
              {menuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-52 overflow-hidden"
                  style={{ background: '#141414', border: `1px solid rgba(255,255,255,0.2)` }}
                >
                  <Link
                    to={`/${session.handle}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70"
                    style={{ fontFamily: MONO, color: INK, borderBottom: `1px solid ${BORDER}` }}
                  >
                    View profile →
                  </Link>
                  <Link
                    to={session.type === 'artist' ? `/studio/${session.handle}/edit` : `/${session.handle}/edit`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70"
                    style={{ fontFamily: MONO, color: INK, borderBottom: `1px solid ${BORDER}` }}
                  >
                    ✎ Edit
                  </Link>
                  <Link
                    to="/upgrade"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70"
                    style={{ fontFamily: MONO, color: ACCENT, borderBottom: `1px solid ${BORDER}` }}
                  >
                    ★ Premium
                  </Link>
                  {admin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70"
                      style={{ fontFamily: MONO, color: ACCENT, borderBottom: `1px solid ${BORDER}` }}
                    >
                      ◆ Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      try { localStorage.removeItem('plinks-session'); } catch {}
                      window.location.href = '/';
                    }}
                    className="block w-full text-left px-4 py-2.5 text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70"
                    style={{ fontFamily: MONO, color: MUTED }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
