import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSession } from '../lib/auth.js';

export default function AuthButton({ theme = 'dark', variant = 'badge' }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const isDark = theme === 'dark';
  const ink = isDark ? '#F2EFE6' : '#0A0A0A';
  const border = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.2)';
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

  return session ? (
    <Link
      to={`/${session.handle}`}
      className="px-3 py-1.5 text-[10px] tracking-[0.3em] uppercase font-bold border hover:scale-[1.02] transition-transform"
      style={{ ...monoStyle, borderColor: border, color: ink }}
    >
      @{session.handle} ↗
    </Link>
  ) : (
    <Link
      to="/login"
      className="px-3 py-1.5 text-[10px] tracking-[0.3em] uppercase font-bold border hover:scale-[1.02] transition-transform"
      style={{ ...monoStyle, borderColor: border, color: ink }}
    >
      Log in →
    </Link>
  );
}
