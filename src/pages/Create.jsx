import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import TopNav from '../components/TopNav.jsx';
import { CATEGORIES, LINK_PRESETS } from '../lib/design.js';
import { isHandleTakenAnywhere, saveProfile } from '../lib/storage.js';
import { setPasswordForHandle, validatePassword } from '../lib/auth.js';
import { recordReferral } from '../lib/referrals.js';

const BG = '#0A0A0A';
const SURFACE = '#141414';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const ACCENT = '#FF4D1F';
const BORDER = 'rgba(255,255,255,0.12)';
const BORDER_STRONG = 'rgba(255,255,255,0.22)';
const DISPLAY = '"Fraunces", serif';
const MONO = '"JetBrains Mono", monospace';

const EASE = [0.22, 1, 0.36, 1];

const RESERVED = ['new', 'explore', 'find', 'admin', 'api', 'studio', 'login', 'edit', 'upgrade', 'help', 'terms', 'privacy'];

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
    if (step === 3 && links.every((l) => !l.label && !l.url)) {
      setLinks(LINK_PRESETS[category].map((l) => ({ ...l })));
    }
  }, [category, step]); // eslint-disable-line

  const validateHandle = async () => {
    const clean = handle.toLowerCase().trim();
    if (!/^[a-z0-9_-]{3,24}$/.test(clean)) {
      setHandleError('3–24 chars · a-z, 0-9, _ or -');
      return false;
    }
    if (RESERVED.includes(clean)) {
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
      const pwErr = validatePassword(password);
      if (pwErr) { setErrorMsg(pwErr); return; }
      if (password !== passwordConfirm) { setErrorMsg("Passwords don't match"); return; }

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
        const pwResult = await setPasswordForHandle(profile.handle, password, 'creator');
        if (!pwResult.ok) console.warn('Password not set:', pwResult.error);
        // Attribute referral if one was captured
        await recordReferral(profile.handle, 'creator');
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
    <div style={{ background: BG, color: INK, minHeight: '100vh' }}>
      <TopNav />

      <div className="max-w-2xl mx-auto px-6 pt-24 md:pt-32 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-[10px] tracking-[0.35em] uppercase font-bold" style={{ fontFamily: MONO, color: ACCENT }}>
            ◆ NEW CREATOR
          </div>
          <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO, color: MUTED }}>
            STEP {String(step).padStart(2, '0')} · 04
          </div>
        </div>

        {/* Progress bars */}
        <div className="flex items-center gap-2 mb-12">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="flex-1 h-[3px] transition-all"
              style={{ background: n <= step ? ACCENT : BORDER }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="space-y-8"
            >
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-3" style={{ fontFamily: MONO, color: MUTED }}>
                  STEP 01 / IDENTITY
                </div>
                <h2 className="font-black tracking-tight leading-[0.95]" style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>
                  What should we<br /><span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>call you?</span>
                </h2>
              </div>

              {/* Musician redirect banner */}
              <Link
                to="/studio/new"
                className="block p-5 hover:scale-[1.005] transition-transform"
                style={{ background: SURFACE, border: `2px solid ${ACCENT}` }}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-2xl" style={{ color: ACCENT }}>♪</span>
                  <div className="flex-1 min-w-[180px]">
                    <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO, color: ACCENT }}>
                      ARE YOU A MUSICIAN?
                    </div>
                    <div className="text-sm mt-1" style={{ fontFamily: DISPLAY, color: INK }}>
                      Use Plinks Studio — audio previews, presaves, drop alerts.
                    </div>
                  </div>
                  <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: MONO, color: ACCENT }}>
                    Go →
                  </span>
                </div>
              </Link>

              {/* Handle */}
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={{ fontFamily: MONO, color: MUTED }}>
                  Your handle · plinks.dev/
                </label>
                <input
                  value={handle}
                  onChange={(e) => { setHandle(e.target.value); setHandleError(''); }}
                  placeholder="yourname"
                  autoCapitalize="off"
                  autoCorrect="off"
                  className="w-full text-3xl md:text-4xl font-black bg-transparent border-b-2 pb-3 outline-none focus:border-orange-500 transition-colors"
                  style={{ borderColor: handleError ? ACCENT : BORDER_STRONG, color: INK, fontFamily: DISPLAY }}
                />
                {handleError && (
                  <div className="text-xs mt-2 font-bold" style={{ color: ACCENT, fontFamily: MONO }}>
                    ⚠ {handleError}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={{ fontFamily: MONO, color: MUTED }}>
                    Display name
                  </label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="optional"
                    className="w-full text-xl bg-transparent border-b-2 pb-2 outline-none focus:border-orange-500 transition-colors"
                    style={{ borderColor: BORDER_STRONG, color: INK, fontFamily: DISPLAY }}
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={{ fontFamily: MONO, color: MUTED }}>
                    You are a…
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xl bg-transparent border-b-2 pb-2 outline-none focus:border-orange-500 transition-colors"
                    style={{ borderColor: BORDER_STRONG, color: INK, fontFamily: DISPLAY }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: BG, color: INK }}>
                        {c.label.toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={{ fontFamily: MONO, color: MUTED }}>
                  A line about yourself
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 160))}
                  placeholder="160 characters"
                  rows={2}
                  className="w-full text-base bg-transparent border-b-2 pb-2 outline-none resize-none focus:border-orange-500 transition-colors"
                  style={{ borderColor: BORDER_STRONG, color: INK, fontFamily: DISPLAY }}
                />
                <div className="text-[10px] mt-1 opacity-60" style={{ fontFamily: MONO, color: MUTED }}>
                  {bio.length} / 160
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="space-y-8"
            >
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-3" style={{ fontFamily: MONO, color: MUTED }}>
                  STEP 02 / FEATURED
                </div>
                <h2 className="font-black tracking-tight leading-[0.95]" style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>
                  Pin the <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>main</span> one.
                </h2>
                <p className="mt-4 text-base opacity-70 max-w-md" style={{ fontFamily: DISPLAY }}>
                  The link you most want clicked — newest project, biggest drop, your shop. It sits at the top with a ★ badge.
                </p>
              </div>

              <div className="p-6 space-y-5" style={{ background: SURFACE, border: `1px solid ${BORDER_STRONG}` }}>
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: MONO, color: MUTED }}>
                    Label
                  </label>
                  <input
                    value={pinned.label}
                    onChange={(e) => setPinned({ ...pinned, label: e.target.value })}
                    placeholder="e.g. New EP out now"
                    className="w-full text-lg bg-transparent border-b pb-1 outline-none focus:border-orange-500 transition-colors"
                    style={{ borderColor: BORDER_STRONG, color: INK, fontFamily: DISPLAY }}
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={{ fontFamily: MONO, color: MUTED }}>
                    URL
                  </label>
                  <input
                    value={pinned.url}
                    onChange={(e) => setPinned({ ...pinned, url: e.target.value })}
                    placeholder="https://"
                    className="w-full text-sm bg-transparent border-b pb-1 outline-none focus:border-orange-500 transition-colors"
                    style={{ borderColor: BORDER_STRONG, color: INK, fontFamily: MONO }}
                  />
                </div>
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-60" style={{ fontFamily: MONO, color: MUTED }}>
                Optional — skip if you don't have one yet
              </p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="space-y-8"
            >
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-3" style={{ fontFamily: MONO, color: MUTED }}>
                  STEP 03 / LINKS
                </div>
                <h2 className="font-black tracking-tight leading-[0.95]" style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>
                  Add your <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>links</span>.
                </h2>
                <p className="mt-4 text-base opacity-70 max-w-md" style={{ fontFamily: DISPLAY }}>
                  We seeded suggestions based on your category. Edit, remove, or add more. We'll render real platform logos automatically.
                </p>
              </div>

              <div className="space-y-2.5">
                {links.map((l, i) => (
                  <div
                    key={i}
                    className="p-4 grid grid-cols-[1fr_2fr_auto] gap-3 items-center"
                    style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                  >
                    <input
                      value={l.label}
                      onChange={(e) => updateLink(i, 'label', e.target.value)}
                      placeholder="Label"
                      className="bg-transparent outline-none text-base font-bold min-w-0"
                      style={{ fontFamily: DISPLAY, color: INK }}
                    />
                    <input
                      value={l.url}
                      onChange={(e) => updateLink(i, 'url', e.target.value)}
                      placeholder="https://"
                      className="bg-transparent outline-none text-sm min-w-0"
                      style={{ fontFamily: MONO, color: MUTED }}
                    />
                    <button
                      onClick={() => removeLink(i)}
                      aria-label="Remove"
                      className="text-sm opacity-50 hover:opacity-100 transition-opacity"
                      style={{ color: MUTED }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={addLink}
                  className="w-full py-3 text-[10px] tracking-[0.3em] uppercase font-bold border border-dashed hover:bg-white/5 transition-colors"
                  style={{ borderColor: BORDER_STRONG, color: INK, fontFamily: MONO }}
                >
                  + Add another link
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="s4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="space-y-8"
            >
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-3" style={{ fontFamily: MONO, color: MUTED }}>
                  STEP 04 / SECURE IT
                </div>
                <h2 className="font-black tracking-tight leading-[0.95]" style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>
                  Set a <span style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>password</span>.
                </h2>
                <p className="mt-4 text-base opacity-70 max-w-md" style={{ fontFamily: DISPLAY }}>
                  So you can come back and edit anytime. Save it somewhere safe — automated recovery isn't built yet, you'd email us.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={{ fontFamily: MONO, color: MUTED }}>
                    Password · 6+ characters
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full text-2xl bg-transparent border-b-2 pb-2 outline-none focus:border-orange-500 transition-colors"
                    style={{ borderColor: BORDER_STRONG, color: INK, fontFamily: DISPLAY }}
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={{ fontFamily: MONO, color: MUTED }}>
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••"
                    className="w-full text-2xl bg-transparent border-b-2 pb-2 outline-none focus:border-orange-500 transition-colors"
                    style={{ borderColor: BORDER_STRONG, color: INK, fontFamily: DISPLAY }}
                  />
                </div>
              </div>

              <div className="border-l-2 pl-4 py-2 text-sm opacity-80" style={{ borderColor: ACCENT, fontFamily: DISPLAY }}>
                Your handle is <strong style={{ color: ACCENT }}>/{handle}</strong>. Remember it — you'll use it to log in.
              </div>

              <div className="text-[10px] leading-relaxed opacity-60" style={{ fontFamily: MONO }}>
                By publishing, you agree to our{' '}
                <Link to="/terms" style={{ color: ACCENT, textDecoration: 'underline' }}>Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" style={{ color: ACCENT, textDecoration: 'underline' }}>Privacy Policy</Link>.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: BORDER }}>
          {errorMsg && (
            <div
              className="mb-4 px-4 py-3 text-xs font-bold flex items-center gap-2"
              style={{ border: `1px solid ${ACCENT}`, color: ACCENT, background: 'rgba(255,77,31,0.06)', fontFamily: MONO }}
            >
              <span>⚠</span><span>{errorMsg}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-70 hover:opacity-100 transition-opacity"
                style={{ fontFamily: MONO, color: INK }}
              >
                ← Previous
              </button>
            ) : <span />}
            <button
              onClick={next}
              disabled={saving || (step === 1 && !handle)}
              className="px-6 py-3 text-[10px] tracking-[0.3em] uppercase font-bold flex items-center gap-2 disabled:opacity-40 hover:scale-[1.02] transition-transform"
              style={{ background: ACCENT, color: BG, fontFamily: MONO }}
            >
              {saving ? 'Publishing…' : step === 4 ? 'Publish profile' : 'Continue'} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
