import { useId } from 'react';

/**
 * Liquid glass surface that sits in normal layout flow.
 *
 * Layers (back to front):
 *  1. refraction — blurs + saturates what's behind, then an SVG displacement
 *     filter bends it so edges look like thick glass (Chromium shows the
 *     bend; Safari/Firefox fall back to plain frosted blur, still readable)
 *  2. tint — a light wash so text on top keeps contrast over busy photos
 *  3. rim — inset highlights that catch the light along the edges
 *  4. content
 *
 * The refraction filter is costly to repaint, so index.css only switches it
 * on for large screens with a mouse; phones get the frosted blur alone.
 *
 * Built in-house instead of liquid-glass-react: that package positions every
 * layer at top/left 50% for floating overlays and moves with the cursor,
 * which fights a form that lives in a page layout.
 */
export default function LiquidGlass({
  children,
  className = '',
  radius = 24,
  tint = 'rgba(255,255,255,0.12)',
  blur = 14,
  distortion = 60,
  as: Tag = 'div',
  ...props
}) {
  const id = useId().replace(/:/g, '');
  const filterId = `lg-${id}`;

  return (
    <Tag
      className={`relative isolate overflow-hidden ${className}`}
      style={{ borderRadius: radius }}
      {...props}
    >
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <filter id={filterId} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="3" result="softNoise" />
          <feDisplacementMap in="SourceGraphic" in2="softNoise" scale={distortion} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <span
        aria-hidden="true"
        className="lg-refract pointer-events-none absolute inset-0 -z-10"
        style={{
          backdropFilter: `blur(${blur}px) saturate(170%)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(170%)`,
          '--lg-filter': `url(#${filterId})`,
        }}
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: tint }} />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          borderRadius: radius,
          boxShadow:
            'inset 1.5px 1.5px 0 rgba(255,255,255,0.55), inset -1px -1px 0 rgba(255,255,255,0.18), inset 0 0 24px rgba(255,255,255,0.10), 0 24px 60px -20px rgba(4,14,32,0.55)',
        }}
      />
      {children}
    </Tag>
  );
}
