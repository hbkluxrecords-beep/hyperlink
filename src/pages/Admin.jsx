import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import TopNav from '../components/TopNav.jsx';
import { isAdmin, getAdminStats, listAllProfiles, toggleFeatured } from '../lib/admin.js';

const BG = '#0A0A0A';
const SURFACE = '#141414';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const ACCENT = '#FF4D1F';
const BORDER = 'rgba(255,255,255,0.08)';
const BORDER_STRONG = 'rgba(255,255,255,0.18)';
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [artists, setArtists] = useState([]);
  const [creators, setCreators] = useState([]);
  const [tab, setTab] = useState('artists');

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    refresh();
  }, [navigate]);

  const refresh = async () => {
    setLoading(true);
    const [s, all] = await Promise.all([getAdminStats(), listAllProfiles()]);
    setStats(s);
    setArtists(all.artists);
    setCreators(all.creators);
    setLoading(false);
  };

  const toggle = async (handle, type, current) => {
    const r = await toggleFeatured(handle, type, !current);
    if (r.ok) {
      if (type === 'artist') {
        setArtists((prev) => prev.map((a) => a.handle === handle ? { ...a, is_featured: !current } : a));
      } else {
        setCreators((prev) => prev.map((c) => c.handle === handle ? { ...c, is_featured: !current } : c));
      }
    } else {
      alert('Toggle failed: ' + r.error);
    }
  };

  if (loading) {
    return (
      <div style={{ background: BG, color: INK, minHeight: '100vh' }} className="flex items-center justify-center">
        <TopNav />
        <div className="text-xs tracking-[0.3em] uppercase font-bold animate-pulse" style={{ fontFamily: MONO, color: MUTED }}>
          Loading admin…
        </div>
      </div>
    );
  }

  const list = tab === 'artists' ? artists : creators;

  return (
    <div style={{ background: BG, color: INK, minHeight: '100vh' }}>
      <TopNav />

      <div className="max-w-4xl mx-auto px-5 pt-24 md:pt-32 pb-20">
        <div className="text-[10px] tracking-[0.35em] uppercase font-bold mb-2" style={{ fontFamily: MONO, color: ACCENT }}>
          ◆ PLINKS ADMIN
        </div>
        <h1 className="font-black tracking-tight mb-8" style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>
          Command <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>center.</span>
        </h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
            {[
              { label: 'Artists', value: stats.artists },
              { label: 'Creators', value: stats.creators },
              { label: 'Premium Artists', value: stats.premiumArtists, accent: true },
              { label: 'Premium Creators', value: stats.premiumCreators, accent: true },
              { label: 'Fan Messages', value: stats.totalMessages },
              { label: 'Subscribers', value: stats.totalSubscribers },
            ].map((s) => (
              <div key={s.label} className="p-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO, color: s.accent ? ACCENT : MUTED }}>
                  {s.label}
                </div>
                <div className="text-3xl font-black mt-1" style={{ fontFamily: DISPLAY, color: INK }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-2 mb-4 border-b" style={{ borderColor: BORDER }}>
          {['artists', 'creators'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="text-[10px] tracking-[0.3em] uppercase font-bold px-4 py-3 transition-all"
              style={{
                fontFamily: MONO,
                color: tab === t ? ACCENT : MUTED,
                borderBottom: tab === t ? `2px solid ${ACCENT}` : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {t} ({t === 'artists' ? artists.length : creators.length})
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-1">
          {list.map((p, i) => (
            <motion.div
              key={p.handle}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="flex items-center gap-3 px-4 py-3"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
            >
              <div className="flex-1 min-w-0">
                <div className="font-black tracking-tight truncate" style={{ fontFamily: DISPLAY, color: INK }}>
                  {p.artist_name || p.display_name || p.handle}
                  {p.is_premium && <span className="ml-2" style={{ color: ACCENT }}>★</span>}
                  {p.is_featured && <span className="ml-1" style={{ color: ACCENT }}>◆</span>}
                </div>
                <div className="text-[10px] tracking-[0.25em] uppercase opacity-60 mt-0.5" style={{ fontFamily: MONO, color: MUTED }}>
                  /{p.handle}
                </div>
              </div>
              <Link
                to={`/${p.handle}`}
                className="text-[9px] tracking-[0.3em] uppercase font-bold px-2 py-1 border hover:scale-[1.04] transition-transform shrink-0"
                style={{ borderColor: BORDER_STRONG, fontFamily: MONO, color: INK }}
              >
                View
              </Link>
              <button
                onClick={() => toggle(p.handle, tab === 'artists' ? 'artist' : 'creator', p.is_featured)}
                className="text-[9px] tracking-[0.3em] uppercase font-bold px-2 py-1 transition-transform shrink-0"
                style={{
                  background: p.is_featured ? ACCENT : 'transparent',
                  color: p.is_featured ? BG : ACCENT,
                  border: `1px solid ${ACCENT}`,
                  fontFamily: MONO,
                }}
              >
                {p.is_featured ? '◆ Featured' : '+ Feature'}
              </button>
            </motion.div>
          ))}
        </div>

        {list.length === 0 && (
          <div className="py-16 text-center text-xs tracking-[0.3em] uppercase opacity-60" style={{ fontFamily: MONO, color: MUTED }}>
            No {tab} yet.
          </div>
        )}
      </div>
    </div>
  );
}
