import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getBookingDetail, initiatePayment, verifyPayment } from '../api/trips';
import { openPaystackPopup } from '../utils/paystack';
import { buildShareUrl, extractShareToken } from '../utils/shareUrl';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { bookingStatusStyle, bookingStatusLabel } from '../constants/bookingStatus';
import { nearText } from '../utils/places';

function money(n) {
  const num = Number(n);
  return `₦${Number.isFinite(num) ? num.toLocaleString() : '0'}`;
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

      openPaystackPopup({
        accessCode,
        onSettled: async () => {
          // We never trust Paystack's own success/close signal directly —
          // always re-check with our backend, which is the source of truth.
          setPayNotice('Checking payment status…');
          try {
            const verifyRes = await verifyPayment(id);
            const status = verifyRes.data?.booking_status;

            if (status === 'confirmed') {
              const detail = await getBookingDetail(id);
              const freshBooking = detail.data?.booking;
              const isPrivate = freshBooking?.booking_type === 'private';
              navigate(isPrivate ? `/bookings/${id}/tickets` : `/bookings/${id}/seats`);
              return;
            }

            // Not confirmed — refresh the booking in place so the status
            // badge and payment history reflect reality, and tell the
            // person plainly what happened.
            const detail = await getBookingDetail(id);
            setBooking(detail.data?.booking);
            setPaymentHistory(detail.data?.payment_history || []);
            setPayNotice('');
            if (status === 'payment_failed') {
              setPayError('That payment did not go through. You can try again.');
            } else if (status === 'pending_payment') {
              setPayError(
                "We haven't received confirmation yet — if you completed payment, give it a moment and refresh."
              );
            }
          } catch (err) {
            setPayNotice('');
            setPayError(err.message);
          } finally {
            setPayLoading(false);
            payingRef.current = false;
          }
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
      <div className="mx-auto max-w-lg px-6 py-24 text-center font-mono text-sm text-slate">
        Loading booking…
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-mono text-sm text-alert">{error}</p>
      </div>
    );
  }

  if (!booking) {
    // Loading finished, no error was thrown, but we still don't have a
    // booking (e.g. an unexpected response shape). Fail safe instead of
    // crashing on booking.schedule below.
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-mono text-sm text-alert">
          We couldn't load this booking. Please try again.
        </p>
      </div>
    );
  }

  const schedule = booking.schedule;

  // The booking detail response carries a `tickets` field directly (see
  // trips.js getBookingDetail comment) — that's the real source of truth
  // for "do tickets exist," not something we should infer. Private
  // bookings skip seat selection entirely, so their tickets are issued
  // the moment payment confirms. Falls back to the old seat-assignment
  // check only if the API doesn't populate `tickets` for some reason —
  // belt-and-suspenders rather than silently hiding the button.
  const ticketsFieldKnown = Array.isArray(booking.tickets);
  const hasIssuedTickets =
    booking.booking_type === 'private' ||
    (ticketsFieldKnown
      ? booking.tickets.length > 0
      : booking.passengers?.length > 0 && booking.passengers.every((p) => p.seat_id));

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${bookingStatusStyle(
            booking.status
          )}`}
        >
          {bookingStatusLabel(booking.status)}
        </span>
        <span className="font-mono text-xs text-slate">{booking.reference}</span>
      </div>

      <h1 className="mt-4 font-display text-3xl font-bold leading-none text-asphalt sm:text-4xl">
        Booking summary
      </h1>

      {schedule && (
        <Card className="mt-6">
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-asphalt">
            <span>{schedule.departure?.location?.name}</span>
            <span className="text-danfo">→</span>
            <span>{schedule.arrival?.location?.name}</span>
          </div>
          <div className="mt-1 font-mono text-xs text-slate">
            <div>
              {schedule.departure?.terminal?.name} → {schedule.arrival?.terminal?.name}
            </div>
            {(schedule.departure?.terminal?.address || schedule.departure?.terminal?.landmark) && (
              <div className="mt-0.5 text-slate/70">
                Board: {schedule.departure.terminal.address}
                {schedule.departure.terminal.landmark &&
                  ` (${nearText(schedule.departure.terminal.landmark)})`}
              </div>
            )}
            {(schedule.arrival?.terminal?.address || schedule.arrival?.terminal?.landmark) && (
              <div className="mt-0.5 text-slate/70">
                Arrive: {schedule.arrival.terminal.address}
                {schedule.arrival.terminal.landmark &&
                  ` (${nearText(schedule.arrival.terminal.landmark)})`}
              </div>
            )}
          </div>
          <div className="mt-2 font-mono text-xs text-slate">
            {schedule.departure?.date} · {schedule.departure?.time?.slice(0, 5)} –{' '}
            {schedule.arrival?.time?.slice(0, 5)}
          </div>
        </Card>
      )}

      {booking.booking_type === 'private' && booking.private && (
        <Card title="Private trip details" className="mt-4">
          <dl className="space-y-2 font-mono text-xs text-slate">
            <div className="flex justify-between">
              <dt>Pickup</dt>
              <dd className="text-right text-asphalt">
                {booking.private.pickup_location} ({booking.private.pickup_landmark})
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Drop-off</dt>
              <dd className="text-right text-asphalt">{booking.private.dropoff_location}</dd>
            </div>
            {booking.private.additional_stops?.length > 0 && (
              <div className="flex justify-between">
                <dt>Stops</dt>
                <dd className="text-right text-asphalt">
                  {booking.private.additional_stops.join(', ')}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      )}

      {booking.passengers?.length > 0 && (
        <Card title="Passengers" className="mt-4">
          <div className="space-y-2">
            {booking.passengers.map((p) => (
              <div key={p.id} className="flex justify-between font-mono text-xs text-slate">
                <span>
                  {p.title} {p.first_name} {p.last_name} · {p.passenger_category}
                </span>
                <span className="text-asphalt">{money(p.fare_applied)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-4 space-y-3">
        <div className="flex justify-between font-mono text-sm">
          <span className="text-slate">Fare</span>
          <span>{money(booking.total_fare)}</span>
        </div>
        <div className="flex justify-between font-mono text-sm">
          <span className="text-slate">Service charge</span>
          <span>{money(booking.service_charge)}</span>
        </div>
        <div className="flex justify-between border-t border-asphalt/10 pt-3 font-mono text-sm font-semibold text-asphalt">
          <span>Total payable</span>
          <span>{money(booking.total_amount_payable)}</span>
        </div>
      </Card>

      {paymentHistory.length > 0 && (
        <Card title="Payment history" className="mt-4">
          <div className="space-y-2">
            {paymentHistory.map((p) => (
              <div
                key={p.reference}
                className="flex items-center justify-between font-mono text-xs text-slate"
              >
                <div>
                  <div className="text-asphalt">{p.reference}</div>
                  <div>
                    {p.provider} · {p.paid_at}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-asphalt">{money(p.amount)}</div>
                  <div className="capitalize">{p.status}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {share?.active && share?.share_url && (
        <Card title="Share link" className="mt-4">
          <p className="font-mono text-xs text-slate">
            This trip already has an active share link.
          </p>
          <div className="mt-3 truncate rounded-lg bg-paper-dim px-3 py-2 font-mono text-xs text-asphalt">
            {buildShareUrl(extractShareToken(share.share_url))}
          </div>
        </Card>
      )}

      {booking.status === 'pending_payment' && (
        <>
          {payNotice && <p className="mt-6 font-mono text-sm text-slate">{payNotice}</p>}
          {payError && <p className="mt-6 font-mono text-sm text-alert">{payError}</p>}
          <Button loading={payLoading} onClick={onPay} className="mt-6 w-full">
            Pay {money(booking.total_amount_payable)}
          </Button>
        </>
      )}

      {booking.status === 'payment_failed' && (
        <>
          {payNotice && <p className="mt-6 font-mono text-sm text-slate">{payNotice}</p>}
          {payError && <p className="mt-6 font-mono text-sm text-alert">{payError}</p>}
          <p className="mt-6 rounded-3xl bg-alert-soft p-4 text-center font-mono text-sm text-alert">
            That payment didn't go through — no ticket has been issued yet.
          </p>
          <Button loading={payLoading} onClick={onPay} className="mt-4 w-full">
            Retry payment — {money(booking.total_amount_payable)}
          </Button>
        </>
      )}

      {booking.status === 'cancelled' && (
        <p className="mt-6 rounded-3xl bg-asphalt/5 p-4 text-center font-mono text-sm text-slate">
          This booking was cancelled — no ticket was issued.
        </p>
      )}

      {booking.status === 'confirmed' && (
        <p className="mt-6 rounded-3xl bg-signal-soft p-4 text-center font-mono text-sm text-signal">
          Payment confirmed — this booking is complete.
        </p>
      )}

      {booking.status === 'confirmed' &&
        booking.booking_type === 'individual' &&
        !hasIssuedTickets &&
        booking.passengers?.some((p) => !p.seat_id) && (
          <Link to={`/bookings/${booking.id}/seats`}>
            <Button className="mt-4 w-full">Choose your seats</Button>
          </Link>
        )}

      {booking.status === 'confirmed' && hasIssuedTickets && (
        <Link to={`/bookings/${booking.id}/tickets`}>
          <Button className="mt-4 w-full">View / print tickets</Button>
        </Link>
      )}

      {booking.status === 'confirmed' && (
        <Link to={`/bookings/${booking.id}/reschedule`}>
          <Button variant="ghost" className="mt-4 w-full">
            Reschedule
          </Button>
        </Link>
      )}
    </div>
  );
}