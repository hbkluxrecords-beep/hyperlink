import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Grain, Stamp } from '../components/Primitives.jsx';
import { ACCENT, INK, PAPER, CATEGORIES } from '../lib/design.js';
import { loadProfile, saveProfile } from '../lib/storage.js';
import { isOwnerOf } from '../lib/auth.js';

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

  useEffect(() => {
    if (!isOwnerOf(handle)) {
      navigate(`/${handle}`);
      return;
    }
    loadProfile(handle).then((p) => {
      if (!p) {
        navigate(`/${handle}`);
        return;
      }
      setDisplayName(p.displayName || '');
      setBio(p.bio || '');
      setCategory(p.category || 'creator');
      setPinned(p.pinned || { label: '', url: '' });
      setLinks(p.links || []);
      setLoading(false);
    });
  }, [handle, navigate]);

  const updateLink = (i, field, v) =>
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: v } : l)));
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
      if (!result.ok) {
        setErrorMsg(result.error || 'Failed to save');
        setSaving(false);
        return;
      }
      setSavedMsg('Saved ✓');
      setTimeout(() => setSavedMsg(''), 2000);
    } catch (e) {
      setErrorMsg(e.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PAPER, color: INK }}>
        <div className="text-xs tracking-[0.3em] uppercase font-bold animate-pulse" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          Loading editor…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: PAPER, color: INK }}>
      <Grain />

      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b-2 relative z-10" style={{ borderColor: INK }}>
        <Link to={`/${handle}`} className="text-xs tracking-[0.2em] uppercase font-bold hover:underline" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          ← Back to profile
        </Link>
        <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          EDITING · /{handle}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 md:px-12 py-16 md:py-24 relative z-10">
        <div className="mb-12">
          <Stamp rotate={-2}>EDIT MODE</Stamp>
          <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter mt-4" style={{ fontFamily: '"Fraunces", serif' }}>
            Update your <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>profile</span>
          </h1>
        </div>

        {/* Premium upsell */}
        <Link
          to="/upgrade"
          className="block mb-8 p-4 hover:scale-[1.005] transition-transform"
          style={{
            background: 'linear-gradient(135deg, rgba(255,77,31,0.12), rgba(255,77,31,0.04))',
            border: `1px solid ${ACCENT}`,
          }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl">★</span>
            <div className="flex-1 min-w-[200px]">
              <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}>
                Unlock Premium
              </div>
              <div className="text-sm mt-0.5" style={{ fontFamily: '"Fraunces", serif', color: INK }}>
                Custom themes, hover-audio links, drop alerts, fan DMs.
              </div>
            </div>
            <span
              className="text-[10px] tracking-[0.3em] uppercase font-bold"
              style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}
            >
              From $3/mo →
            </span>
          </div>
        </Link>

        <div className="space-y-10">
          {/* Display name */}
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Display Name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full text-3xl md:text-4xl font-black bg-transparent border-b-2 pb-2 outline-none"
              style={{ borderColor: INK, fontFamily: '"Fraunces", serif' }}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={200}
              className="w-full text-lg bg-transparent border-b-2 pb-2 outline-none resize-none"
              style={{ borderColor: INK, fontFamily: '"Fraunces", serif' }}
            />
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold mt-1 text-right opacity-60" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              {bio.length} / 200
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className="text-[10px] tracking-[0.25em] uppercase font-bold px-3 py-1.5 border-2 transition-all"
                  style={{
                    borderColor: INK,
                    background: category === c.id ? ACCENT : 'transparent',
                    color: category === c.id ? PAPER : INK,
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pinned */}
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Pinned Link · optional
            </label>
            <div className="border-2 p-4 grid grid-cols-[1fr_2fr_auto] gap-3 items-center" style={{ borderColor: INK }}>
              <input
                value={pinned.label}
                onChange={(e) => setPinned({ ...pinned, label: e.target.value })}
                placeholder="Label"
                className="bg-transparent outline-none text-base font-bold min-w-0"
                style={{ fontFamily: '"Fraunces", serif' }}
              />
              <input
                value={pinned.url}
                onChange={(e) => setPinned({ ...pinned, url: e.target.value })}
                placeholder="https://"
                className="bg-transparent outline-none text-sm min-w-0"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              />
              <button onClick={() => setPinned({ label: '', url: '' })} className="text-xs opacity-60 hover:opacity-100" style={{ fontFamily: '"JetBrains Mono", monospace' }}>✕</button>
            </div>
          </div>

          {/* Links */}
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Your Links
            </label>
            <div className="space-y-3">
              {links.map((l, i) => (
                <div key={i} className="border-2 p-4 grid grid-cols-[1fr_2fr_auto] gap-3 items-center" style={{ borderColor: INK, background: PAPER }}>
                  <input
                    value={l.label}
                    onChange={(e) => updateLink(i, 'label', e.target.value)}
                    placeholder="Label"
                    className="bg-transparent outline-none text-base font-bold min-w-0"
                    style={{ fontFamily: '"Fraunces", serif' }}
                  />
                  <input
                    value={l.url}
                    onChange={(e) => updateLink(i, 'url', e.target.value)}
                    placeholder="https://"
                    className="bg-transparent outline-none text-sm min-w-0"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  />
                  <button onClick={() => removeLink(i)} className="text-xs opacity-60 hover:opacity-100" style={{ fontFamily: '"JetBrains Mono", monospace' }}>✕</button>
                </div>
              ))}
              <button onClick={addLink} className="w-full border-2 border-dashed py-3 text-xs tracking-[0.2em] uppercase font-bold hover:bg-black hover:text-white hover:border-solid transition-colors" style={{ borderColor: INK, fontFamily: '"JetBrains Mono", monospace' }}>
                + Add another link
              </button>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="mt-16 pt-8 border-t-2" style={{ borderColor: INK }}>
          {errorMsg && (
            <div className="mb-4 px-4 py-3 border-2 text-xs font-bold flex items-center gap-2" style={{ borderColor: ACCENT, color: ACCENT, background: 'rgba(255,77,31,0.06)', fontFamily: '"JetBrains Mono", monospace' }}>
              <span>⚠</span><span>{errorMsg}</span>
            </div>
          )}
          {savedMsg && (
            <div className="mb-4 px-4 py-3 border-2 text-xs font-bold flex items-center gap-2" style={{ borderColor: ACCENT, color: ACCENT, background: 'rgba(255,77,31,0.1)', fontFamily: '"JetBrains Mono", monospace' }}>
              <span>✓</span><span>{savedMsg}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Link to={`/${handle}`} className="text-xs tracking-[0.2em] uppercase font-bold hover:underline" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              ← Cancel
            </Link>
            <button
              onClick={save}
              disabled={saving}
              className="px-6 py-3 text-xs tracking-[0.25em] uppercase font-bold border-2 disabled:opacity-40 hover:scale-[1.02] transition-transform"
              style={{ borderColor: INK, background: ACCENT, color: PAPER, fontFamily: '"JetBrains Mono", monospace' }}
            >
              {saving ? 'Saving…' : 'Save changes →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
