export default function Placeholder({ title, note }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto mb-6 h-12 w-12 rounded-full border-2 border-dashed border-danfo" />
      <h1 className="font-display text-2xl font-bold text-asphalt">{title}</h1>
      <p className="mt-3 font-mono text-sm text-slate">
        {note || 'This screen is next on the build list.'}
      </p>
    </div>
  );
}
