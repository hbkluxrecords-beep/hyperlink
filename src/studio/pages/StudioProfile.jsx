import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import StudioNav from '../components/StudioNav.jsx';
import PresaveBlock from '../components/PresaveBlock.jsx';
import MusicLinkButton from '../components/MusicLinkButton.jsx';
import { STUDIO, STUDIO_FONTS, SOCIAL_PLATFORMS } from '../lib/studioDesign.js';
import { LUXURY_EASE, staggerContainer } from '../lib/animations.js';
import { loadArtist, trackEvent } from '../lib/studioStorage.js';
import { isOwnerOf, checkHandle, getSession, logout } from '../../lib/auth.js';
import ClaimModal from '../../components/ClaimModal.jsx';

// Truncate "City, Full Country" to "City, USA"
function compactLocation(loc) {
  if (!loc) return '';
  const parts = loc.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) return parts[0]?.toUpperCase() || '';
  const city = parts[0];
  let region = parts[1];
  const stateMap = {
    'united states of america': 'USA',
    'united states': 'USA',
    'united kingdom': 'UK',
  };
  const lower = region.toLowerCase();
  if (stateMap[lower]) region = stateMap[lower];
  if (region.length > 3) region = region.split(' ')[0];
  return `${city.toUpperCase()}, ${region.toUpperCase()}`;
}

function SectionLabel({ number, label }) {
  return (
    <div className="flex items-center gap-3 mb-6">
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

function ArtistCard({ artist, year, locDisplay, compact = false }) {
  return (
    <div className="flex gap-5 items-start">
      {artist.photoUrl && (
        <div
          className={`shrink-0 overflow-hidden rounded-full ${compact ? 'w-16 h-16' : 'w-20 h-20 md:w-24 md:h-24'}`}
          style={{ border: `1px solid ${STUDIO.borderStrong}` }}
        >
          <img src={artist.photoUrl} alt={artist.artistName} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div
          className="font-black leading-[1] tracking-tighter break-words"
          style={{
            fontFamily: STUDIO_FONTS.display,
            fontSize: compact ? 'clamp(1.5rem, 5vw, 2rem)' : 'clamp(1.75rem, 5.5vw, 2.25rem)',
          }}
        >
          {artist.artistName}
        </div>

        {artist.genres && artist.genres.length > 0 && (
          <div
            className="mt-2 text-[10px] tracking-[0.3em] uppercase font-bold"
            style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}
          >
            {artist.genres.join(' · ')}
          </div>
        )}

        {locDisplay && (
          <div
            className="mt-1.5 text-[10px] tracking-[0.3em] uppercase truncate"
            style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
          >
            ◉ {locDisplay} · EST {year}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudioProfile() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [claimable, setClaimable] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadArtist(handle).then(async (a) => {
      setArtist(a);
      setLoading(false);
      if (a) {
        trackEvent(handle, 'view');
        // Check if profile is unclaimed (no password yet) → show Claim button
        const status = await checkHandle(handle);
        setClaimable(status.exists && !status.claimed);
        setIsOwner(isOwnerOf(handle));
      }
    });
  }, [handle]);

  const featuredRelease = artist?.releases?.[0];
  const otherReleases = artist?.releases?.slice(1) || [];

  const share = async () => {
    const url = `${window.location.origin}/studio/${handle}`;
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
  const releaseIsHero = !!featuredRelease;
  const year = new Date(artist.createdAt || Date.now()).getFullYear();
  const locDisplay = compactLocation(artist.location);

  return (
    <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="pb-20">
      <StudioNav minimal />

      {/* Vol/Issue stamp */}
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-2">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block px-2 py-1"
          style={{
            border: `1px solid ${STUDIO.borderStrong}`,
            transform: 'rotate(-3deg)',
            fontFamily: STUDIO_FONTS.mono,
            fontSize: 9,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: STUDIO.muted,
          }}
        >
          VOL. 01 / ISSUE 04 · {year}
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-12">

        {releaseIsHero ? (
          <>
            {/* Release headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.1 }}
              className="mb-8 mt-4"
            >
              <span
                className="text-[10px] tracking-[0.35em] uppercase font-bold block mb-2"
                style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
              >
                A new release from {artist.artistName}
              </span>
              <h1
                className="font-black leading-[0.9] tracking-tighter break-words"
                style={{
                  fontFamily: STUDIO_FONTS.display,
                  fontSize: 'clamp(3rem, 9vw, 5.5rem)',
                }}
              >
                {featuredRelease.trackTitle}
              </h1>
            </motion.div>

            {/* ARTIST CARD — now right under the headline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: LUXURY_EASE, delay: 0.25 }}
              className="mb-6 pb-6"
              style={{ borderBottom: `1px solid ${STUDIO.border}` }}
            >
              <ArtistCard artist={artist} year={year} locDisplay={locDisplay} compact />

              {artist.bio && (
                <div
                  className="mt-5 pl-5 py-1"
                  style={{ borderLeft: `2px solid ${STUDIO.accent}` }}
                >
                  <p
                    className="text-base md:text-lg leading-snug"
                    style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}
                  >
                    {artist.bio}
                  </p>
                </div>
              )}

              {/* Inline share/analytics */}
              <div className="flex items-center gap-2 mt-5 flex-wrap">
                <button
                  onClick={share}
                  className="text-[10px] tracking-[0.3em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
                  style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink }}
                >
                  {copied ? '✓ Copied' : 'Share ↗'}
                </button>
                <Link
                  to={`/studio/${handle}/analytics`}
                  className="text-[10px] tracking-[0.3em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
                  style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
                >
                  Analytics
                </Link>
                {claimable && !isOwner && (
                  <button
                    onClick={() => setShowClaim(true)}
                    className="text-[10px] tracking-[0.3em] uppercase font-bold px-3 py-1.5 hover:scale-[1.02] transition-all"
                    style={{ background: STUDIO.accent, color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }}
                  >
                    🔒 Claim profile
                  </button>
                )}
                {isOwner && (
                  <>
                    <button
                      onClick={() => { logout(); setIsOwner(false); }}
                      className="text-[10px] tracking-[0.3em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
                      style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
                    >
                      Log out
                    </button>
                  </>
                )}
              </div>
            </motion.div>

            {/* Presave/Player block */}
            <div className="mb-12">
              <PresaveBlock
                release={featuredRelease}
                artistName={artist.artistName}
                onPlay={() => trackEvent(handle, 'audio_play', { trackTitle: featuredRelease.trackTitle })}
                onPresaveClick={() => trackEvent(handle, 'presave_click', { trackTitle: featuredRelease.trackTitle })}
              />
            </div>
          </>
        ) : (
          // No release — artist info IS the hero
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: LUXURY_EASE }}
            className="mb-12 mt-4"
          >
            {artist.photoUrl && (
              <div
                className="w-32 h-32 md:w-40 md:h-40 mb-6 overflow-hidden rounded-full"
                style={{ border: `1px solid ${STUDIO.borderStrong}` }}
              >
                <img src={artist.photoUrl} alt={artist.artistName} className="w-full h-full object-cover" />
              </div>
            )}

            <h1
              className="font-black leading-[0.9] tracking-tighter break-words mb-3"
              style={{
                fontFamily: STUDIO_FONTS.display,
                fontSize: 'clamp(3rem, 9vw, 5.5rem)',
              }}
            >
              {artist.artistName}
            </h1>

            {artist.genres && artist.genres.length > 0 && (
              <div
                className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2"
                style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}
              >
                {artist.genres.join(' · ')}
              </div>
            )}

            {locDisplay && (
              <div
                className="text-[10px] tracking-[0.3em] uppercase mb-6 truncate"
                style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
              >
                ◉ {locDisplay} · EST {year}
              </div>
            )}

            {artist.bio && (
              <div className="pl-5 py-1" style={{ borderLeft: `2px solid ${STUDIO.accent}` }}>
                <p
                  className="text-lg md:text-xl leading-snug max-w-md"
                  style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}
                >
                  {artist.bio}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 mt-6 flex-wrap">
              <button
                onClick={share}
                className="text-[10px] tracking-[0.3em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
                style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink }}
              >
                {copied ? '✓ Copied' : 'Share ↗'}
              </button>
              <Link
                to={`/studio/${handle}/analytics`}
                className="text-[10px] tracking-[0.3em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
                style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
              >
                Analytics
              </Link>
              {claimable && !isOwner && (
                <button
                  onClick={() => setShowClaim(true)}
                  className="text-[10px] tracking-[0.3em] uppercase font-bold px-3 py-1.5 hover:scale-[1.02] transition-all"
                  style={{ background: STUDIO.accent, color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }}
                >
                  🔒 Claim profile
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => { logout(); setIsOwner(false); }}
                  className="text-[10px] tracking-[0.3em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
                  style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
                >
                  Log out
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Discography */}
        {otherReleases.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <SectionLabel number="02" label="Discography" />
            <div className="space-y-2">
              {otherReleases.map((r, i) => (
                <div
                  key={r.id || i}
                  className="flex items-center gap-4 py-3 border-b"
                  style={{ borderColor: STUDIO.border }}
                >
                  <span
                    className="text-[10px] tracking-[0.2em] tabular-nums shrink-0"
                    style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted, width: 24 }}
                  >
                    {String(i + 2).padStart(2, '0')}
                  </span>
                  <span
                    className="flex-1 font-bold truncate"
                    style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}
                  >
                    {r.trackTitle}
                  </span>
                  {r.presaveUrl && (
                    <a
                      href={r.presaveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] tracking-[0.25em] uppercase font-bold opacity-60 hover:opacity-100"
                      style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}
                    >
                      Listen →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Music links */}
        {artist.links && artist.links.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="mt-12"
          >
            <SectionLabel number={otherReleases.length > 0 ? '03' : '02'} label="Listen Everywhere" />
            <div className="space-y-3">
              {artist.links.map((l, i) => (
                <MusicLinkButton
                  key={i}
                  label={l.label}
                  url={l.url}
                  color={l.color}
                  index={i}
                  onClick={() => trackEvent(handle, 'link_click', { platform: l.label, url: l.url })}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Socials */}
        {socialEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <SectionLabel
              number={
                (otherReleases.length > 0 ? 1 : 0) +
                (artist.links?.length > 0 ? 1 : 0) +
                2 < 10
                  ? String((otherReleases.length > 0 ? 1 : 0) + (artist.links?.length > 0 ? 1 : 0) + 2).padStart(2, '0')
                  : '0X'
              }
              label="Off the record"
            />
            <div className="flex flex-wrap gap-2">
              {socialEntries.map(([id, url]) => {
                const platform = SOCIAL_PLATFORMS.find((p) => p.id === id);
                return (
                  <a
                    key={id}
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent(handle, 'link_click', { platform: id, url })}
                    className="text-[10px] tracking-[0.3em] uppercase font-bold px-4 py-2 border hover:scale-[1.02] transition-all"
                    style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink, borderColor: STUDIO.border }}
                  >
                    {platform?.label || id} ↗
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Footer credit */}
        <div
          className="mt-24 pt-8 border-t flex items-center justify-between text-[9px] tracking-[0.35em] uppercase"
          style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
        >
          <span>Pressed at Plinks Studio</span>
          <Link to="/studio/new" className="hover:opacity-100 hover:underline">Claim yours →</Link>
        </div>
      </div>

      {showClaim && (
        <ClaimModal
          handle={handle}
          type="artist"
          theme="dark"
          onClose={() => setShowClaim(false)}
          onClaimed={() => {
            setShowClaim(false);
            setClaimable(false);
            setIsOwner(true);
          }}
        />
      )}
    </div>
  );
}
