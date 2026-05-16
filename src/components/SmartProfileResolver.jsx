import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isHandleTakenAnywhere } from '../lib/storage.js';
import Profile from '../pages/Profile.jsx';
import StudioProfile from '../studio/pages/StudioProfile.jsx';
import NotFound from '../pages/NotFound.jsx';

/**
 * Routes plinks.dev/:handle to the correct profile design.
 * Checks artist_profiles first, then profiles. Falls back to NotFound.
 *
 * Important: studio profile designs (dark, audio player, etc) stay 100% separate
 * from creator profile designs (cream, link blocks). Only the URL is unified.
 */
export default function SmartProfileResolver() {
  const { handle } = useParams();
  const [type, setType] = useState(null); // 'artist' | 'creator' | 'none' | null (loading)

  useEffect(() => {
    let cancelled = false;
    setType(null);
    isHandleTakenAnywhere(handle).then((result) => {
      if (cancelled) return;
      if (result.taken && result.type) {
        setType(result.type);
      } else {
        setType('none');
      }
    });
    return () => { cancelled = true; };
  }, [handle]);

  if (type === null) {
    // Loading — return null instead of a spinner because both Profile and StudioProfile
    // have their own loading states. A flash of nothing is better than a flash of the
    // wrong theme.
    return null;
  }

  if (type === 'artist') return <StudioProfile />;
  if (type === 'creator') return <Profile />;
  return <NotFound />;
}
