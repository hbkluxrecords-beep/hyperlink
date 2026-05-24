import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import TopNav from '../components/TopNav.jsx';
import { getReferralStats, requestPayout, formatMoney } from '../lib/referrals.js';
import { isOwnerOf } from '../lib/auth.js';
import { useToast } from '../components/Toast.jsx';

const BG = '#0A0A0A';
const SURFACE = '#141414';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const ACCENT = '#FF4D1F';
const BORDER = 'rgba(255,255,255,0.12)';
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

const MIN_PAYOUT_CENTS = 500; // $5 minimum

export default function ReferralDashboard() {
  const { handle } = useParams();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [method, setMethod] = useState('cashapp');
  const [destination, setDestination] = useState('');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    setIsOwner(isOwnerOf(handle));
    getReferralStats(handle).then((s) => {
      setStats(s);
      setLoading(false);
    });
  }, [handle]);

  const refLink = `${window.location.origin}/r/${handle}`;

  const copyLink = () => {
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      toast.success('Referral link copied');
      setTimeout(() => setCopied(false), 1600);
    });
  };

  const submitPayout = async () => {
    if (!destination.trim()) {
      toast.error('Enter where to send the money');
      return;
    }
    setRequesting(true);
    const r = await requestPayout(handle, stats.earnedCents, method, destination.trim());
    setRequesting(false);
    if (r.ok) {
      toast.success('Payout requested — paid within 7 days');
      setShowPayout(false);
    } else {
      toast.error('Request failed: ' + (r.error || 'try again'));
    }
  };

  if (loading) {
    return (
      <div style={{ background: BG, minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-[10px] tracking-[0.3em] uppercase opacity-50" style={{ fontFamily: MONO, color: MUTED }}>Loading…</div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div style={{ background: BG, color: INK, minHeight: '100vh' }}>
        <TopNav />
        <div className="max-w-md mx-auto px-6 pt-32 text-center">
          <h1 className="text-3xl font-black mb-3" style={{ fontFamily: DISPLAY }}>Not your dashboard</h1>
          <p className="opacity-70 mb-6" style={{ fontFamily: DISPLAY }}>Log in as /{handle} to see referral earnings.</p>
          <Link to="/login" className="text-[10px] tracking-[0.3em] uppercase font-bold underline" style={{ fontFamily: MONO, color: ACCENT }}>
            Log in →
          </Link>
        </div>
      </div>
    );
  }

  const canPayout = stats.earnedCents >= MIN_PAYOUT_CENTS;

  return (
    <div style={{ background: BG, color: INK, minHeight: '100vh' }}>
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 pt-24 md:pt-32 pb-20">
        <div className="text-[10px] tracking-[0.35em] uppercase font-bold mb-3" style={{ fontFamily: MONO, color: ACCENT }}>
          ◆ REFERRALS · /{handle}
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.95] mb-3" style={{ fontFamily: DISPLAY }}>
          Earn by <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>spreading</span> plinks.
        </h1>
        <p className="text-base opacity-75 max-w-lg mb-8" style={{ fontFamily: DISPLAY }}>
          Share your link. When someone signs up through it and goes Premium, you earn <strong style={{ color: INK }}>$1</strong>. Cash out anytime over $5.
        </p>

        {/* Referral link */}
        <div className="p-4 mb-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2" style={{ fontFamily: MONO, color: MUTED }}>
            Your referral link
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-sm truncate font-bold" style={{ fontFamily: MONO, color: ACCENT }}>
              {refLink}
            </div>
            <button
              onClick={copyLink}
              className="text-[10px] tracking-[0.3em] uppercase font-bold px-3 py-2 shrink-0"
              style={{ background: ACCENT, color: BG, fontFamily: MONO }}
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Stat label="Signed up" value={stats.total} />
          <Stat label="Went premium" value={stats.converted} accent />
          <Stat label="Earned" value={formatMoney(stats.earnedCents)} accent />
        </div>

        {/* Payout */}
        <div className="p-5 mb-8" style={{ background: SURFACE, border: `1px solid ${canPayout ? ACCENT : BORDER}` }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO, color: MUTED }}>
                Available to cash out
              </div>
              <div className="text-3xl font-black mt-1" style={{ fontFamily: DISPLAY, color: canPayout ? ACCENT : INK }}>
                {formatMoney(stats.earnedCents)}
              </div>
            </div>
            <button
              onClick={() => setShowPayout((v) => !v)}
              disabled={!canPayout}
              className="text-[10px] tracking-[0.3em] uppercase font-bold px-4 py-3 disabled:opacity-40"
              style={{ background: canPayout ? ACCENT : 'transparent', color: canPayout ? BG : MUTED, border: canPayout ? 'none' : `1px solid ${BORDER}`, fontFamily: MONO }}
            >
              {canPayout ? 'Cash out →' : `$5 min`}
            </button>
          </div>

          {showPayout && canPayout && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-5 pt-5 space-y-3"
              style={{ borderTop: `1px solid ${BORDER}`, overflow: 'hidden' }}
            >
              <div className="grid grid-cols-3 gap-2">
                {['cashapp', 'paypal', 'venmo'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className="py-2 text-[10px] tracking-[0.2em] uppercase font-bold"
                    style={{
                      background: method === m ? 'rgba(255,77,31,0.1)' : 'transparent',
                      border: `1px solid ${method === m ? ACCENT : BORDER}`,
                      color: method === m ? ACCENT : INK,
                      fontFamily: MONO,
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={method === 'cashapp' ? '$cashtag' : method === 'paypal' ? 'paypal email' : '@venmo'}
                className="w-full bg-transparent border-b pb-2 outline-none text-base"
                style={{ borderColor: BORDER, color: INK, fontFamily: MONO }}
              />
              <button
                onClick={submitPayout}
                disabled={requesting}
                className="w-full py-3 text-[10px] tracking-[0.3em] uppercase font-bold disabled:opacity-50"
                style={{ background: ACCENT, color: BG, fontFamily: MONO }}
              >
                {requesting ? 'Requesting…' : `Request ${formatMoney(stats.earnedCents)} →`}
              </button>
              <p className="text-[9px] tracking-[0.2em] uppercase opacity-50 text-center" style={{ fontFamily: MONO, color: MUTED }}>
                Paid manually within 7 days
              </p>
            </motion.div>
          )}
        </div>

        {/* Referral list */}
        {stats.referrals.length > 0 && (
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-3" style={{ fontFamily: MONO, color: MUTED }}>
              Your referrals
            </div>
            <div className="space-y-1.5">
              {stats.referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                  <span className="text-sm font-bold" style={{ fontFamily: DISPLAY }}>/{r.referred_handle}</span>
                  <span
                    className="text-[9px] tracking-[0.25em] uppercase font-bold px-2 py-1"
                    style={{
                      background: r.status === 'converted' ? 'rgba(29,185,84,0.15)' : 'rgba(255,255,255,0.05)',
                      color: r.status === 'converted' ? '#1DB954' : MUTED,
                      fontFamily: MONO,
                    }}
                  >
                    {r.status === 'converted' ? `+${formatMoney(r.reward_cents)}` : 'pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.referrals.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <div className="text-4xl mb-2">◆</div>
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO, color: MUTED }}>
              No referrals yet — share your link
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t" style={{ borderColor: BORDER }}>
          <Link to={`/${handle}`} className="text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70" style={{ fontFamily: MONO, color: ACCENT }}>
            ← Back to profile
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="p-4 text-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
      <div className="text-2xl md:text-3xl font-black" style={{ fontFamily: DISPLAY, color: accent ? ACCENT : INK }}>
        {value}
      </div>
      <div className="text-[9px] tracking-[0.2em] uppercase mt-1 opacity-60" style={{ fontFamily: MONO, color: MUTED }}>
        {label}
      </div>
    </div>
  );
}
