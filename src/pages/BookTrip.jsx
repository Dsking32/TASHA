import { useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { bookTrip } from '../api/trips';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';

const emptyPassenger = (category = 'adult') => ({
  title: 'Mr',
  first_name: '',
  last_name: '',
  gender: 'male',
  phone_number: '',
  email: '',
  date_of_birth: '',
  passenger_category: category,
  id_type: '',
  id_number: '',
  special_assistance: '',
});

export default function BookTrip() {
  const { scheduleId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const passengerCount = Math.max(1, Number(searchParams.get('passenger_count')) || 1);

  const [passengers, setPassengers] = useState(
    Array.from({ length: passengerCount }, () => emptyPassenger())
  );
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
  // The `loading` state disables the button visually, but a fast
  // double-click/tap can fire onSubmit twice before that re-render lands —
  // this ref is checked synchronously so a genuine double-submit (which
  // would create a duplicate booking) can't slip through.
  const submittingRef = useRef(false);

  const updatePassenger = (index, field, value) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setFormError('');
    setErrors({});
    setLoading(true);

    // Trim optional fields down to null so we don't send empty strings for
    // things the passenger didn't fill in (id_type, id_number, etc).
    const cleanedPassengers = passengers.map((p) => ({
      ...p,
      id_type: p.id_type || null,
      id_number: p.id_number || null,
      special_assistance: p.special_assistance || null,
    }));

    const payload = {
      schedule_id: Number(scheduleId),
      passengers: cleanedPassengers,
      ...contact,
      ...emergency,
    };

    try {
      const res = await bookTrip(payload);
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
        eyebrow="Booking details"
        title="Who's travelling?"
        subtitle={
          <>
            {passengerCount} passenger{passengerCount > 1 ? 's' : ''} · schedule #{scheduleId}
          </>
        }
      />

      <form onSubmit={onSubmit} className="mt-8 space-y-10">
        {passengers.map((p, i) => (
          <fieldset key={i} className="rounded-2xl border border-asphalt/10 p-5">
            <legend className="px-2 font-display text-sm font-semibold text-asphalt">
              Passenger {i + 1}
            </legend>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-slate">
                  Title
                </span>
                <select
                  value={p.title}
                  onChange={(e) => updatePassenger(i, 'title', e.target.value)}
                  className="w-full rounded-lg border border-asphalt/15 bg-paper px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-danfo/60"
                >
                  <option>Mr</option>
                  <option>Mrs</option>
                  <option>Miss</option>
                  <option>Master</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-slate">
                  Category
                </span>
                <select
                  value={p.passenger_category}
                  onChange={(e) => updatePassenger(i, 'passenger_category', e.target.value)}
                  className="w-full rounded-lg border border-asphalt/15 bg-paper px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-danfo/60"
                >
                  <option value="adult">Adult</option>
                  <option value="child">Child</option>
                  <option value="infant">Infant</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-slate">
                  Gender
                </span>
                <select
                  value={p.gender}
                  onChange={(e) => updatePassenger(i, 'gender', e.target.value)}
                  className="w-full rounded-lg border border-asphalt/15 bg-paper px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-danfo/60"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <Field
                label="First name"
                name={`passenger-${i}-first_name`}
                value={p.first_name}
                onChange={(e) => updatePassenger(i, 'first_name', e.target.value)}
                error={errors.passengers?.[i]?.first_name?.[0]}
                required
              />
              <Field
                label="Last name"
                name={`passenger-${i}-last_name`}
                value={p.last_name}
                onChange={(e) => updatePassenger(i, 'last_name', e.target.value)}
                error={errors.passengers?.[i]?.last_name?.[0]}
                required
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <Field
                label="Phone number"
                name={`passenger-${i}-phone`}
                type="tel"
                value={p.phone_number}
                onChange={(e) => updatePassenger(i, 'phone_number', e.target.value)}
                error={errors.passengers?.[i]?.phone_number?.[0]}
                required
              />
              <Field
                label="Email"
                name={`passenger-${i}-email`}
                type="email"
                value={p.email}
                onChange={(e) => updatePassenger(i, 'email', e.target.value)}
                error={errors.passengers?.[i]?.email?.[0]}
              />
            </div>

            <div className="mt-4">
              <Field
                label="Date of birth"
                name={`passenger-${i}-dob`}
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={p.date_of_birth}
                onChange={(e) => updatePassenger(i, 'date_of_birth', e.target.value)}
                error={errors.passengers?.[i]?.date_of_birth?.[0]}
                required
              />
            </div>
          </fieldset>
        ))}

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
