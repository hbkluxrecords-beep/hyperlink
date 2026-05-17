import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import CollapsibleSection from '../components/CollapsibleSection.jsx';
import { CATEGORIES } from '../lib/design.js';
import { loadProfile, saveProfile } from '../lib/storage.js';
import { isOwnerOf } from '../lib/auth.js';
import { isPremium } from '../lib/premium.js';
import { convertToArtist } from '../lib/profileType.js';
import { saveGlowButtons, savePortfolioUrl } from '../lib/premiumFeatures.js';

const BG = '#0A0A0A';
const SURFACE = '#141414';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const ACCENT = '#FF4D1F';
const BORDER = 'rgba(255,255,255,0.08)';
const BORDER_STRONG = 'rgba(255,255,255,0.18)';
const DISPLAY = '"Fraunces", serif';
const MONO = '"JetBrains Mono", monospace';

export default function Edit() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('creator');
  const [pinned, setPinned] = useState({ label: '', url: '' });
  const [links, setLinks] = useState([]);
  const [premium, setPremium] = useState(false);
  const [glowButtons, setGlowButtons] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState('');

  useEffect(() => {
    if (!isOwnerOf(handle)) { navigate(`/${handle}`); return; }
    loadProfile(handle).then((p) => {
      if (!p) { navigate(`/${handle}`); return; }
      setDisplayName(p.displayName || '');
      setBio(p.bio || '');
      setCategory(p.category || 'creator');
      setGlowButtons(!!p.glowButtons);
      setPortfolioUrl(p.portfolioUrl || '');
      setPinned(p.pinned || { label: '', url: '' });
      setLinks(p.links || []);
      setLoading(false);
    });
    isPremium(handle).then(setPremium);
  }, [handle, navigate]);

  const updateLink = (i, field, v) =>
    setLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: v } : l));
  const addLink = () => setLinks((prev) => [...prev, { label: '', url: '' }]);
  const removeLink = (i) => setLinks((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setErrorMsg('');
    setSavedMsg('');
    setSaving(true);
    try {
      const cleanLinks = links.filter((l) => l.label.trim() && l.url.trim());
      const profile = {
        handle: handle.toLowerCase().trim(),
        displayName: displayName.trim() || handle,
        bio: bio.trim(),
        category,
        pinned: pinned.label && pinned.url ? pinned : null,
        links: cleanLinks,
      };
      const result = await saveProfile(profile);
      if (!result.ok) { setErrorMsg(result.error || 'Save failed'); setSaving(false); return; }
      // Premium glow + portfolio
      if (premium) {
        await saveGlowButtons(handle, 'creator', glowButtons);
      }
      await savePortfolioUrl(handle, portfolioUrl.trim() || null);
      setSavedMsg('Saved ✓');
      setTimeout(() => setSavedMsg(''), 2000);
    } catch (e) {
      setErrorMsg(e.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: 'transparent',
    borderBottom: `1px solid ${BORDER}`,
    color: INK,
    fontFamily: DISPLAY,
  };
  const labelStyle = { fontFamily: MONO, color: MUTED };

  if (loading) {
    return (
      <div style={{ background: BG, color: INK, minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-xs tracking-[0.3em] uppercase font-bold animate-pulse" style={labelStyle}>
          Loading editor…
        </div>
      </div>
    );
  }

  const catLabel = (CATEGORIES.find((c) => c.id === category) || CATEGORIES[2]).label;

  return (
    <div style={{ background: BG, color: INK, minHeight: '100vh' }}>
      <nav className="px-5 py-4">
        <Link to="/" className="text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70" style={{ fontFamily: MONO, color: MUTED }}>
          HYPERLINK
        </Link>
      </nav>

      <div className="max-w-lg mx-auto px-5 pt-6 pb-32">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO, color: ACCENT }}>
              EDITING · /{handle}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1" style={{ fontFamily: DISPLAY }}>
              Edit your <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>profile</span>
            </h1>
          </div>
          <Link to={`/${handle}`} className="text-[10px] tracking-[0.25em] uppercase font-bold hover:opacity-70 shrink-0" style={labelStyle}>
            ← Back
          </Link>
        </div>

        {/* Premium upsell - hide for premium users */}
        {!premium && (
          <Link
            to="/upgrade"
            className="block mb-6 p-3 hover:scale-[1.005] transition-transform"
            style={{
              background: 'linear-gradient(135deg, rgba(255,77,31,0.12), rgba(255,77,31,0.04))',
              border: `1px solid ${ACCENT}`,
            }}
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="text-lg">★</span>
              <span className="flex-1" style={{ fontFamily: DISPLAY, color: INK }}>
                Unlock premium features
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO, color: ACCENT }}>
                $3/mo →
              </span>
            </div>
          </Link>
        )}

        {premium && (
          <div
            className="mb-6 p-3"
            style={{
              background: 'linear-gradient(135deg, rgba(255,77,31,0.12), rgba(255,77,31,0.04))',
              border: `1px solid ${ACCENT}`,
            }}
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="text-lg">★</span>
              <span className="flex-1" style={{ fontFamily: DISPLAY, color: INK }}>
                You're a Plinks Premium member
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO, color: ACCENT }}>
                ACTIVE
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <CollapsibleSection
            label="Display Name"
            summary={displayName}
            theme="dark"
          >
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full text-xl font-black pb-2 outline-none"
              style={inputStyle}
            />
          </CollapsibleSection>

          <CollapsibleSection
            label="Bio"
            summary={bio || 'Add a bio'}
            theme="dark"
          >
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={200}
              className="w-full text-base pb-2 outline-none resize-none"
              style={inputStyle}
            />
            <div className="text-[10px] tracking-[0.3em] uppercase mt-1 text-right" style={labelStyle}>
              {bio.length} / 200
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            label="Category"
            summary={catLabel}
            theme="dark"
          >
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className="text-[10px] tracking-[0.25em] uppercase font-bold px-2.5 py-1 border transition-all"
                  style={{
                    borderColor: category === c.id ? ACCENT : BORDER,
                    background: category === c.id ? ACCENT : 'transparent',
                    color: category === c.id ? BG : MUTED,
                    fontFamily: MONO,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            label="Pinned Link"
            summary={pinned.label && pinned.url ? `★ ${pinned.label}` : 'No pinned link'}
            theme="dark"
          >
            <div className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center p-2 border" style={{ borderColor: BORDER }}>
              <input
                value={pinned.label}
                onChange={(e) => setPinned({ ...pinned, label: e.target.value })}
                placeholder="Label"
                className="bg-transparent outline-none text-sm font-bold"
                style={{ fontFamily: DISPLAY, color: INK }}
              />
              <input
                value={pinned.url}
                onChange={(e) => setPinned({ ...pinned, url: e.target.value })}
                placeholder="https://"
                className="bg-transparent outline-none text-xs"
                style={{ fontFamily: MONO, color: MUTED }}
              />
              <button onClick={() => setPinned({ label: '', url: '' })} className="text-xs opacity-60 hover:opacity-100 px-1" style={{ color: MUTED }}>✕</button>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            label="Your Links"
            summary={links.length ? `${links.length} link${links.length === 1 ? '' : 's'}` : 'Add links'}
            theme="dark"
          >
            <div className="space-y-2 mb-3">
              {links.map((l, i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center p-2 border" style={{ borderColor: BORDER }}>
                  <input
                    value={l.label}
                    onChange={(e) => updateLink(i, 'label', e.target.value)}
                    placeholder="Label"
                    className="bg-transparent outline-none text-sm font-bold"
                    style={{ fontFamily: DISPLAY, color: INK }}
                  />
                  <input
                    value={l.url}
                    onChange={(e) => updateLink(i, 'url', e.target.value)}
                    placeholder="https://"
                    className="bg-transparent outline-none text-xs"
                    style={{ fontFamily: MONO, color: MUTED }}
                  />
                  <button onClick={() => removeLink(i)} className="text-xs opacity-60 hover:opacity-100 px-1" style={{ color: MUTED }}>✕</button>
                </div>
              ))}
              <button
                onClick={addLink}
                className="w-full border border-dashed py-2 text-[10px] tracking-[0.2em] uppercase font-bold hover:opacity-100 opacity-70"
                style={{ borderColor: BORDER_STRONG, fontFamily: MONO, color: MUTED }}
              >
                + Add link
              </button>
            </div>
          </CollapsibleSection>

          {/* Premium glow buttons - same as artist profile vibe */}
          {premium && (
            <CollapsibleSection
              label="Glow buttons"
              summary={glowButtons ? '✓ ON · accent pulse' : 'OFF'}
              theme="dark"
            >
              <div className="space-y-3">
                <div className="text-xs leading-relaxed" style={{ color: MUTED, fontFamily: DISPLAY }}>
                  Adds a pulsing accent-colored glow around all your link buttons. Same as the artist profile vibe.
                </div>
                <button
                  onClick={() => setGlowButtons((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 transition-all"
                  style={{
                    background: glowButtons ? 'rgba(255,77,31,0.1)' : 'transparent',
                    border: `2px solid ${glowButtons ? '#FF4D1F' : BORDER_STRONG}`,
                  }}
                >
                  <span className="text-[11px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO, color: glowButtons ? '#FF4D1F' : INK }}>
                    {glowButtons ? '✓ Enabled' : 'Tap to enable'}
                  </span>
                  <span className="w-10 h-5 rounded-full relative transition-colors" style={{ background: glowButtons ? '#FF4D1F' : BORDER_STRONG }}>
                    <span className="absolute top-0.5 w-4 h-4 rounded-full transition-all" style={{
                      background: glowButtons ? INK : MUTED,
                      left: glowButtons ? '22px' : '2px',
                    }} />
                  </span>
                </button>
              </div>
            </CollapsibleSection>
          )}

          {/* Portfolio embed (developers/creators) */}
          <CollapsibleSection
            label="Live portfolio"
            summary={portfolioUrl ? '✓ Embedded' : 'Add your site'}
            theme="dark"
          >
            <div className="space-y-3">
              <div className="text-xs leading-relaxed" style={{ color: MUTED, fontFamily: DISPLAY }}>
                Embed your live portfolio, app, or website right on your profile. Visitors see your actual work — no extra click.
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: MONO, color: MUTED }}>
                  Portfolio URL
                </label>
                <input
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yoursite.com"
                  className="w-full text-base bg-transparent border-b-2 pb-2 outline-none"
                  style={{ borderColor: BORDER_STRONG, color: INK, fontFamily: MONO }}
                />
                <div className="text-[10px] mt-2 opacity-60" style={{ fontFamily: MONO, color: MUTED }}>
                  Note: most sites refuse to be embedded. If yours won't load, set the right CSP headers or use a screenshot link instead.
                </div>
              </div>
              {portfolioUrl && (
                <button
                  onClick={() => setPortfolioUrl('')}
                  className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-60 hover:opacity-100"
                  style={{ fontFamily: MONO, color: MUTED }}
                >
                  ✕ Remove embed
                </button>
              )}
            </div>
          </CollapsibleSection>

          {/* Switch profile type */}
          <CollapsibleSection label="Profile type" summary="Creator · Switch to Artist" theme="dark">
            <div className="space-y-3">
              <div className="text-xs leading-relaxed" style={{ color: '#8A8680', fontFamily: '"Fraunces", serif' }}>
                Make music? Switch to an Artist profile to get audio previews, presaves, and the studio dashboard. Your handle, bio, and premium status stay the same.
              </div>
              <button
                onClick={async () => {
                  if (!confirm(`Switch /${handle} to an ARTIST profile? This converts your account from Creator → Artist. Your links will become socials.`)) return;
                  const r = await convertToArtist(handle);
                  if (r.ok) {
                    alert('Switched to artist! Reloading your new studio edit page.');
                    window.location.href = `/studio/${handle}/edit`;
                  } else {
                    alert('Switch failed: ' + r.error);
                  }
                }}
                className="w-full text-[11px] tracking-[0.3em] uppercase font-bold py-3 transition-transform hover:scale-[1.01]"
                style={{ background: '#FF4D1F', color: '#0A0A0A', fontFamily: '"JetBrains Mono", monospace' }}
              >
                ♪ Switch to Artist →
              </button>
            </div>
          </CollapsibleSection>
        </div>
      </div>

      {/* Sticky save bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-5 py-3 border-t backdrop-blur"
        style={{ background: 'rgba(10,10,10,0.92)', borderColor: BORDER_STRONG }}
      >
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {errorMsg && (
            <div className="flex-1 text-xs truncate" style={{ color: ACCENT, fontFamily: MONO }}>⚠ {errorMsg}</div>
          )}
          {savedMsg && (
            <div className="flex-1 text-xs" style={{ color: ACCENT, fontFamily: MONO }}>{savedMsg}</div>
          )}
          {!errorMsg && !savedMsg && (
            <Link to={`/${handle}`} className="text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70" style={{ fontFamily: MONO, color: MUTED }}>
              ← Cancel
            </Link>
          )}
          <div className="flex-1" />
          <motion.button
            onClick={save}
            disabled={saving}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 text-[11px] tracking-[0.3em] uppercase font-bold disabled:opacity-40"
            style={{ background: ACCENT, color: BG, fontFamily: MONO }}
          >
            {saving ? 'Saving…' : 'Save →'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
