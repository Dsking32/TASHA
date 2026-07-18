export default function Card({ title, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-asphalt/8 bg-white p-6 shadow-sm shadow-asphalt/[0.03] ${className}`}>
      {title && (
        <h2 className="mb-3 font-display text-lg font-bold text-asphalt">{title}</h2>
      )}
      {children}
    </div>
  );
}
