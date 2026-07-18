/**
 * The recurring visual signature across the site: a dashed route between
 * two terminus stops. It's not decoration — it's the literal shape of
 * what TashaXpress sells (a route from A to B), reused at different
 * scales in the hero, section dividers, and footer.
 */
export default function RouteLine({ className = '', variant = 'wide' }) {
  if (variant === 'wide') {
    return (
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M0 90 C 200 90, 260 20, 460 20 S 720 100, 940 60 S 1100 10, 1200 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 16"
          opacity="0.5"
        />
        <circle cx="4" cy="90" r="7" fill="currentColor" />
        <circle cx="1196" cy="30" r="7" fill="currentColor" />
      </svg>
    );
  }

  // compact: small horizontal route mark, e.g. next to a wordmark
  return (
    <svg viewBox="0 0 64 16" className={className} aria-hidden="true">
      <circle cx="4" cy="8" r="3.5" fill="currentColor" />
      <path
        d="M9 8 H55"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 7"
        opacity="0.6"
      />
      <circle cx="60" cy="8" r="3.5" fill="currentColor" />
    </svg>
  );
}
