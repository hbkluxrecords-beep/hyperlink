import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Grain, Stamp } from '../components/Primitives.jsx';
import { ACCENT, INK, PAPER, PAPER_DEEP, CATEGORIES } from '../lib/design.js';
import { loadRecentProfiles } from '../lib/storage.js';

export default function Landing() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    loadRecentProfiles(12).then(setRecent);
  }, []);

  return (
    <div className="min-h-screen relative" style={{ background: PAPER, color: INK }}>
      <Grain />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 border-b-2" style={{ borderColor: INK }}>
        <Link to="/" className="flex items-center gap-3">
          <div
            className="w-8 h-8 flex items-center justify-center font-black text-lg"
            style={{ background: INK, color: PAPER, fontFamily: '"JetBrains Mono", monospace' }}
          >
            H
          </div>
          <span className="font-black text-xl tracking-tighter" style={{ fontFamily: '"Fraunces", serif' }}>
            HYPERLINK
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-xs tracking-[0.2em] uppercase font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          <Link to="/" className="hover:underline">Index</Link>
          <Link to="/explore" className="hover:underline">Directory</Link>
          <Link to="/find" className="hover:underline">Find</Link>
        </div>
        <Link
          to="/new"
          className="px-4 py-2 text-xs tracking-[0.2em] uppercase font-bold border-2 hover:scale-[1.02] active:scale-95 transition-transform"
          style={{ borderColor: INK, background: ACCENT, color: PAPER, fontFamily: '"JetBrains Mono", monospace' }}
        >
          Claim Page →
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative px-6 md:px-12 pt-12 md:pt-20 pb-24 overflow-hidden">
        <div className="hidden lg:block absolute right-12 top-12 bottom-12 w-px" style={{ background: INK, opacity: 0.2 }} />
        <div className="hidden lg:flex absolute right-4 top-24 flex-col gap-2 text-[10px] tracking-[0.3em] uppercase font-bold rotate-90 origin-top-right" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          <span>VOL. 01 — ISSUE 04 / 2026</span>
        </div>

        <div className="max-w-6xl">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Stamp rotate={-3} bg={ACCENT} color={PAPER}>ISSUE №01</Stamp>
            <Stamp rotate={1.5}>FOR THE PEOPLE WHO MAKE THINGS</Stamp>
            <Stamp rotate={-1} bg={INK} color={PAPER}>EST. 2026</Stamp>
          </div>

          <h1
            className="font-black leading-[0.85] tracking-[-0.04em] mb-8"
            style={{ fontFamily: '"Fraunces", serif', fontSize: 'clamp(3.5rem, 11vw, 11rem)' }}
          >
            One link.<br />
            <span style={{ fontStyle: 'italic', fontWeight: 300 }}>Every</span>{' '}
            <span style={{ color: ACCENT }}>thing.</span>
          </h1>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl">
            <p className="md:col-span-2 text-lg md:text-2xl leading-snug font-light" style={{ fontFamily: '"Fraunces", serif' }}>
              A homepage for streamers, musicians, creators, and developers who refuse to
              choose between platforms. Print-shop aesthetics. Built for clicks.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/new"
                className="px-5 py-4 text-sm tracking-[0.25em] uppercase font-bold border-2 text-left flex items-center justify-between hover:translate-x-1 transition-transform"
                style={{ borderColor: INK, background: INK, color: PAPER, fontFamily: '"JetBrains Mono", monospace' }}
              >
                <span>Make yours</span><span>→</span>
              </Link>
              <Link
                to="/explore"
                className="px-5 py-4 text-sm tracking-[0.25em] uppercase font-bold border-2 text-left flex items-center justify-between hover:translate-x-1 transition-transform"
                style={{ borderColor: INK, background: 'transparent', color: INK, fontFamily: '"JetBrains Mono", monospace' }}
              >
                <span>Browse the directory</span><span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories ribbon */}
      <section className="relative border-t-2 border-b-2 overflow-hidden" style={{ borderColor: INK, background: INK, color: PAPER }}>
        <div className="flex animate-marquee whitespace-nowrap py-5 text-2xl md:text-3xl font-black tracking-tight" style={{ fontFamily: '"Fraunces", serif' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              {CATEGORIES.map((c) => (
                <span key={c.id + i} className="flex items-center gap-4">
                  <span style={{ color: ACCENT }}>{c.icon}</span>
                  <span style={{ fontStyle: 'italic', fontWeight: 300 }}>{c.label}</span>
                  <span style={{ color: ACCENT }}>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Triptych */}
      <section className="px-6 md:px-12 py-20 md:py-28 relative">
        <div className="flex items-center gap-3 mb-12">
          <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>§ 01</span>
          <div className="flex-1 h-px" style={{ background: INK }} />
          <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>WHY HYPERLINK</span>
        </div>

        <div className="grid md:grid-cols-3 gap-px" style={{ background: INK }}>
          {[
            { n: '01', t: 'Designed,\nnot defaulted', b: 'Editorial typography. Riso textures. Layouts with a point of view — not the same template everyone else uses.' },
            { n: '02', t: 'For makers\nspecifically', b: 'Streamer schedules. Musician releases. Dev repos. Creator socials. Category-aware blocks, not just rounded rectangles.' },
            { n: '03', t: 'Yours in\nninety seconds', b: 'Pick a handle, pick a category, paste your links. Share the URL. No accounts, no upsells, no purple gradient.' },
          ].map((f) => (
            <div key={f.n} className="p-8 md:p-10" style={{ background: PAPER }}>
              <div className="text-5xl font-black mb-6" style={{ fontFamily: '"Fraunces", serif', color: ACCENT }}>{f.n}</div>
              <h3 className="text-2xl md:text-3xl font-black leading-tight mb-4 whitespace-pre-line" style={{ fontFamily: '"Fraunces", serif' }}>{f.t}</h3>
              <p className="text-sm leading-relaxed opacity-80">{f.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent */}
      {recent.length > 0 && (
        <section className="px-6 md:px-12 py-16 border-t-2" style={{ borderColor: INK, background: PAPER_DEEP }}>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>§ 02</span>
            <div className="flex-1 h-px" style={{ background: INK }} />
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>RECENTLY PUBLISHED</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((p) => (
              <Link
                key={p.handle}
                to={`/${p.handle}`}
                className="px-4 py-2 border-2 text-sm font-bold hover:bg-black hover:text-white transition-colors"
                style={{ borderColor: INK, fontFamily: '"JetBrains Mono", monospace' }}
              >
                /{p.handle}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 border-t-2 flex flex-wrap items-end justify-between gap-6" style={{ borderColor: INK }}>
        <div>
          <div className="text-4xl md:text-5xl font-black leading-none tracking-tighter" style={{ fontFamily: '"Fraunces", serif' }}>
            HYPER<span style={{ color: ACCENT, fontStyle: 'italic', fontWeight: 300 }}>link</span>
          </div>
          <div className="text-[10px] tracking-[0.3em] uppercase mt-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Printed in the browser · {new Date().getFullYear()}
          </div>
        </div>
        <div className="text-[10px] tracking-[0.3em] uppercase opacity-60 max-w-xs text-right" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          A home for everyone who has more than one URL worth sharing.
        </div>
      </footer>
    </div>
  );
}
