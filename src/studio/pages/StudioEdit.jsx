import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import StudioNav from '../components/StudioNav.jsx';
import { STUDIO, STUDIO_FONTS, GENRES, MUSIC_PLATFORMS, SOCIAL_PLATFORMS } from '../lib/studioDesign.js';
import { LUXURY_EASE } from '../lib/animations.js';
import { loadArtist, saveArtist, uploadFile, updatePresaveRelease, savePresaveRelease } from '../lib/studioStorage.js';
import { getAudioDuration, generateWaveformData } from '../lib/audioUtils.js';
import { isOwnerOf, getSession } from '../../lib/auth.js';

export default function StudioEdit() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  const [artistName, setArtistName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [genres, setGenres] = useState([]);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [musicLinks, setMusicLinks] = useState([]);
  const [socials, setSocials] = useState({});

  // Release editing
  const [releaseId, setReleaseId] = useState(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [presaveUrl, setPresaveUrl] = useState('');
  const [coverArtUrl, setCoverArtUrl] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioError, setAudioError] = useState('');
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    // Gate: must be logged in as this handle's owner
    if (!isOwnerOf(handle)) {
      navigate(`/studio/${handle}`);
      return;
    }

    loadArtist(handle).then((a) => {
      if (!a) {
        navigate(`/studio/${handle}`);
        return;
      }
      setArtistName(a.artistName || '');
      setBio(a.bio || '');
      setLocation(a.location || '');
      setGenres(a.genres || []);
      setPhotoUrl(a.photoUrl || null);
      setMusicLinks(a.links || []);
      setSocials(a.socials || {});

      if (a.releases && a.releases.length > 0) {
        const r = a.releases[0];
        setReleaseId(r.id);
        setTrackTitle(r.trackTitle || '');
        setReleaseDate(r.releaseDate ? String(r.releaseDate).split('T')[0] : '');
        setPresaveUrl(r.presaveUrl || '');
        setCoverArtUrl(r.coverArtUrl || null);
        setAudioPreviewUrl(r.audioPreviewUrl || null);
        setPlatforms(r.platforms || []);
      }

      setLoading(false);
    });
  }, [handle, navigate]);

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

  const onCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrorMsg('Cover art must be under 5MB'); return; }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onAudioChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioError('');
    if (file.size > 10 * 1024 * 1024) { setAudioError('Audio must be under 10MB'); return; }
    try {
      const duration = await getAudioDuration(file);
      if (duration > 35) {
        setAudioError(`Preview must be under 30s (got ${Math.round(duration)}s)`);
        return;
      }
      setAudioFile(file);
    } catch {
      setAudioError('Could not read audio file');
    }
  };

  const togglePlatform = (p) => {
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const save = async () => {
    setErrorMsg('');
    setSavedMsg('');
    setSaving(true);
    try {
      let finalPhotoUrl = photoUrl;
      if (photoFile) {
        const r = await uploadFile('artist-photos', photoFile, handle);
        if (r.ok) finalPhotoUrl = r.url;
      }

      const profile = {
        handle: handle.toLowerCase().trim(),
        artistName: artistName.trim(),
        bio: bio.trim(),
        location: location.trim(),
        genres,
        photoUrl: finalPhotoUrl,
        links: musicLinks.filter((l) => l.label && l.url),
        socials,
        tourDates: [],
      };

      const result = await saveArtist(profile);
      if (!result.ok) {
        setErrorMsg(result.error || 'Failed to save profile');
        setSaving(false);
        return;
      }

      // Handle release update/create
      if (trackTitle.trim()) {
        let finalCoverUrl = coverArtUrl;
        let finalAudioUrl = audioPreviewUrl;
        let waveformData = null;

        if (coverFile) {
          const r = await uploadFile('cover-art', coverFile, handle);
          if (r.ok) finalCoverUrl = r.url;
        }
        if (audioFile) {
          const r = await uploadFile('audio-previews', audioFile, handle);
          if (r.ok) {
            finalAudioUrl = r.url;
            try { waveformData = await generateWaveformData(audioFile); } catch {}
          }
        }

        const releaseFields = {
          trackTitle: trackTitle.trim(),
          releaseDate: releaseDate || null,
          coverArtUrl: finalCoverUrl,
          audioPreviewUrl: finalAudioUrl,
          presaveUrl: presaveUrl.trim(),
          platforms,
        };
        if (waveformData) releaseFields.waveformData = waveformData;

        if (releaseId) {
          const rr = await updatePresaveRelease(handle, releaseId, releaseFields);
          if (!rr.ok) { setErrorMsg(rr.error || 'Release update failed'); setSaving(false); return; }
        } else {
          const rr = await savePresaveRelease(handle, releaseFields);
          if (!rr.ok) { setErrorMsg(rr.error || 'Release create failed'); setSaving(false); return; }
        }
      }

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
    borderBottom: `1px solid ${STUDIO.border}`,
    color: STUDIO.ink,
    fontFamily: STUDIO_FONTS.display,
  };

  const labelStyle = {
    fontFamily: STUDIO_FONTS.mono,
    color: STUDIO.muted,
  };

  if (loading) {
    return (
      <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-xs tracking-[0.3em] uppercase font-bold animate-pulse" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
          Loading editor…
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }}>
      <StudioNav minimal />

      <div className="max-w-2xl mx-auto px-6 md:px-12 pt-32 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-1" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
              EDITING · /{handle}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: STUDIO_FONTS.display }}>
              Update your <span style={{ fontStyle: 'italic', fontWeight: 300, color: STUDIO.accent }}>profile</span>
            </h1>
          </div>
          <Link
            to={`/studio/${handle}`}
            className="text-[10px] tracking-[0.25em] uppercase font-bold hover:opacity-70"
            style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
          >
            ← Back
          </Link>
        </div>

        {/* Premium upsell */}
        <Link
          to="/upgrade"
          className="block mb-8 p-4 hover:scale-[1.005] transition-transform"
          style={{
            background: 'linear-gradient(135deg, rgba(255,77,31,0.12), rgba(255,77,31,0.04))',
            border: `1px solid ${STUDIO.accent}`,
          }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl">★</span>
            <div className="flex-1 min-w-[200px]">
              <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
                Unlock Premium
              </div>
              <div className="text-sm mt-0.5" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}>
                Custom themes, hover-audio links, drop alerts, fan DMs.
              </div>
            </div>
            <span
              className="text-[10px] tracking-[0.3em] uppercase font-bold"
              style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}
            >
              From $3/mo →
            </span>
          </div>
        </Link>

        <div className="space-y-10">
          {/* Artist name */}
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>Artist Name</label>
            <input
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="w-full text-3xl md:text-4xl font-black pb-3 outline-none"
              style={inputStyle}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={160}
              className="w-full text-lg pb-2 outline-none resize-none"
              style={inputStyle}
            />
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold mt-1 text-right" style={labelStyle}>
              {bio.length} / 160
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Youngstown, OH"
              className="w-full text-lg pb-2 outline-none"
              style={inputStyle}
            />
          </div>

          {/* Photo */}
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={labelStyle}>Profile Photo</label>
            <div className="flex items-center gap-4">
              {(photoPreview || photoUrl) && (
                <img
                  src={photoPreview || photoUrl}
                  alt=""
                  className="w-20 h-20 object-cover rounded-full"
                  style={{ border: `1px solid ${STUDIO.borderStrong}` }}
                />
              )}
              <label
                className="text-[10px] tracking-[0.25em] uppercase font-bold border px-4 py-2 cursor-pointer hover:scale-[1.02] transition-transform inline-block"
                style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink }}
              >
                {(photoPreview || photoUrl) ? 'Replace photo' : 'Upload photo'}
                <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={labelStyle}>Genres · pick up to 3</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => {
                const active = genres.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className="text-[10px] tracking-[0.25em] uppercase font-bold px-3 py-1.5 border transition-all"
                    style={{
                      borderColor: active ? STUDIO.accent : STUDIO.border,
                      background: active ? STUDIO.accent : 'transparent',
                      color: active ? STUDIO.ink : STUDIO.muted,
                      fontFamily: STUDIO_FONTS.mono,
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Music links */}
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={labelStyle}>Music Links</label>
            <div className="space-y-3 mb-3">
              {musicLinks.map((l, i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-3 items-center p-3 border" style={{ borderColor: STUDIO.border }}>
                  <input
                    value={l.label}
                    onChange={(e) => updateMusicLink(i, 'label', e.target.value)}
                    className="bg-transparent outline-none text-sm font-bold"
                    style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}
                  />
                  <input
                    value={l.url}
                    onChange={(e) => updateMusicLink(i, 'url', e.target.value)}
                    className="bg-transparent outline-none text-xs"
                    style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
                  />
                  <button onClick={() => removeMusicLink(i)} className="text-xs opacity-60 hover:opacity-100" style={{ color: STUDIO.muted }}>✕</button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {MUSIC_PLATFORMS.filter(p => !musicLinks.find(l => l.platformId === p.id)).map((p) => (
                <button
                  key={p.id}
                  onClick={() => addMusicLink(p)}
                  className="text-[10px] tracking-[0.25em] uppercase font-bold px-3 py-1.5 border hover:scale-[1.02] transition-all"
                  style={{ borderColor: STUDIO.border, color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono }}
                >
                  + {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Socials */}
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

          {/* RELEASE SECTION */}
          <div className="pt-8 border-t" style={{ borderColor: STUDIO.borderStrong }}>
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
              § Featured Release
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-6" style={{ fontFamily: STUDIO_FONTS.display }}>
              {releaseId ? 'Update release' : 'Add a release'}
            </h2>

            <div className="space-y-8">
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>Track Title</label>
                <input
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  placeholder="Snake Eyes"
                  className="w-full text-2xl md:text-3xl font-black pb-2 outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>Release Date</label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full text-lg pb-2 outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={labelStyle}>Cover Art</label>
                <div className="flex items-center gap-4">
                  {(coverPreview || coverArtUrl) && (
                    <img src={coverPreview || coverArtUrl} alt="" className="w-20 h-20 object-cover" style={{ border: `1px solid ${STUDIO.borderStrong}` }} />
                  )}
                  <label className="text-[10px] tracking-[0.25em] uppercase font-bold border px-4 py-2 cursor-pointer hover:scale-[1.02] transition-transform inline-block"
                    style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink }}>
                    {(coverPreview || coverArtUrl) ? 'Replace' : 'Upload'}
                    <input type="file" accept="image/*" onChange={onCoverChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={labelStyle}>Audio Preview · 30s max</label>
                <div className="flex items-center gap-4 flex-wrap">
                  {(audioFile || audioPreviewUrl) && (
                    <span className="text-xs" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                      ♪ {audioFile ? audioFile.name : 'current preview'}
                    </span>
                  )}
                  <label className="text-[10px] tracking-[0.25em] uppercase font-bold border px-4 py-2 cursor-pointer hover:scale-[1.02] transition-transform inline-block"
                    style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink }}>
                    {(audioFile || audioPreviewUrl) ? 'Replace' : 'Upload'}
                    <input type="file" accept="audio/*" onChange={onAudioChange} className="hidden" />
                  </label>
                </div>
                {audioError && <div className="mt-2 text-xs" style={{ color: STUDIO.accent, fontFamily: STUDIO_FONTS.mono }}>{audioError}</div>}
              </div>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-2" style={labelStyle}>Presave URL</label>
                <input
                  value={presaveUrl}
                  onChange={(e) => setPresaveUrl(e.target.value)}
                  placeholder="https://distrokid.com/hyperfollow/yourtrack"
                  className="w-full text-sm pb-2 outline-none"
                  style={{ ...inputStyle, fontFamily: STUDIO_FONTS.mono }}
                />
              </div>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-3" style={labelStyle}>Available On</label>
                <div className="flex flex-wrap gap-2">
                  {['Spotify','Apple','SoundCloud','YouTube','Tidal','Bandcamp'].map((p) => {
                    const active = platforms.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className="text-[10px] tracking-[0.25em] uppercase font-bold px-3 py-1.5 border transition-all"
                        style={{
                          borderColor: active ? STUDIO.accent : STUDIO.border,
                          background: active ? STUDIO.accent : 'transparent',
                          color: active ? STUDIO.ink : STUDIO.muted,
                          fontFamily: STUDIO_FONTS.mono,
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save button - sticky bottom */}
        <div className="mt-16 pt-8 border-t" style={{ borderColor: STUDIO.border }}>
          {errorMsg && (
            <div className="mb-4 px-4 py-3 border text-xs font-bold flex items-center gap-2" style={{ borderColor: STUDIO.accent, color: STUDIO.accent, background: 'rgba(255,77,31,0.06)', fontFamily: STUDIO_FONTS.mono }}>
              <span>⚠</span><span>{errorMsg}</span>
            </div>
          )}
          {savedMsg && (
            <div className="mb-4 px-4 py-3 border text-xs font-bold flex items-center gap-2" style={{ borderColor: STUDIO.accent, color: STUDIO.accent, background: 'rgba(255,77,31,0.1)', fontFamily: STUDIO_FONTS.mono }}>
              <span>✓</span><span>{savedMsg}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Link
              to={`/studio/${handle}`}
              className="text-xs tracking-[0.25em] uppercase font-bold hover:opacity-70"
              style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
            >
              ← Cancel
            </Link>
            <motion.button
              onClick={save}
              disabled={saving}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 text-xs tracking-[0.25em] uppercase font-bold transition-all disabled:opacity-40"
              style={{ background: STUDIO.accent, color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }}
            >
              {saving ? 'Saving…' : 'Save changes →'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
