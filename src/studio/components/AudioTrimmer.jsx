import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { decodeAudioFile, bufferToWaveform, trimAudioToWav, formatTime } from '../lib/audioUtils.js';

const ACCENT = '#FF4D1F';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const BG = '#0A0A0A';
const SURFACE = '#141414';
const BORDER = 'rgba(255,255,255,0.18)';
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

const DEFAULT_MAX_DURATION = 30; // seconds — overrideable via prop

/**
 * Modal that lets the user pick a clip out of any-length audio file.
 *
 * Props:
 *   file - the File from the input
 *   onClose - cancel/X
 *   onTrim(blob, duration) - called with trimmed WAV blob + duration in seconds
 *   maxDuration - optional max clip length (defaults to 30s); pass null/0 to allow full length
 */
export default function AudioTrimmer({ file, onClose, onTrim, maxDuration = DEFAULT_MAX_DURATION }) {
  const MAX_DURATION = maxDuration && maxDuration > 0 ? maxDuration : Infinity;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buffer, setBuffer] = useState(null);
  const [waveform, setWaveform] = useState([]);
  const [duration, setDuration] = useState(0);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(MAX_DURATION === Infinity ? 0 : MAX_DURATION);
  const [playing, setPlaying] = useState(false);
  const [trimming, setTrimming] = useState(false);

  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const playTimeoutRef = useRef(null);

  // Decode the file once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const buf = await decodeAudioFile(file);
        if (cancelled) return;
        const dur = buf.duration;
        setBuffer(buf);
        setWaveform(bufferToWaveform(buf, 200));
        setDuration(dur);
        // Default: first MAX_DURATION secs, or full file if max is unlimited/file is shorter
        setStartSec(0);
        setEndSec(Math.min(MAX_DURATION, dur));
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Could not load audio');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [file]);

  // Set up audio element for preview
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (audioRef.current) {
      audioRef.current.src = url;
    }
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Pause playback if range changes
  useEffect(() => {
    if (audioRef.current && playing) {
      audioRef.current.pause();
      setPlaying(false);
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startSec, endSec]);

  const playPreview = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
      return;
    }
    audioRef.current.currentTime = startSec;
    audioRef.current.play();
    setPlaying(true);
    const stopAfter = (endSec - startSec) * 1000;
    playTimeoutRef.current = setTimeout(() => {
      if (audioRef.current) audioRef.current.pause();
      setPlaying(false);
    }, stopAfter);
  };

  const onTrimClick = async () => {
    if (!buffer) return;
    setTrimming(true);
    try {
      const blob = await trimAudioToWav(buffer, startSec, endSec);
      onTrim(blob, endSec - startSec);
    } catch (e) {
      setError('Trim failed: ' + e.message);
      setTrimming(false);
    }
  };

  const handleDrag = (which, clientX) => {
    if (!containerRef.current || duration === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newSec = ratio * duration;

    if (which === 'start') {
      const clamped = Math.max(0, Math.min(newSec, endSec - 1));
      // Don't let span exceed MAX
      if (endSec - clamped > MAX_DURATION) {
        setEndSec(clamped + MAX_DURATION);
      }
      setStartSec(clamped);
    } else {
      const clamped = Math.max(startSec + 1, Math.min(newSec, duration));
      // Don't let span exceed MAX
      if (clamped - startSec > MAX_DURATION) {
        setStartSec(clamped - MAX_DURATION);
      }
      setEndSec(clamped);
    }
  };

  const startPercent = duration > 0 ? (startSec / duration) * 100 : 0;
  const endPercent = duration > 0 ? (endSec / duration) * 100 : 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg p-5"
          style={{ background: BG, border: `1px solid ${BORDER}` }}
        >
          <audio ref={audioRef} preload="metadata" />

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[10px] tracking-[0.35em] uppercase font-bold" style={{ fontFamily: MONO, color: ACCENT }}>
                ◆ TRIM PREVIEW
              </div>
              <div className="text-lg font-black tracking-tight mt-1" style={{ fontFamily: DISPLAY, color: INK }}>
                {MAX_DURATION === Infinity ? 'Pick your clip' : `Pick your ${MAX_DURATION}s`}
              </div>
            </div>
            <button onClick={onClose} className="text-xl opacity-60 hover:opacity-100" style={{ color: MUTED }}>✕</button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs tracking-[0.3em] uppercase font-bold animate-pulse" style={{ fontFamily: MONO, color: MUTED }}>
              Decoding audio…
            </div>
          ) : error ? (
            <div className="py-8 text-center text-sm" style={{ fontFamily: MONO, color: ACCENT }}>
              ⚠ {error}
            </div>
          ) : (
            <>
              {/* Waveform with handles */}
              <div
                ref={containerRef}
                className="relative w-full h-24 select-none"
                style={{ background: SURFACE, border: `1px solid rgba(255,255,255,0.08)` }}
              >
                {/* Waveform bars */}
                <div className="absolute inset-0 flex items-center px-1">
                  {waveform.map((v, i) => {
                    const sampleRatio = i / waveform.length;
                    const sampleSec = sampleRatio * duration;
                    const inRange = sampleSec >= startSec && sampleSec <= endSec;
                    return (
                      <div
                        key={i}
                        className="flex-1 mx-[0.5px]"
                        style={{
                          height: `${Math.max(2, v * 100)}%`,
                          background: inRange ? ACCENT : 'rgba(255,255,255,0.2)',
                          transition: 'background 0.15s',
                        }}
                      />
                    );
                  })}
                </div>

                {/* Range selection overlay */}
                <div
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{
                    left: `${startPercent}%`,
                    width: `${endPercent - startPercent}%`,
                    background: `${ACCENT}10`,
                    borderLeft: `2px solid ${ACCENT}`,
                    borderRight: `2px solid ${ACCENT}`,
                  }}
                />

                {/* Start handle */}
                <DragHandle
                  position={startPercent}
                  onDrag={(x) => handleDrag('start', x)}
                />
                {/* End handle */}
                <DragHandle
                  position={endPercent}
                  onDrag={(x) => handleDrag('end', x)}
                />
              </div>

              {/* Timeline labels */}
              <div className="flex items-center justify-between mt-3 text-[10px] tracking-[0.25em] uppercase font-bold" style={{ fontFamily: MONO, color: MUTED }}>
                <span>{formatTime(startSec)}</span>
                <span style={{ color: ACCENT }}>{formatTime(endSec - startSec)} CLIP</span>
                <span>{formatTime(endSec)}</span>
              </div>

              {/* Preview play */}
              <button
                onClick={playPreview}
                className="w-full mt-5 py-3 text-[11px] tracking-[0.3em] uppercase font-bold border hover:scale-[1.01] transition-transform"
                style={{
                  borderColor: BORDER,
                  color: INK,
                  fontFamily: MONO,
                  background: playing ? `${ACCENT}20` : 'transparent',
                }}
              >
                {playing ? '⏸ Stop preview' : '▶ Preview selection'}
              </button>

              {/* Use this clip */}
              <button
                onClick={onTrimClick}
                disabled={trimming}
                className="w-full mt-2 py-3.5 text-[11px] tracking-[0.3em] uppercase font-bold hover:scale-[1.01] transition-transform disabled:opacity-40"
                style={{ background: ACCENT, color: BG, fontFamily: MONO }}
              >
                {trimming ? 'Trimming…' : 'Use this clip →'}
              </button>

              <div className="mt-4 text-[10px] tracking-[0.25em] uppercase opacity-50 text-center" style={{ fontFamily: MONO, color: MUTED }}>
                {MAX_DURATION === Infinity ? 'Drag the orange handles · Any length' : `Drag the orange handles · Max ${MAX_DURATION}s`}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Draggable handle on the waveform. Supports mouse + touch.
 */
function DragHandle({ position, onDrag }) {
  const startDrag = (clientX) => {
    onDrag(clientX);
    const move = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      onDrag(x);
    };
    const stop = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
  };

  return (
    <div
      className="absolute top-0 bottom-0 cursor-ew-resize z-10 flex items-center justify-center"
      style={{
        left: `calc(${position}% - 12px)`,
        width: 24,
        touchAction: 'none',
      }}
      onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX); }}
      onTouchStart={(e) => { e.preventDefault(); startDrag(e.touches[0].clientX); }}
    >
      <div
        className="w-1 h-full"
        style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center"
        style={{ background: ACCENT, color: BG, fontSize: 10, fontWeight: 900 }}
      >
        ⇄
      </div>
    </div>
  );
}
