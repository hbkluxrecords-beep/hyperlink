import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import AuthButton from '../components/AuthButton.jsx';
import TopNav from '../components/TopNav.jsx';
import MiniPreviewPlayer from '../components/MiniPreviewPlayer.jsx';
import { loadRecentProfiles } from '../lib/storage.js';
import { loadRecentArtists } from '../studio/lib/studioStorage.js';
import { listFeatured } from '../lib/admin.js';
import BrandIntro from '../components/BrandIntro.jsx';

const BG = '#0A0A0A';
const SURFACE = '#141414';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const ACCENT = '#FF4D1F';
const BORDER = 'rgba(255,255,255,0.08)';
const BORDER_STRONG = 'rgba(255,255,255,0.18)';
const DISPLAY = '"Fraunces", serif';
const MONO = '"JetBrains Mono", monospace';

const EASE = [0.22, 1, 0.36, 1];

function ChooserCard({ to, eyebrow, headline, subline, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      <Link to={to} className="block group relative overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER_STRONG}` }}>
        {/* Hover accent fill */}
        <motion.div
          className="absolute inset-0 origin-bottom"
          style={{ background: accent, opacity: 0 }}
          whileHover={{ opacity: 0.06 }}
          transition={{ duration: 0.4 }}
        />

        <div className="relative p-8 md:p-10 min-h-[280px] md:min-h-[400px] flex flex-col justify-between">
          <div>
            <div
              className="text-[10px] tracking-[0.35em] uppercase font-bold mb-4"
              style={{ fontFamily: MONO, color: accent }}
            >
              {eyebrow}
            </div>
            <h2
              className="font-black leading-[0.9] tracking-tight"
              style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', color: INK }}
            >
              {headline}
            </h2>
            <p
              className="mt-4 text-base md:text-lg max-w-sm"
              style={{ fontFamily: DISPLAY, color: MUTED }}
            >
              {subline}
            </p>
          </div>

          <div
            className="flex items-center justify-between text-[10px] tracking-[0.3em] uppercase font-bold mt-8"
            style={{ fontFamily: MONO, color: INK }}
          >
            <span>Start here</span>
            <motion.span
              className="text-2xl"
              style={{ color: accent }}
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              →
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Landing() {
  const [recent, setRecent] = useState([]);
  const [recentArtists, setRecentArtists] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    loadRecentProfiles(6).then(setRecent);
    loadRecentArtists(6).then(setRecentArtists);
    listFeatured().then(setFeatured);
  }, []);

  return (
    <div style={{ background: BG, color: INK, minHeight: '100vh' }}>
      <BrandIntro />
      <TopNav />

      {/* FEATURED ARTISTS - moved to TOP */}
      {featured.length > 0 && (
        <section className="px-6 md:px-12 pt-24 md:pt-28 pb-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-[10px] tracking-[0.35em] uppercase font-bold mb-3" style={{ fontFamily: MONO, color: ACCENT }}>
              ◆ FEATURED THIS WEEK
            </div>
            <h2 className="font-black tracking-tight mb-6" style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: INK }}>
              On <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>rotation.</span>
            </h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-6 md:-mx-12 px-6 md:px-12">
              {featured.map((f, i) => (
                <motion.div
                  key={`${f.type}-${f.handle}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="shrink-0"
                  style={{ width: 220 }}
                >
                  <Link
                    to={`/${f.handle}`}
                    className="block group hover:scale-[1.02] transition-transform"
                    style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                  >
                    <div className="aspect-square overflow-hidden" style={{ background: '#0A0A0A' }}>
                      {f.photoUrl ? (
                        <img src={f.photoUrl} alt={f.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-black opacity-30" style={{ fontFamily: DISPLAY, color: INK }}>
                            {(f.name || '?')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-[9px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO, color: ACCENT }}>
                        {f.type === 'artist' ? '◆ ARTIST' : 'CREATOR'}
                      </div>
                      <div className="font-black tracking-tight mt-1 truncate" style={{ fontFamily: DISPLAY, color: INK }}>
                        {f.name}
                      </div>
                      <div className="text-[10px] tracking-[0.25em] uppercase opacity-60 mt-0.5 mb-2" style={{ fontFamily: MONO, color: MUTED }}>
                        /{f.handle}
                      </div>
                      {f.type === 'artist' && (
                        <MiniPreviewPlayer
                          id={`featured-${f.handle}`}
                          coverUrl={f.coverArtUrl || f.photoUrl}
                          audioUrl={f.audioPreviewUrl}
                          trackTitle={f.trackTitle}
                        />
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HERO: chooser */}
      <section className={`px-6 md:px-12 ${featured.length > 0 ? 'pt-6' : 'pt-24 md:pt-32'} pb-20`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-[10px] tracking-[0.35em] uppercase font-bold mb-4"
              style={{ fontFamily: MONO, color: ACCENT }}
            >
              ONE LINK · ALL YOUR WORK
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
              className="font-black leading-[0.88] tracking-tighter"
              style={{ fontFamily: DISPLAY, fontSize: 'clamp(3rem, 12vw, 7rem)', color: INK }}
            >
              Who are <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>you?</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-5 text-base md:text-lg opacity-75 max-w-md mx-auto"
              style={{ fontFamily: DISPLAY }}
            >
              Two flavors of plinks — one built for music, one for everything else. Pick yours.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <ChooserCard
              to="/studio"
              eyebrow="ARTISTS · MUSICIANS"
              headline={<>Plinks <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>Studio.</span></>}
              subline="Audio previews, presave countdowns, real analytics. Built for rappers, producers, indie artists."
              accent={ACCENT}
              delay={0.65}
            />
            <ChooserCard
              to="/new"
              eyebrow="STREAMERS · CREATORS · DEVS"
              headline={<>Plinks <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>Bio.</span></>}
              subline="One clean link-in-bio for everything you do. Streamers, social media, developers."
              accent={ACCENT}
              delay={0.8}
            />
          </div>
        </motion.div>
      </section>

      {/* WHY PLINKS */}
      <section className="px-6 md:px-12 py-16 md:py-24" style={{ background: SURFACE }}>
        <div className="max-w-5xl mx-auto">
          <div
            className="text-[10px] tracking-[0.35em] uppercase font-bold mb-4"
            style={{ fontFamily: MONO, color: ACCENT }}
          >
            § 02 · WHY PLINKS
          </div>
          <h2
            className="font-black leading-[0.9] tracking-tight mb-12"
            style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: INK }}
          >
            Most platforms charge monthly.<br />
            <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>We don't.</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'FREE FOREVER', detail: 'Every feature on the free tier. No trial. No watermark. No catch.' },
              { label: 'ZERO FEES', detail: 'Most platforms take a cut of every sale. We take 0%, ever.' },
              { label: 'YOUR NAME', detail: 'plinks.dev/yourname — no branding, no ads, no algorithm.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: EASE }}
                className="p-6"
                style={{ background: BG, border: `1px solid ${BORDER}` }}
              >
                <div
                  className="text-[10px] tracking-[0.3em] uppercase font-bold mb-3"
                  style={{ fontFamily: MONO, color: ACCENT }}
                >
                  {item.label}
                </div>
                <p style={{ fontFamily: DISPLAY, color: INK }} className="text-base leading-snug">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              to="/upgrade"
              className="inline-block text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70 transition-opacity"
              style={{ fontFamily: MONO, color: MUTED }}
            >
              See premium tier →
            </Link>
          </div>
        </div>
      </section>

      {/* RECENT */}
      {(recent.length > 0 || recentArtists.length > 0) && (
        <section className="px-6 md:px-12 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <div
              className="text-[10px] tracking-[0.35em] uppercase font-bold mb-4"
              style={{ fontFamily: MONO, color: ACCENT }}
            >
              § 03 · RECENTLY ADDED
            </div>
            <h2
              className="font-black tracking-tight mb-8"
              style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 5vw, 3rem)', color: INK }}
            >
              The <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>roster.</span>
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                ...recentArtists.map((a) => ({ ...a, type: 'artist', displayName: a.artistName || a.handle })),
                ...recent.map((p) => ({ ...p, type: 'creator' })),
              ].slice(0, 6).map((p, i) => (
                <motion.div
                  key={`${p.type}-${p.handle}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }}
                >
                  <Link
                    to={`/${p.handle}`}
                    className="block p-5 group transition-colors"
                    style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                  >
                    <div
                      className="text-[9px] tracking-[0.3em] uppercase font-bold mb-2"
                      style={{ fontFamily: MONO, color: ACCENT }}
                    >
                      {p.type === 'artist' ? 'ARTIST' : 'CREATOR'}
                    </div>
                    <div
                      className="text-xl font-black tracking-tight"
                      style={{ fontFamily: DISPLAY, color: INK }}
                    >
                      {p.displayName}
                    </div>
                    <div
                      className="text-[10px] tracking-[0.25em] uppercase mt-1"
                      style={{ fontFamily: MONO, color: MUTED }}
                    >
                      /{p.handle}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                to="/explore"
                className="text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70 transition-opacity"
                style={{ fontFamily: MONO, color: MUTED }}
              >
                View full directory →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        className="px-6 md:px-12 py-10 border-t"
        style={{ borderColor: BORDER, fontFamily: MONO, color: MUTED }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] tracking-[0.3em] uppercase mb-6">
          <span>© 2026 plinks.dev · built in 2026</span>
          <div className="flex items-center gap-5 flex-wrap">
            <Link to="/upgrade" className="hover:opacity-100 hover:underline">Pricing</Link>
            <Link to="/help" className="hover:opacity-100 hover:underline">Help</Link>
            <Link to="/explore" className="hover:opacity-100 hover:underline">Directory</Link>
            <Link to="/login" className="hover:opacity-100 hover:underline">Log in</Link>
            <Link to="/terms" className="hover:opacity-100 hover:underline">Terms</Link>
            <Link to="/privacy" className="hover:opacity-100 hover:underline">Privacy</Link>
            <a href="mailto:plinksbiz@proton.me" className="hover:opacity-100 hover:underline">Support</a>
          </div>
        </div>
        <div className="text-[9px] leading-relaxed opacity-50 normal-case tracking-normal" style={{ fontFamily: MONO }}>
          Spotify, Apple Music, YouTube, SoundCloud, Tidal, Amazon Music, Deezer, Bandcamp, Instagram, TikTok, X, Facebook, Twitch, Discord, and other third-party names and logos are trademarks of their respective owners. plinks.dev is not affiliated with, sponsored by, or endorsed by any third-party service. References are made under nominative fair use to help users identify destination links.
        </div>
      </footer>
    </div>
  );
}
