import { useRef, useState, useEffect } from 'react';

/**
 * Swipe-based pager. Two screens: main profile + discography.
 * Uses native scroll-snap for buttery iOS-style swipes.
 */
export default function ProfileSwipePager({ accent = '#FF4D1F', mainSlide, discographySlide, hasTracks }) {
  const scrollRef = useRef(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth;
      if (!w) return;
      const p = Math.round(el.scrollLeft / w);
      if (p !== page) setPage(p);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [page]);

  const goTo = (i) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  // No tracks = just render the main view, no pager
  if (!hasTracks) {
    return <>{mainSlide}</>;
  }

  return (
    <div className="relative">
      {/* Page indicator - fixed top */}
      <div
        className="fixed top-[68px] left-1/2 z-30 flex items-center gap-2 px-3 py-1.5"
        style={{
          transform: 'translateX(-50%)',
          background: 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 999,
        }}
      >
        <button
          onClick={() => goTo(0)}
          aria-label="Profile"
          className="text-[9px] tracking-[0.3em] uppercase font-bold transition-opacity"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            color: page === 0 ? accent : '#8A8680',
            opacity: page === 0 ? 1 : 0.5,
          }}
        >
          PROFILE
        </button>
        <span style={{ color: '#3A3A3A' }}>·</span>
        <button
          onClick={() => goTo(1)}
          aria-label="Discography"
          className="text-[9px] tracking-[0.3em] uppercase font-bold transition-opacity flex items-center gap-1"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            color: page === 1 ? accent : '#8A8680',
            opacity: page === 1 ? 1 : 0.5,
          }}
        >
          MUSIC
        </button>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <div className="min-w-full snap-start snap-always">{mainSlide}</div>
        <div className="min-w-full snap-start snap-always">{discographySlide}</div>
      </div>
    </div>
  );
}
