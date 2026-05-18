import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import PlatformLinkCard from '../components/PlatformLinkCard.jsx';
import SocialPill from '../components/SocialPill.jsx';
import { loadProfile } from '../lib/storage.js';
import { isOwnerOf, logout } from '../lib/auth.js';

const BG = '#0A0A0A';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const ACCENT = '#FF4D1F';
const BORDER = 'rgba(255,255,255,0.08)';
const BORDER_STRONG = 'rgba(255,255,255,0.18)';
const DISPLAY = '"Fraunces", serif';
const MONO = '"JetBrains Mono", monospace';

const CAT_LABELS = {
  streamer: 'STREAMER',
  musician: 'MUSICIAN',
  creator: 'CREATOR',
  developer: 'DEVELOPER',
};

function SectionLabel({ number, label }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-12">
      <span className="text-[10px] tracking-[0.3em] uppercase font-bold shrink-0" style={{ fontFamily: MONO, color: ACCENT }}>
        § {number}
      </span>
      <span className="text-[10px] tracking-[0.3em] uppercase font-bold shrink-0" style={{ fontFamily: MONO, color: MUTED }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: BORDER }} />
    </div>
  );
}

export default function Profile() {
  const { handle } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadProfile(handle).then((p) => {
      setProfile(p);
      setLoading(false);
      if (p) setIsOwner(isOwnerOf(handle));
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
      <div style={{ background: BG, color: INK, minHeight: '100vh' }} className="flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xs tracking-[0.3em] uppercase font-bold"
          style={{ fontFamily: MONO, color: MUTED }}
        >
          Loading /{handle}…
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ background: BG, color: INK, minHeight: '100vh' }} className="flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-8xl font-black mb-4" style={{ fontFamily: DISPLAY, color: ACCENT }}>404</div>
          <h2 className="text-3xl font-black mb-3" style={{ fontFamily: DISPLAY }}>No profile at /{handle}</h2>
          <p className="opacity-70 mb-8" style={{ fontFamily: DISPLAY, color: MUTED }}>This handle hasn't been claimed yet.</p>
          <Link
            to="/new"
            className="px-6 py-3 text-xs tracking-[0.25em] uppercase font-bold transition-all hover:scale-[1.02] inline-block"
            style={{ background: ACCENT, color: BG, fontFamily: MONO }}
          >
            Claim it →
          </Link>
        </div>
      </div>
    );
  }

  const year = new Date(profile.createdAt || Date.now()).getFullYear();
  const categoryLabel = CAT_LABELS[profile.category] || 'CREATOR';
  const accentColor = profile.accentColor || ACCENT;
  const canGlow = profile.isPremium;
  const pinnedGlow = canGlow && profile.glowPinned;
  const linksGlow = canGlow && profile.glowLinks;
  const bioGlow = canGlow && profile.glowBio;
  const pinnedGlowColor = profile.glowPinnedColor || accentColor;
  const linksGlowColor = profile.glowLinksColor || accentColor;
  const bioGlowColor = profile.glowBioColor || accentColor;

  return (
    <div style={{ background: BG, color: INK, minHeight: '100vh' }} className="pb-20">
      {/* Minimal nav */}
      <nav className="px-6 py-5 flex items-center justify-between">
        <Link to="/" className="text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70" style={{ fontFamily: MONO, color: MUTED }}>
          HYPERLINK
        </Link>
      </nav>

      <div className="max-w-xl mx-auto px-6 pt-8 pb-12">
        {/* Subtle vol/issue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[9px] tracking-[0.35em] uppercase font-bold mb-6"
          style={{ fontFamily: MONO, color: MUTED }}
        >
          VOL 01 · ISSUE 04 · {year}
        </motion.div>

        {/* Display name + category */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <h1
            className="font-black leading-[0.9] tracking-tight break-words"
            style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.5rem, 9vw, 4.5rem)' }}
          >
            {profile.displayName}
            {profile.isPremium && (
              <motion.span
                initial={{ opacity: 0, scale: 0.6, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block ml-2 align-middle"
                style={{
                  fontSize: '0.45em',
                  color: ACCENT,
                  filter: `drop-shadow(0 0 8px ${ACCENT}80)`,
                }}
                title="Plinks Premium"
              >
                ★
              </motion.span>
            )}
          </h1>
          {profile.isPremium && (
            <div className="text-[9px] tracking-[0.35em] uppercase font-bold mt-1" style={{ fontFamily: MONO, color: ACCENT }}>
              ◆ PLINKS PREMIUM
            </div>
          )}
          <div
            className="text-[10px] tracking-[0.3em] uppercase font-bold mt-3"
            style={{ fontFamily: MONO, color: ACCENT }}
          >
            {categoryLabel}
          </div>
          <div className="text-[10px] tracking-[0.3em] uppercase mt-2" style={{ fontFamily: MONO, color: MUTED }}>
            /{profile.handle}
          </div>
        </motion.div>

        {/* Bio */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={bioGlow ? {
              opacity: 1,
              boxShadow: [
                `0 0 16px ${bioGlowColor}30, inset 0 0 8px ${bioGlowColor}15`,
                `0 0 32px ${bioGlowColor}60, inset 0 0 12px ${bioGlowColor}25`,
                `0 0 16px ${bioGlowColor}30, inset 0 0 8px ${bioGlowColor}15`,
              ],
            } : { opacity: 1 }}
            transition={bioGlow ? {
              opacity: { duration: 0.6, delay: 0.25 },
              boxShadow: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
            } : { duration: 0.6, delay: 0.25 }}
            className="mt-6 p-4"
            style={{
              borderLeft: `2px solid ${bioGlow ? bioGlowColor : accentColor}`,
              background: bioGlow ? `${bioGlowColor}08` : 'transparent',
            }}
          >
            <p
              className="text-base md:text-lg leading-snug"
              style={{
                fontFamily: DISPLAY,
                color: INK,
                textShadow: bioGlow ? `0 0 12px ${bioGlowColor}80` : 'none',
              }}
            >
              {profile.bio}
            </p>
          </motion.div>
        )}

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-2 mt-6 flex-wrap"
        >
          <button
            onClick={share}
            className="text-[10px] tracking-[0.3em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
            style={{ borderColor: BORDER_STRONG, fontFamily: MONO, color: INK }}
          >
            {copied ? '✓ Copied' : 'Share ↗'}
          </button>
          {isOwner && (
            <>
              <Link
                to={`/${handle}/edit`}
                className="text-[10px] tracking-[0.3em] uppercase font-bold px-3 py-1.5 hover:scale-[1.02] transition-all"
                style={{ background: ACCENT, color: BG, fontFamily: MONO }}
              >
                ✎ Edit
              </Link>
              <button
                onClick={() => { logout(); setIsOwner(false); }}
                className="text-[10px] tracking-[0.3em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
                style={{ borderColor: BORDER_STRONG, fontFamily: MONO, color: MUTED }}
              >
                Log out
              </button>
            </>
          )}
        </motion.div>

        {/* Pinned link */}
        {profile.pinned && profile.pinned.label && profile.pinned.url && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8"
          >
            <div className="text-[9px] tracking-[0.35em] uppercase font-bold mb-2" style={{ fontFamily: MONO, color: pinnedGlow ? pinnedGlowColor : ACCENT }}>
              ★ PINNED
            </div>
            <PlatformLinkCard
              label={profile.pinned.label}
              url={profile.pinned.url}
              theme="dark"
              glow={pinnedGlow}
              accent={pinnedGlowColor}
            />
          </motion.div>
        )}

        {/* Links */}
        {profile.links && profile.links.length > 0 && (
          <div>
            <SectionLabel number="02" label="The Links" />
            <div className="space-y-2.5">
              {profile.links.map((l, i) => (
                <PlatformLinkCard
                  key={i}
                  label={l.label}
                  url={l.url}
                  index={i}
                  theme="dark"
                  glow={linksGlow}
                  accent={linksGlowColor}
                />
              ))}
            </div>
          </div>
        )}

        {/* Live portfolio embed (developers) */}
        {profile.portfolioUrl && (
          <div className="mt-12">
            <SectionLabel number="03" label="Live Portfolio" />
            <div
              className="overflow-hidden"
              style={{
                background: '#141414',
                border: `1px solid rgba(255,255,255,0.08)`,
                aspectRatio: '16 / 10',
              }}
            >
              <iframe
                src={profile.portfolioUrl}
                title="Live portfolio"
                className="w-full h-full"
                style={{ border: 'none', background: '#fff' }}
                sandbox="allow-scripts allow-same-origin allow-popups"
                loading="lazy"
              />
            </div>
            <div className="mt-2 text-[10px] tracking-[0.3em] uppercase opacity-50 flex items-center justify-between" style={{ fontFamily: MONO, color: MUTED }}>
              <span>{profile.portfolioUrl}</span>
              <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-100">Open ↗</a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-20 pt-6 border-t flex items-center justify-between text-[9px] tracking-[0.35em] uppercase"
          style={{ borderColor: BORDER, fontFamily: MONO, color: MUTED }}
        >
          <span>/{profile.handle}</span>
          {isOwner && (
            <Link to={`/${handle}/edit`} className="hover:opacity-100 hover:underline">Edit →</Link>
          )}
        </div>
      </div>
    </div>
  );
}
