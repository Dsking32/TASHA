export default function PageHeader({ eyebrow, title, subtitle, className = '' }) {
  return (
    <div className={className}>
      {eyebrow && (
        <span className="inline-block rounded-full bg-danfo/10 px-3 py-1 font-body text-xs font-bold text-danfo">
          {eyebrow}
        </span>
      )}
      <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-asphalt sm:text-4xl">
        {title}
      </h1>
      {subtitle && <p className="mt-2 font-body text-sm text-slate">{subtitle}</p>}
    </div>
  );
}
