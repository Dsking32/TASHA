/** Card section used by the booking forms: icon, title, short note, fields. */
export default function FormSection({ Icon, title, note, children, action }) {
  return (
    <section className="rounded-3xl bg-white p-5 ring-1 ring-asphalt/8 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-soft text-rose">
            <Icon size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold text-asphalt">{title}</h2>
            {note && <p className="mt-0.5 text-sm text-slate">{note}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
