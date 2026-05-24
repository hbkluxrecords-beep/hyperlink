import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { captureReferrer } from '../lib/referrals.js';

/**
 * /r/:handle — captures the referrer, then sends the visitor to the homepage
 * (or to signup) so they can create an account that gets attributed.
 */
export default function ReferralCapture() {
  const { handle } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (handle) captureReferrer(handle);
    // Send them to the landing page to explore + sign up
    navigate('/', { replace: true });
  }, [handle, navigate]);

  return null;
}
