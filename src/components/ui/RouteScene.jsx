/**
 * Hero signature visual — an evolution of RouteLine into a full scene.
 * A bus travels a dashed route between two terminal pins, with a stack of
 * "seat" dots trailing behind it like a boarding manifest. This is the
 * literal product (a route, a seat, a ticket) rendered as the hero, rather
 * than a generic gradient blob or stock photo.
 */
export default function RouteScene({ className = '' }) {
  return (
    <svg
      viewBox="0 0 520 460"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="rs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-danfo)" stopOpacity="0.14" />
          <stop offset="1" stopColor="var(--color-danfo)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rs-bus" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-danfo)" />
          <stop offset="1" stopColor="var(--color-danfo-dark)" />
        </linearGradient>
      </defs>

      <circle cx="260" cy="210" r="230" fill="url(#rs-sky)" />

      {/* the route */}
      <path
        d="M60 340 C 120 260, 140 150, 250 130 S 430 160, 460 90"
        fill="none"
        stroke="var(--color-asphalt)"
        strokeOpacity="0.14"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="2 18"
      />

      {/* origin terminal */}
      <g transform="translate(60 340)">
        <circle r="11" fill="var(--color-signal)" />
        <circle r="11" fill="var(--color-signal)" opacity="0.35">
          <animate attributeName="r" values="11;20;11" dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.35;0;0.35" dur="2.8s" repeatCount="indefinite" />
        </circle>
      </g>
      <text x="34" y="378" className="font-display" fontSize="15" fontWeight="700" fill="var(--color-asphalt)">
        Lagos
      </text>

      {/* destination terminal */}
      <g transform="translate(460 90)">
        <circle r="11" fill="var(--color-premium)" />
      </g>
      <text x="424" y="62" className="font-display" fontSize="15" fontWeight="700" fill="var(--color-asphalt)">
        Abuja
      </text>

      {/* bus riding the route */}
      <g transform="translate(250 130)">
        <ellipse cx="0" cy="34" rx="46" ry="8" fill="var(--color-asphalt)" opacity="0.1" />
        <g transform="rotate(-24)">
          <rect x="-42" y="-24" width="84" height="46" rx="16" fill="url(#rs-bus)" />
          <rect x="-34" y="-15" width="20" height="16" rx="4" fill="white" opacity="0.9" />
          <rect x="-9" y="-15" width="20" height="16" rx="4" fill="white" opacity="0.9" />
          <rect x="16" y="-15" width="20" height="16" rx="4" fill="white" opacity="0.7" />
          <circle cx="-24" cy="24" r="8" fill="var(--color-asphalt)" />
          <circle cx="24" cy="24" r="8" fill="var(--color-asphalt)" />
          <circle cx="-24" cy="24" r="3" fill="var(--color-paper)" />
          <circle cx="24" cy="24" r="3" fill="var(--color-paper)" />
        </g>
      </g>

      {/* trailing seat dots, like a filling manifest */}
      {[
        [190, 172],
        [155, 210],
        [130, 255],
        [112, 300],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill="var(--color-danfo)" opacity={0.55 - i * 0.1} />
      ))}
    </svg>
  );
}
