import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Info } from 'lucide-react';
import { getBookingDetail, getScheduleSeats, assignSeats } from '../api/trips';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';

/*
 * Seat layouts for the TASHA fleet, front to back. Nigeria drives on the
 * right, so the driver sits front-left and the sliding door is on the right.
 *   HiAce  (14): 2 beside the driver, then 4 rows of 3
 *   Sienna (7):  1 beside the driver, then 2 rows of 3
 * Seats fill the rows in seat-number order. Anything else falls back to one
 * front seat plus rows of 3.
 */
const LAYOUTS = {
  hiace: { name: 'Toyota HiAce', rows: [2, 3, 3, 3, 3] },
  sienna: { name: 'Toyota Sienna', rows: [1, 3, 3] },
};

function layoutFor(vehicle, count) {
  const model = `${vehicle?.make || ''} ${vehicle?.model || ''}`.toLowerCase();
  const known = model.includes('sienna') ? LAYOUTS.sienna : model.includes('hiace') ? LAYOUTS.hiace : null;
  if (known && known.rows.reduce((a, b) => a + b, 0) === count) return known.rows;
  const rows = [Math.min(1, count)];
  for (let left = count - rows[0]; left > 0; left -= 3) rows.push(Math.min(3, left));
  return rows;
}

function vehicleName(vehicle) {
  const model = `${vehicle?.model || ''}`.toLowerCase();
  if (model.includes('sienna')) return LAYOUTS.sienna.name;
  if (model.includes('hiace')) return LAYOUTS.hiace.name;
  return [vehicle?.make, vehicle?.model].filter(Boolean).join(' ') || 'Your vehicle';
}

const initials = (p) => `${p?.first_name?.[0] || ''}${p?.last_name?.[0] || ''}`.toUpperCase();

/** One seat, seen from above: cushion with a backrest band at the rear. */
function Seat({ seat, passenger, isSelected, onClick, front }) {
  const taken = seat.status !== 'available';
  const label = seat.seat_label || `Seat ${seat.seat_number}`;
  const state = isSelected ? 'selected' : taken ? 'taken' : 'free';

  const styles = {
    selected: 'bg-rose text-white ring-rose shadow-[0_8px_18px_-8px_rgba(233,30,120,0.9)]',
    taken: 'bg-asphalt/85 text-white/60 ring-asphalt cursor-not-allowed',
    free: `${front ? 'bg-sky-soft' : 'bg-white'} text-asphalt ring-asphalt/20 hover:-translate-y-0.5 hover:ring-rose`,
  }[state];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={taken}
      aria-pressed={isSelected}
      aria-label={`${label}${taken ? ', taken' : isSelected ? `, selected for ${passenger?.first_name || 'a passenger'}` : ', available'}${front ? ', front row' : ''}`}
      className={`group relative flex h-14 w-14 flex-col items-center justify-center rounded-2xl ring-2 transition-[transform,background-color,box-shadow] duration-200 ease-(--ease-out) active:scale-95 sm:h-16 sm:w-16 ${styles}`}
    >
      {/* backrest */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-2 bottom-1.5 h-1.5 rounded-full ${
          state === 'selected' ? 'bg-white/50' : state === 'taken' ? 'bg-white/20' : 'bg-asphalt/15'
        }`}
      />
      {state === 'selected' ? (
        <span className="text-base font-bold">{initials(passenger) || <Check size={18} />}</span>
      ) : state === 'taken' ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ) : (
        <span className="text-base font-bold tabular-nums">{Number(seat.seat_number) || seat.seat_number}</span>
      )}
    </button>
  );
}

function Legend() {
  const items = [
    { cls: 'bg-white ring-2 ring-asphalt/20', label: 'Free' },
    { cls: 'bg-sky-soft ring-2 ring-asphalt/20', label: 'Front row' },
    { cls: 'bg-rose', label: 'Your pick' },
    { cls: 'bg-asphalt/85', label: 'Taken' },
  ];
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          <span className={`h-4 w-4 rounded-md ${i.cls}`} aria-hidden="true" />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [seats, setSeats] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [selected, setSelected] = useState([]); // seat ids, in passenger order
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const submittingRef = useRef(false);

  useEffect(() => {
    getBookingDetail(id)
      .then(async (res) => {
        const b = res.data?.booking;
        setBooking(b);
        // Pre-fill any seats this booking already has (re-picking is allowed).
        const existing = (b?.passengers || []).map((p) => p.seat_id).filter(Boolean);
        if (existing.length === b?.passengers?.length) setSelected(existing);
        if (b?.schedule?.id) {
          const seatRes = await getScheduleSeats(b.schedule.id);
          const list = [...(seatRes.data?.seats || [])].sort(
            (a, c) => Number(a.seat_number) - Number(c.seat_number) || String(a.seat_number).localeCompare(String(c.seat_number))
          );
          // Seats this booking already holds show as ours, not "taken".
          setSeats(list.map((s) => (existing.includes(s.id) ? { ...s, status: 'available' } : s)));
          setVehicle(seatRes.data?.vehicle || b.schedule.vehicle || null);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const passengers = booking?.passengers || [];
  const passengerCount = booking?.passenger_count || passengers.length || 0;
  const nextIndex = selected.length < passengerCount ? selected.length : null;

  const toggleSeat = (seat) => {
    if (seat.status !== 'available' || passengerCount < 1) return;
    setSelected((prev) => {
      if (prev.includes(seat.id)) return prev.filter((s) => s !== seat.id);
      // Full: replace the earliest pick so a tap never silently does nothing.
      if (prev.length >= passengerCount) return [...prev.slice(1), seat.id];
      return [...prev, seat.id];
    });
  };

  const onSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await assignSeats(id, { seat_ids: selected });
      if (res.success === false) {
        setSubmitError(res.message || 'Those seats could not be saved. Please pick again.');
        return;
      }
      navigate(`/bookings/${id}/tickets`);
    } catch (err) {
      setSubmitError(err.message);
      // Someone else may have taken a seat: refresh the map.
      if (err.status === 409 && booking?.schedule?.id) {
        const seatRes = await getScheduleSeats(booking.schedule.id);
        setSeats(seatRes.data?.seats || []);
        setSelected((prev) => prev.filter((sid) => (seatRes.data?.seats || []).some((s) => s.id === sid && s.status === 'available')));
      }
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]" aria-busy="true">
        <div className="skeleton h-[560px] rounded-[40px]" />
        <div className="skeleton h-72 rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-display text-2xl font-bold text-asphalt">We couldn't load the seat map</p>
        <p className="mt-2 text-[15px] text-slate">{error}</p>
      </div>
    );
  }

  if (booking?.status !== 'confirmed') {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-display text-2xl font-bold text-asphalt">Pay first, then pick seats</p>
        <p className="mt-2 text-[15px] text-slate">Seat selection opens once this booking is paid for.</p>
        <Link to={`/bookings/${id}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-bold text-white hover:bg-rose-dark">
          Go to payment
        </Link>
      </div>
    );
  }

  const rowSizes = layoutFor(vehicle, seats.length);
  const rows = [];
  let cursor = 0;
  rowSizes.forEach((n) => {
    rows.push(seats.slice(cursor, cursor + n));
    cursor += n;
  });
  const [frontRow, ...cabinRows] = rows;
  const passengerFor = (seatId) => passengers[selected.indexOf(seatId)];
  const seatById = (sid) => seats.find((s) => s.id === sid);
  const free = seats.filter((s) => s.status === 'available').length;

  return (
    <div className="px-4 pb-36 pt-6 sm:px-6 lg:pb-12">
      <div className="mx-auto max-w-5xl">
        <Link to={`/bookings/${id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-asphalt">
          <ArrowLeft size={16} aria-hidden="true" /> Back to booking
        </Link>
        <PageHeader
          className="mt-3"
          eyebrow={`Booking ${booking.reference}`}
          title="Choose your seats"
          subtitle={`${vehicleName(vehicle)} · ${free} of ${seats.length} seats free. Tap a seat for each passenger.`}
        />

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_340px]">
          {/* ── Vehicle, top-down ─────────────────────── */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px]">
              {/* wheels */}
              {['top-[14%]', 'bottom-[12%]'].map((pos) => (
                <span key={pos} aria-hidden="true" className={`absolute ${pos} -left-2 -right-2 flex justify-between`}>
                  <span className="h-14 w-3 rounded-full bg-asphalt" />
                  <span className="h-14 w-3 rounded-full bg-asphalt" />
                </span>
              ))}
              {/* mirrors */}
              <span aria-hidden="true" className="absolute -left-4 top-[7%] h-4 w-6 rounded-full bg-asphalt/80" />
              <span aria-hidden="true" className="absolute -right-4 top-[7%] h-4 w-6 rounded-full bg-asphalt/80" />

              <div className="relative overflow-hidden rounded-t-[64px] rounded-b-[36px] bg-paper-dim ring-2 ring-asphalt/15 shadow-[0_30px_60px_-30px_rgba(10,31,60,0.45)]">
                {/* windscreen */}
                <div className="mx-6 mt-5 h-10 rounded-t-[40px] rounded-b-xl bg-gradient-to-b from-sky/60 to-sky/20" aria-hidden="true" />
                <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-widest text-slate">Front</p>

                {/* front row: driver + front seat(s) */}
                <div className="mt-3 flex items-center justify-between gap-3 px-6">
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-asphalt/10 text-slate sm:h-16 sm:w-16" aria-label="Driver">
                    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                      <path d="M12 3v7M4.5 15l5.5-2M19.5 15l-5.5-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase">Driver</span>
                  </div>
                  <div className="flex gap-2">
                    {frontRow?.map((seat) => (
                      <Seat key={seat.id} seat={seat} front isSelected={selected.includes(seat.id)} passenger={passengerFor(seat.id)} onClick={() => toggleSeat(seat)} />
                    ))}
                  </div>
                </div>

                <div className="mx-6 my-5 border-t-2 border-dashed border-asphalt/10" aria-hidden="true" />

                {/* cabin rows; sliding door on the right */}
                <div className="relative space-y-3 px-6 pb-6">
                  <span aria-hidden="true" className="absolute -right-0.5 top-0 flex h-[72px] w-2 items-center rounded-l-full bg-rose/70" />
                  <span aria-hidden="true" className="absolute -right-1 top-[78px] w-12 -translate-x-full text-right text-[10px] font-bold uppercase tracking-wider text-rose">
                    Door
                  </span>
                  {cabinRows.map((row, r) => (
                    <div key={r} className="flex items-center justify-between gap-2">
                      <span className="w-5 text-center text-[11px] font-bold text-slate/70">{r + 2}</span>
                      <div className="flex flex-1 justify-end gap-2">
                        {row.map((seat) => (
                          <Seat key={seat.id} seat={seat} isSelected={selected.includes(seat.id)} passenger={passengerFor(seat.id)} onClick={() => toggleSeat(seat)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* rear window */}
                <div className="mx-8 mb-4 h-3 rounded-full bg-sky/25" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* ── Passengers + confirm ─────────────────── */}
          <aside className="space-y-5 lg:sticky lg:top-28">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-asphalt/8">
              <h2 className="font-display text-xl font-bold text-asphalt">Passengers</h2>
              <ul className="mt-4 space-y-3">
                {Array.from({ length: passengerCount }).map((_, i) => {
                  const p = passengers[i];
                  const seat = seatById(selected[i]);
                  const isNext = i === nextIndex;
                  return (
                    <li
                      key={p?.id || i}
                      className={`flex items-center gap-3 rounded-2xl p-3 transition-colors ${isNext ? 'bg-rose-soft ring-1 ring-rose/30' : 'bg-paper-dim'}`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${seat ? 'bg-rose text-white' : 'bg-white text-slate'}`}>
                        {initials(p) || i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-asphalt">
                          {p ? `${p.first_name} ${p.last_name}` : `Passenger ${i + 1}`}
                        </p>
                        <p className={`text-sm ${isNext ? 'font-semibold text-rose' : 'text-slate'}`}>
                          {seat ? `Seat ${Number(seat.seat_number) || seat.seat_number}` : isNext ? 'Tap a seat on the map' : 'No seat yet'}
                        </p>
                      </div>
                      {seat && <Check size={18} className="text-rose" aria-hidden="true" />}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-5 border-t border-asphalt/8 pt-5">
                <Legend />
              </div>
            </div>

            <p className="flex gap-2 rounded-2xl bg-sky-soft p-4 text-sm text-asphalt">
              <Info size={16} className="mt-0.5 shrink-0 text-danfo" aria-hidden="true" />
              Tap a picked seat again to free it. Seats go to passengers in the order shown.
            </p>

            {submitError && (
              <p role="alert" className="rounded-xl bg-alert-soft px-4 py-3 text-sm font-semibold text-alert">
                {submitError}
              </p>
            )}

            <div className="hidden lg:block">
              <Button size="lg" onClick={onSubmit} loading={submitting} disabled={selected.length !== passengerCount} className="w-full">
                Confirm {passengerCount > 1 ? `${passengerCount} seats` : 'seat'}
              </Button>
            </div>
          </aside>
        </div>
      </div>

      {/* Phone: sticky confirm bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-asphalt/10 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate">
            <span className="font-display text-2xl font-bold text-asphalt">{selected.length}</span> / {passengerCount} picked
          </p>
          <Button onClick={onSubmit} loading={submitting} disabled={selected.length !== passengerCount} className="px-7">
            Confirm seats
          </Button>
        </div>
      </div>
    </div>
  );
}
