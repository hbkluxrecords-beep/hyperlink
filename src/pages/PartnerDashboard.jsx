import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import TopNav from '../components/TopNav.jsx';
import {
  getPartnerStats,
  getPartnerDeal,
  markSignupLive,
  markOwnerPaidOut,
  formatMoney,
} from '../lib/partners.js';
import { useToast } from '../components/Toast.jsx';

const BG = '#0A0A0A';
const SURFACE = '#141414';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const ACCENT = '#FF4D1F';
const GOLD = '#FFD700';
const BORDER = 'rgba(255,255,255,0.12)';
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

// Lightweight gate. Both the owner and the partner (Oziel) get the same code.
// Not security-grade — just keeps the dashboard from being casually browsable.
// Override per-deal here if needed.
const ACCESS_CODES = {
  loveit: 'loveit2026',
};
const SESSION_KEY = (code) => `plinks-partner-access-${code}`;

export default function PartnerDashboard() {
  const { code = 'loveit' } = useParams();
  const toast = useToast();
  const deal = getPartnerDeal(code);

  const [granted, setGranted] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY(code)) === 'ok') setGranted(true);
    } catch {}
  }, [code]);

  const load = () => {
    setLoading(true);
    getPartnerStats(code).then((s) => {
      setStats(s);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (granted) load();
  }, [granted, code]);

  const tryUnlock = () => {
    const expected = ACCESS_CODES[code];
    if (codeInput.trim().toLowerCase() === expected) {
      try {
        sessionStorage.setItem(SESSION_KEY(code), 'ok');
      } catch {}
      setGranted(true);
    } else {
      toast.error('Wrong access code');
    }
  };

  const onMarkLive = async (id) => {
    const r = await markSignupLive(id);
    if (r.ok) {
      toast.success('Marked live');
      load();
    } else {
      toast.error('Update failed');
    }
  };

  const onMarkPaid = async (id) => {
    const r = await markOwnerPaidOut(id);
    if (r.ok) {
      toast.success('Marked your cut as settled');
      load();
    } else {
      toast.error('Update failed');
    }
  };

  // ---- Gate screen ----
  if (!granted) {
    return (
      <div style={{ background: BG, color: INK, minHeight: '100vh' }}>
        <TopNav />
        <div className="max-w-md mx-auto px-6 pt-32">
          <div
            className="inline-block mb-6 px-3 py-1.5"
            style={{ border: `1px solid ${BORDER}`, fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT }}
          >
            {deal.name} × plinks
          </div>
          <h1 className="font-black text-3xl mb-3" style={{ fontFamily: DISPLAY }}>
            Partner dashboard
          </h1>
          <p className="mb-8 text-sm" style={{ color: MUTED }}>
            Enter the access code to view signups and earnings.
          </p>
          <input
            type="password"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
            placeholder="Access code"
            className="w-full mb-4 px-4 py-3 outline-none"
            style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: INK, fontFamily: MONO, fontSize: 14 }}
          />
          <button
            onClick={tryUnlock}
            className="w-full py-3 font-bold transition-transform hover:scale-[1.01]"
            style={{ background: ACCENT, color: '#fff', fontFamily: MONO, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div style={{ background: BG, minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-[10px] tracking-[0.3em] uppercase opacity-50" style={{ fontFamily: MONO, color: MUTED }}>
          Loading…
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total artists', value: stats.total, sub: `${stats.paid} paid · ${stats.launch} free` },
    { label: 'You are owed', value: formatMoney(stats.ownerOwedCents), sub: 'Your $25 cut, unsettled', accent: true },
    { label: 'Live pages', value: stats.live, sub: 'Domains wired up' },
    { label: 'Collected', value: formatMoney(stats.collectedCents), sub: 'Gross via the deal' },
  ];

  return (
    <div style={{ background: BG, color: INK, minHeight: '100vh' }}>
      <TopNav />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-24">
        <div
          className="inline-block mb-5 px-3 py-1.5"
          style={{ border: `1px solid ${BORDER}`, fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT }}
        >
          {deal.name} × plinks
        </div>
        <h1 className="font-black text-4xl mb-2" style={{ fontFamily: DISPLAY }}>
          Partner dashboard
        </h1>
        <p className="mb-10 text-sm" style={{ color: MUTED }}>
          {formatMoney(deal.listPriceCents)} / artist · you keep {formatMoney(deal.ownerCutCents)} · {deal.name} keeps{' '}
          {formatMoney(deal.partnerCutCents)}
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {statCards.map((c) => (
            <div
              key={c.label}
              className="p-5"
              style={{ background: SURFACE, border: `1px solid ${c.accent ? ACCENT : BORDER}` }}
            >
              <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: MUTED, fontFamily: MONO }}>
                {c.label}
              </div>
              <div className="font-black text-2xl" style={{ fontFamily: DISPLAY, color: c.accent ? ACCENT : INK }}>
                {c.value}
              </div>
              <div className="text-[11px] mt-1" style={{ color: MUTED }}>
                {c.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Signups list */}
        <h2 className="font-bold text-lg mb-4" style={{ fontFamily: DISPLAY }}>
          Signups
        </h2>
        {stats.signups.length === 0 ? (
          <div className="p-8 text-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <p style={{ color: MUTED }}>No artists onboarded yet.</p>
            <p className="text-xs mt-2" style={{ color: MUTED }}>
              Share <span style={{ color: ACCENT }}>plinks.dev/love-it-digital</span> to start.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.signups.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 flex flex-wrap items-center gap-3 justify-between"
                style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/studio/${s.artist_handle}`}
                      className="font-bold hover:opacity-70"
                      style={{ fontFamily: DISPLAY }}
                    >
                      {s.artist_name || s.artist_handle}
                    </Link>
                    {s.tier === 'launch' && (
                      <span
                        className="text-[9px] px-2 py-0.5 uppercase tracking-wider"
                        style={{ background: 'rgba(255,215,0,0.12)', color: GOLD, fontFamily: MONO }}
                      >
                        Launch · Free
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] mt-1" style={{ color: MUTED, fontFamily: MONO }}>
                    @{s.artist_handle}
                    {s.custom_domain ? ` · ${s.custom_domain}` : ''} · {s.status}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {s.tier === 'paid' && (
                    <span className="text-sm font-bold" style={{ fontFamily: MONO, color: s.owner_paid_out ? MUTED : ACCENT }}>
                      {s.owner_paid_out ? 'settled' : `+${formatMoney(s.owner_cut_cents)}`}
                    </span>
                  )}
                  {s.status !== 'live' && s.status !== 'paid_out' && (
                    <button
                      onClick={() => onMarkLive(s.id)}
                      className="text-[10px] px-3 py-1.5 uppercase tracking-wider transition-opacity hover:opacity-80"
                      style={{ border: `1px solid ${BORDER}`, fontFamily: MONO, color: INK }}
                    >
                      Mark live
                    </button>
                  )}
                  {s.tier === 'paid' && !s.owner_paid_out && (
                    <button
                      onClick={() => onMarkPaid(s.id)}
                      className="text-[10px] px-3 py-1.5 uppercase tracking-wider transition-opacity hover:opacity-80"
                      style={{ border: `1px solid ${ACCENT}`, fontFamily: MONO, color: ACCENT }}
                    >
                      Settle $25
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <p className="mt-10 text-xs" style={{ color: MUTED }}>
          To onboard a free launch artist, send them{' '}
          <span style={{ color: ACCENT }}>plinks.dev/studio/new?partner=loveit&amp;tier=launch</span>
        </p>
      </div>
    </div>
  );
}
