import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import StudioNav from '../components/StudioNav.jsx';
import CompactPlayer from '../components/CompactPlayer.jsx';
import ShowcaseRelease from '../components/ShowcaseRelease.jsx';
import MinimalRelease from '../components/MinimalRelease.jsx';
import AnimatedBackground from '../components/AnimatedBackground.jsx';
import ProfileIntro from '../../components/ProfileIntro.jsx';
import ProfileSkeleton from '../../components/ProfileSkeleton.jsx';
import PlaylistPlayer from '../../components/PlaylistPlayer.jsx';
import PlatformLinkCard from '../../components/PlatformLinkCard.jsx';
import SocialPill from '../../components/SocialPill.jsx';
import FanDMWidget from '../../components/FanDMWidget.jsx';
import { STUDIO, STUDIO_FONTS, SOCIAL_PLATFORMS } from '../lib/studioDesign.js';
import { LUXURY_EASE } from '../lib/animations.js';
import { loadArtist, loadTracks, trackEvent } from '../lib/studioStorage.js';
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
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadArtist(handle), loadTracks(handle)]).then(([a, ts]) => {
      setArtist(a);
      setTracks(ts || []);
      setLoading(false);
      if (a) {
        trackEvent(handle, 'view');
        setIsOwner(isOwnerOf(handle));
      }
    });
  }, [handle]);

  const featuredRelease = artist?.releases?.[0];
  const accentColor = (artist?.isPremium && artist?.accentColor) || STUDIO.accent;

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
    return null;
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
    <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="relative overflow-x-hidden">
      <ProfileIntro handle={handle} />
      {artist.isPremium && artist.animatedBg && <AnimatedBackground accent={accentColor} />}
      <StudioNav minimal />

      {/* Page indicator pill - only show if there are tracks */}
      {tracks.length > 0 && (
        <div
          className="fixed top-[68px] left-1/2 z-30 flex items-center gap-2 px-3 py-1.5"
          style={{
            transform: 'translateX(-50%)',
            background: 'rgba(10,10,10,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 999,
            fontFamily: STUDIO_FONTS.mono,
          }}
        >
          <button
            onClick={() => document.querySelector('[data-pager-scroll]')?.scrollTo({ left: 0, behavior: 'smooth' })}
            className="text-[9px] tracking-[0.3em] uppercase font-bold transition-opacity"
            style={{ color: STUDIO.ink }}
          >
            PROFILE
          </button>
          <span style={{ color: '#3A3A3A' }}>·</span>
          <button
            onClick={() => {
              const el = document.querySelector('[data-pager-scroll]');
              if (el) el.scrollTo({ left: el.clientWidth, behavior: 'smooth' });
            }}
            className="text-[9px] tracking-[0.3em] uppercase font-bold transition-opacity"
            style={{ color: accentColor }}
          >
            MUSIC
          </button>
        </div>
      )}

      {/* Pager: slide 1 = full profile, slide 2 = discography */}
      <div
        data-pager-scroll
        className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* SLIDE 1 - main profile */}
        <div className="min-w-full snap-start snap-always pb-20">
          <div className={`max-w-xl mx-auto px-6 relative ${(artist.releaseLayout === 'showcase' || artist.releaseLayout === 'minimal') ? 'pt-24 md:pt-28 pb-6' : 'pt-28 md:pt-32 pb-12'}`} style={{ zIndex: 1 }}>

        {/* HIDE everything above the release in SHOWCASE mode - lnk.to direct page style */}
        {artist.releaseLayout !== 'showcase' && artist.releaseLayout !== 'minimal' && (
          <>
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
          </>
        )}

        {/* Profile photo + name - only in compact mode */}
        {artist.releaseLayout !== 'showcase' && artist.releaseLayout !== 'minimal' && (
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

          {/* PLINKS PREMIUM tag - above name */}
          {artist.isPremium && (
            <div
              className="text-[9px] tracking-[0.35em] uppercase font-bold mb-2"
              style={{ fontFamily: STUDIO_FONTS.mono, color: accentColor }}
            >
              ◆ PLINKS PREMIUM
            </div>
          )}

          <h1
            className="font-black leading-[0.9] tracking-tight break-words"
            style={{
              fontFamily: STUDIO_FONTS.display,
              fontSize: 'clamp(2.5rem, 9vw, 4.5rem)',
            }}
          >
            {artist.artistName || handle}
            {artist.isPremium && (
              <motion.span
                initial={{ opacity: 0, scale: 0.6, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block ml-2 align-middle"
                style={{
                  fontSize: '0.45em',
                  color: accentColor,
                  filter: `drop-shadow(0 0 8px ${accentColor}80)`,
                }}
                title="Plinks Premium"
              >
                ★
              </motion.span>
            )}
          </h1>

          {/* Merged genres + location line */}
          {(artist.genres?.length > 0 || locDisplay) && (
            <div
              className="text-[10px] tracking-[0.3em] uppercase font-bold mt-3 flex flex-wrap items-center gap-x-2 gap-y-1"
              style={{ fontFamily: STUDIO_FONTS.mono }}
            >
              {artist.genres?.length > 0 && (
                <span style={{ color: accentColor }}>{artist.genres.join(' · ')}</span>
              )}
              {artist.genres?.length > 0 && locDisplay && (
                <span style={{ color: STUDIO.muted }}>·</span>
              )}
              {locDisplay && (
                <span style={{ color: STUDIO.muted }}>◉ {locDisplay}</span>
              )}
            </div>
          )}
          </motion.div>
        )}

        {/* Bio pullquote - hide in showcase */}
        {artist.releaseLayout !== 'showcase' && artist.releaseLayout !== 'minimal' && artist.bio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 pl-4"
            style={{ borderLeft: `2px solid ${accentColor}` }}
          >
            <p
              className="text-base md:text-lg leading-snug"
              style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}
            >
              {artist.bio}
            </p>
          </motion.div>
        )}

        {/* Owner/Share button row - hidden in showcase */}
        {artist.releaseLayout !== 'showcase' && artist.releaseLayout !== 'minimal' && (
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
              {artist.isPremium && (
                <>
                  <Link
                    to={`/studio/${handle}/inbox`}
                    className="text-[10px] tracking-[0.3em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
                    style={{ borderColor: accentColor, fontFamily: STUDIO_FONTS.mono, color: accentColor }}
                  >
                    ✉ Inbox
                  </Link>
                  <Link
                    to={`/studio/${handle}/subscribers`}
                    className="text-[10px] tracking-[0.3em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
                    style={{ borderColor: accentColor, fontFamily: STUDIO_FONTS.mono, color: accentColor }}
                  >
                    ★ Fans
                  </Link>
                </>
              )}
              <Link
                to={`/studio/${handle}/edit`}
                className="text-[10px] tracking-[0.3em] uppercase font-bold px-3 py-1.5 hover:scale-[1.02] transition-all"
                style={{ background: accentColor, color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }}
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
        )}

        {/* In SHOWCASE mode, owner gets a tiny floating edit link only */}
        {(artist.releaseLayout === 'showcase' || artist.releaseLayout === 'minimal') && isOwner && (
          <div className="flex justify-end mb-2">
            <Link
              to={`/studio/${handle}/edit`}
              className="text-[10px] tracking-[0.3em] uppercase font-bold px-3 py-1.5 hover:scale-[1.02] transition-all"
              style={{ background: accentColor, color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }}
            >
              ✎ Edit
            </Link>
          </div>
        )}

        {/* RELEASE - 3 layouts: showcase, minimal, compact */}
        {featuredRelease && artist.releaseLayout === 'showcase' ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: LUXURY_EASE }}
          >
            <ShowcaseRelease
              release={featuredRelease}
              artistName={artist.artistName}
              handle={handle}
              musicLinks={artist.links || []}
              isPremium={artist.isPremium}
              accent={accentColor}
              hideReleaseDate={artist.hideReleaseDate}
              textEffect={artist.textEffect}
              onPlay={() => trackEvent(handle, 'audio_play', { trackTitle: featuredRelease.trackTitle })}
              onPresaveClick={() => trackEvent(handle, 'presave_click', { trackTitle: featuredRelease.trackTitle })}
              onLinkClick={(l) => trackEvent(handle, 'link_click', { platform: l.label, url: l.url })}
            />
          </motion.div>
        ) : featuredRelease && artist.releaseLayout === 'minimal' ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: LUXURY_EASE }}
          >
            <MinimalRelease
              release={featuredRelease}
              artistName={artist.artistName}
              handle={handle}
              musicLinks={artist.links || []}
              isPremium={artist.isPremium}
              accent={accentColor}
              hideReleaseDate={artist.hideReleaseDate}
              textEffect={artist.textEffect}
              onPlay={() => trackEvent(handle, 'audio_play', { trackTitle: featuredRelease.trackTitle })}
              onPresaveClick={() => trackEvent(handle, 'presave_click', { trackTitle: featuredRelease.trackTitle })}
              onLinkClick={(l) => trackEvent(handle, 'link_click', { platform: l.label, url: l.url })}
            />
          </motion.div>
        ) : featuredRelease ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: LUXURY_EASE }}
            className="mt-8"
          >
            <CompactPlayer
              release={featuredRelease}
              artistName={artist.artistName}
              handle={handle}
              isPremium={artist.isPremium}
              accent={artist.accentColor}
              onPlay={() => trackEvent(handle, 'audio_play', { trackTitle: featuredRelease.trackTitle })}
              onPresaveClick={() => trackEvent(handle, 'presave_click', { trackTitle: featuredRelease.trackTitle })}
            />
          </motion.div>
        ) : null}

        {/* Swipe hint - points to discography screen */}
        {tracks.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: LUXURY_EASE }}
            onClick={() => {
              // Scroll the pager to slide 2
              const pager = document.querySelector('[data-pager-scroll]');
              if (pager) pager.scrollTo({ left: pager.clientWidth, behavior: 'smooth' });
            }}
            className="mt-6 w-full flex items-center justify-between gap-3 px-4 py-3 group"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center gap-3 text-left">
              <span className="text-2xl" style={{ color: accentColor }}>♪</span>
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: accentColor }}>
                  DISCOGRAPHY · {tracks.length} {tracks.length === 1 ? 'TRACK' : 'TRACKS'}
                </div>
                <div className="text-xs opacity-70 mt-0.5" style={{ fontFamily: STUDIO_FONTS.display }}>
                  Swipe → for the full catalog
                </div>
              </div>
            </div>
            <motion.span
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-xl shrink-0"
              style={{ color: accentColor }}
            >
              →
            </motion.span>
          </motion.button>
        )}

        {/* Music links — only in compact layout (showcase has them built-in) */}
        {artist.releaseLayout !== 'showcase' && artist.releaseLayout !== 'minimal' && artist.links && artist.links.length > 0 && (
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

        {/* Socials - hidden in showcase */}
        {artist.releaseLayout !== 'showcase' && artist.releaseLayout !== 'minimal' && socialEntries.length > 0 && (
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

        {/* Premium: Fan DM widget - hidden in showcase */}
        {artist.releaseLayout !== 'showcase' && artist.releaseLayout !== 'minimal' && artist.isPremium && !isOwner && (
          <FanDMWidget handle={handle} accent={accentColor} />
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

        {/* SLIDE 2 - DISCOGRAPHY */}
        {tracks.length > 0 && (
          <div className="min-w-full snap-start snap-always pb-20">
            <div className="max-w-xl mx-auto px-6 pt-28 md:pt-32 pb-12">
              {/* Back hint */}
              <button
                onClick={() => document.querySelector('[data-pager-scroll]')?.scrollTo({ left: 0, behavior: 'smooth' })}
                className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-60 hover:opacity-100 transition-opacity mb-6 flex items-center gap-2"
                style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
              >
                ← Swipe back to profile
              </button>

              <div className="text-[10px] tracking-[0.35em] uppercase font-bold mb-3" style={{ fontFamily: STUDIO_FONTS.mono, color: accentColor }}>
                ◆ DISCOGRAPHY
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.95] mb-2" style={{ fontFamily: STUDIO_FONTS.display }}>
                {artist.artistName || handle}
              </h2>
              <div className="text-[10px] tracking-[0.3em] uppercase opacity-60 mb-8" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} · Tap any to skip
              </div>

              <PlaylistPlayer tracks={tracks} accent={accentColor} />

              {/* Footer */}
              <div
                className="mt-20 pt-6 border-t flex items-center justify-between text-[9px] tracking-[0.35em] uppercase"
                style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
              >
                <span>/{handle}</span>
                {isOwner && (
                  <Link to={`/studio/${handle}/edit`} className="hover:opacity-100 hover:underline">Edit tracks →</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
