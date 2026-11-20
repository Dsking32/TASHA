import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBookingDetail, getScheduleSeats, assignSeats } from '../api/trips';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';

// An 18-seater in this context is a Hiace-style commuter bus, not an
// intercity coach — so the real layout is: driver + one front passenger
// seat, then bench rows of 3 across with no center aisle (you board
// through a side door and walk along one edge), and a wider back bench
// that absorbs whatever doesn't divide evenly into 3s.
const BENCH_SIZE = 3;

// Fill/text colors per seat state, reusing the app's existing status
// palette rather than arbitrary decorative colors — blue/yellow in a
// reference image usually just means "different," but here color has to
// keep meaning available vs booked vs premium vs selected.
const SEAT_COLORS = {
  available: { fill: 'fill-paper-dim', stroke: 'stroke-asphalt/25', text: 'fill-asphalt' },
  selected: { fill: 'fill-rose', stroke: 'stroke-rose-dark', text: 'fill-white' },
  booked: { fill: 'fill-asphalt', stroke: 'stroke-asphalt', text: 'fill-white' },
  held: { fill: 'fill-asphalt/50', stroke: 'stroke-asphalt/60', text: 'fill-white' },
  unavailable: { fill: 'fill-asphalt/10', stroke: 'stroke-asphalt/15', text: 'fill-slate/50' },
  premium: { fill: 'fill-premium-soft', stroke: 'stroke-premium', text: 'fill-premium' },
};

function colorsFor(seat, isSelected) {
  if (isSelected) return SEAT_COLORS.selected;
  if (seat.status === 'available' && seat.seat_type === 'premium') return SEAT_COLORS.premium;
  return SEAT_COLORS[seat.status] || SEAT_COLORS.unavailable;
}

// A stylized armchair: headrest, backrest/cushion, two armrests. Filled
// with currentColor-style Tailwind classes so it can be recolored per
// seat status while keeping one consistent illustrated shape.
function SeatIcon({ seat, isSelected, onClick, size = 'h-14 w-14' }) {
  const c = colorsFor(seat, isSelected);
  const disabled = seat.status !== 'available';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={seat.seat_type === 'premium' ? 'Premium seat' : undefined}
      className={`${size} shrink-0 transition-transform active:scale-90 ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <svg viewBox="0 0 40 40" className="h-full w-full drop-shadow-sm">
        {/* armrests */}
        <rect x="1" y="15" width="6" height="16" rx="3" className={`${c.fill} ${c.stroke}`} strokeWidth="1.5" />
        <rect x="33" y="15" width="6" height="16" rx="3" className={`${c.fill} ${c.stroke}`} strokeWidth="1.5" />
        {/* headrest */}
        <rect x="10" y="1" width="20" height="11" rx="4" className={`${c.fill} ${c.stroke}`} strokeWidth="1.5" />
        {/* backrest / cushion */}
        <rect x="6" y="11" width="28" height="21" rx="6" className={`${c.fill} ${c.stroke}`} strokeWidth="1.5" />
        <text
          x="20"
          y="26"
          textAnchor="middle"
          className={`${c.text} font-mono`}
          style={{ fontSize: '9px', fontWeight: 600 }}
        >
          {seat.seat_number}
        </text>
      </svg>
    </button>
  );
}

export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
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
        if (b?.schedule?.id) {
          const seatRes = await getScheduleSeats(b.schedule.id);
          setSeats(seatRes.data?.seats || []);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const passengerCount = booking?.passenger_count || 0;

  const toggleSeat = (seat) => {
    if (seat.status !== 'available') return;
    if (passengerCount < 1) return;
    setSelected((prev) => {
      // Already selected — tap again to deselect.
      if (prev.includes(seat.id)) return prev.filter((s) => s !== seat.id);

      // At capacity — a click on a *different* seat shouldn't silently do
      // nothing (that read as "the page is stuck, better refresh"). Swap
      // in the new pick, bumping whichever seat was chosen first.
      if (prev.length >= passengerCount) {
        return [...prev.slice(1), seat.id];
      }

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
        setSubmitError(res.message || 'Seat assignment was not accepted.');
        return;
      }
      navigate(`/bookings/${id}/tickets`);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center font-mono text-sm text-slate">
        Loading seat map…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center font-mono text-sm text-alert">
        {error}
      </div>
    );
  }

  if (booking?.status !== 'confirmed') {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-body text-sm text-slate">
          Seat selection unlocks once this booking is paid for.
        </p>
      </div>
    );
  }

  // First seat rides up front next to the driver. Everything else is
  // chunked into 3-across benches, with a too-short trailing bench folded
  // into the row before it so the back row ends up wider — the way the
  // last row of a real Hiace commuter bus actually is.
  const [frontSeat, ...restSeats] = seats;
  const benchRows = [];
  for (let i = 0; i < restSeats.length; i += BENCH_SIZE) {
    benchRows.push(restSeats.slice(i, i + BENCH_SIZE));
  }
  if (benchRows.length > 1 && benchRows[benchRows.length - 1].length < BENCH_SIZE) {
    const overflow = benchRows.pop();
    benchRows[benchRows.length - 1] = [...benchRows[benchRows.length - 1], ...overflow];
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10 pb-32">
      <PageHeader
        eyebrow={`Booking ${booking.reference}`}
        title="Choose your seats"
        subtitle={
          <>
            Pick {passengerCount} seat{passengerCount > 1 ? 's' : ''} — {selected.length} selected
          </>
        }
      />

      {/* Legend */}
      <div className="mt-8 grid grid-cols-4 gap-2">
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-8 w-8 rounded-lg border border-asphalt/15 bg-paper-dim" />
          <span className="font-body text-[11px] text-slate">Available</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-8 w-8 rounded-lg bg-rose shadow-sm" />
          <span className="font-body text-[11px] text-slate">Selected</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-8 w-8 rounded-lg bg-asphalt" />
          <span className="font-body text-[11px] text-slate">Taken</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-8 w-8 rounded-lg border border-premium/40 bg-premium-soft" />
          <span className="font-body text-[11px] text-slate">Premium</span>
        </div>
      </div>

      {/* Bus body — metal-toned chassis, mirrors, steering wheel, illustrated seats */}
      <div className="mt-8 overflow-hidden rounded-t-[64px] rounded-b-3xl border-2 border-asphalt/20 bg-gradient-to-b from-asphalt/5 to-white shadow-[0_24px_48px_-28px_rgba(10,31,60,0.35)]">
        {/* Front console: mirrors, steering wheel (driver + door both left, matching Nigerian commuter bus layout), front passenger seat */}
        <div className="relative border-b-2 border-dashed border-asphalt/15 bg-asphalt/[0.04] px-7 pb-5 pt-9">
          {/* Wing mirrors */}
          <div className="absolute -top-1 left-6 h-3 w-8 -translate-y-full rounded-full bg-asphalt/70" />
          <div className="absolute -top-1 right-6 h-3 w-8 -translate-y-full rounded-full bg-asphalt/70" />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 40 40" className="h-11 w-11 drop-shadow-sm">
                <circle cx="20" cy="20" r="18" className="fill-white stroke-asphalt/25" strokeWidth="1.5" />
                <circle cx="20" cy="20" r="13" fill="none" className="stroke-asphalt/60" strokeWidth="2.5" />
                <circle cx="20" cy="20" r="3" className="fill-asphalt/70" />
                <line x1="20" y1="9" x2="20" y2="17" className="stroke-asphalt/60" strokeWidth="2.5" />
                <line x1="11" y1="26" x2="17" y2="22" className="stroke-asphalt/60" strokeWidth="2.5" />
                <line x1="29" y1="26" x2="23" y2="22" className="stroke-asphalt/60" strokeWidth="2.5" />
              </svg>
              <div>
                <div className="font-body text-sm font-semibold text-asphalt">Driver</div>
                <div className="font-mono text-[10px] uppercase tracking-wide text-slate/70">
                  Front of bus
                </div>
              </div>
            </div>

            {frontSeat && (
              <div className="flex flex-col items-center gap-1">
                <SeatIcon
                  seat={frontSeat}
                  isSelected={selected.includes(frontSeat.id)}
                  onClick={() => toggleSeat(frontSeat)}
                  size="h-12 w-12"
                />
                <span className="font-mono text-[9px] uppercase tracking-wide text-slate/60">
                  Front seat
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Seating cabin — bench rows, walk lane along the LEFT (door) edge */}
        <div className="relative px-4 py-7">
          {/* Door, on the left wall (Nigerian commuter bus convention) */}
          <div className="pointer-events-none absolute left-0 top-[26%] flex items-center gap-1 rounded-r-full border border-asphalt/15 bg-white py-1 pl-1.5 pr-2 shadow-sm">
            <span className="text-xs">🚪</span>
            <span className="font-mono text-[9px] uppercase tracking-wide text-slate/60">
              Door
            </span>
          </div>

          {/* Right-side window strip, purely atmospheric */}
          <div className="pointer-events-none absolute inset-y-7 right-2 flex w-2 flex-col justify-between">
            {benchRows.map((_, r) => (
              <span key={r} className="h-5 w-1.5 rounded-full bg-asphalt/10" />
            ))}
          </div>

          <div className="mx-6 flex flex-col gap-4">
            {benchRows.map((rowSeats, r) => {
              const isLastRow = r === benchRows.length - 1;
              return (
                <div key={r} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 text-center font-mono text-[10px] text-slate/60">
                    {r + 2}
                  </span>
                  <div
                    className="grid flex-1 items-center justify-items-center gap-2"
                    style={{
                      gridTemplateColumns: isLastRow
                        ? `repeat(${rowSeats.length}, 1fr)`
                        : `22px repeat(${rowSeats.length}, 1fr)`,
                    }}
                  >
                    {!isLastRow && (
                      <div className="flex h-full items-center justify-center">
                        <div className="h-full w-px border-l border-dashed border-asphalt/20" />
                      </div>
                    )}
                    {rowSeats.map((seat) => (
                      <SeatIcon
                        key={seat.id}
                        seat={seat}
                        isSelected={selected.includes(seat.id)}
                        onClick={() => toggleSeat(seat)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rear wall */}
        <div className="border-t-2 border-dashed border-asphalt/15 bg-asphalt/[0.04] py-2.5 text-center">
          <span className="font-mono text-[10px] uppercase tracking-wide text-slate/60">
            Rear
          </span>
        </div>
      </div>

      {submitError && <p className="mt-6 font-body text-sm text-alert">{submitError}</p>}

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-asphalt/10 bg-white px-6 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div>
            <div className="font-body text-xs text-slate">Seats selected</div>
            <div className="font-display text-xl font-bold text-asphalt">
              {selected.length} <span className="text-base font-normal text-slate">/ {passengerCount}</span>
            </div>
          </div>
          <Button
            onClick={onSubmit}
            loading={submitting}
            disabled={selected.length !== passengerCount}
            className="px-8"
          >
            Confirm seats
          </Button>
        </div>
      </div>
    </div>
  );
}