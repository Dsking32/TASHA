import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRescheduleOptions, initiateReschedule } from '../api/trips';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';

function money(n) {
  const num = Number(n);
  return `₦${Number.isFinite(num) ? num.toLocaleString() : '0'}`;
}

export default function RescheduleBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [completedMessage, setCompletedMessage] = useState('');
  const submittingRef = useRef(false);

  useEffect(() => {
    getRescheduleOptions(id)
      .then((res) => setSchedules(res.data?.schedules || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await initiateReschedule(id, {
        new_schedule_id: selectedId,
        reason,
      });

      // The API can return a 200 with success:false for a business-logic
      // rejection (e.g. seats no longer available, schedule past its
      // reschedule window) — same pattern as assignSeats in
      // SeatSelection.jsx. Without this check, a rejected reschedule would
      // fall through to the "complete" branch below and tell the user it
      // worked when it didn't.
      if (res.success === false) {
        setSubmitError(res.message || 'This reschedule could not be completed.');
        return;
      }

      if (res.data?.status === 'pending_payment' && res.data?.checkout_url) {
        // Same trick as the initial payment flow — stash the booking id so
        // /payment/callback can find it regardless of the redirect shape.
        sessionStorage.setItem('tasha_pending_payment_booking_id', id);
        window.location.href = res.data.checkout_url;
        return;
      }

      if (res.data?.status === 'completed') {
        setCompletedMessage(res.message || 'Reschedule complete.');
        return;
      }

      // Unrecognized response shape — don't assume success just because
      // nothing threw. Surface it plainly instead of a false "complete".
      setSubmitError(
        res.message ||
          "Couldn't confirm the reschedule went through — check My Bookings for the latest status."
      );
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
        Loading available schedules…
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

  if (completedMessage) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-mono text-sm text-signal">{completedMessage}</p>
        <Button variant="ghost" className="mt-6" onClick={() => navigate(`/bookings/${id}`)}>
          Back to booking
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <PageHeader eyebrow={`Booking #${id}`} title="Reschedule this trip" />

      {schedules.length === 0 ? (
        <p className="mt-6 font-mono text-sm text-slate">
          No alternative schedules are available on this route right now.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div className="space-y-3">
            {schedules.map((s) => (
              <label
                key={s.id}
                className={`block cursor-pointer rounded-2xl border-2 p-4 transition-colors ${
                  selectedId === s.id ? 'border-danfo' : 'border-asphalt/10'
                }`}
              >
                <input
                  type="radio"
                  name="schedule"
                  value={s.id}
                  checked={selectedId === s.id}
                  onChange={() => setSelectedId(s.id)}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm text-asphalt">
                    {s.departure_date} · {s.departure_time?.slice(0, 5)} –{' '}
                    {s.arrival_time?.slice(0, 5)}
                  </div>
                  <div className="font-mono text-xs text-slate">
                    {s.available_seats} seats left
                  </div>
                </div>
                <div className="mt-1 font-mono text-xs text-slate">
                  {s.boarding_terminal} → {s.dropoff_terminal}
                </div>
                {Number(s.fare?.reschedule_fee) > 0 && (
                  <div className="mt-1 font-mono text-xs text-danfo-dark">
                    Reschedule fee: {money(s.fare.reschedule_fee)}
                  </div>
                )}
              </label>
            ))}
          </div>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-slate">
              Reason for rescheduling
            </span>
            <input
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Change of travel plans"
              className="w-full rounded-xl border border-transparent bg-paper-dim px-4 py-3.5 text-[15px] font-medium text-asphalt transition-[border-color,background-color,box-shadow] duration-200 focus:border-danfo focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky/20"
            />
          </label>

          {submitError && <p className="font-mono text-sm text-alert">{submitError}</p>}

          <Button
            type="submit"
            loading={submitting}
            disabled={!selectedId || !reason}
            className="w-full"
          >
            Confirm reschedule
          </Button>
        </form>
      )}
    </div>
  );
}
