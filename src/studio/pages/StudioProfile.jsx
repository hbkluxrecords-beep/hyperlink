import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import StudioNav from '../components/StudioNav.jsx';
import PresaveBlock from '../components/PresaveBlock.jsx';
import MusicLinkButton from '../components/MusicLinkButton.jsx';
import { STUDIO, STUDIO_FONTS, SOCIAL_PLATFORMS } from '../lib/studioDesign.js';
import { LUXURY_EASE, staggerContainer, staggerItem } from '../lib/animations.js';
import { loadArtist, trackEvent } from '../lib/studioStorage.js';

// Truncate "City, Full Country" to "City, ST"
function compactLocation(loc) {
  if (!loc) return '';
  // Take everything before first comma (city), then short region after
  const parts = loc.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) return parts[0]?.toUpperCase() || '';
  const city = parts[0];
  let region = parts[1];
  // Map common full names to abbreviations
  const stateMap = {
    'united states of america': 'USA',
    'united states': 'USA',
    'united kingdom': 'UK',
  };
  const lower = region.toLowerCase();
  if (stateMap[lower]) region = stateMap[lower];
  // If region is a 2-letter code, keep it. Otherwise truncate to first word
  if (region.length > 3) region = region.split(' ')[0];
  return `${city.toUpperCase()}, ${region.toUpperCase()}`;
}

function SectionLabel({ number, label }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span
        className="text-[10px] tracking-[0.3em] uppercase font-bold"
        style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}
      >
        § {number}
      </span>
      <span
        className="text-[10px] tracking-[0.3em] uppercase font-bold"
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

  const { scrollY } = useScroll();
  const photoParallax = useTransform(scrollY, [0, 600], [0, -60]);

  useEffect(() => {
    setLoading(true);
    loadArtist(handle).then((a) => {
      setArtist(a);
      setLoading(false);
      if (a) trackEvent(handle, 'view');
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

      {/* Vol/Issue stamp - top of page like main site */}
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

        {/* HERO: Release if exists, otherwise artist */}
        {releaseIsHero ? (
          <>
            {/* Release headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.1 }}
              className="mb-6 mt-4"
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

            {/* Presave/Player block */}
            <div className="mb-16">
              <PresaveBlock
                release={featuredRelease}
                artistName={artist.artistName}
                onPlay={() => trackEvent(handle, 'audio_play', { trackTitle: featuredRelease.trackTitle })}
                onPresaveClick={() => trackEvent(handle, 'presave_click', { trackTitle: featuredRelease.trackTitle })}
              />
            </div>

            {/* Artist credit (below the music) */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <SectionLabel number="02" label="The Artist" />

              <div className="flex gap-5 items-start">
                {artist.photoUrl && (
                  <motion.div
                    style={{ y: photoParallax }}
                    className="shrink-0 overflow-hidden"
                  >
                    <div
                      className="w-24 h-24 md:w-32 md:h-32 overflow-hidden rounded-full"
                      style={{ border: `1px solid ${STUDIO.borderStrong}` }}
                    >
                      <img src={artist.photoUrl} alt={artist.artistName} className="w-full h-full object-cover" />
                    </div>
                  </motion.div>
                )}

                <div className="flex-1 min-w-0">
                  <h2
                    className="font-black leading-[0.95] tracking-tighter break-words"
                    style={{
                      fontFamily: STUDIO_FONTS.display,
                      fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                    }}
                  >
                    {artist.artistName}
                  </h2>

                  {/* Genre line - liner notes style */}
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

              {/* Bio as magazine pull-quote, no italic quote marks */}
              {artist.bio && (
                <div
                  className="mt-6 pl-5 py-1"
                  style={{ borderLeft: `2px solid ${STUDIO.accent}` }}
                >
                  <p
                    className="text-lg md:text-xl leading-snug"
                    style={{
                      fontFamily: STUDIO_FONTS.display,
                      color: STUDIO.ink,
                      fontWeight: 400,
                    }}
                  >
                    {artist.bio}
                  </p>
                </div>
              )}
            </motion.div>
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
          </motion.div>
        )}

        {/* Share/Analytics buttons */}
        <div className="flex items-center gap-2 mt-8 mb-8">
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
        </div>

        {/* Tracklist - other releases as vinyl back cover style */}
        {otherReleases.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <SectionLabel number="03" label="Discography" />
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
            className="mt-16"
          >
            <SectionLabel number={otherReleases.length > 0 ? '04' : '03'} label="Listen Everywhere" />
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
            className="mt-16"
          >
            <SectionLabel
              number={otherReleases.length > 0 ? '05' : '04'}
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

        {/* Footer credit - record label imprint style */}
        <div
          className="mt-24 pt-8 border-t flex items-center justify-between text-[9px] tracking-[0.35em] uppercase"
          style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
        >
          <span>Pressed at Plinks Studio</span>
          <Link to="/studio/new" className="hover:opacity-100 hover:underline">Claim yours →</Link>
        </div>
      </div>
    </div>
  );
}
