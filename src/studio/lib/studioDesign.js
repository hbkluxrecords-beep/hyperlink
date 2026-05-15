// Plinks Studio — dark cinematic music-industry design tokens
export const STUDIO = {
  bg: '#0A0A0A',
  surface: '#141414',
  surfaceElevated: '#1F1F1F',
  ink: '#F2EFE6',
  accent: '#FF4D1F',
  gold: '#FFD700',
  muted: '#6B6B6B',
  border: 'rgba(242, 239, 230, 0.1)',
  borderStrong: 'rgba(242, 239, 230, 0.2)',
};

export const GENRES = [
  'HIP-HOP', 'R&B', 'POP', 'INDIE', 'ROCK', 'ELECTRONIC', 'HOUSE',
  'TECHNO', 'JAZZ', 'SOUL', 'FUNK', 'AMBIENT', 'EXPERIMENTAL',
  'AFROBEATS', 'LATIN', 'COUNTRY', 'METAL', 'PUNK', 'CLASSICAL',
  'LO-FI', 'TRAP', 'DRILL', 'DANCEHALL', 'REGGAE',
];

export const MUSIC_PLATFORMS = [
  { id: 'spotify', label: 'Spotify', color: '#1DB954', urlPrefix: 'https://open.spotify.com/' },
  { id: 'apple', label: 'Apple Music', color: '#FA243C', urlPrefix: 'https://music.apple.com/' },
  { id: 'soundcloud', label: 'SoundCloud', color: '#FF5500', urlPrefix: 'https://soundcloud.com/' },
  { id: 'youtube', label: 'YouTube Music', color: '#FF0000', urlPrefix: 'https://music.youtube.com/' },
  { id: 'bandcamp', label: 'Bandcamp', color: '#629AA9', urlPrefix: 'https://bandcamp.com/' },
  { id: 'tidal', label: 'Tidal', color: '#000000', urlPrefix: 'https://tidal.com/' },
];

export const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', urlPrefix: 'https://instagram.com/' },
  { id: 'twitter', label: 'X / Twitter', urlPrefix: 'https://x.com/' },
  { id: 'tiktok', label: 'TikTok', urlPrefix: 'https://tiktok.com/@' },
];

export const STUDIO_FONTS = {
  display: '"Fraunces", ui-serif, Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};
