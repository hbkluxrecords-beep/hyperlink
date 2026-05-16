import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import StudioNav from '../components/StudioNav.jsx';
import CompactPlayer from '../components/CompactPlayer.jsx';
import PlatformLinkCard from '../../components/PlatformLinkCard.jsx';
import SocialPill from '../../components/SocialPill.jsx';
import { STUDIO, STUDIO_FONTS, SOCIAL_PLATFORMS } from '../lib/studioDesign.js';
import { LUXURY_EASE } from '../lib/animations.js';
import { loadArtist, trackEvent } from '../lib/studioStorage.js';
import { isOwnerOf, logout } from '../../lib/auth.js';

function compactLocation(loc) {
  if (!loc) return '';
  const parts = loc.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) return parts[0]?.toUpperCase() || '';
  const city = parts[0];
  let region = parts[1];
  const map = { 'united states of america': 'USA', 'united states': 'USA', 'united kingdom': 'UK' };
  const lower = region.toLowerCase();
  if (map[lower]) region = map[lower];
  if (region.length > 3) region = region.split(' ')[0];
  return `${city.toUpperCase()}, ${region.toUpperCase()}`;
}

function SectionLabel({ number, label }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-12">
      <span
        className="text-[10px] tracking-[0.3em] uppercase font-bold shrink-0"
        style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}
      >
        § {number}
      </span>
      <span
        className="text-[10px] tracking-[0.3em] uppercase font-bold shrink-0"
        style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: STUDIO.border }} />
    </div>
  );
}

export default function StudioProfile() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadArtist(handle).then((a) => {
      setArtist(a);
      setLoading(false);
      if (a) {
        trackEvent(handle, 'view');
        setIsOwner(isOwnerOf(handle));
      }
    });
  }, [handle]);

  const featuredRelease = artist?.releases?.[0];

  const share = async () => {
    const url = `${window.location.origin}/${handle}`;
    try {
      if (navigator.share) {
        await navigator.share({ url, title: artist?.artistName || handle });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {}
  };

  if (loading) {
    return (
      <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xs tracking-[0.3em] uppercase font-bold"
          style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
        >
          Loading /{handle}…
        </motion.div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="flex items-center justify-center px-6">
        <StudioNav minimal />
        <div className="text-center max-w-md">
          <div className="text-8xl font-black mb-4" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.accent }}>404</div>
          <h2 className="text-3xl font-black mb-3" style={{ fontFamily: STUDIO_FONTS.display }}>No artist at /{handle}</h2>
          <p className="opacity-70 mb-8" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.muted }}>This handle hasn't been claimed yet.</p>
          <button
            onClick={() => navigate('/studio/new')}
            className="px-6 py-3 text-xs tracking-[0.25em] uppercase font-bold transition-all hover:scale-[1.02]"
            style={{ background: STUDIO.accent, color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }}
          >
            Claim it →
          </button>
        </div>
      </div>
    );
  }

  const socialEntries = Object.entries(artist.socials || {}).filter(([_, url]) => url && url.trim());
  const year = new Date(artist.createdAt || Date.now()).getFullYear();
  const locDisplay = compactLocation(artist.location);

  return (
    <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="pb-20">
      <StudioNav minimal />

      <div className="max-w-xl mx-auto px-6 pt-24 pb-12">

        {/* Subtle vol/issue tag — flat, no rotation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[9px] tracking-[0.35em] uppercase font-bold mb-6"
          style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
        >
          VOL 01 · ISSUE 04 · {year}
        </motion.div>

        {/* Profile photo + name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: LUXURY_EASE }}
        >
          {artist.photoUrl && (
            <div
              className="w-20 h-20 mb-5 overflow-hidden rounded-full"
              style={{ border: `1px solid ${STUDIO.borderStrong}` }}
            >
              <img src={artist.photoUrl} alt={artist.artistName} className="w-full h-full object-cover" />
            </div>
          )}
          <h1
            className="font-black leading-[0.9] tracking-tight break-words"
            style={{
              fontFamily: STUDIO_FONTS.display,
              fontSize: 'clamp(2.5rem, 9vw, 4.5rem)',
            }}
          >
            {artist.artistName}
          </h1>

          {artist.genres && artist.genres.length > 0 && (
            <div
              className="text-[10px] tracking-[0.3em] uppercase font-bold mt-3"
              style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}
            >
              {artist.genres.join(' · ')}
            </div>
          )}

          {locDisplay && (
            <div
              className="text-[10px] tracking-[0.3em] uppercase mt-2 truncate"
              style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
            >
              ◉ {locDisplay} · EST {year}
            </div>
          )}
        </motion.div>

        {/* Bio pullquote */}
        {artist.bio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 pl-4"
            style={{ borderLeft: `2px solid ${STUDIO.accent}` }}
          >
            <p
              className="text-base md:text-lg leading-snug"
              style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}
            >
              {artist.bio}
            </p>
          </motion.div>
        )}

        {/* Owner/Share button row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-2 mt-6 flex-wrap"
        >
          <button
            onClick={share}
            className="text-[10px] tracking-[0.3em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
            style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink }}
          >
            {copied ? '✓ Copied' : 'Share ↗'}
          </button>
          {isOwner && (
            <>
              <Link
                to={`/studio/${handle}/analytics`}
                className="text-[10px] tracking-[0.3em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
                style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
              >
                Analytics
              </Link>
              <Link
                to={`/studio/${handle}/edit`}
                className="text-[10px] tracking-[0.3em] uppercase font-bold px-3 py-1.5 hover:scale-[1.02] transition-all"
                style={{ background: STUDIO.accent, color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }}
              >
                ✎ Edit
              </Link>
              <button
                onClick={() => { logout(); setIsOwner(false); }}
                className="text-[10px] tracking-[0.3em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
                style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
              >
                Log out
              </button>
            </>
          )}
        </motion.div>

        {/* COMPACT RELEASE PLAYER */}
        {featuredRelease && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: LUXURY_EASE }}
            className="mt-8"
          >
            <CompactPlayer
              release={featuredRelease}
              artistName={artist.artistName}
              onPlay={() => trackEvent(handle, 'audio_play', { trackTitle: featuredRelease.trackTitle })}
              onPresaveClick={() => trackEvent(handle, 'presave_click', { trackTitle: featuredRelease.trackTitle })}
            />
          </motion.div>
        )}

        {/* Music links */}
        {artist.links && artist.links.length > 0 && (
          <div>
            <SectionLabel number="02" label="Listen Everywhere" />
            <div className="space-y-2.5">
              {artist.links.map((l, i) => (
                <PlatformLinkCard
                  key={i}
                  label={l.label}
                  url={l.url}
                  color={l.color}
                  index={i}
                  theme="dark"
                  onClick={() => trackEvent(handle, 'link_click', { platform: l.label, url: l.url })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Socials */}
        {socialEntries.length > 0 && (
          <div>
            <SectionLabel number="03" label="Off the record" />
            <div className="flex flex-wrap gap-2">
              {socialEntries.map(([id, url]) => {
                const platform = SOCIAL_PLATFORMS.find((p) => p.id === id);
                const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                return (
                  <SocialPill
                    key={id}
                    label={platform?.label || id}
                    url={fullUrl}
                    theme="dark"
                    onClick={() => trackEvent(handle, 'link_click', { platform: id, url })}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-20 pt-6 border-t flex items-center justify-between text-[9px] tracking-[0.35em] uppercase"
          style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
        >
          <span>/{handle}</span>
          {isOwner && (
            <Link to={`/studio/${handle}/edit`} className="hover:opacity-100 hover:underline">Edit →</Link>
          )}
        </div>
      </div>
    </div>
  );
}
