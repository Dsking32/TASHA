const STATUS_DOT = {
  confirmed: 'bg-signal',
  active: 'bg-signal',
  pending: 'bg-danfo',
  cancelled: 'bg-alert',
};

const STATUS_TEXT = {
  confirmed: 'text-signal',
  active: 'text-signal',
  pending: 'text-danfo',
  cancelled: 'text-alert',
};

export default function TicketCard({
  reference,
  from,
  to,
  date,
  time,
  passengerName,
  seatNumber,
  status = 'confirmed',
}) {
  return (
    <div className="print-exact-color flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-asphalt/8 shadow-[0_18px_40px_-28px_rgba(10,31,60,0.4)] md:flex-row print:flex-row print:break-inside-avoid print:shadow-none">
      {/* Left: travel info */}
      <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <span className="font-body text-[11px] font-semibold uppercase tracking-widest text-slate">
            TASHA
          </span>
          <div className="text-right">
            <span className="block font-body text-[11px] font-semibold uppercase tracking-widest text-slate">
              Status
            </span>
            <span
              className={`mt-1 flex items-center justify-end gap-1.5 text-sm font-semibold capitalize ${
                STATUS_TEXT[status] || 'text-slate'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] || 'bg-slate'}`} />
              {status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold text-asphalt sm:text-3xl">{from}</h3>
            <p className="mt-1 font-display text-lg font-semibold text-danfo">{time}</p>
          </div>
          <span aria-hidden className="mt-2 text-xl text-asphalt/30">
            →
          </span>
          <div className="text-right">
            <h3 className="font-display text-2xl font-bold text-asphalt sm:text-3xl">{to}</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 border-t border-asphalt/10 pt-5">
          <div>
            <span className="font-body text-[11px] font-semibold uppercase tracking-widest text-slate">
              Date
            </span>
            <p className="mt-1 font-body text-sm font-semibold text-asphalt">{date}</p>
          </div>
          {passengerName && (
            <div>
              <span className="font-body text-[11px] font-semibold uppercase tracking-widest text-slate">
                Passenger
              </span>
              <p className="mt-1 font-body text-sm font-semibold text-asphalt">
                {passengerName}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right: seat / reference stub */}
      <div className="flex w-full flex-col justify-center gap-3 border-t border-dashed border-asphalt/15 bg-paper-dim p-6 sm:p-8 md:w-56 md:border-l md:border-t-0 print:w-56 print:border-l print:border-t-0">
        <div className="flex items-center justify-between rounded-2xl border-2 border-asphalt/8 bg-white px-3 py-2.5">
          <span className="font-body text-[10px] font-semibold uppercase tracking-widest text-slate">
            Seat
          </span>
          <span className="font-mono text-base font-bold text-danfo">{seatNumber || '—'}</span>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-2xl border-2 border-asphalt/8 bg-white px-3 py-2.5">
          <span className="font-body text-[10px] font-semibold uppercase tracking-widest text-slate">
            Ref
          </span>
          <span className="truncate font-mono text-xs text-asphalt">{reference}</span>
        </div>
      </div>
    </div>
  );
}
