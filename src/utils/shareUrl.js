/**
 * The backend's share_url field points at its own API host and path
 * (e.g. "http://127.0.0.1:8000/api/v1/share/{token}") — that's a raw API
 * endpoint that returns JSON, not our rendered SharedRide.jsx page. If we
 * hand that URL to users to share, whoever opens it gets broken output
 * instead of the actual shared-ride screen.
 *
 * The fix: always build our own frontend URL from the token, and only use
 * the backend's share_url as a source to extract that token from when we
 * don't have it directly (e.g. the booking-detail endpoint only returns
 * share_url, not share_token, separately).
 */

export function buildShareUrl(token) {
  if (!token) return '';
  return `${window.location.origin}/share/${token}`;
}

export function extractShareToken(rawShareUrl) {
  if (!rawShareUrl) return null;
  const parts = rawShareUrl.split('/').filter(Boolean);
  return parts[parts.length - 1] || null;
}
