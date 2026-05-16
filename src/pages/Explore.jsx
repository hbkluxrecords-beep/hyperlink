import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Grain, Stamp } from '../components/Primitives.jsx';
import AuthButton from '../components/AuthButton.jsx';
import { ACCENT, INK, PAPER, CATEGORIES } from '../lib/design.js';
import { loadRecentProfiles } from '../lib/storage.js';
import { loadRecentArtists } from '../studio/lib/studioStorage.js';

export default function Explore() {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadRecentProfiles(48).then((profiles) =>
        profiles.map((p) => ({ ...p, _type: 'creator' }))
      ),
      loadRecentArtists(48).then((artists) =>
        artists.map((a) => ({
          handle: a.handle,
          displayName: a.artistName || a.handle,
          bio: a.bio || '',
          category: 'musician',
          links: a.links || [],
          pinned: null,
          genres: a.genres || [],
          createdAt: a.createdAt,
          _type: 'artist',
        }))
      ),
    ]).then(([creators, artists]) => {
      // Merge + sort by createdAt desc
      const merged = [...creators, ...artists].sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      setEntries(merged);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // 'musician' filter shows artists; other filters show creators with matching category
  const filtered = filter === 'all'
    ? entries
    : filter === 'musician'
      ? entries.filter((e) => e._type === 'artist')
      : entries.filter((e) => e._type === 'creator' && e.category === filter);

  return (
    <div className="min-h-screen relative" style={{ background: PAPER, color: INK }}>
      <Grain />
      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b-2" style={{ borderColor: INK }}>
        <Link to="/" className="text-xs tracking-[0.2em] uppercase font-bold hover:underline" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          ← HYPERLINK
        </Link>
        <div className="flex items-center gap-2">
          <AuthButton theme="light" variant="badge" />
          <Link to="/new" className="px-3 py-1.5 text-xs tracking-[0.2em] uppercase font-bold border-2" style={{ borderColor: INK, background: ACCENT, color: PAPER, fontFamily: '"JetBrains Mono", monospace' }}>
            Claim a page →
          </Link>
        </div>
      </header>

      <div className="px-6 md:px-12 py-16">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <Stamp rotate={-2}>DIRECTORY</Stamp>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mt-3" style={{ fontFamily: '"Fraunces", serif' }}>
              The <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>directory</span>.
            </h1>
            <p className="mt-3 max-w-md opacity-70" style={{ fontFamily: '"Fraunces", serif' }}>
              Everyone who's published. Creators and artists. Click to visit.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', ...CATEGORIES.map((c) => c.id)].map((id) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className="px-3 py-1.5 text-[10px] tracking-[0.25em] uppercase font-bold border-2 transition-colors"
                style={{
                  borderColor: INK,
                  background: filter === id ? INK : 'transparent',
                  color: filter === id ? PAPER : INK,
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                {id === 'all' ? 'All' : CATEGORIES.find((c) => c.id === id).label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="opacity-60 text-sm" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Loading directory…</div>
        ) : filtered.length === 0 ? (
          <div className="border-2 border-dashed p-12 text-center" style={{ borderColor: INK }}>
            <div className="text-2xl font-black mb-2" style={{ fontFamily: '"Fraunces", serif' }}>Empty page.</div>
            <p className="opacity-70 mb-6">Nobody has published in this category yet.</p>
            <Link to="/new" className="inline-block px-5 py-2 border-2 text-xs tracking-[0.25em] uppercase font-bold" style={{ borderColor: INK, background: ACCENT, color: PAPER, fontFamily: '"JetBrains Mono", monospace' }}>
              Be the first →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: INK }}>
            {filtered.map((p) => {
              const isArtist = p._type === 'artist';
              const cat = isArtist
                ? { label: 'ARTIST' }
                : (CATEGORIES.find((c) => c.id === p.category) || CATEGORIES[2]);
              return (
                <Link
                  key={`${p._type}-${p.handle}`}
                  to={`/${p.handle}`}
                  className="text-left p-6 hover:bg-[#E6E2D5] transition-colors relative overflow-hidden group"
                  style={{ background: PAPER }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Stamp rotate={-2} bg={isArtist ? ACCENT : undefined} color={isArtist ? PAPER : undefined}>
                      {cat.label}
                    </Stamp>
                  </div>
                  <div className="text-3xl font-black leading-tight tracking-tight mb-1 break-words" style={{ fontFamily: '"Fraunces", serif' }}>
                    {p.displayName}
                  </div>
                  <div className="text-xs opacity-60 mb-4" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    /{p.handle}
                  </div>
                  {isArtist && p.genres && p.genres.length > 0 && (
                    <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2" style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}>
                      {p.genres.join(' · ')}
                    </div>
                  )}
                  {p.bio && <p className="text-sm opacity-80 line-clamp-2" style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic' }}>"{p.bio}"</p>}
                  <div className="mt-6 flex items-center justify-between text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    <span>{isArtist ? 'STUDIO' : `${p.links.length + (p.pinned ? 1 : 0)} LINKS`}</span>
                    <span className="group-hover:translate-x-1 transition-transform">VISIT →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
