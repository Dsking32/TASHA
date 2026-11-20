import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPayment, getBookingDetail } from '../api/trips';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const STATUS_COPY = {
  confirmed: {
    title: 'Payment confirmed',
    body: "You're all set — this booking is paid for.",
    tone: 'text-signal',
  },
  payment_failed: {
    title: 'Payment failed',
    body: 'That payment did not go through. You can try again from the booking page.',
    tone: 'text-alert',
  },
  pending_payment: {
    title: 'Still pending',
    body: "We haven't received confirmation yet. Give it a moment and check again — a background check also runs automatically.",
    tone: 'text-danfo-dark',
  },
  cancelled: {
    title: 'Booking cancelled',
    body: 'This booking was cancelled.',
    tone: 'text-slate',
  },
};

export default function PaymentCallback() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try every source we might have for the booking id, since we don't
    // yet know exactly what your backend's redirect appends. sessionStorage
    // is the reliable one (set right before leaving for checkout); the
    // query param fallbacks cover the case where the redirect lands here
    // directly with a recognizable param, or the page was opened fresh.
    const id =
      sessionStorage.getItem('tasha_pending_payment_booking_id') ||
      searchParams.get('booking_id') ||
      searchParams.get('bookingId');

    if (!id) {
      setError(
        "Couldn't tell which booking this payment belongs to — check your booking for the latest status."
      );
      setLoading(false);
      return;
    }

    setBookingId(id);
    sessionStorage.removeItem('tasha_pending_payment_booking_id');

    verifyPayment(id)
      .then(async (res) => {
        setStatus(res.data?.booking_status);
        if (res.data?.booking_status === 'confirmed') {
          // Docs: private -> tickets directly, individual -> seat selection.
          const detail = await getBookingDetail(id);
          const isPrivate = detail.data?.booking?.booking_type === 'private';
          navigate(isPrivate ? `/bookings/${id}/tickets` : `/bookings/${id}/seats`, {
            replace: true,
          });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center font-mono text-sm text-slate">
        Confirming your payment…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-mono text-sm text-alert">{error}</p>
        <Link to={isAuthed ? '/dashboard/bookings' : '/manage-booking'} className="mt-6 inline-block">
          <Button variant="ghost">{isAuthed ? 'Go to My bookings' : 'Find my booking'}</Button>
        </Link>
      </div>
    );
  }

  // Only non-confirmed statuses render here — confirmed already redirected above.
  const copy = STATUS_COPY[status] || STATUS_COPY.pending_payment;

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className={`font-display text-2xl font-bold ${copy.tone}`}>{copy.title}</h1>
      <p className="mt-3 font-mono text-sm text-slate">{copy.body}</p>
      {bookingId && (
        <Link to={`/bookings/${bookingId}`} className="mt-6 inline-block">
          <Button variant="ghost">Back to booking</Button>
        </Link>
      )}
    </div>
  );
}
