import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import StudioNav from '../components/StudioNav.jsx';
import { STUDIO, STUDIO_FONTS, GENRES, MUSIC_PLATFORMS, SOCIAL_PLATFORMS } from '../lib/studioDesign.js';
import { LUXURY_EASE } from '../lib/animations.js';
import {
  isArtistHandleTaken,
  saveArtist,
  savePresaveRelease,
  uploadFile,
} from '../lib/studioStorage.js';
import { isHandleTakenAnywhere } from '../../lib/storage.js';
import { getAudioDuration, generateWaveformData } from '../lib/audioUtils.js';
import { setPasswordForHandle, validatePassword } from '../../lib/auth.js';

const RESERVED = ['new', 'explore', 'analytics', 'studio', 'admin', 'api', 'edit', 'login', 'signup', 'upgrade'];

export default function StudioCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [handleError, setHandleError] = useState('');

  // Step 1: Identity
  const [handle, setHandle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [genres, setGenres] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Step 2: Featured drop
  const [hasRelease, setHasRelease] = useState(false);
  const [trackTitle, setTrackTitle] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [presaveUrl, setPresaveUrl] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [audioError, setAudioError] = useState('');

  // Step 3: Links
  const [musicLinks, setMusicLinks] = useState([]);
  const [socials, setSocials] = useState({});

  // Step 4: Password
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const toggleGenre = (g) => {
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : prev.length < 3 ? [...prev, g] : prev
    );
  };

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Photo must be under 5MB');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const onCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Cover art must be under 5MB');
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onAudioChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioError('');
    if (file.size > 5 * 1024 * 1024) {
      setAudioError('Audio must be under 5MB');
      return;
    }
    try {
      const duration = await getAudioDuration(file);
      if (duration > 31) {
        setAudioError('Preview must be 30 seconds or less');
        return;
      }
      setAudioFile(file);
    } catch (e) {
      setAudioError('Could not read audio file');
    }
  };

  const togglePlatform = (id) => {
    setPlatforms((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

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
      if (!handle || !artistName) {
        setHandleError(!handle ? 'Handle required' : '');
        if (!artistName) setErrorMsg('Artist name required');
        return;
      }
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
      if (password !== passwordConfirm) { setErrorMsg('Passwords don\'t match'); return; }
      await publish();
    }
  };

  const publish = async () => {
    setSaving(true);
    setErrorMsg('');
    try {
      const h = handle.toLowerCase().trim();

      // Upload photo if any
      let photoUrl = null;
      if (photoFile) {
        const r = await uploadFile('artist-photos', photoFile, h);
        if (r.ok) photoUrl = r.url;
      }

      // Build links array
      const links = musicLinks.filter((l) => l.label && l.url);

      const profile = {
        handle: h,
        artistName: artistName.trim(),
        bio: bio.trim(),
        location: location.trim(),
        genres,
        photoUrl,
        links,
        socials,
        tourDates: [],
      };

      const result = await saveArtist(profile);
      if (!result.ok) {
        setErrorMsg(result.error || 'Failed to publish');
        setSaving(false);
        return;
      }

      // Save the release if we have one
      if (hasRelease && trackTitle && presaveUrl) {
        let audioUrl = null;
        let coverUrl = null;
        let waveformData = null;

        if (audioFile) {
          const r = await uploadFile('audio-previews', audioFile, h);
          if (r.ok) audioUrl = r.url;
          waveformData = await generateWaveformData(audioFile);
        }
        if (coverFile) {
          const r = await uploadFile('cover-art', coverFile, h);
          if (r.ok) coverUrl = r.url;
        }

        await savePresaveRelease(h, {
          trackTitle: trackTitle.trim(),
          releaseDate: releaseDate || null,
          coverArtUrl: coverUrl,
          audioPreviewUrl: audioUrl,
          waveformData,
          presaveUrl: presaveUrl.trim(),
          platforms,
        });
      }

      // Set password
      const pwResult = await setPasswordForHandle(h, password, 'artist');
      if (!pwResult.ok) {
        console.warn('Password not set:', pwResult.error);
      }

      navigate(`/studio/${h}`);
    } catch (e) {
      setErrorMsg(e.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const addMusicLink = (platform) => {
    setMusicLinks((prev) => [
      ...prev,
      { label: platform.label, url: platform.urlPrefix, platformId: platform.id, color: platform.color },
    ]);
  };

  const updateMusicLink = (i, field, v) => {
    setMusicLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: v } : l)));
  };

  const removeMusicLink = (i) => {
    setMusicLinks((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateSocial = (id, url) => {
    setSocials((prev) => ({ ...prev, [id]: url }));
  };

  const inputStyle = {
    background: 'transparent',
    color: STUDIO.ink,
    borderBottom: `1px solid ${STUDIO.borderStrong}`,
    fontFamily: STUDIO_FONTS.display,
  };

  const labelStyle = {
    color: STUDIO.muted,
    fontFamily: STUDIO_FONTS.mono,
  };

  return (
    <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }}>
      <StudioNav minimal />

      <div className="max-w-2xl mx-auto px-6 md:px-12 pt-32 pb-24">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-12">
          {[1, 2, 3, 4].map((n) => (
            <motion.div
              key={n}
              className="flex-1 h-[2px]"
              animate={{ background: n <= step ? STUDIO.accent : STUDIO.border }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-8" style={labelStyle}>
          NEW STUDIO · {step} / 4
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: LUXURY_EASE }}
              className="space-y-10"
            >
              <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight" style={{ fontFamily: STUDIO_FONTS.display }}>
                Who are<br />
                <span style={{ color: STUDIO.accent, fontStyle: 'italic', fontWeight: 300 }}>you?</span>
              </h2>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>
                  Handle · plinks.dev/studio/
                </label>
                <input
                  value={handle}
                  onChange={(e) => { setHandle(e.target.value); setHandleError(''); }}
                  placeholder="yourname"
                  autoCapitalize="off"
                  autoCorrect="off"
                  className="w-full text-3xl md:text-4xl font-black pb-3 outline-none focus:border-orange-500"
                  style={inputStyle}
                />
                {handleError && (
                  <div className="text-xs mt-2 font-bold" style={{ color: STUDIO.accent, fontFamily: STUDIO_FONTS.mono }}>
                    ⚠ {handleError}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>Artist name</label>
                  <input value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="Stage name" className="w-full text-xl pb-2 outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>Location</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className="w-full text-xl pb-2 outline-none" style={inputStyle} />
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 160))} placeholder="One line about you (160 chars)" rows={2} className="w-full text-lg pb-2 outline-none resize-none" style={inputStyle} />
                <div className="text-[10px] mt-1 opacity-60" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>{bio.length} / 160</div>
              </div>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={labelStyle}>Genre tags (up to 3)</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => {
                    const active = genres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenre(g)}
                        className="px-3 py-1.5 text-[10px] tracking-[0.25em] uppercase font-bold transition-all"
                        style={{
                          fontFamily: STUDIO_FONTS.mono,
                          background: active ? STUDIO.accent : 'transparent',
                          color: active ? STUDIO.ink : STUDIO.muted,
                          border: `1px solid ${active ? STUDIO.accent : STUDIO.border}`,
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={labelStyle}>Artist photo (optional)</label>
                <label
                  className="block cursor-pointer border-2 border-dashed p-6 text-center transition-colors hover:border-orange-500"
                  style={{ borderColor: STUDIO.border, background: STUDIO.surface }}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="w-32 h-32 object-cover mx-auto rounded-full" />
                  ) : (
                    <div className="text-sm" style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                      + Upload photo (max 5MB)
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
                </label>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: LUXURY_EASE }}
              className="space-y-10"
            >
              <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight" style={{ fontFamily: STUDIO_FONTS.display }}>
                Got a drop<br />
                <span style={{ color: STUDIO.accent, fontStyle: 'italic', fontWeight: 300 }}>coming?</span>
              </h2>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setHasRelease(!hasRelease)}
                  className="px-4 py-2 text-xs tracking-[0.25em] uppercase font-bold transition-all"
                  style={{
                    fontFamily: STUDIO_FONTS.mono,
                    background: hasRelease ? STUDIO.accent : 'transparent',
                    color: hasRelease ? STUDIO.ink : STUDIO.muted,
                    border: `1px solid ${hasRelease ? STUDIO.accent : STUDIO.border}`,
                  }}
                >
                  {hasRelease ? '✓ Adding a release' : '+ Add a release'}
                </button>
                <span style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  Optional · skip if none
                </span>
              </div>

              <AnimatePresence>
                {hasRelease && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-8 overflow-hidden"
                  >
                    <div>
                      <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>Track title</label>
                      <input value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} placeholder="Track name" className="w-full text-2xl font-black pb-2 outline-none" style={inputStyle} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>Release date (optional)</label>
                        <input type="datetime-local" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="w-full text-lg pb-2 outline-none" style={inputStyle} />
                      </div>
                      <div>
                        <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>Presave / Stream URL</label>
                        <input value={presaveUrl} onChange={(e) => setPresaveUrl(e.target.value)} placeholder="https://distrokid.com/..." className="w-full text-base pb-2 outline-none" style={{ ...inputStyle, fontFamily: STUDIO_FONTS.mono }} />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={labelStyle}>Cover art</label>
                      <label className="block cursor-pointer border-2 border-dashed p-4 text-center" style={{ borderColor: STUDIO.border, background: STUDIO.surface }}>
                        {coverPreview ? (
                          <img src={coverPreview} alt="" className="w-32 h-32 object-cover mx-auto" />
                        ) : (
                          <div className="text-sm" style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            + Cover art (max 5MB)
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={onCoverChange} className="hidden" />
                      </label>
                    </div>

                    <div>
                      <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={labelStyle}>Audio preview (max 30 sec, 5MB)</label>
                      <label className="block cursor-pointer border-2 border-dashed p-4 text-center" style={{ borderColor: STUDIO.border, background: STUDIO.surface }}>
                        {audioFile ? (
                          <div className="text-sm" style={{ color: STUDIO.accent, fontFamily: STUDIO_FONTS.mono, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            ✓ {audioFile.name}
                          </div>
                        ) : (
                          <div className="text-sm" style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            + Audio preview (mp3 / m4a)
                          </div>
                        )}
                        <input type="file" accept="audio/mp3,audio/mpeg,audio/m4a,audio/x-m4a" onChange={onAudioChange} className="hidden" />
                      </label>
                      {audioError && (
                        <div className="text-xs mt-2 font-bold" style={{ color: STUDIO.accent, fontFamily: STUDIO_FONTS.mono }}>⚠ {audioError}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={labelStyle}>Available on (optional)</label>
                      <div className="flex flex-wrap gap-2">
                        {MUSIC_PLATFORMS.map((p) => {
                          const active = platforms.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => togglePlatform(p.id)}
                              className="px-3 py-1.5 text-[10px] tracking-[0.25em] uppercase font-bold transition-all"
                              style={{
                                fontFamily: STUDIO_FONTS.mono,
                                background: active ? p.color : 'transparent',
                                color: active ? STUDIO.ink : STUDIO.muted,
                                border: `1px solid ${active ? p.color : STUDIO.border}`,
                              }}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: LUXURY_EASE }}
              className="space-y-10"
            >
              <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight" style={{ fontFamily: STUDIO_FONTS.display }}>
                Connect your<br />
                <span style={{ color: STUDIO.accent, fontStyle: 'italic', fontWeight: 300 }}>platforms.</span>
              </h2>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-4" style={labelStyle}>Music platforms</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {MUSIC_PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addMusicLink(p)}
                      className="px-3 py-2 text-[10px] tracking-[0.25em] uppercase font-bold transition-all hover:scale-105"
                      style={{
                        fontFamily: STUDIO_FONTS.mono,
                        background: 'transparent',
                        color: STUDIO.ink,
                        border: `1px solid ${p.color}`,
                      }}
                    >
                      + {p.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {musicLinks.map((l, i) => (
                    <div key={i} className="border p-3 grid grid-cols-[auto_1fr_auto] gap-3 items-center" style={{ borderColor: STUDIO.border, background: STUDIO.surface }}>
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: l.color || STUDIO.accent }} />
                      <input value={l.url} onChange={(e) => updateMusicLink(i, 'url', e.target.value)} placeholder={l.label + ' URL'} className="bg-transparent outline-none text-sm w-full" style={{ color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }} />
                      <button onClick={() => removeMusicLink(i)} className="text-xs opacity-60 hover:opacity-100" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={labelStyle}>Socials</label>
                <div className="space-y-3">
                  {SOCIAL_PLATFORMS.map((s) => (
                    <div key={s.id} className="grid grid-cols-[100px_1fr] gap-3 items-center">
                      <span className="text-xs uppercase tracking-[0.2em] font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>{s.label}</span>
                      <input
                        value={socials[s.id] || ''}
                        onChange={(e) => updateSocial(s.id, e.target.value)}
                        placeholder={s.urlPrefix + 'yourname'}
                        className="bg-transparent outline-none text-sm pb-1"
                        style={{ ...inputStyle, fontFamily: STUDIO_FONTS.mono }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: LUXURY_EASE }}
              className="space-y-10"
            >
              <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight" style={{ fontFamily: STUDIO_FONTS.display }}>
                Lock it<br />
                <span style={{ color: STUDIO.accent, fontStyle: 'italic', fontWeight: 300 }}>down.</span>
              </h2>
              <p className="text-base opacity-70 max-w-md" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.muted }}>
                Set a password so only you can edit your studio. Save it — there's no recovery yet.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>
                    Password · 6+ characters
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full text-2xl pb-2 outline-none"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>
                    Confirm
                  </label>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••"
                    className="w-full text-2xl pb-2 outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="pl-4 py-2 text-xs opacity-80" style={{ borderLeft: `2px solid ${STUDIO.accent}`, fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}>
                Your handle is <strong>/{handle}</strong>. You'll use it to log in.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <div className="mt-16 pt-8 border-t" style={{ borderColor: STUDIO.border }}>
          {errorMsg && (
            <div className="mb-4 px-4 py-3 border text-xs font-bold flex items-center gap-2" style={{ borderColor: STUDIO.accent, color: STUDIO.accent, background: 'rgba(255,77,31,0.06)', fontFamily: STUDIO_FONTS.mono }}>
              <span>⚠</span><span>{errorMsg}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="text-xs tracking-[0.25em] uppercase font-bold hover:opacity-70" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                ← Previous
              </button>
            ) : (
              <Link to="/studio" className="text-xs tracking-[0.25em] uppercase font-bold hover:opacity-70" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                ← Back
              </Link>
            )}
            <motion.button
              onClick={next}
              disabled={saving}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 text-xs tracking-[0.25em] uppercase font-bold transition-all disabled:opacity-40"
              style={{ background: STUDIO.accent, color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }}
            >
              {saving ? 'Publishing…' : step === 4 ? 'Publish Studio' : 'Continue'} →
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
