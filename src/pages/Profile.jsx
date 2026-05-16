import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Grain, Halftone, Stamp } from '../components/Primitives.jsx';
import { ACCENT, INK, PAPER, CATEGORIES } from '../lib/design.js';
import { loadProfile } from '../lib/storage.js';
import { isOwnerOf, logout } from '../lib/auth.js';

export default function Profile() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadProfile(handle).then(async (p) => {
      setProfile(p);
      setLoading(false);
      if (p) {
        setIsOwner(isOwnerOf(handle));
      }
    });
  }, [handle]);

  const share = async () => {
    const url = `${window.location.origin}/${handle}`;
    try {
      if (navigator.share) {
        await navigator.share({ url, title: profile?.displayName || handle });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PAPER, color: INK }}>
        <div className="text-xs tracking-[0.3em] uppercase font-bold animate-pulse" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          Loading /{handle}…
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 relative" style={{ background: PAPER, color: INK }}>
        <Grain />
        <div className="text-center max-w-md relative z-10">
          <div className="text-8xl font-black mb-4" style={{ fontFamily: '"Fraunces", serif', color: ACCENT }}>404</div>
          <h2 className="text-3xl font-black mb-3" style={{ fontFamily: '"Fraunces", serif' }}>No one lives at /{handle}</h2>
          <p className="opacity-70 mb-8" style={{ fontFamily: '"Fraunces", serif' }}>This handle hasn't been claimed yet. Want it?</p>
          <button onClick={() => navigate('/new')} className="px-6 py-3 text-xs tracking-[0.25em] uppercase font-bold border-2" style={{ borderColor: INK, background: ACCENT, color: PAPER, fontFamily: '"JetBrains Mono", monospace' }}>
            Claim it →
          </button>
        </div>
      </div>
    );
  }

  const cat = CATEGORIES.find((c) => c.id === profile.category) || CATEGORIES[2];

  return (
    <div className="min-h-screen relative pb-20" style={{ background: PAPER, color: INK }}>
      <Grain />

      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b-2" style={{ borderColor: INK }}>
        <Link to="/" className="text-xs tracking-[0.2em] uppercase font-bold hover:underline flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          ← HYPERLINK
        </Link>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {isOwner && (
            <>
              <Link
                to={`/${handle}/edit`}
                className="text-xs tracking-[0.2em] uppercase font-bold border-2 px-3 py-1.5 hover:scale-[1.02] transition-transform"
                style={{ borderColor: INK, background: ACCENT, color: PAPER, fontFamily: '"JetBrains Mono", monospace' }}
              >
                ✎ Edit
              </Link>
              <button
                onClick={() => { logout(); setIsOwner(false); }}
                className="text-xs tracking-[0.2em] uppercase font-bold border-2 px-3 py-1.5"
                style={{ borderColor: INK, fontFamily: '"JetBrains Mono", monospace' }}
              >
                Log out
              </button>
            </>
          )}
          <button onClick={share} className="text-xs tracking-[0.2em] uppercase font-bold border-2 px-3 py-1.5" style={{ borderColor: INK, fontFamily: '"JetBrains Mono", monospace' }}>
            {copied ? '✓ Copied' : 'Share ↗'}
          </button>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 pt-12 md:pt-16">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Stamp rotate={-2} bg={ACCENT} color={PAPER}>{cat.label}</Stamp>
            <Stamp rotate={1}>/{profile.handle}</Stamp>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter break-words" style={{ fontFamily: '"Fraunces", serif' }}>
            {profile.displayName}
          </h1>

          {profile.bio && (
            <p className="mt-6 text-lg md:text-xl leading-snug opacity-80 max-w-md" style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic' }}>
              "{profile.bio}"
            </p>
          )}

          <div className="mt-8 flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase opacity-60" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            <span>{cat.icon}</span>
            <div className="flex-1 h-px" style={{ background: INK }} />
            <span>{profile.links.length + (profile.pinned ? 1 : 0)} LINKS</span>
          </div>
        </div>

        {profile.pinned && profile.pinned.url && (
          <a
            href={profile.pinned.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative border-2 p-6 mb-8 overflow-hidden group hover:translate-x-1 hover:-translate-y-1 transition-transform"
            style={{ borderColor: INK, background: INK, color: PAPER, boxShadow: `6px 6px 0 ${ACCENT}` }}
          >
            <Halftone className="absolute -right-10 -top-10 w-40 h-40 opacity-30" />
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-3" style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}>★ PINNED · LATEST</div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-2xl md:text-3xl font-black leading-tight" style={{ fontFamily: '"Fraunces", serif' }}>{profile.pinned.label}</span>
              <span className="text-3xl">→</span>
            </div>
          </a>
        )}

        <div className="space-y-3">
          {profile.links.map((l, i) => (
            <a
              key={i}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative border-2 px-5 py-4 flex items-center justify-between gap-4 group hover:bg-black hover:text-white transition-colors"
              style={{ borderColor: INK, background: PAPER }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-[10px] tracking-[0.2em] font-bold opacity-50 tabular-nums" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-lg md:text-xl font-bold truncate" style={{ fontFamily: '"Fraunces", serif' }}>
                  {l.label}
                </span>
              </div>
              <span className="text-xl shrink-0 group-hover:translate-x-1 transition-transform">→</span>
            </a>
          ))}
        </div>

        <div className="mt-20 pt-8 border-t flex items-center justify-between text-[10px] tracking-[0.3em] uppercase opacity-60" style={{ borderColor: INK, fontFamily: '"JetBrains Mono", monospace' }}>
          <span>/{profile.handle}</span>
          {isOwner && (
            <Link to={`/${handle}/edit`} className="hover:opacity-100 hover:underline">Edit profile →</Link>
          )}
        </div>
      </div>
    </div>
  );
}
