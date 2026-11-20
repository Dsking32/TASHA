export default function Card({ title, children, className = '' }) {
  return (
    <div className={`rounded-3xl bg-white p-6 ring-1 ring-asphalt/8 shadow-[0_18px_40px_-28px_rgba(10,31,60,0.35)] sm:p-7 ${className}`}>
      {title && (
        <h2 className="mb-4 font-display text-xl font-bold text-asphalt">{title}</h2>
      )}
      {children}
    </div>
  );
}
