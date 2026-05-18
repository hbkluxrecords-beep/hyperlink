import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grain, Stamp } from '../components/Primitives.jsx';
import { ACCENT, INK, PAPER, PAPER_DEEP, CATEGORIES, LINK_PRESETS } from '../lib/design.js';
import { isHandleTaken, isHandleTakenAnywhere, saveProfile } from '../lib/storage.js';
import { setPasswordForHandle, validatePassword } from '../lib/auth.js';

export default function Create() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('creator');
  const [links, setLinks] = useState([{ label: '', url: '' }]);
  const [pinned, setPinned] = useState({ label: '', url: '' });
  const [handleError, setHandleError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  useEffect(() => {
    if (step === 2 && links.every((l) => !l.label && !l.url)) {
      setLinks(LINK_PRESETS[category].map((l) => ({ ...l })));
    }
  }, [category, step]); // eslint-disable-line

  const validateHandle = async () => {
    const clean = handle.toLowerCase().trim();
    if (!/^[a-z0-9_-]{3,24}$/.test(clean)) {
      setHandleError('3–24 chars · a-z, 0-9, _ or -');
      return false;
    }
    if (['new', 'explore', 'find', 'admin', 'api', 'studio', 'login', 'edit', 'upgrade'].includes(clean)) {
      setHandleError('Reserved handle');
      return false;
    }
    const collision = await isHandleTakenAnywhere(clean);
    if (collision.taken) {
      setHandleError('Taken — try another');
      return false;
    }
    setHandleError('');
    return true;
  };

  const next = async () => {
    setErrorMsg('');
    if (step === 1) {
      const ok = await validateHandle();
      if (!ok) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      // Validate password
      const pwErr = validatePassword(password);
      if (pwErr) { setErrorMsg(pwErr); return; }
      if (password !== passwordConfirm) { setErrorMsg('Passwords don\'t match'); return; }

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
          setErrorMsg(result.error || 'Failed to publish');
          return;
        }
        // Set password right after profile created
        const pwResult = await setPasswordForHandle(profile.handle, password, 'creator');
        if (!pwResult.ok) {
          // Profile saved but password failed — non-fatal, just warn
          console.warn('Password not set:', pwResult.error);
        }
        navigate(`/${profile.handle}`);
      } catch (e) {
        setErrorMsg(e.message || 'Something went wrong publishing.');
      } finally {
        setSaving(false);
      }
    }
  };

  const updateLink = (i, field, v) => setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: v } : l)));
  const addLink = () => setLinks((prev) => [...prev, { label: '', url: '' }]);
  const removeLink = (i) => setLinks((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="min-h-screen relative" style={{ background: PAPER, color: INK }}>
      <Grain />
      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b-2" style={{ borderColor: INK }}>
        <Link to="/" className="text-xs tracking-[0.2em] uppercase font-bold hover:underline" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          ← Back to index
        </Link>
        <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          NEW SUBMISSION · {step} / 4
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="flex items-center gap-2 mb-12">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex-1 h-1" style={{ background: n <= step ? ACCENT : 'rgba(0,0,0,0.15)' }} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-10">
            <div>
              <Stamp rotate={-2}>STEP 01 / IDENTITY</Stamp>
              <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight mt-4" style={{ fontFamily: '"Fraunces", serif' }}>
                What should we<br /><span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>call you?</span>
              </h2>
            </div>

            {/* Are you a musician? Route to Studio instead */}
            <div className="p-4 flex items-center justify-between gap-3 flex-wrap" style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${INK}` }}>
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}>
                  ◆ ARE YOU A MUSICIAN?
                </div>
                <div className="text-sm mt-1" style={{ fontFamily: '"Fraunces", serif' }}>
                  Get audio previews, presaves, and drop alerts. Use the Studio signup instead.
                </div>
              </div>
              <Link
                to="/studio/new"
                className="text-[10px] tracking-[0.3em] uppercase font-bold px-3 py-2 shrink-0 hover:scale-[1.02] transition-transform"
                style={{ background: INK, color: PAPER, fontFamily: '"JetBrains Mono", monospace' }}
              >
                Studio signup →
              </Link>
            </div>

            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Your handle · hyperlink.to/
              </label>
              <input
                value={handle}
                onChange={(e) => { setHandle(e.target.value); setHandleError(''); }}
                placeholder="yourname"
                autoCapitalize="off"
                autoCorrect="off"
                className="w-full text-4xl md:text-5xl font-black bg-transparent border-b-2 pb-3 outline-none"
                style={{ borderColor: INK, fontFamily: '"Fraunces", serif' }}
              />
              {handleError && (
                <div className="text-xs mt-2 font-bold" style={{ color: ACCENT, fontFamily: '"JetBrains Mono", monospace' }}>
                  ⚠ {handleError}
                </div>
              )}
            </div>

            {/* Musician redirect banner */}
            <Link
              to="/studio/new"
              className="block p-4 hover:scale-[1.005] transition-transform"
              style={{ background: 'rgba(255,77,31,0.08)', border: `2px solid ${ACCENT}` }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl">♪</span>
                <div className="flex-1 min-w-[200px]">
                  <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}>
                    ARE YOU A MUSICIAN?
                  </div>
                  <div className="text-sm mt-1" style={{ fontFamily: '"Fraunces", serif' }}>
                    Use Plinks Studio instead — built for artists with audio previews, presaves, analytics.
                  </div>
                </div>
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: '"JetBrains Mono", monospace', color: ACCENT }}>
                  Go to Studio →
                </span>
              </div>
            </Link>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Display name</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="optional" className="w-full text-xl bg-transparent border-b-2 pb-2 outline-none" style={{ borderColor: INK, fontFamily: '"Fraunces", serif' }} />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>You are a…</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-xl bg-transparent border-b-2 pb-2 outline-none" style={{ borderColor: INK, fontFamily: '"Fraunces", serif' }}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label.toLowerCase()}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>A line about yourself</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 160))} placeholder="160 characters" rows={2} className="w-full text-lg bg-transparent border-b-2 pb-2 outline-none resize-none" style={{ borderColor: INK, fontFamily: '"Fraunces", serif' }} />
              <div className="text-[10px] mt-1 opacity-60" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{bio.length} / 160</div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10">
            <div>
              <Stamp rotate={-2}>STEP 02 / FEATURED</Stamp>
              <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight mt-4" style={{ fontFamily: '"Fraunces", serif' }}>
                Pin the <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>main</span> one.
              </h2>
              <p className="mt-4 text-base opacity-70 max-w-md" style={{ fontFamily: '"Fraunces", serif' }}>
                The link you most want clicked — your newest release, biggest project, live stream. It gets pride of place at the top.
              </p>
            </div>

            <div className="border-2 p-6 space-y-4" style={{ borderColor: INK, background: PAPER_DEEP }}>
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Label</label>
                <input value={pinned.label} onChange={(e) => setPinned({ ...pinned, label: e.target.value })} placeholder="e.g. New EP out now" className="w-full text-xl bg-transparent border-b pb-1 outline-none" style={{ borderColor: INK, fontFamily: '"Fraunces", serif' }} />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>URL</label>
                <input value={pinned.url} onChange={(e) => setPinned({ ...pinned, url: e.target.value })} placeholder="https://" className="w-full text-base bg-transparent border-b pb-1 outline-none" style={{ borderColor: INK, fontFamily: '"JetBrains Mono", monospace' }} />
              </div>
            </div>
            <p className="text-xs opacity-60" style={{ fontFamily: '"JetBrains Mono", monospace' }}>OPTIONAL — leave blank to skip</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div>
              <Stamp rotate={-2}>STEP 03 / DIRECTORY</Stamp>
              <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight mt-4" style={{ fontFamily: '"Fraunces", serif' }}>
                Add your <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>links</span>.
              </h2>
              <p className="mt-4 text-base opacity-70 max-w-md" style={{ fontFamily: '"Fraunces", serif' }}>
                We seeded suggestions based on your category. Edit, remove, or add as you like.
              </p>
            </div>

            <div className="space-y-3">
              {links.map((l, i) => (
                <div key={i} className="border-2 p-4 grid grid-cols-[1fr_2fr_auto] gap-3 items-center" style={{ borderColor: INK, background: PAPER }}>
                  <input value={l.label} onChange={(e) => updateLink(i, 'label', e.target.value)} placeholder="Label" className="bg-transparent outline-none text-base font-bold min-w-0" style={{ fontFamily: '"Fraunces", serif' }} />
                  <input value={l.url} onChange={(e) => updateLink(i, 'url', e.target.value)} placeholder="https://" className="bg-transparent outline-none text-sm min-w-0" style={{ fontFamily: '"JetBrains Mono", monospace' }} />
                  <button onClick={() => removeLink(i)} className="text-xs opacity-60 hover:opacity-100" style={{ fontFamily: '"JetBrains Mono", monospace' }}>✕</button>
                </div>
              ))}
              <button onClick={addLink} className="w-full border-2 border-dashed py-3 text-xs tracking-[0.2em] uppercase font-bold hover:bg-black hover:text-white hover:border-solid transition-colors" style={{ borderColor: INK, fontFamily: '"JetBrains Mono", monospace' }}>
                + Add another link
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-10">
            <div>
              <Stamp rotate={-2}>STEP 04 / SECURE IT</Stamp>
              <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight mt-4" style={{ fontFamily: '"Fraunces", serif' }}>
                Set a <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>password</span>.
              </h2>
              <p className="mt-4 text-base opacity-70 max-w-md" style={{ fontFamily: '"Fraunces", serif' }}>
                So you can come back and edit your profile anytime. Save it somewhere safe — there's no recovery yet.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  Password · 6+ characters
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full text-2xl bg-transparent border-b-2 pb-2 outline-none"
                  style={{ borderColor: INK, fontFamily: '"Fraunces", serif' }}
                />
              </div>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  Confirm password
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••"
                  className="w-full text-2xl bg-transparent border-b-2 pb-2 outline-none"
                  style={{ borderColor: INK, fontFamily: '"Fraunces", serif' }}
                />
              </div>
            </div>

            <div className="border-l-4 pl-4 py-2 text-xs opacity-80" style={{ borderColor: ACCENT, fontFamily: '"Fraunces", serif' }}>
              Your handle is <strong>/{handle}</strong>. Remember it — you'll use it to log in.
            </div>
          </div>
        )}

        <div className="mt-16 pt-8 border-t-2" style={{ borderColor: INK }}>
          {errorMsg && (
            <div className="mb-4 px-4 py-3 border-2 text-xs font-bold flex items-center gap-2" style={{ borderColor: ACCENT, color: ACCENT, background: 'rgba(255,77,31,0.06)', fontFamily: '"JetBrains Mono", monospace' }}>
              <span>⚠</span><span>{errorMsg}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="text-xs tracking-[0.2em] uppercase font-bold hover:underline" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                ← Previous
              </button>
            ) : <span />}
            <button
              onClick={next}
              disabled={saving || (step === 1 && !handle)}
              className="px-6 py-3 text-xs tracking-[0.25em] uppercase font-bold border-2 flex items-center gap-2 disabled:opacity-40 hover:scale-[1.02] transition-transform"
              style={{ borderColor: INK, background: ACCENT, color: PAPER, fontFamily: '"JetBrains Mono", monospace' }}
            >
              {saving ? 'Publishing…' : step === 4 ? 'Publish profile' : 'Continue'} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
