import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PhoneCall, UserPlus, UserRound, Users, X } from 'lucide-react';
import { bookTrip } from '../api/trips';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import CheckoutGate from '../components/booking/CheckoutGate';
import useCheckoutStage from '../hooks/useCheckoutStage';
import { useAuth } from '../context/AuthContext';
import { guestBookings } from '../utils/guestBookings';
import FormSection from '../components/booking/FormSection';

const MAX_PASSENGERS = 10;

const emptyPassenger = () => ({ first_name: '', last_name: '', gender: '', passenger_category: 'adult' });

// Laravel returns array errors as flat keys: "passengers.1.first_name".
const err = (errors, key) => errors[key]?.[0];

/** Small two/three-way toggle used for gender and age group. */
function Choice({ label, value, options, onChange, error }) {
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-bold text-asphalt">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-xl bg-paper-dim p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`flex-1 cursor-pointer rounded-lg px-2 py-2.5 text-sm font-semibold transition-colors duration-200 ease-(--ease-in-out) ${
              value === o.value ? 'bg-white text-asphalt shadow-sm' : 'text-slate hover:text-asphalt'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {error && <span className="mt-1.5 block text-xs font-semibold text-alert">{error}</span>}
    </div>
  );
}

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const AGE_GROUPS = [
  { value: 'adult', label: 'Adult' },
  { value: 'child', label: 'Child' },
  { value: 'infant', label: 'Infant' },
];

export default function BookTrip() {
  const { scheduleId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const passengerCount = Math.min(MAX_PASSENGERS, Math.max(1, Number(searchParams.get('passenger_count')) || 1));

  // The person booking is passenger 1 and the booking contact.
  const [you, setYou] = useState({ first_name: '', last_name: '', gender: '', phone: '', email: '' });
  const [others, setOthers] = useState(Array.from({ length: passengerCount - 1 }, emptyPassenger));
  const [emergency, setEmergency] = useState({ emergency_contact_name: '', emergency_contact_phone: '' });

  // Signed in: fill "your details" from the profile (still editable).
  useEffect(() => {
    if (!user) return;
    setYou((y) => ({
      ...y,
      first_name: y.first_name || user.first_name || '',
      last_name: y.last_name || user.last_name || '',
      phone: y.phone || user.phone_number || '',
      email: y.email || user.email || '',
    }));
  }, [user]);

  const [guestChosen, setGuestChosen] = useState(false);
  const stage = useCheckoutStage(guestChosen);

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  // Guards against a fast double tap creating two bookings before the
  // loading state re-renders.
  const submittingRef = useRef(false);

  const updateOther = (index, field, value) =>
    setOthers((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;

    const missingGender = [you, ...others].some((p) => !p.gender);
    if (missingGender) {
      setFormError('Choose male or female for each passenger.');
      return;
    }

    submittingRef.current = true;
    setFormError('');
    setErrors({});
    setLoading(true);

    const payload = {
      schedule_id: Number(scheduleId),
      passengers: [
        {
          first_name: you.first_name,
          last_name: you.last_name,
          gender: you.gender,
          phone_number: you.phone,
          email: you.email || null,
          passenger_category: 'adult',
        },
        // Other passengers' phone defaults to the contact phone on the server.
        ...others.map((p) => ({ ...p })),
      ],
      contact_first_name: you.first_name,
      contact_last_name: you.last_name,
      contact_email: you.email,
      contact_phone: you.phone,
      ...emergency,
    };

    try {
      const res = await bookTrip(payload);
      const booking = res.data?.booking;
      if (!booking?.id) {
        setFormError("Your booking may have gone through, but we couldn't confirm it here. Check your email before trying again.");
        return;
      }
      // Guests get a private access token once; keep it on this device.
      if (res.data?.guest_token) {
        guestBookings.save(booking.id, res.data.guest_token, booking.reference);
      }
      navigate(`/bookings/${booking.id}`, { state: { booking } });
    } catch (error) {
      setFormError(error.message);
      setErrors(error.errors || {});
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

  const total = others.length + 1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        eyebrow="Step 1 of 3"
        title="Who's travelling?"
        subtitle={`${total} passenger${total > 1 ? 's' : ''}. Use names as they appear on an ID.`}
      />

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <FormSection Icon={UserRound} title="Your details" note="We'll send your booking to this email and phone.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" name="first_name" value={you.first_name} onChange={(e) => setYou({ ...you, first_name: e.target.value })} error={err(errors, 'contact_first_name') || err(errors, 'passengers.0.first_name')} autoComplete="given-name" required />
            <Field label="Last name" name="last_name" value={you.last_name} onChange={(e) => setYou({ ...you, last_name: e.target.value })} error={err(errors, 'contact_last_name') || err(errors, 'passengers.0.last_name')} autoComplete="family-name" required />
            <Field label="Phone number" name="phone" type="tel" inputMode="tel" placeholder="080..." value={you.phone} onChange={(e) => setYou({ ...you, phone: e.target.value })} error={err(errors, 'contact_phone') || err(errors, 'passengers.0.phone_number')} autoComplete="tel" required />
            <Field label="Email" name="email" type="email" value={you.email} onChange={(e) => setYou({ ...you, email: e.target.value })} error={err(errors, 'contact_email')} autoComplete="email" required />
          </div>
          <div className="mt-4">
            <Choice label="Gender" value={you.gender} options={GENDERS} onChange={(v) => setYou({ ...you, gender: v })} error={err(errors, 'passengers.0.gender')} />
          </div>
        </FormSection>

        {others.length > 0 && (
          <FormSection Icon={Users} title="Other passengers" note="Just their names. We'll use your phone number for them.">
            <div className="space-y-6">
              {others.map((p, i) => {
                const n = i + 1; // index in the API's passengers array
                return (
                  <fieldset key={n} className="border-t border-asphalt/8 pt-5 first:border-t-0 first:pt-0">
                    <legend className="mb-3 flex w-full items-center justify-between text-sm font-bold text-asphalt">
                      Passenger {n + 1}
                      <button
                        type="button"
                        onClick={() => setOthers((prev) => prev.filter((_, j) => j !== i))}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-slate transition-colors hover:bg-alert-soft hover:text-alert"
                      >
                        <X size={13} aria-hidden="true" /> Remove
                      </button>
                    </legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="First name" name={`p${n}-first`} value={p.first_name} onChange={(e) => updateOther(i, 'first_name', e.target.value)} error={err(errors, `passengers.${n}.first_name`)} required />
                      <Field label="Last name" name={`p${n}-last`} value={p.last_name} onChange={(e) => updateOther(i, 'last_name', e.target.value)} error={err(errors, `passengers.${n}.last_name`)} required />
                      <Choice label="Gender" value={p.gender} options={GENDERS} onChange={(v) => updateOther(i, 'gender', v)} error={err(errors, `passengers.${n}.gender`)} />
                      <Choice label="Age group" value={p.passenger_category} options={AGE_GROUPS} onChange={(v) => updateOther(i, 'passenger_category', v)} />
                    </div>
                  </fieldset>
                );
              })}
            </div>
          </FormSection>
        )}

        {total < MAX_PASSENGERS && (
          <button
            type="button"
            onClick={() => setOthers((prev) => [...prev, emptyPassenger()])}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-asphalt/15 py-4 text-sm font-bold text-slate transition-colors hover:border-rose/50 hover:bg-rose-soft hover:text-rose"
          >
            <UserPlus size={16} aria-hidden="true" /> Add a passenger
          </button>
        )}

        <FormSection Icon={PhoneCall} title="Emergency contact" note="Someone we can call if anything happens on the trip, ideally not travelling with you.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Their name" name="emergency_contact_name" value={emergency.emergency_contact_name} onChange={(e) => setEmergency({ ...emergency, emergency_contact_name: e.target.value })} error={err(errors, 'emergency_contact_name')} required />
            <Field label="Their phone" name="emergency_contact_phone" type="tel" inputMode="tel" placeholder="080..." value={emergency.emergency_contact_phone} onChange={(e) => setEmergency({ ...emergency, emergency_contact_phone: e.target.value })} error={err(errors, 'emergency_contact_phone')} required />
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
