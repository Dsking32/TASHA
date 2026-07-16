import { useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { bookPrivateTrip } from '../api/trips';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';

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
    contact_alt_phone: '',
  });
  const [emergency, setEmergency] = useState({
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

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
          "Your booking may have gone through, but we couldn't confirm it here — check My Bookings before trying again."
        );
        return;
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

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <PageHeader
        eyebrow="Private booking"
        title="Reserve the whole vehicle"
        subtitle={`Schedule #${scheduleId}`}
      />

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <Field
          label="Passenger count"
          name="passenger_count"
          type="number"
          min={1}
          value={form.passenger_count}
          onChange={(e) => setForm({ ...form, passenger_count: e.target.value })}
          error={errors.passenger_count?.[0]}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Pickup location"
            name="pickup_location"
            value={form.pickup_location}
            onChange={(e) => setForm({ ...form, pickup_location: e.target.value })}
            error={errors.pickup_location?.[0]}
            required
          />
          <Field
            label="Pickup landmark"
            name="pickup_landmark"
            value={form.pickup_landmark}
            onChange={(e) => setForm({ ...form, pickup_landmark: e.target.value })}
            error={errors.pickup_landmark?.[0]}
            required
          />
        </div>

        <Field
          label="Drop-off location"
          name="dropoff_location"
          value={form.dropoff_location}
          onChange={(e) => setForm({ ...form, dropoff_location: e.target.value })}
          error={errors.dropoff_location?.[0]}
          required
        />

        <Field
          label="Preferred pickup time"
          name="preferred_pickup_time"
          type="datetime-local"
          value={form.preferred_pickup_time}
          onChange={(e) => setForm({ ...form, preferred_pickup_time: e.target.value })}
          error={errors.preferred_pickup_time?.[0]}
          required
        />

        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-slate">
            Additional stops (comma-separated, optional)
          </span>
          <input
            value={additionalStops}
            onChange={(e) => setAdditionalStops(e.target.value)}
            placeholder="Jabi Lake Mall, Wuse Market"
            className="w-full rounded-lg border border-asphalt/15 bg-paper px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-danfo/60"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-slate">
            Special requirements (optional)
          </span>
          <textarea
            rows={3}
            value={form.special_requirements}
            onChange={(e) => setForm({ ...form, special_requirements: e.target.value })}
            className="w-full rounded-lg border border-asphalt/15 bg-paper px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-danfo/60"
          />
        </label>

        <fieldset className="rounded-2xl border border-asphalt/10 p-5">
          <legend className="px-2 font-display text-sm font-semibold text-asphalt">
            Primary contact
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="First name"
              name="contact_first_name"
              value={contact.contact_first_name}
              onChange={(e) => setContact({ ...contact, contact_first_name: e.target.value })}
              error={errors.contact_first_name?.[0]}
              required
            />
            <Field
              label="Last name"
              name="contact_last_name"
              value={contact.contact_last_name}
              onChange={(e) => setContact({ ...contact, contact_last_name: e.target.value })}
              error={errors.contact_last_name?.[0]}
              required
            />
          </div>
          <div className="mt-4">
            <Field
              label="Email"
              name="contact_email"
              type="email"
              value={contact.contact_email}
              onChange={(e) => setContact({ ...contact, contact_email: e.target.value })}
              error={errors.contact_email?.[0]}
              required
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field
              label="Phone"
              name="contact_phone"
              type="tel"
              value={contact.contact_phone}
              onChange={(e) => setContact({ ...contact, contact_phone: e.target.value })}
              error={errors.contact_phone?.[0]}
              required
            />
            <Field
              label="Alt phone"
              name="contact_alt_phone"
              type="tel"
              value={contact.contact_alt_phone}
              onChange={(e) => setContact({ ...contact, contact_alt_phone: e.target.value })}
              error={errors.contact_alt_phone?.[0]}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-asphalt/10 p-5">
          <legend className="px-2 font-display text-sm font-semibold text-asphalt">
            Emergency contact
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Name"
              name="emergency_contact_name"
              value={emergency.emergency_contact_name}
              onChange={(e) =>
                setEmergency({ ...emergency, emergency_contact_name: e.target.value })
              }
              error={errors.emergency_contact_name?.[0]}
              required
            />
            <Field
              label="Phone"
              name="emergency_contact_phone"
              type="tel"
              value={emergency.emergency_contact_phone}
              onChange={(e) =>
                setEmergency({ ...emergency, emergency_contact_phone: e.target.value })
              }
              error={errors.emergency_contact_phone?.[0]}
              required
            />
          </div>
        </fieldset>

        {formError && <p className="font-mono text-sm text-alert">{formError}</p>}

        <Button type="submit" loading={loading} className="w-full">
          Continue to payment
        </Button>
      </form>
    </div>
  );
}
