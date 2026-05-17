import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import StudioNav from '../components/StudioNav.jsx';
import CollapsibleSection from '../../components/CollapsibleSection.jsx';
import { STUDIO, STUDIO_FONTS, GENRES, MUSIC_PLATFORMS, SOCIAL_PLATFORMS } from '../lib/studioDesign.js';
import { loadArtist, saveArtist, uploadFile, updatePresaveRelease, savePresaveRelease } from '../lib/studioStorage.js';
import { getAudioDuration, generateWaveformData } from '../lib/audioUtils.js';
import AudioTrimmer from '../components/AudioTrimmer.jsx';
import { isOwnerOf } from '../../lib/auth.js';
import { isPremium } from '../../lib/premium.js';
import { convertToCreator } from '../../lib/profileType.js';
import { saveAccentColor, saveReleaseLayout, saveAnimatedBg, PREMIUM_PALETTE } from '../../lib/premiumFeatures.js';

export default function StudioEdit() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  // Artist data
  const [artistName, setArtistName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [genres, setGenres] = useState([]);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [musicLinks, setMusicLinks] = useState([]);
  const [socials, setSocials] = useState({});

  // Release data
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
  const [trimmerFile, setTrimmerFile] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [premium, setPremium] = useState(false);
  const [accentColor, setAccentColor] = useState(null);
  const [animatedBg, setAnimatedBg] = useState(false);
  const [releaseLayout, setReleaseLayout] = useState('compact');

  useEffect(() => {
    if (!isOwnerOf(handle)) {
      navigate(`/studio/${handle}`);
      return;
    }
    loadArtist(handle).then((a) => {
      if (!a) { navigate(`/studio/${handle}`); return; }
      setArtistName(a.artistName || '');
      setBio(a.bio || '');
      setLocation(a.location || '');
      setGenres(a.genres || []);
      setPhotoUrl(a.photoUrl || null);
      setMusicLinks(a.links || []);
      setSocials(a.socials || {});
      setAccentColor(a.accentColor || null);
      setAnimatedBg(!!a.animatedBg);
      setReleaseLayout(a.releaseLayout || 'compact');
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
    isPremium(handle).then(setPremium);
  }, [handle, navigate]);

  const toggleGenre = (g) =>
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : prev.length < 3 ? [...prev, g] : prev);

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrorMsg('Photo must be under 5MB'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
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
    // Accept up to 25MB raw (will trim to <1MB clip)
    if (file.size > 50 * 1024 * 1024) { setAudioError('File must be under 50MB'); return; }
    try {
      const dur = await getAudioDuration(file);
      if (dur < 1) { setAudioError('Audio too short'); return; }
      // Open the trimmer modal
      setTrimmerFile(file);
    } catch {
      setAudioError('Could not read audio');
    }
  };

  const onTrimComplete = (blob, durationSec) => {
    // Convert Blob back to File so existing upload flow works
    const ext = 'wav';
    const trimmedFile = new File([blob], `preview-${Date.now()}.${ext}`, { type: 'audio/wav' });
    setAudioFile(trimmedFile);
    setTrimmerFile(null);
  };

  const togglePlatform = (p) =>
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const addMusicLink = (platform) =>
    setMusicLinks((prev) => [...prev, { label: platform.label, url: platform.urlPrefix, platformId: platform.id, color: platform.color }]);

  const updateMusicLink = (i, field, v) =>
    setMusicLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: v } : l));

  const removeMusicLink = (i) =>
    setMusicLinks((prev) => prev.filter((_, idx) => idx !== i));

  const updateSocial = (id, url) => setSocials((prev) => ({ ...prev, [id]: url }));

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
      if (!result.ok) { setErrorMsg(result.error || 'Save failed'); setSaving(false); return; }

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
          } else {
            console.error('Audio upload failed:', r.error);
            setErrorMsg('Audio upload failed: ' + (r.error || 'unknown'));
            setSaving(false);
            return;
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

        const rr = releaseId
          ? await updatePresaveRelease(handle, releaseId, releaseFields)
          : await savePresaveRelease(handle, releaseFields);
        if (!rr.ok) { setErrorMsg(rr.error || 'Release save failed'); setSaving(false); return; }
      }

      // Save premium-only accent color
      if (premium && accentColor) {
        await saveAccentColor(handle, accentColor, 'artist');
      }
      // Save premium animated background toggle
      if (premium) {
        await saveAnimatedBg(handle, 'artist', animatedBg);
      }

      // Save layout (free for all)
      await saveReleaseLayout(handle, releaseLayout, 'artist');

      setSavedMsg('Saved ✓');
      setTimeout(() => setSavedMsg(''), 2000);
    } catch (e) {
      setErrorMsg(e.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  // Style helpers
  const inputStyle = {
    background: 'transparent',
    borderBottom: `1px solid ${STUDIO.border}`,
    color: STUDIO.ink,
    fontFamily: STUDIO_FONTS.display,
  };
  const labelStyle = { fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted };

  if (loading) {
    return (
      <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-xs tracking-[0.3em] uppercase font-bold animate-pulse" style={labelStyle}>
          Loading editor…
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: STUDIO.bg, color: STUDIO.ink, minHeight: '100vh' }}>
      <StudioNav minimal />

      <div className="max-w-lg mx-auto px-5 pt-24 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
              EDITING · /{handle}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1" style={{ fontFamily: STUDIO_FONTS.display }}>
              Edit your <span style={{ fontStyle: 'italic', fontWeight: 300, color: STUDIO.accent }}>profile</span>
            </h1>
          </div>
          <Link
            to={`/studio/${handle}`}
            className="text-[10px] tracking-[0.25em] uppercase font-bold hover:opacity-70 shrink-0"
            style={labelStyle}
          >
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
              border: `1px solid ${STUDIO.accent}`,
            }}
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="text-lg">★</span>
              <span className="flex-1" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}>
                Unlock premium features
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
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
              border: `1px solid ${STUDIO.accent}`,
            }}
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="text-lg">★</span>
              <span className="flex-1" style={{ fontFamily: STUDIO_FONTS.display, color: STUDIO.ink }}>
                You're a Plinks Premium member
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
                ACTIVE
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {/* ARTIST NAME */}
          <CollapsibleSection
            label="Artist Name"
            summary={artistName}
            theme="dark"
            defaultOpen={false}
          >
            <input
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="w-full text-xl font-black pb-2 outline-none"
              style={inputStyle}
            />
          </CollapsibleSection>

          {/* BIO */}
          <CollapsibleSection
            label="Bio"
            summary={bio || 'Add a bio'}
            theme="dark"
          >
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={160}
              className="w-full text-base pb-2 outline-none resize-none"
              style={inputStyle}
            />
            <div className="text-[10px] tracking-[0.3em] uppercase mt-1 text-right" style={labelStyle}>
              {bio.length} / 160
            </div>
          </CollapsibleSection>

          {/* LOCATION */}
          <CollapsibleSection
            label="Location"
            summary={location || 'Add location'}
            theme="dark"
          >
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Youngstown, OH"
              className="w-full text-base pb-2 outline-none"
              style={inputStyle}
            />
          </CollapsibleSection>

          {/* PHOTO */}
          <CollapsibleSection
            label="Profile Photo"
            summary={(photoPreview || photoUrl) ? '✓ Uploaded' : 'No photo'}
            theme="dark"
          >
            <div className="flex items-center gap-3">
              {(photoPreview || photoUrl) && (
                <img
                  src={photoPreview || photoUrl}
                  alt=""
                  className="w-16 h-16 object-cover rounded-full"
                  style={{ border: `1px solid ${STUDIO.borderStrong}` }}
                />
              )}
              <label
                className="text-[10px] tracking-[0.25em] uppercase font-bold border px-3 py-1.5 cursor-pointer hover:scale-[1.02] transition-transform inline-block"
                style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink }}
              >
                {(photoPreview || photoUrl) ? 'Replace' : 'Upload'}
                <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
              </label>
            </div>
          </CollapsibleSection>

          {/* GENRES */}
          <CollapsibleSection
            label="Genres"
            summary={genres.length ? genres.join(' · ') : 'Pick up to 3'}
            theme="dark"
          >
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((g) => {
                const active = genres.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className="text-[10px] tracking-[0.25em] uppercase font-bold px-2.5 py-1 border transition-all"
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
          </CollapsibleSection>

          {/* MUSIC LINKS */}
          <CollapsibleSection
            label="Music Links"
            summary={musicLinks.length ? `${musicLinks.length} link${musicLinks.length === 1 ? '' : 's'}` : 'Add links'}
            theme="dark"
          >
            <div className="space-y-2 mb-3">
              {musicLinks.map((l, i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center p-2 border" style={{ borderColor: STUDIO.border }}>
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
                  <button onClick={() => removeMusicLink(i)} className="text-xs opacity-60 hover:opacity-100 px-1" style={{ color: STUDIO.muted }}>✕</button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MUSIC_PLATFORMS.filter((p) => !musicLinks.find((l) => l.platformId === p.id)).map((p) => (
                <button
                  key={p.id}
                  onClick={() => addMusicLink(p)}
                  className="text-[10px] tracking-[0.25em] uppercase font-bold px-2.5 py-1 border hover:scale-[1.02] transition-all"
                  style={{ borderColor: STUDIO.border, color: STUDIO.muted, fontFamily: STUDIO_FONTS.mono }}
                >
                  + {p.label}
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* SOCIALS */}
          <CollapsibleSection
            label="Socials"
            summary={(() => {
              const filled = Object.entries(socials).filter(([, v]) => v && v.trim());
              return filled.length ? `${filled.length} connected` : 'Add socials';
            })()}
            theme="dark"
          >
            <div className="space-y-2">
              {SOCIAL_PLATFORMS.map((s) => (
                <div key={s.id} className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>{s.label}</span>
                  <input
                    value={socials[s.id] || ''}
                    onChange={(e) => updateSocial(s.id, e.target.value)}
                    placeholder={s.urlPrefix + 'yourname'}
                    className="bg-transparent outline-none text-xs pb-1"
                    style={{ ...inputStyle, fontFamily: STUDIO_FONTS.mono }}
                  />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* RELEASE DIVIDER */}
          <div className="pt-4 pb-2">
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
              § Release
            </div>
          </div>

          {/* LAYOUT PICKER */}
          <CollapsibleSection
            label="Layout"
            summary={
              releaseLayout === 'showcase' ? 'Showcase (big cover)' :
              releaseLayout === 'minimal' ? 'Minimal (lnk.to style)' :
              'Compact (mini player)'
            }
            theme="dark"
          >
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setReleaseLayout('compact')}
                className="p-2 transition-all text-left"
                style={{
                  background: releaseLayout === 'compact' ? STUDIO.surfaceHigh : 'transparent',
                  border: `2px solid ${releaseLayout === 'compact' ? STUDIO.accent : STUDIO.border}`,
                }}
              >
                <div className="flex items-center gap-1 mb-2" style={{ background: '#0A0A0A', padding: 3 }}>
                  <div className="w-5 h-5" style={{ background: STUDIO.muted }} />
                  <div className="flex-1 space-y-1">
                    <div className="h-1 w-3/4" style={{ background: STUDIO.muted }} />
                    <div className="h-1 w-1/2" style={{ background: STUDIO.border }} />
                  </div>
                  <div className="w-3 h-3 rounded-full" style={{ background: STUDIO.accent }} />
                </div>
                <div className="space-y-1">
                  <div className="h-1 w-full" style={{ background: STUDIO.border }} />
                  <div className="h-1 w-full" style={{ background: STUDIO.border }} />
                </div>
                <div className="text-[9px] tracking-[0.2em] uppercase font-bold mt-2" style={{ fontFamily: STUDIO_FONTS.mono, color: releaseLayout === 'compact' ? STUDIO.accent : STUDIO.muted }}>
                  Compact
                </div>
              </button>

              <button
                onClick={() => setReleaseLayout('showcase')}
                className="p-2 transition-all text-left"
                style={{
                  background: releaseLayout === 'showcase' ? STUDIO.surfaceHigh : 'transparent',
                  border: `2px solid ${releaseLayout === 'showcase' ? STUDIO.accent : STUDIO.border}`,
                }}
              >
                <div className="aspect-square mb-2 flex items-center justify-center" style={{ background: STUDIO.muted }}>
                  <div className="w-4 h-4 rounded-full" style={{ background: STUDIO.accent }} />
                </div>
                <div className="space-y-1 mb-1">
                  <div className="h-1 w-2/3 mx-auto" style={{ background: STUDIO.ink }} />
                </div>
                <div className="space-y-1">
                  <div className="h-1 w-full" style={{ background: STUDIO.border }} />
                </div>
                <div className="text-[9px] tracking-[0.2em] uppercase font-bold mt-2" style={{ fontFamily: STUDIO_FONTS.mono, color: releaseLayout === 'showcase' ? STUDIO.accent : STUDIO.muted }}>
                  Showcase
                </div>
              </button>

              <button
                onClick={() => setReleaseLayout('minimal')}
                className="p-2 transition-all text-left"
                style={{
                  background: releaseLayout === 'minimal' ? STUDIO.surfaceHigh : 'transparent',
                  border: `2px solid ${releaseLayout === 'minimal' ? STUDIO.accent : STUDIO.border}`,
                }}
              >
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-5 h-5" style={{ background: STUDIO.muted }} />
                  <div className="flex-1 space-y-1">
                    <div className="h-1 w-2/3" style={{ background: STUDIO.muted }} />
                  </div>
                </div>
                <div className="h-1 w-full mb-2" style={{ background: STUDIO.accent }} />
                <div className="space-y-1">
                  <div className="h-2 w-full" style={{ background: STUDIO.surfaceHigh, border: `1px solid ${STUDIO.border}` }} />
                  <div className="h-2 w-full" style={{ background: STUDIO.surfaceHigh, border: `1px solid ${STUDIO.border}` }} />
                  <div className="h-2 w-full" style={{ background: STUDIO.surfaceHigh, border: `1px solid ${STUDIO.border}` }} />
                </div>
                <div className="text-[9px] tracking-[0.2em] uppercase font-bold mt-2" style={{ fontFamily: STUDIO_FONTS.mono, color: releaseLayout === 'minimal' ? STUDIO.accent : STUDIO.muted }}>
                  Minimal
                </div>
              </button>
            </div>
            <div className="mt-3 text-[10px] tracking-[0.25em] uppercase opacity-60" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
              Compact · Showcase · Minimal (lnk.to)
            </div>
          </CollapsibleSection>

          {/* TRACK TITLE */}
          <CollapsibleSection
            label="Track Title"
            summary={trackTitle || 'Add a release'}
            theme="dark"
          >
            <input
              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              placeholder="Snake Eyes"
              className="w-full text-xl font-black pb-2 outline-none"
              style={inputStyle}
            />
          </CollapsibleSection>

          {/* RELEASE DATE */}
          <CollapsibleSection
            label="Release Date"
            summary={releaseDate || 'Not set'}
            theme="dark"
          >
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className="w-full text-base pb-2 outline-none"
              style={inputStyle}
            />
          </CollapsibleSection>

          {/* COVER ART */}
          <CollapsibleSection
            label="Cover Art"
            summary={(coverPreview || coverArtUrl) ? '✓ Uploaded' : 'No cover'}
            theme="dark"
          >
            <div className="flex items-center gap-3">
              {(coverPreview || coverArtUrl) && (
                <img
                  src={coverPreview || coverArtUrl}
                  alt=""
                  className="w-16 h-16 object-cover"
                  style={{ border: `1px solid ${STUDIO.borderStrong}` }}
                />
              )}
              <label
                className="text-[10px] tracking-[0.25em] uppercase font-bold border px-3 py-1.5 cursor-pointer hover:scale-[1.02] transition-transform inline-block"
                style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink }}
              >
                {(coverPreview || coverArtUrl) ? 'Replace' : 'Upload'}
                <input type="file" accept="image/*" onChange={onCoverChange} className="hidden" />
              </label>
            </div>
          </CollapsibleSection>

          {/* AUDIO PREVIEW */}
          <CollapsibleSection
            label="Audio Preview"
            summary={(audioFile || audioPreviewUrl) ? '✓ Uploaded · trimmed clip' : 'Upload + trim to 30s'}
            theme="dark"
          >
            <div className="flex items-center gap-3 flex-wrap">
              {(audioFile || audioPreviewUrl) && (
                <span className="text-xs truncate max-w-[200px]" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                  ♪ {audioFile ? audioFile.name : 'current'}
                </span>
              )}
              <label
                className="text-[10px] tracking-[0.25em] uppercase font-bold border px-3 py-1.5 cursor-pointer hover:scale-[1.02] transition-transform inline-block"
                style={{ borderColor: STUDIO.border, fontFamily: STUDIO_FONTS.mono, color: STUDIO.ink }}
              >
                {(audioFile || audioPreviewUrl) ? 'Replace' : 'Upload'}
                <input type="file" accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg,.flac" onChange={onAudioChange} className="hidden" />
              </label>
            </div>
            {audioError && <div className="mt-2 text-xs" style={{ color: STUDIO.accent, fontFamily: STUDIO_FONTS.mono }}>{audioError}</div>}
          </CollapsibleSection>

          {/* PRESAVE URL */}
          <CollapsibleSection
            label="Presave URL"
            summary={presaveUrl || 'Not set'}
            theme="dark"
          >
            <input
              value={presaveUrl}
              onChange={(e) => setPresaveUrl(e.target.value)}
              placeholder="https://distrokid.com/hyperfollow/..."
              className="w-full text-xs pb-2 outline-none"
              style={{ ...inputStyle, fontFamily: STUDIO_FONTS.mono }}
            />
          </CollapsibleSection>

          {/* PLATFORMS */}
          <CollapsibleSection
            label="Available On"
            summary={platforms.length ? platforms.join(' · ') : 'Pick platforms'}
            theme="dark"
          >
            <div className="flex flex-wrap gap-1.5">
              {['Spotify','Apple','SoundCloud','YouTube','Tidal','Bandcamp'].map((p) => {
                const active = platforms.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className="text-[10px] tracking-[0.25em] uppercase font-bold px-2.5 py-1 border transition-all"
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
          </CollapsibleSection>

          {/* PREMIUM SECTION */}
          {premium && (
            <>
              <div className="pt-4 pb-2">
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.accent }}>
                  ★ § PREMIUM
                </div>
              </div>

              <CollapsibleSection
                label="Accent Color"
                summary={accentColor ? PREMIUM_PALETTE.find((p) => p.value === accentColor)?.name || 'Custom' : 'Plinks Orange (default)'}
                theme="dark"
              >
                <div className="grid grid-cols-4 gap-2">
                  {PREMIUM_PALETTE.map((c) => {
                    const active = accentColor === c.value;
                    return (
                      <button
                        key={c.value}
                        onClick={() => setAccentColor(c.value)}
                        className="aspect-square flex items-center justify-center transition-transform hover:scale-105"
                        style={{
                          background: c.value,
                          border: active ? `2px solid ${STUDIO.ink}` : `1px solid ${STUDIO.border}`,
                          boxShadow: active ? `0 0 12px ${c.value}` : 'none',
                        }}
                        title={c.name}
                      >
                        {active && <span style={{ color: '#0A0A0A', fontWeight: 'bold' }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 text-[10px] tracking-[0.25em] uppercase opacity-60" style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}>
                  Changes your profile's accent color
                </div>
              </CollapsibleSection>

              {/* Animated background — premium toggle */}
              <CollapsibleSection
                label="Animated background"
                summary={animatedBg ? '✓ ON · subtle drift' : 'OFF'}
                theme="dark"
              >
                <div className="space-y-3">
                  <div className="text-xs leading-relaxed" style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.display }}>
                    Adds a slow drifting accent-color glow behind your profile. Subtle motion — won't distract from the music.
                  </div>
                  <button
                    onClick={() => setAnimatedBg((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 transition-all"
                    style={{
                      background: animatedBg ? STUDIO.surfaceHigh : 'transparent',
                      border: `2px solid ${animatedBg ? STUDIO.accent : STUDIO.border}`,
                    }}
                  >
                    <span className="text-[11px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: STUDIO_FONTS.mono, color: animatedBg ? STUDIO.accent : STUDIO.ink }}>
                      {animatedBg ? '✓ Enabled' : 'Tap to enable'}
                    </span>
                    <span className="w-10 h-5 rounded-full relative transition-colors" style={{ background: animatedBg ? STUDIO.accent : STUDIO.border }}>
                      <span className="absolute top-0.5 w-4 h-4 rounded-full transition-all" style={{
                        background: animatedBg ? STUDIO.ink : STUDIO.muted,
                        left: animatedBg ? '22px' : '2px',
                      }} />
                    </span>
                  </button>
                </div>
              </CollapsibleSection>
            </>
          )}

          {/* Profile type switch */}
          <CollapsibleSection label="Profile type" summary="Artist · Switch to Creator" theme="dark">
            <div className="space-y-3">
              <div className="text-xs leading-relaxed" style={{ color: STUDIO.muted, fontFamily: STUDIO_FONTS.display }}>
                Not making music anymore? Switch to a Creator profile (no audio player, just link cards). Your handle, bio, premium status stay.
              </div>
              <button
                onClick={async () => {
                  if (!confirm(`Switch /${handle} to a CREATOR profile? Audio previews and releases will be hidden.`)) return;
                  const r = await convertToCreator(handle, 'creator');
                  if (r.ok) {
                    alert('Switched to creator! Reloading.');
                    window.location.href = `/${handle}/edit`;
                  } else {
                    alert('Switch failed: ' + r.error);
                  }
                }}
                className="w-full text-[11px] tracking-[0.3em] uppercase font-bold py-3 transition-transform hover:scale-[1.01]"
                style={{ background: STUDIO.accent, color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }}
              >
                ✦ Switch to Creator →
              </button>
            </div>
          </CollapsibleSection>
        </div>
      </div>

      {/* Audio trimmer modal */}
      {trimmerFile && (
        <AudioTrimmer
          file={trimmerFile}
          onClose={() => setTrimmerFile(null)}
          onTrim={onTrimComplete}
        />
      )}

      {/* Sticky save bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-5 py-3 border-t backdrop-blur"
        style={{ background: 'rgba(10,10,10,0.92)', borderColor: STUDIO.borderStrong }}
      >
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {errorMsg && (
            <div className="flex-1 text-xs truncate" style={{ color: STUDIO.accent, fontFamily: STUDIO_FONTS.mono }}>⚠ {errorMsg}</div>
          )}
          {savedMsg && (
            <div className="flex-1 text-xs" style={{ color: STUDIO.accent, fontFamily: STUDIO_FONTS.mono }}>{savedMsg}</div>
          )}
          {!errorMsg && !savedMsg && (
            <Link
              to={`/studio/${handle}`}
              className="text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70"
              style={{ fontFamily: STUDIO_FONTS.mono, color: STUDIO.muted }}
            >
              ← Cancel
            </Link>
          )}
          <div className="flex-1" />
          <motion.button
            onClick={save}
            disabled={saving}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 text-[11px] tracking-[0.3em] uppercase font-bold disabled:opacity-40"
            style={{ background: STUDIO.accent, color: STUDIO.ink, fontFamily: STUDIO_FONTS.mono }}
          >
            {saving ? 'Saving…' : 'Save →'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
