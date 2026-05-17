// Audio utility — validates duration, generates waveform data
export async function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => resolve(audio.duration);
    audio.onerror = () => reject(new Error('Could not read audio file'));
    audio.src = URL.createObjectURL(file);
  });
}

export async function generateWaveformData(file, samples = 60) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return Array.from({ length: samples }, () => 0.3 + Math.random() * 0.5);

    const audioCtx = new AudioCtx();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const rawData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData = [];

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      const start = i * blockSize;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[start + j] || 0);
      }
      filteredData.push(sum / blockSize);
    }

    const max = Math.max(...filteredData) || 1;
    return filteredData.map((v) => v / max);
  } catch (e) {
    return Array.from({ length: samples }, () => 0.3 + Math.random() * 0.5);
  }
}

export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Decode a file into an AudioBuffer once so the trimmer can scrub
 * without re-decoding on every change.
 */
export async function decodeAudioFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) throw new Error('Web Audio API not supported');
  const ctx = new AudioCtx();
  const buffer = await ctx.decodeAudioData(arrayBuffer);
  ctx.close();
  return buffer;
}

/**
 * Compute peak amplitudes for waveform rendering across an existing AudioBuffer.
 */
export function bufferToWaveform(buffer, samples = 200) {
  const data = buffer.getChannelData(0);
  const blockSize = Math.floor(data.length / samples);
  const result = [];
  for (let i = 0; i < samples; i++) {
    let max = 0;
    const start = i * blockSize;
    for (let j = 0; j < blockSize; j++) {
      const v = Math.abs(data[start + j] || 0);
      if (v > max) max = v;
    }
    result.push(max);
  }
  const peak = Math.max(...result) || 1;
  return result.map((v) => v / peak);
}

/**
 * Slice an AudioBuffer between startSec and endSec, returning a WAV Blob.
 */
export async function trimAudioToWav(buffer, startSec, endSec) {
  const sampleRate = buffer.sampleRate;
  const channels = buffer.numberOfChannels;
  const startSample = Math.floor(startSec * sampleRate);
  const endSample = Math.floor(endSec * sampleRate);
  const length = endSample - startSample;

  // Build a new buffer with only the selected range
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const offline = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
    channels,
    length,
    sampleRate
  );

  const sliced = offline.createBuffer(channels, length, sampleRate);
  for (let c = 0; c < channels; c++) {
    const src = buffer.getChannelData(c);
    const dst = sliced.getChannelData(c);
    for (let i = 0; i < length; i++) {
      dst[i] = src[startSample + i] || 0;
    }
  }

  // Encode as WAV
  return encodeWAV(sliced);
}

/**
 * Encode an AudioBuffer as a 16-bit PCM WAV Blob.
 */
function encodeWAV(audioBuffer) {
  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave channels and write 16-bit PCM samples
  let offset = 44;
  const channelData = [];
  for (let c = 0; c < channels; c++) channelData.push(audioBuffer.getChannelData(c));

  for (let i = 0; i < length; i++) {
    for (let c = 0; c < channels; c++) {
      let sample = Math.max(-1, Math.min(1, channelData[c][i]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, sample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

export function getSessionId() {
  let id = sessionStorage.getItem('plinks-session');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('plinks-session', id);
  }
  return id;
}
