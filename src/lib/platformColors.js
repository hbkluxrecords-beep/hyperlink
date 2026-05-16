// Brand colors for music + social platforms. Used as small dots/accents
// in dark-themed link cards. NEVER as full logos (copyright).

export const PLATFORM_COLORS = {
  spotify: '#1DB954',
  apple: '#FA243C',
  applemusic: '#FA243C',
  soundcloud: '#FF5500',
  youtube: '#FF0000',
  youtubemusic: '#FF0000',
  tidal: '#00FFFF',
  bandcamp: '#629AA9',
  amazon: '#00A8E1',
  amazonmusic: '#00A8E1',
  deezer: '#FEAA2D',
  audius: '#7E1BCC',
  twitch: '#9146FF',
  twitter: '#1DA1F2',
  x: '#FFFFFF',
  instagram: '#E1306C',
  tiktok: '#FE2C55',
  github: '#FFFFFF',
  discord: '#5865F2',
  patreon: '#FF424D',
  paypal: '#003087',
  kofi: '#FF5E5B',
  email: '#8A8680',
  website: '#FF4D1F',
};

/**
 * Detect platform from a label or URL. Returns the dot color
 * or the default accent if no match.
 */
export function platformColor(labelOrUrl) {
  if (!labelOrUrl) return '#FF4D1F';
  const s = labelOrUrl.toLowerCase().replace(/\s+/g, '');
  for (const [key, color] of Object.entries(PLATFORM_COLORS)) {
    if (s.includes(key)) return color;
  }
  return '#FF4D1F';
}
