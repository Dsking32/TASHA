import { useEffect, useRef, useState } from 'react';

/**
 * Hand-drawn pink mark around a word — the brand's way of pointing at what
 * matters in a headline. Draws itself in once, after `delay` ms.
 *
 * variant="circle"    loose oval around the word
 * variant="underline" quick swoosh under it
 */
const PATHS = {
  circle:
    'M0.62 0.12 C0.85 0.14 1.0 0.32 0.98 0.55 C0.95 0.85 0.62 0.98 0.38 0.94 C0.12 0.9 -0.02 0.7 0.03 0.45 C0.08 0.18 0.35 0.04 0.66 0.08 C0.78 0.1 0.86 0.16 0.9 0.22',
  underline: 'M0.02 0.62 C0.25 0.4 0.55 0.38 0.98 0.5 M0.18 0.82 C0.4 0.66 0.62 0.66 0.84 0.74',
};

export default function Scribble({ children, variant = 'circle', delay = 600, className = '' }) {
  const isCircle = variant === 'circle';
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  // Draw when the word scrolls into view, not on page load.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className={`relative inline-block whitespace-nowrap ${className}`}>
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        className={`pointer-events-none absolute z-0 overflow-visible text-rose ${
          isCircle ? '-left-[8%] -top-[16%] h-[134%] w-[116%]' : '-bottom-[0.35em] left-0 h-[0.5em] w-full'
        }`}
      >
        <path
          d={PATHS[variant]}
          pathLength="1"
          fill="none"
          stroke="currentColor"
          strokeWidth={isCircle ? 4 : 5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1,
            animation: inView ? `draw 0.9s var(--ease-out) ${delay}ms forwards` : 'none',
          }}
        />
      </svg>
    </span>
  );
}
