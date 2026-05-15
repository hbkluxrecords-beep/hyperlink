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

export function getSessionId() {
  let id = sessionStorage.getItem('plinks-session');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('plinks-session', id);
  }
  return id;
}
