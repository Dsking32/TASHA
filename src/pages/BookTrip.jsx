import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { UserPlus, X } from 'lucide-react';
import { bookTrip } from '../api/trips';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import CheckoutGate from '../components/booking/CheckoutGate';
import useCheckoutStage from '../hooks/useCheckoutStage';
import { useAuth } from '../context/AuthContext';
import { guestBookings } from '../utils/guestBookings';

const MAX_PASSENGERS = 6;

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

  const addPassenger = () => {
    setPassengers((prev) =>
      prev.length >= MAX_PASSENGERS ? prev : [...prev, emptyPassenger()]
    );
  };

  const removePassenger = (index) => {
    setPassengers((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
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
    <div className="mx-auto max-w-2xl px-6 py-12">
      <PageHeader
        eyebrow="Booking details"
        title="Who's travelling?"
        subtitle={
          <>
            {passengers.length} passenger{passengers.length > 1 ? 's' : ''}. Names must match a valid ID.
          </>
        }
      />

      <form onSubmit={onSubmit} className="mt-8 space-y-10">
        {passengers.map((p, i) => (
          <fieldset key={i} className="rounded-3xl bg-white p-5 ring-1 ring-asphalt/8">
            <legend className="flex w-full items-center justify-between px-2">
              <span className="font-display text-sm font-semibold text-asphalt">
                Passenger {i + 1}
              </span>
              {passengers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePassenger(i)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 font-mono text-[11px] text-slate transition-colors hover:bg-alert-soft hover:text-alert"
                >
                  <X size={13} />
                  Remove
                </button>
              )}
            </legend>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-bold text-asphalt">
                  Title
                </span>
                <select
                  value={p.title}
                  onChange={(e) => updatePassenger(i, 'title', e.target.value)}
                  className="w-full rounded-xl border border-transparent bg-paper-dim px-3 py-3 text-sm font-medium text-asphalt transition-[border-color,background-color,box-shadow] duration-200 focus:border-danfo focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky/20"
                >
                  <option>Mr</option>
                  <option>Mrs</option>
                  <option>Miss</option>
                  <option>Master</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[13px] font-bold text-asphalt">
                  Category
                </span>
                <select
                  value={p.passenger_category}
                  onChange={(e) => updatePassenger(i, 'passenger_category', e.target.value)}
                  className="w-full rounded-xl border border-transparent bg-paper-dim px-3 py-3 text-sm font-medium text-asphalt transition-[border-color,background-color,box-shadow] duration-200 focus:border-danfo focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky/20"
                >
                  <option value="adult">Adult</option>
                  <option value="child">Child</option>
                  <option value="infant">Infant</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[13px] font-bold text-asphalt">
                  Gender
                </span>
                <select
                  value={p.gender}
                  onChange={(e) => updatePassenger(i, 'gender', e.target.value)}
                  className="w-full rounded-xl border border-transparent bg-paper-dim px-3 py-3 text-sm font-medium text-asphalt transition-[border-color,background-color,box-shadow] duration-200 focus:border-danfo focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky/20"
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

        {passengers.length < MAX_PASSENGERS && (
          <button
            type="button"
            onClick={addPassenger}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-asphalt/20 py-4 font-display text-sm font-semibold text-slate transition-colors hover:border-rose/50 hover:bg-rose-soft hover:text-rose"
          >
            <UserPlus size={16} />
            Add another passenger
          </button>
        )}

        <fieldset className="rounded-3xl bg-white p-5 ring-1 ring-asphalt/8">
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

        <fieldset className="rounded-3xl bg-white p-5 ring-1 ring-asphalt/8">
          <legend className="px-2 font-display text-sm font-semibold text-asphalt">
            Emergency contact
          </legend>
          <p className="mb-4 px-2 text-sm text-slate">
            Someone we can call if anything happens on the trip, ideally not travelling with you. Required for every booking.
          </p>
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
