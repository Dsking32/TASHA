export default function Footer() {
  return (
    <footer className="mt-24 border-t border-asphalt/10 bg-paper-dim print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-slate sm:flex-row sm:items-center sm:justify-between">
        <span className="font-display font-semibold text-asphalt">TashaXpress</span>
        <span className="font-mono text-xs">
          Book your route. Hold your seat. Travel Nigeria.
        </span>
      </div>
    </footer>
  );
}
