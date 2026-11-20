import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getBookingDetail, initiatePayment, verifyPayment } from '../api/trips';
import { openPaystackPopup } from '../utils/paystack';
import { buildShareUrl, extractShareToken } from '../utils/shareUrl';
import {
  AlertCircle,
  ArrowRight,
  Bus,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Flag,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LiquidGlass from '../components/ui/LiquidGlass';
import { img, vehiclePhoto } from '../constants/images';
import { guestBookings } from '../utils/guestBookings';
import { bookingStatusLabel } from '../constants/bookingStatus';
import { nearText } from '../utils/places';

function money(n) {
  const num = Number(n);
  return `₦${Number.isFinite(num) ? num.toLocaleString('en-NG', { maximumFractionDigits: 0 }) : '0'}`;
}

function formatDay(dateStr) {
  if (!dateStr) return '';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function BookingDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Show the just-created booking instantly if we have it (from the
  // booking form's navigate state), then refresh from the server so the
  // page is also correct on a hard reload or when returning from payment.
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [payNotice, setPayNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const payingRef = useRef(false);

  useEffect(() => {
    getBookingDetail(id)
      .then((res) => {
        setBooking(res.data?.booking);
        setPaymentHistory(res.data?.payment_history || []);
        setShare(res.data?.share || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const onPay = async () => {
    if (payingRef.current) return;
    payingRef.current = true;
    setPayError('');
    setPayNotice('');
    setPayLoading(true);
    try {
      const res = await initiatePayment(id);
      const accessCode = res.data?.paystack?.access_code;
      if (!accessCode) {
        setPayError('No payment session was returned. Try again in a moment.');
        setPayLoading(false);
        payingRef.current = false;
        return;
      }

      const finish = () => {
        setPayLoading(false);
        payingRef.current = false;
      };

      const refresh = async () => {
        const detail = await getBookingDetail(id);
        setBooking(detail.data?.booking);
        setPaymentHistory(detail.data?.payment_history || []);
        return detail.data?.booking;
      };

      openPaystackPopup({
        accessCode,
        // Paystack says it's paid. Our backend is still the source of truth:
        // verify, and give Paystack a few seconds to settle transfers/USSD.
        onSuccess: async () => {
          setPayNotice('Confirming your payment…');
          try {
            let failed = false;
            for (let attempt = 0; attempt < 6; attempt += 1) {
              const verifyRes = await verifyPayment(id);
              if (verifyRes.data?.booking_status === 'confirmed') {
                const fresh = await refresh();
                navigate(fresh?.booking_type === 'private' ? `/bookings/${id}/tickets` : `/bookings/${id}/seats`);
                return;
              }
              if (['failed', 'abandoned', 'reversed'].includes(verifyRes.data?.payment_status)) {
                failed = true;
                break;
              }
              await new Promise((r) => setTimeout(r, 2500));
            }
            await refresh();
            setPayNotice('');
            setPayError(
              failed
                ? "That payment didn't go through. Your booking is still saved, so you can try again."
                : "We haven't received confirmation from Paystack yet. If money left your account, refresh in a minute; you won't be charged twice."
            );
          } catch (err) {
            setPayNotice('');
            setPayError(err.message);
          } finally {
            finish();
          }
        },
        // Closed without paying: nothing to verify, the booking stays open.
        onClose: () => {
          setPayNotice('');
          setPayError('Payment not completed. Your booking is still saved, so you can pay when ready.');
          finish();
        },
        onError: (err) => {
          setPayError(err.message);
          finish();
        },
      });
    } catch (err) {
      setPayError(err.message);
      setPayLoading(false);
      payingRef.current = false;
    }
  };

  if (loading && !booking) {
    return (
      <div className="mx-auto grid max-w-6xl gap-6 px-3 py-6 sm:px-6 lg:grid-cols-[1fr_380px]" aria-busy="true">
        <div className="space-y-4">
          <div className="skeleton h-72 rounded-[32px]" />
          <div className="skeleton h-40 rounded-3xl" />
        </div>
        <div className="skeleton h-80 rounded-3xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <AlertCircle size={36} className="mx-auto text-alert" aria-hidden="true" />
        <p className="mt-4 font-display text-2xl font-bold text-asphalt">We couldn't open this booking</p>
        <p className="mt-2 text-[15px] text-slate">{error || 'Please try again.'}</p>
        <Link
          to="/manage-booking"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-bold text-white hover:bg-rose-dark"
        >
          Find a booking <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const schedule = booking.schedule;
  const isPrivate = booking.booking_type === 'private';
  const isGuest = Boolean(guestBookings.token(booking.id));

  // The booking detail response carries `tickets` directly — the source of
  // truth for "do tickets exist". Private bookings skip seat selection, so
  // their tickets exist as soon as payment confirms.
  const ticketsFieldKnown = Array.isArray(booking.tickets);
  const hasIssuedTickets =
    isPrivate ||
    (ticketsFieldKnown
      ? booking.tickets.length > 0
      : booking.passengers?.length > 0 && booking.passengers.every((p) => p.seat_id));
  const needsSeats =
    booking.status === 'confirmed' && !isPrivate && booking.passengers?.some((p) => !p.seat_id);

  // Where the traveller is in the journey: details → pay → seats → ticket
  const steps = isPrivate ? ['Details', 'Pay', 'Ticket'] : ['Details', 'Pay', 'Seats', 'Ticket'];
  const current =
    booking.status !== 'confirmed' ? 1 : needsSeats ? 2 : steps.length - 1;

  const photo = vehiclePhoto(schedule?.vehicle);
  const vehicleName = [schedule?.vehicle?.make, schedule?.vehicle?.model].filter(Boolean).join(' ');

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(booking.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked — the reference is still visible to copy by hand.
    }
  };

  return (
    <div className="px-3 pb-6 pt-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Progress */}
        <ol className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 text-sm font-bold" aria-label="Booking progress">
          {steps.map((s, i) => (
            <li key={s} className="flex shrink-0 items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                  i < current ? 'bg-asphalt text-white' : i === current ? 'bg-rose text-white' : 'bg-paper-dim text-slate'
                }`}
                aria-current={i === current ? 'step' : undefined}
              >
                {i < current ? <Check size={14} aria-hidden="true" /> : i + 1}
              </span>
              <span className={i === current ? 'text-asphalt' : 'text-slate'}>{s}</span>
              {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-asphalt/15 sm:w-10" aria-hidden="true" />}
            </li>
          ))}
        </ol>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          {/* ── Trip ─────────────────────────────── */}
          <div className="space-y-5">
            <section className="relative isolate overflow-hidden rounded-[32px] bg-asphalt">
              <img
                src={img(photo, 1200, 700)}
                alt={vehicleName ? `A ${vehicleName}` : 'The bus for this trip'}
                className="absolute inset-0 -z-20 h-full w-full object-cover"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-asphalt via-asphalt/40 to-asphalt/10" aria-hidden="true" />

              <div className="flex min-h-[320px] flex-col justify-between p-4 sm:min-h-[360px] sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Solid badge so it stays readable on any photo */}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wider text-asphalt backdrop-blur">
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 rounded-full ${
                        { confirmed: 'bg-signal', pending_payment: 'bg-rose', payment_failed: 'bg-alert' }[booking.status] || 'bg-slate'
                      }`}
                    />
                    {bookingStatusLabel(booking.status)}
                  </span>
                  {vehicleName && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-asphalt backdrop-blur">
                      <Bus size="1.1em" aria-hidden="true" /> {vehicleName}
                    </span>
                  )}
                </div>

                {schedule && (
                  <LiquidGlass radius={24} tint="rgba(10,31,60,0.35)" className="p-5 text-white sm:p-6">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="font-display text-3xl font-bold tabular-nums sm:text-4xl">{schedule.departure?.time?.slice(0, 5)}</p>
                        <p className="font-display text-xl font-bold">{schedule.departure?.location?.name}</p>
                      </div>
                      <div className="mb-2 flex flex-1 flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-white/80">{formatDay(schedule.departure?.date)}</span>
                        <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="h-2 w-full text-rose" aria-hidden="true">
                          <line x1="4" y1="4" x2="96" y2="4" stroke="currentColor" strokeWidth="2" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" className="[animation:route-travel_1.2s_linear_infinite]" />
                          <circle cx="4" cy="4" r="3" fill="currentColor" />
                          <circle cx="96" cy="4" r="3" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-3xl font-bold tabular-nums sm:text-4xl">{schedule.arrival?.time?.slice(0, 5)}</p>
                        <p className="font-display text-xl font-bold">{schedule.arrival?.location?.name}</p>
                      </div>
                    </div>
                  </LiquidGlass>
                )}
              </div>
            </section>

            {/* Terminals */}
            {schedule && (
              <section className="grid gap-3 sm:grid-cols-2">
                {[
                  { Icon: MapPin, label: 'Board at', t: schedule.departure?.terminal },
                  { Icon: Flag, label: 'Arrive at', t: schedule.arrival?.terminal },
                ].map(({ Icon, label, t }) => (
                  <div key={label} className="flex gap-3 rounded-3xl bg-white p-5 ring-1 ring-asphalt/8">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-soft text-danfo">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate">{label}</p>
                      <p className="mt-0.5 font-bold text-asphalt">{t?.name}</p>
                      {(t?.address || t?.landmark) && (
                        <p className="text-sm text-slate">
                          {t.address}
                          {t.landmark && ` (${nearText(t.landmark)})`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {isPrivate && booking.private && (
              <Card title="Your private trip">
                <dl className="space-y-3 text-[15px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate">Pickup</dt>
                    <dd className="text-right font-semibold text-asphalt">
                      {booking.private.pickup_location}
                      {booking.private.pickup_landmark && ` (${booking.private.pickup_landmark})`}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate">Drop-off</dt>
                    <dd className="text-right font-semibold text-asphalt">{booking.private.dropoff_location}</dd>
                  </div>
                  {booking.private.additional_stops?.length > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate">Stops</dt>
                      <dd className="text-right font-semibold text-asphalt">{booking.private.additional_stops.join(', ')}</dd>
                    </div>
                  )}
                </dl>
              </Card>
            )}

            {booking.passengers?.length > 0 && (
              <Card title={`Passengers (${booking.passengers.length})`}>
                <ul className="divide-y divide-asphalt/8">
                  {booking.passengers.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-soft font-bold text-rose">
                        {(p.first_name?.[0] || '').toUpperCase()}
                        {(p.last_name?.[0] || '').toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-asphalt">
                          {p.first_name} {p.last_name}
                        </p>
                        <p className="text-sm capitalize text-slate">{p.passenger_category}</p>
                      </div>
                      <span className="font-semibold tabular-nums text-asphalt">{money(p.fare_applied)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {booking.emergency_contact?.name && (
              <div className="flex items-center gap-3 rounded-3xl bg-paper-dim p-5">
                <PhoneCall size={18} className="shrink-0 text-danfo" aria-hidden="true" />
                <p className="text-sm text-slate">
                  Emergency contact:{' '}
                  <span className="font-semibold text-asphalt">
                    {booking.emergency_contact.name} · {booking.emergency_contact.phone}
                  </span>
                </p>
              </div>
            )}

            {share?.active && share?.share_url && (
              <Card title="Trip share link">
                <p className="text-sm text-slate">Family can follow this trip with this link.</p>
                <div className="mt-3 truncate rounded-xl bg-paper-dim px-3 py-2 text-sm text-asphalt">
                  {buildShareUrl(extractShareToken(share.share_url))}
                </div>
              </Card>
            )}
          </div>

          {/* ── Payment / actions ────────────────── */}
          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-asphalt/8 shadow-[0_24px_60px_-36px_rgba(10,31,60,0.5)]">
              <p className="text-xs font-bold uppercase tracking-wider text-slate">Booking reference</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="font-display text-2xl font-bold tracking-wide text-asphalt">{booking.reference}</p>
                <button
                  type="button"
                  onClick={copyReference}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-paper-dim px-3 py-1.5 text-xs font-bold text-asphalt transition-colors hover:bg-rose-soft hover:text-rose"
                >
                  {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              {isGuest && (
                <p className="mt-3 rounded-xl bg-sky-soft px-3 py-2 text-sm text-asphalt">
                  Keep this reference. With your email, it's how you find this booking again.
                </p>
              )}

              <dl className="mt-6 space-y-3 text-[15px]">
                <div className="flex justify-between">
                  <dt className="text-slate">
                    Fare{booking.passenger_count > 1 ? ` (${booking.passenger_count} passengers)` : ''}
                  </dt>
                  <dd className="font-semibold tabular-nums text-asphalt">{money(booking.total_fare)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate">Service charge</dt>
                  <dd className="font-semibold tabular-nums text-asphalt">{money(booking.service_charge)}</dd>
                </div>
                <div className="flex items-end justify-between border-t border-dashed border-asphalt/15 pt-4">
                  <dt className="font-bold text-asphalt">Total</dt>
                  <dd className="font-display text-3xl font-bold tabular-nums text-asphalt">{money(booking.total_amount_payable)}</dd>
                </div>
              </dl>

              {(booking.status === 'pending_payment' || booking.status === 'payment_failed') && (
                <>
                  {booking.status === 'payment_failed' && (
                    <p className="mt-5 rounded-xl bg-alert-soft px-4 py-3 text-sm font-semibold text-alert">
                      That payment didn't go through. No ticket has been issued yet.
                    </p>
                  )}
                  {payNotice && <p className="mt-5 text-sm font-semibold text-slate">{payNotice}</p>}
                  {payError && <p role="alert" className="mt-5 text-sm font-semibold text-alert">{payError}</p>}
                  <Button loading={payLoading} onClick={onPay} size="lg" className="mt-5 w-full">
                    {booking.status === 'payment_failed' ? 'Try again' : 'Pay'} {money(booking.total_amount_payable)}
                  </Button>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate">
                    <ShieldCheck size={14} className="text-signal" aria-hidden="true" /> Secure payment by Paystack
                  </p>
                </>
              )}

              {booking.status === 'confirmed' && (
                <div className="mt-5 space-y-3">
                  <p className="flex items-center gap-2 rounded-xl bg-signal-soft px-4 py-3 text-sm font-bold text-signal">
                    <CheckCircle2 size={18} aria-hidden="true" /> Paid
                  </p>
                  {needsSeats && (
                    <Link to={`/bookings/${booking.id}/seats`} className="block">
                      <Button size="lg" className="w-full">Choose your seats</Button>
                    </Link>
                  )}
                  {hasIssuedTickets && !needsSeats && (
                    <Link to={`/bookings/${booking.id}/tickets`} className="block">
                      <Button size="lg" className="w-full">View tickets</Button>
                    </Link>
                  )}
                  <Link to={`/bookings/${booking.id}/reschedule`} className="block">
                    <Button variant="ghost" className="w-full">Change travel date</Button>
                  </Link>
                </div>
              )}

              {booking.status === 'cancelled' && (
                <p className="mt-5 rounded-xl bg-paper-dim px-4 py-3 text-sm font-semibold text-slate">
                  This booking was cancelled. No ticket was issued.
                </p>
              )}
            </div>

            {paymentHistory.length > 0 && (
              <details className="group rounded-3xl bg-white p-5 ring-1 ring-asphalt/8">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-asphalt">
                  Payment history ({paymentHistory.length})
                  <ChevronDown size={16} className="transition-transform duration-300 ease-(--ease-out) group-open:rotate-180" aria-hidden="true" />
                </summary>
                <ul className="mt-4 space-y-3 text-sm">
                  {paymentHistory.map((p) => (
                    <li key={p.reference} className="flex justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-asphalt">{p.reference}</span>
                        <span className="text-slate">{p.paid_at}</span>
                      </span>
                      <span className="text-right">
                        <span className="block font-semibold tabular-nums text-asphalt">{money(p.amount)}</span>
                        <span className="capitalize text-slate">{p.status}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
