import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import StudioNav from '../components/StudioNav.jsx';
import PresaveBlock from '../components/PresaveBlock.jsx';
import MusicLinkButton from '../components/MusicLinkButton.jsx';
import { STUDIO, STUDIO_FONTS, SOCIAL_PLATFORMS } from '../lib/studioDesign.js';
import { LUXURY_EASE, staggerContainer, staggerItem } from '../lib/animations.js';
import { loadArtist, trackEvent } from '../lib/studioStorage.js';

export default function StudioProfile() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadArtist(handle).then((a) => {
      setArtist(a);
      setLoading(false);
      if (a) trackEvent(handle, 'view');
    });
  }, [handle]);

  const featuredRelease = artist?.releases?.[0];

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

  return (
    <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="pb-20">
      <StudioNav minimal />

      <div className="max-w-2xl mx-auto px-6 pt-32 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: LUXURY_EASE }}
          className="text-center mb-12"
        >
          {artist.photoUrl && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: LUXURY_EASE }}
              className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-6 overflow-hidden rounded-full"
              style={{ border: `2px solid ${STUDIO.borderStrong}` }}
            >
              <img src={artist.photoUrl} alt={artist.artistName} className="w-full h-full object-cover" />
            </motion.div>
          )}

          <h1
            className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tighter mb-3 break-words"
            style={{ fontFamily: STUDIO_FONTS.display }}
          >
            {artist.artistName}
          </h1>

          {artist.genres && artist.genres.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
              {artist.genres.map((g) => (
                <span
                  key={g}
                  className="text-[10px] tracking-[0.25em] uppercase font-bold px-2 py-1 border"
                  style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent, borderColor: STUDIO.accent }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {artist.location && (
            <div className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
              ◉ {artist.location}
            </div>
          )}

          {artist.bio && (
            <p className="text-base md:text-lg leading-snug opacity-80 max-w-md mx-auto" style={{ fontFamily: STUDIO_FONTS.display, fontStyle: 'italic' }}>
              "{artist.bio}"
            </p>
          )}

          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={share}
              className="text-[10px] tracking-[0.25em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
              style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink }}
            >
              {copied ? '✓ Copied' : 'Share ↗'}
            </button>
            <Link
              to={`/studio/${handle}/analytics`}
              className="text-[10px] tracking-[0.25em] uppercase font-bold border px-3 py-1.5 hover:scale-[1.02] transition-all"
              style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
            >
              Analytics
            </Link>
          </div>
        </motion.div>

        {/* Featured release */}
        {featuredRelease && (
          <div className="mb-12">
            <PresaveBlock
              release={featuredRelease}
              artistName={artist.artistName}
              onPlay={() => trackEvent(handle, 'audio_play', { trackTitle: featuredRelease.trackTitle })}
              onPresaveClick={() => trackEvent(handle, 'presave_click', { trackTitle: featuredRelease.trackTitle })}
            />
          </div>
        )}

        {/* Music links */}
        {artist.links && artist.links.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            <motion.div
              variants={staggerItem}
              className="flex items-center gap-3 mb-4"
            >
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                ◐ Listen
              </span>
              <div className="flex-1 h-px" style={{ background: STUDIO.border }} />
            </motion.div>
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
          </motion.div>
        )}

        {/* Socials */}
        {socialEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 pt-8 border-t"
            style={{ borderColor: STUDIO.border }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                ✦ Socials
              </span>
              <div className="flex-1 h-px" style={{ background: STUDIO.border }} />
            </div>
            <div className="flex flex-wrap gap-3">
              {socialEntries.map(([id, url]) => {
                const platform = SOCIAL_PLATFORMS.find((p) => p.id === id);
                return (
                  <a
                    key={id}
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent(handle, 'link_click', { platform: id, url })}
                    className="text-xs tracking-[0.25em] uppercase font-bold px-4 py-2 border hover:scale-[1.02] transition-all"
                    style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink, borderColor: STUDIO.border }}
                  >
                    {platform?.label || id} ↗
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Colophon */}
        <div className="mt-20 pt-8 border-t flex items-center justify-between text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
          <span>via Plinks Studio</span>
          <Link to="/studio/new" className="hover:opacity-100 hover:underline">Make yours →</Link>
        </div>
      </div>
    </div>
  );
}
