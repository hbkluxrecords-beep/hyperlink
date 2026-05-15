import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import StudioNav from '../components/StudioNav.jsx';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';
import { LUXURY_EASE } from '../lib/animations.js';
import { loadRecentArtists } from '../lib/studioStorage.js';

export default function StudioExplore() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentArtists(48).then((a) => {
      setArtists(a);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="pb-20">
      <StudioNav />

      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-32 pb-12">
        <div className="mb-12">
          <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
            Directory
          </span>
          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mt-3" style={{ fontFamily: STUDIO_FONTS.display }}>
            The <span style={{ color: STUDIO.accent, fontStyle: 'italic', fontWeight: 300 }}>roster</span>.
          </h1>
          <p className="mt-3 max-w-md text-base" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.muted }}>
            Every artist on Plinks Studio. Click to visit.
          </p>
        </div>

        {loading ? (
          <div style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono, fontSize: 12 }}>Loading…</div>
        ) : artists.length === 0 ? (
          <div className="border-2 border-dashed p-12 text-center" style={{ borderColor: STUDIO.border }}>
            <div className="text-2xl font-black mb-2" style={{ fontFamily: STUDIO_FONTS.display }}>Nobody yet.</div>
            <p style={{ color: STUDIO.muted }} className="mb-6">Be the first artist on Plinks Studio.</p>
            <Link
              to="/studio/new"
              className="inline-block px-5 py-2 text-xs tracking-[0.25em] uppercase font-bold"
              style={{ background: STUDIO.accent, color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }}
            >
              Claim yours →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: STUDIO.border }}>
            {artists.map((a, i) => (
              <motion.div
                key={a.handle}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.04, ease: LUXURY_EASE }}
              >
                <Link
                  to={`/studio/${a.handle}`}
                  className="block p-6 hover:scale-[0.99] transition-transform"
                  style={{ background: STUDIO.surface }}
                >
                  {a.photoUrl && (
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-4" style={{ border: `1px solid ${STUDIO.border}` }}>
                      <img src={a.photoUrl} alt={a.artistName} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="text-2xl font-black mb-1 break-words" style={{ fontFamily: STUDIO_FONTS.display }}>{a.artistName}</div>
                  <div className="text-xs opacity-60 mb-3" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>/{a.handle}</div>
                  {a.genres?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {a.genres.slice(0, 3).map((g) => (
                        <span key={g} className="text-[9px] tracking-[0.25em] uppercase font-bold px-1.5 py-0.5 border" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent, borderColor: STUDIO.accent }}>
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                  {a.bio && (
                    <p className="text-xs opacity-70 line-clamp-2" style={{ fontFamily: STUDIO_FONTS.display, fontStyle: 'italic' }}>"{a.bio}"</p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
