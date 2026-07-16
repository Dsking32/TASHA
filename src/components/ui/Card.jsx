export default function Card({ title, children, className = '' }) {
  return (
    <div className={`rounded-3xl border-2 border-asphalt/8 bg-white p-6 shadow-sm ${className}`}>
      {title && (
        <h2 className="mb-3 font-display text-lg font-bold text-asphalt">{title}</h2>
      )}
      {children}
    </div>
  );
}
