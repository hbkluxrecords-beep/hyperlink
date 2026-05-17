import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import StudioNav from '../components/StudioNav.jsx';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';
import { isOwnerOf } from '../../lib/auth.js';
import { isPremium } from '../../lib/premium.js';
import { listSubscribers, subscribersToCSV } from '../../lib/premiumFeatures.js';

export default function StudioSubscribers() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [premium, setPremium] = useState(false);
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    if (!isOwnerOf(handle)) { navigate(`/studio/${handle}`); return; }
    Promise.all([isPremium(handle), listSubscribers(handle)]).then(([p, subs]) => {
      setPremium(p);
      setSubscribers(subs);
      setLoading(false);
    });
  }, [handle, navigate]);

  const exportCSV = () => {
    const url = subscribersToCSV(subscribers);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plinks-subscribers-${handle}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-xs tracking-[0.3em] uppercase font-bold animate-pulse" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
          Loading subscribers…
        </div>
      </div>
    );
  }

  if (!premium) {
    return (
      <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }}>
        <StudioNav minimal />
        <div className="max-w-lg mx-auto px-6 pt-24 pb-20 text-center">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3" style={{ fontFamily: STUDIO_FONTS.display }}>
            Subscriber <span style={{ fontStyle: 'italic', fontWeight: 300, color: STUDIO.accent }}>list.</span>
          </h1>
          <p className="opacity-70 mb-6" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.muted }}>
            Build a direct fan email list. Export anytime. Premium only.
          </p>
          <Link
            to="/upgrade"
            className="inline-block px-6 py-3 text-xs tracking-[0.3em] uppercase font-bold hover:scale-[1.02] transition-transform"
            style={{ background: STUDIO.accent, color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }}
          >
            ★ Unlock for $3 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }}>
      <StudioNav minimal />

      <div className="max-w-lg mx-auto px-5 pt-24 pb-20">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
              ★ SUBSCRIBERS · /{handle}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1" style={{ fontFamily: STUDIO_FONTS.display }}>
              {subscribers.length} <span style={{ fontStyle: 'italic', fontWeight: 300, color: STUDIO.accent }}>fans.</span>
            </h1>
          </div>
          <Link to={`/studio/${handle}`} className="text-[10px] tracking-[0.25em] uppercase font-bold hover:opacity-70" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
            ← Back
          </Link>
        </div>

        {subscribers.length > 0 && (
          <button
            onClick={exportCSV}
            className="block w-full text-center py-3 mb-6 text-[10px] tracking-[0.3em] uppercase font-bold hover:scale-[1.005] transition-transform"
            style={{ background: STUDIO.accent, color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }}
          >
            ⬇ Export CSV
          </button>
        )}

        {subscribers.length === 0 ? (
          <div className="py-16 text-center" style={{ border: `1px dashed ${STUDIO.border}` }}>
            <div className="text-4xl mb-3 opacity-30">✉</div>
            <div className="text-sm opacity-70" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.muted }}>
              No subscribers yet.
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase mt-2 opacity-50" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
              Add a release with a future date — fans can subscribe
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {subscribers.map((s, i) => (
              <motion.div
                key={s.email + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
                className="flex items-center justify-between px-4 py-3"
                style={{ background: STUDIO.surface, border: `1px solid ${STUDIO.border}` }}
              >
                <span className="text-sm truncate" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink }}>
                  {s.email}
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase shrink-0 ml-3" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                  {new Date(s.created_at).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
