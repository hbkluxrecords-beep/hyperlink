import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import StudioNav from '../components/StudioNav.jsx';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';
import { LUXURY_EASE } from '../lib/animations.js';
import { loadAnalytics, loadArtist } from '../lib/studioStorage.js';

function computeMetrics(events) {
  const now = Date.now();
  const day = 86400000;
  const week = day * 7;
  const month = day * 30;

  const views = events.filter((e) => e.event_type === 'view');
  const plays = events.filter((e) => e.event_type === 'audio_play');
  const clicks = events.filter((e) => e.event_type === 'link_click');
  const presaves = events.filter((e) => e.event_type === 'presave_click');

  // Dedupe views by session
  const uniqueViews = new Set(views.map((v) => v.session_id || v.id)).size;

  const within = (events, ms) =>
    events.filter((e) => now - new Date(e.created_at).getTime() < ms);

  // Clicks by platform
  const clicksByPlatform = {};
  clicks.forEach((c) => {
    const p = c.metadata?.platform || 'Unknown';
    clicksByPlatform[p] = (clicksByPlatform[p] || 0) + 1;
  });
  const topPlatforms = Object.entries(clicksByPlatform).sort((a, b) => b[1] - a[1]);

  // Referrers
  const refs = {};
  views.forEach((v) => {
    let r = v.referrer || 'direct';
    try {
      if (r && r !== 'direct') r = new URL(r).hostname.replace('www.', '');
    } catch {}
    refs[r] = (refs[r] || 0) + 1;
  });
  const topReferrers = Object.entries(refs).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Hourly heatmap
  const heatmap = Array(24).fill(0);
  views.forEach((v) => {
    const h = new Date(v.created_at).getHours();
    heatmap[h]++;
  });

  // Daily views for last 14 days
  const daily = Array(14).fill(0).map((_, i) => {
    const start = now - (13 - i) * day;
    const end = start + day;
    return views.filter((v) => {
      const t = new Date(v.created_at).getTime();
      return t >= start && t < end;
    }).length;
  });

  return {
    views: { total: uniqueViews, week: within(views, week).length, month: within(views, month).length },
    plays: { total: plays.length, week: within(plays, week).length },
    clicks: { total: clicks.length, week: within(clicks, week).length },
    presaves: { total: presaves.length, week: within(presaves, week).length },
    conversion: plays.length ? Math.round((presaves.length / plays.length) * 100) : 0,
    topPlatforms,
    topReferrers,
    heatmap,
    daily,
  };
}

function StatCard({ label, value, sub, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: LUXURY_EASE }}
      className="p-6"
      style={{ background: STUDIO.surface, border: `1px solid ${STUDIO.border}` }}
    >
      <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
        {label}
      </div>
      <div className="text-4xl md:text-5xl font-black tabular-nums" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}>
        {value}
      </div>
      {sub && (
        <div className="text-[10px] tracking-[0.2em] uppercase mt-2" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
          {sub}
        </div>
      )}
    </motion.div>
  );
}

function MiniLineChart({ data, label }) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (v / max) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="p-6" style={{ background: STUDIO.surface, border: `1px solid ${STUDIO.border}` }}>
      <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-4" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
        {label}
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-32">
        <motion.polyline
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: LUXURY_EASE }}
          points={points}
          fill="none"
          stroke={STUDIO.accent}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((v, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (v / max) * 80;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="1.2"
              fill={STUDIO.accent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 * i + 0.5, duration: 0.3 }}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default function StudioAnalytics() {
  const { handle } = useParams();
  const [events, setEvents] = useState([]);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadAnalytics(handle), loadArtist(handle)]).then(([evs, a]) => {
      setEvents(evs);
      setArtist(a);
      setLoading(false);
    });
  }, [handle]);

  if (loading) {
    return (
      <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-xs tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
          Loading analytics…
        </div>
      </div>
    );
  }

  const m = computeMetrics(events);
  const heatmapMax = Math.max(...m.heatmap, 1);

  return (
    <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="pb-20">
      <StudioNav minimal />

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-12">
        <Link to={`/studio/${handle}`} className="text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
          ← Back to profile
        </Link>

        <div className="flex items-end justify-between flex-wrap gap-4 mt-6 mb-12">
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
              Analytics
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight mt-2" style={{ fontFamily: STUDIO_FONTS.display }}>
              {artist?.artistName || handle}
            </h1>
          </div>
          <div className="text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
            {events.length} events tracked
          </div>
        </div>

        {events.length === 0 ? (
          <div className="border-2 border-dashed p-12 text-center" style={{ borderColor: STUDIO.border }}>
            <div className="text-2xl font-black mb-2" style={{ fontFamily: STUDIO_FONTS.display }}>No data yet.</div>
            <p className="text-sm" style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.display }}>
              Share your profile and check back. Analytics will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px mb-12" style={{ background: STUDIO.border }}>
              <StatCard label="Profile Views" value={m.views.total} sub={`${m.views.week} this week`} delay={0} />
              <StatCard label="Audio Plays" value={m.plays.total} sub={`${m.plays.week} this week`} delay={0.1} />
              <StatCard label="Link Clicks" value={m.clicks.total} sub={`${m.clicks.week} this week`} delay={0.2} />
              <StatCard label="Presaves" value={m.presaves.total} sub={`${m.conversion}% conversion`} delay={0.3} />
            </div>

            <div className="grid md:grid-cols-2 gap-px mb-12" style={{ background: STUDIO.border }}>
              <MiniLineChart data={m.daily} label="Views · Last 14 days" />

              {/* Hourly heatmap */}
              <div className="p-6" style={{ background: STUDIO.surface }}>
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-4" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                  Hourly Heatmap
                </div>
                <div className="grid grid-cols-12 gap-1">
                  {m.heatmap.map((v, h) => {
                    const intensity = heatmapMax > 0 ? v / heatmapMax : 0;
                    return (
                      <motion.div
                        key={h}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: h * 0.02, duration: 0.3 }}
                        className="aspect-square flex items-center justify-center text-[8px] tabular-nums"
                        style={{
                          background: `rgba(255, 77, 31, ${0.1 + intensity * 0.9})`,
                          color: intensity > 0.5 ? STUDIO.ink : STUDIO.muted,
                          fontFamily: STUDIO_FONTS.mono,
                        }}
                        title={`${h}:00 — ${v} views`}
                      >
                        {h}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-px mb-12" style={{ background: STUDIO.border }}>
              {/* Top platforms */}
              <div className="p-6" style={{ background: STUDIO.surface }}>
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-4" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                  Top Link Clicks
                </div>
                {m.topPlatforms.length === 0 ? (
                  <div className="text-sm" style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono }}>No clicks yet</div>
                ) : (
                  <div className="space-y-2">
                    {m.topPlatforms.slice(0, 6).map(([p, count], i) => {
                      const max = m.topPlatforms[0][1];
                      const pct = (count / max) * 100;
                      return (
                        <div key={p}>
                          <div className="flex items-center justify-between text-xs mb-1" style={{ fontFamily: STUDIO_FONTS.mono }}>
                            <span style={{ color: STUDIO.ink }}>{p}</span>
                            <span className="tabular-nums" style={{ color: STUDIO.muted }}>{count}</span>
                          </div>
                          <div className="h-1" style={{ background: STUDIO.border }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.1 * i, ease: LUXURY_EASE }}
                              className="h-full"
                              style={{ background: STUDIO.accent }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Referrers */}
              <div className="p-6" style={{ background: STUDIO.surface }}>
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-4" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                  Top Referrers
                </div>
                {m.topReferrers.length === 0 ? (
                  <div className="text-sm" style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono }}>No referral data yet</div>
                ) : (
                  <div className="space-y-2">
                    {m.topReferrers.map(([ref, count]) => (
                      <div key={ref} className="flex items-center justify-between text-xs" style={{ fontFamily: STUDIO_FONTS.mono }}>
                        <span style={{ color: STUDIO.ink }}>{ref}</span>
                        <span className="tabular-nums" style={{ color: STUDIO.muted }}>{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mt-12" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
          ⚠ This dashboard is public for now. Auth coming soon.
        </div>
      </div>
    </div>
  );
}
