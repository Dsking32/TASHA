export default function PageHeader({ eyebrow, title, subtitle, className = '' }) {
  return (
    <div className={className}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-rose">
          <span className="h-2 w-2 rounded-full bg-rose" aria-hidden="true" />
          {eyebrow}
        </span>
      )}
      <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-asphalt sm:text-5xl">
        {title}
      </h1>
      {subtitle && <p className="mt-3 text-[15px] leading-relaxed text-slate">{subtitle}</p>}
    </div>
  );
}
