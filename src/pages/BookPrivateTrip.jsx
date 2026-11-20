import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { bookPrivateTrip } from '../api/trips';
import Field from '../components/ui/Field';
import { ChevronDown, MapPin, PhoneCall, UserRound } from 'lucide-react';
import Button from '../components/ui/Button';
import FormSection from '../components/booking/FormSection';
import PageHeader from '../components/ui/PageHeader';
import CheckoutGate from '../components/booking/CheckoutGate';
import useCheckoutStage from '../hooks/useCheckoutStage';
import { useAuth } from '../context/AuthContext';
import { guestBookings } from '../utils/guestBookings';

export default function BookPrivateTrip() {
  const { scheduleId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    passenger_count: Number(searchParams.get('passenger_count')) || 1,
    pickup_location: '',
    pickup_landmark: '',
    dropoff_location: '',
    preferred_pickup_time: '',
    special_requirements: '',
  });
  const [additionalStops, setAdditionalStops] = useState('');
  const [contact, setContact] = useState({
    contact_first_name: '',
    contact_last_name: '',
    contact_email: '',
    contact_phone: '',
  });
  const [emergency, setEmergency] = useState({
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  // Signed in: start the primary contact from the profile (still editable).
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    setContact((c) => ({
      ...c,
      contact_first_name: c.contact_first_name || user.first_name || '',
      contact_last_name: c.contact_last_name || user.last_name || '',
      contact_email: c.contact_email || user.email || '',
      contact_phone: c.contact_phone || user.phone_number || '',
    }));
  }, [user]);

  const [guestChosen, setGuestChosen] = useState(false);
  const stage = useCheckoutStage(guestChosen);

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setFormError('');
    setErrors({});
    setLoading(true);

    const payload = {
      schedule_id: Number(scheduleId),
      ...form,
      passenger_count: Number(form.passenger_count) || 1,
      special_requirements: form.special_requirements || null,
      additional_stops: additionalStops
        ? additionalStops.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      // preferred_pickup_time comes from a datetime-local input; convert to ISO.
      preferred_pickup_time: form.preferred_pickup_time
        ? new Date(form.preferred_pickup_time).toISOString()
        : '',
      ...contact,
      ...emergency,
    };

    try {
      const res = await bookPrivateTrip(payload);
      const booking = res.data?.booking;
      if (!booking?.id) {
        setFormError(
          "Your booking may have gone through, but we couldn't confirm it here — check your email before trying again."
        );
        return;
      }
      // Guests get a private access token once; keep it on this device.
      if (res.data?.guest_token) {
        guestBookings.save(booking.id, res.data.guest_token, booking.reference);
      }
      navigate(`/bookings/${booking.id}`, { state: { booking } });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  if (stage === 'checking') {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-12" aria-busy="true">
        <div className="skeleton h-10 w-2/3 rounded-xl" />
        <div className="skeleton h-48 rounded-3xl" />
      </div>
    );
  }

  if (stage === 'gate') {
    return <CheckoutGate onGuest={() => setGuestChosen(true)} />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        eyebrow="Whole bus hire"
        title="Where should we pick you up?"
        subtitle="The bus is yours alone. Tell us the pickup, drop-off and time."
      />

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <FormSection Icon={MapPin} title="Trip">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pickup address" name="pickup_location" placeholder="Street or area" value={form.pickup_location} onChange={(e) => setForm({ ...form, pickup_location: e.target.value })} error={errors.pickup_location?.[0]} required />
            <Field label="Nearby landmark (optional)" name="pickup_landmark" placeholder="e.g. opposite First Bank" value={form.pickup_landmark} onChange={(e) => setForm({ ...form, pickup_landmark: e.target.value })} error={errors.pickup_landmark?.[0]} />
            <Field label="Drop-off address" name="dropoff_location" value={form.dropoff_location} onChange={(e) => setForm({ ...form, dropoff_location: e.target.value })} error={errors.dropoff_location?.[0]} required />
            <Field label="Pickup time" name="preferred_pickup_time" type="datetime-local" value={form.preferred_pickup_time} onChange={(e) => setForm({ ...form, preferred_pickup_time: e.target.value })} error={errors.preferred_pickup_time?.[0]} required />
            <Field label="Number of passengers" name="passenger_count" type="number" inputMode="numeric" min={1} value={form.passenger_count} onChange={(e) => setForm({ ...form, passenger_count: e.target.value })} error={errors.passenger_count?.[0]} required />
          </div>

          <details className="group mt-5 rounded-2xl bg-paper-dim px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-asphalt">
              Add stops or notes (optional)
              <ChevronDown size={16} className="transition-transform duration-300 ease-(--ease-out) group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="mt-4 space-y-4 pb-1">
              <Field label="Stops on the way" name="additional_stops" placeholder="Separate with commas, e.g. Jabi Lake Mall, Wuse Market" value={additionalStops} onChange={(e) => setAdditionalStops(e.target.value)} />
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-bold text-asphalt">Anything we should know?</span>
                <textarea
                  rows={3}
                  value={form.special_requirements}
                  onChange={(e) => setForm({ ...form, special_requirements: e.target.value })}
                  placeholder="Luggage, wheelchair access, event details"
                  className="w-full rounded-xl border border-transparent bg-white px-4 py-3.5 text-[15px] font-medium text-asphalt transition-[border-color,box-shadow] duration-200 focus:border-danfo focus:outline-none focus:ring-4 focus:ring-sky/20"
                />
              </label>
            </div>
          </details>
        </FormSection>

        <FormSection Icon={UserRound} title="Your details" note="We'll send your booking to this email and phone.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" name="contact_first_name" value={contact.contact_first_name} onChange={(e) => setContact({ ...contact, contact_first_name: e.target.value })} error={errors.contact_first_name?.[0]} autoComplete="given-name" required />
            <Field label="Last name" name="contact_last_name" value={contact.contact_last_name} onChange={(e) => setContact({ ...contact, contact_last_name: e.target.value })} error={errors.contact_last_name?.[0]} autoComplete="family-name" required />
            <Field label="Phone number" name="contact_phone" type="tel" inputMode="tel" placeholder="080..." value={contact.contact_phone} onChange={(e) => setContact({ ...contact, contact_phone: e.target.value })} error={errors.contact_phone?.[0]} autoComplete="tel" required />
            <Field label="Email" name="contact_email" type="email" value={contact.contact_email} onChange={(e) => setContact({ ...contact, contact_email: e.target.value })} error={errors.contact_email?.[0]} autoComplete="email" required />
          </div>
        </FormSection>

        <FormSection Icon={PhoneCall} title="Emergency contact" note="Someone we can call if anything happens on the trip, ideally not travelling with you.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Their name" name="emergency_contact_name" value={emergency.emergency_contact_name} onChange={(e) => setEmergency({ ...emergency, emergency_contact_name: e.target.value })} error={errors.emergency_contact_name?.[0]} required />
            <Field label="Their phone" name="emergency_contact_phone" type="tel" inputMode="tel" placeholder="080..." value={emergency.emergency_contact_phone} onChange={(e) => setEmergency({ ...emergency, emergency_contact_phone: e.target.value })} error={errors.emergency_contact_phone?.[0]} required />
          </div>
        </FormSection>

        {formError && (
          <p role="alert" className="rounded-xl bg-alert-soft px-4 py-3 text-sm font-semibold text-alert">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Continue to payment
        </Button>
      </form>
    </div>
  );
}
