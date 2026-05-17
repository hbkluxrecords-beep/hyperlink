import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import StudioNav from '../components/StudioNav.jsx';
import { STUDIO, STUDIO_FONTS } from '../lib/studioDesign.js';
import { isOwnerOf } from '../../lib/auth.js';
import { isPremium } from '../../lib/premium.js';
import { listMessages, markMessageRead } from '../../lib/premiumFeatures.js';

function timeAgo(iso) {
  const t = new Date(iso).getTime();
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function StudioInbox() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [premium, setPremium] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!isOwnerOf(handle)) { navigate(`/studio/${handle}`); return; }
    Promise.all([isPremium(handle), listMessages(handle)]).then(([p, msgs]) => {
      setPremium(p);
      setMessages(msgs);
      setLoading(false);
    });
  }, [handle, navigate]);

  const handleClick = async (msg) => {
    if (msg.is_read) return;
    await markMessageRead(msg.id);
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m));
  };

  if (loading) {
    return (
      <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-xs tracking-[0.3em] uppercase font-bold animate-pulse" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
          Loading inbox…
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
            Fan <span style={{ fontStyle: 'italic', fontWeight: 300, color: STUDIO.accent }}>inbox.</span>
          </h1>
          <p className="opacity-70 mb-6" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.muted }}>
            Receive anonymous messages from fans. Premium only.
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

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }}>
      <StudioNav minimal />

      <div className="max-w-lg mx-auto px-5 pt-24 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
              ★ INBOX · /{handle}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1" style={{ fontFamily: STUDIO_FONTS.display }}>
              Fan <span style={{ fontStyle: 'italic', fontWeight: 300, color: STUDIO.accent }}>messages.</span>
            </h1>
            {unreadCount > 0 && (
              <div className="text-xs mt-2" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
                {unreadCount} unread
              </div>
            )}
          </div>
          <Link to={`/studio/${handle}`} className="text-[10px] tracking-[0.25em] uppercase font-bold hover:opacity-70" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
            ← Back
          </Link>
        </div>

        {messages.length === 0 ? (
          <div className="py-16 text-center" style={{ border: `1px dashed ${STUDIO.border}` }}>
            <div className="text-4xl mb-3 opacity-30">✉</div>
            <div className="text-sm opacity-70" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.muted }}>
              No messages yet.
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase mt-2 opacity-50" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
              Fans can DM from your profile
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                onClick={() => handleClick(m)}
                className="p-4 cursor-pointer hover:scale-[1.005] transition-transform"
                style={{
                  background: m.is_read ? STUDIO.surface : 'rgba(255,77,31,0.06)',
                  border: `1px solid ${m.is_read ? STUDIO.border : STUDIO.accent}`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: m.is_read ? STUDIO.muted : STUDIO.accent }}>
                    {m.from_name || 'Anonymous'}
                    {!m.is_read && ' · NEW'}
                  </span>
                  <span className="text-[10px]" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                    {timeAgo(m.created_at)}
                  </span>
                </div>
                <p className="text-sm leading-snug" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}>
                  {m.message}
                </p>
                {m.from_email && (
                  <div className="mt-2 text-[10px] tracking-[0.2em]" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                    ↩ {m.from_email}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
