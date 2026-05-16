import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSession } from '../lib/auth.js';

export default function AuthButton({ theme = 'dark', variant = 'badge' }) {
  const [session, setSession] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setSession(getSession());
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [menuOpen]);

  const isDark = theme === 'dark';
  const bg = isDark ? '#141414' : '#F2EFE6';
  const ink = isDark ? '#F2EFE6' : '#0A0A0A';
  const muted = isDark ? '#8A8680' : '#666';
  const border = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.2)';
  const accent = '#FF4D1F';
  const monoStyle = { fontFamily: '"JetBrains Mono", monospace' };

  if (variant === 'minimal') {
    return session ? (
      <Link
        to={`/${session.handle}`}
        className="text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70 transition-opacity"
        style={{ ...monoStyle, color: ink }}
      >
        @{session.handle} ↗
      </Link>
    ) : (
      <Link
        to="/login"
        className="text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70 transition-opacity"
        style={{ ...monoStyle, color: ink }}
      >
        Log in →
      </Link>
    );
  }

  // Logged out → simple login button
  if (!session) {
    return (
      <Link
        to="/login"
        className="px-3 py-1.5 text-[10px] tracking-[0.3em] uppercase font-bold border hover:scale-[1.02] transition-transform"
        style={{ ...monoStyle, borderColor: border, color: ink }}
      >
        Log in →
      </Link>
    );
  }

  // Logged in → dropdown w/ profile, upgrade, logout
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
        className="px-3 py-1.5 text-[10px] tracking-[0.3em] uppercase font-bold border hover:scale-[1.02] transition-transform"
        style={{ ...monoStyle, borderColor: border, color: ink }}
      >
        @{session.handle} ▾
      </button>
      {menuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-56 z-50 overflow-hidden"
          style={{ background: bg, border: `1px solid ${border}` }}
        >
          <Link
            to={`/${session.handle}`}
            className="block px-4 py-3 text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70"
            style={{ ...monoStyle, color: ink, borderBottom: `1px solid ${border}` }}
            onClick={() => setMenuOpen(false)}
          >
            View profile →
          </Link>
          <Link
            to={session.type === 'artist' ? `/studio/${session.handle}/edit` : `/${session.handle}/edit`}
            className="block px-4 py-3 text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70"
            style={{ ...monoStyle, color: ink, borderBottom: `1px solid ${border}` }}
            onClick={() => setMenuOpen(false)}
          >
            ✎ Edit profile
          </Link>
          <Link
            to="/upgrade"
            className="block px-4 py-3 text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70"
            style={{ ...monoStyle, color: accent, borderBottom: `1px solid ${border}` }}
            onClick={() => setMenuOpen(false)}
          >
            ★ Upgrade to premium
          </Link>
          <button
            onClick={() => {
              try { localStorage.removeItem('plinks-session'); } catch {}
              window.location.href = '/';
            }}
            className="block w-full text-left px-4 py-3 text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70"
            style={{ ...monoStyle, color: muted }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
