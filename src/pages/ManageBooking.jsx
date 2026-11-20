import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Ticket } from 'lucide-react';
import { lookupGuestBooking } from '../api/trips';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import AuthShell from '../components/layout/AuthShell';
import { guestBookings } from '../utils/guestBookings';

/**
 * Guests (no account) find their booking with its reference and the email
 * used when booking. Bookings already opened on this device are listed too.
 */
export default function ManageBooking() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ reference: '', email: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const saved = guestBookings.list().filter((b) => b.reference);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setErrors({});
    setLoading(true);
    try {
      const res = await lookupGuestBooking({ reference: form.reference.trim(), email: form.email.trim() });
      const { booking_id: id, guest_token: token, reference } = res.data || {};
      guestBookings.save(id, token, reference);
      navigate(`/bookings/${id}`);
    } catch (err) {
      setFormError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Manage booking"
      title="Find your booking"
      subtitle="Booked without an account? Enter your booking reference and the email you booked with."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Field
          label="Booking reference"
          name="reference"
          placeholder="e.g. TXP-261120-AB12C"
          value={form.reference}
          onChange={(e) => setForm({ ...form, reference: e.target.value.toUpperCase() })}
          error={errors.reference?.[0]}
          autoCapitalize="characters"
          required
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email?.[0]}
          autoComplete="email"
          required
        />

        {formError && (
          <p role="alert" className="rounded-xl bg-alert-soft px-4 py-3 text-sm font-semibold text-alert">
            {formError}
            {formError.includes('Sign in') && (
              <>
                {' '}
                <Link to="/login" className="underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Find booking
        </Button>
      </form>

      {saved.length > 0 && (
        <div className="mt-10">
          <p className="text-[13px] font-bold text-asphalt">On this device</p>
          <ul className="mt-3 space-y-2">
            {saved.map((b) => (
              <li key={b.id}>
                <Link
                  to={`/bookings/${b.id}`}
                  className="group flex items-center justify-between rounded-2xl bg-paper-dim px-4 py-3 text-sm font-semibold text-asphalt transition-colors hover:bg-rose-soft hover:text-rose"
                >
                  <span className="inline-flex items-center gap-2">
                    <Ticket size={16} aria-hidden="true" /> {b.reference}
                  </span>
                  <ArrowRight size={16} className="transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-slate">
        Have an account?{' '}
        <Link to="/login" className="font-bold text-rose hover:text-rose-dark">
          Sign in to see all your trips
        </Link>
      </p>
    </AuthShell>
  );
}
