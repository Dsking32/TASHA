import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpDown, Calendar, MapPin, Minus, Plus, RotateCw, Users } from 'lucide-react';
import { getLocations } from '../../api/trips';
import LiquidGlass from '../ui/LiquidGlass';
import { cityLabel, localDate } from '../../utils/places';

const MAX_PASSENGERS = 10;

const BOOKING_TYPES = [
  { value: 'individual', label: 'Book seats' },
  { value: 'private', label: 'Hire a whole bus' },
];

const fieldClass =
  'w-full rounded-xl border-0 bg-white px-3.5 py-3.5 text-[15px] font-semibold text-asphalt shadow-sm ring-1 ring-black/5 transition-shadow duration-200 ease-(--ease-in-out) focus:outline-none focus:ring-4 focus:ring-sky/40 disabled:cursor-wait disabled:text-slate';

const labelClass = 'mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-white';

export default function SearchPanel() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    departure_location_id: '',
    arrival_location_id: '',
    departure_date: localDate(0),
    booking_type: 'individual',
    passenger_count: 1,
  });

  const loadLocations = useCallback(() => {
    setStatus('loading');
    getLocations()
      .then((res) => {
        setLocations(res.data?.locations || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(loadLocations, [loadLocations]);

  // "/?type=private#search" (from the ride-type cards) preselects the tab.
  const [params] = useSearchParams();
  const typeParam = params.get('type');
  useEffect(() => {
    if (typeParam === 'private' || typeParam === 'individual') {
      setForm((f) => ({ ...f, booking_type: typeParam }));
      document.getElementById('search')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [typeParam]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const swap = () =>
    setForm((f) => ({
      ...f,
      departure_location_id: f.arrival_location_id,
      arrival_location_id: f.departure_location_id,
    }));

  const changePassengers = (delta) =>
    set('passenger_count', Math.min(MAX_PASSENGERS, Math.max(1, form.passenger_count + delta)));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.departure_location_id || !form.arrival_location_id) {
      setFormError('Choose where you are leaving from and where you are going.');
      return;
    }
    if (form.departure_location_id === form.arrival_location_id) {
      setFormError('Leaving from and going to cannot be the same city.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    navigate(`/search?${new URLSearchParams(form)}`);
  };

  const today = localDate(0);
  const tomorrow = localDate(1);
  const cityPlaceholder = status === 'loading' ? 'Loading cities…' : 'Select city';

  const citySelect = (key, otherKey, label) => (
    <label className="block">
      <span className={labelClass}>
        <MapPin size="1em" aria-hidden="true" /> {label}
      </span>
      <select
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        disabled={status !== 'ready'}
        className={`${fieldClass} cursor-pointer pr-10`}
      >
        <option value="">{cityPlaceholder}</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id} disabled={String(loc.id) === form[otherKey]}>
            {cityLabel(loc)}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <LiquidGlass radius={28} className="p-5 sm:p-6">
      <form id="search" onSubmit={onSubmit} noValidate className="scroll-mt-28 text-left">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-white">Where are you going?</h2>
        </div>

        {/* Booking type */}
        <div role="radiogroup" aria-label="Booking type" className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-asphalt/35 p-1">
          {BOOKING_TYPES.map((opt) => {
            const active = form.booking_type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => set('booking_type', opt.value)}
                className={`cursor-pointer rounded-full px-3 py-2.5 text-sm font-bold transition-colors duration-200 ease-(--ease-in-out) ${
                  active ? 'bg-white text-asphalt' : 'text-white/85 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Route */}
        <div className="relative mt-4 grid gap-3">
          {citySelect('departure_location_id', 'arrival_location_id', 'Leaving from')}
          {citySelect('arrival_location_id', 'departure_location_id', 'Going to')}
          <button
            type="button"
            onClick={swap}
            aria-label="Swap cities"
            className="absolute right-12 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-rose text-white shadow-md transition-transform duration-300 ease-(--ease-out) hover:rotate-180"
          >
            <ArrowUpDown size={16} aria-hidden="true" />
          </button>
        </div>

        {status === 'error' && (
          <div role="alert" className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-alert">
            <span>Couldn't load cities.</span>
            <button
              type="button"
              onClick={loadLocations}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap underline-offset-2 hover:underline"
            >
              <RotateCw size="1em" aria-hidden="true" /> Try again
            </button>
          </div>
        )}

        {/* Date + passengers */}
        <div className="mt-4 grid gap-4">
          <div>
            <span className={labelClass}>
              <Calendar size="1em" aria-hidden="true" /> Travel date
            </span>
            <div className="flex gap-2">
              {[
                { value: today, label: 'Today' },
                { value: tomorrow, label: 'Tomorrow' },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => set('departure_date', d.value)}
                  aria-pressed={form.departure_date === d.value}
                  className={`shrink-0 cursor-pointer rounded-xl px-3 text-sm font-bold transition-colors duration-200 ease-(--ease-in-out) ${
                    form.departure_date === d.value
                      ? 'bg-asphalt text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {d.label}
                </button>
              ))}
              <input
                type="date"
                aria-label="Pick another date"
                min={today}
                value={form.departure_date}
                onChange={(e) => set('departure_date', e.target.value || today)}
                className={`${fieldClass} min-w-0 flex-1 cursor-pointer px-3`}
              />
            </div>
          </div>

          {/* Own row so the stepper never gets squeezed by the date controls */}
          <div className="flex items-center justify-between gap-4">
            <span className={`${labelClass} mb-0`}>
              <Users size="1em" aria-hidden="true" /> Passengers
            </span>
            <div className="flex shrink-0 items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => changePassengers(-1)}
                disabled={form.passenger_count <= 1}
                aria-label="Remove a passenger"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-asphalt transition-colors hover:bg-paper-dim disabled:cursor-not-allowed disabled:text-asphalt/25 disabled:hover:bg-transparent"
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <output aria-live="polite" className="w-7 text-center font-mono text-base font-semibold text-asphalt">
                {form.passenger_count}
              </output>
              <button
                type="button"
                onClick={() => changePassengers(1)}
                disabled={form.passenger_count >= MAX_PASSENGERS}
                aria-label="Add a passenger"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-asphalt transition-colors hover:bg-paper-dim disabled:cursor-not-allowed disabled:text-asphalt/25 disabled:hover:bg-transparent"
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {formError && (
          <p role="alert" className="mt-4 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={status !== 'ready' || submitting}
          className="group mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-rose px-6 py-4 text-base font-bold text-white shadow-[0_12px_30px_-10px_rgba(233,30,120,0.8)] transition-[background-color,transform] duration-200 ease-(--ease-out) hover:-translate-y-0.5 hover:bg-rose-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          Find buses
          <ArrowRight size={18} className="transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </form>
    </LiquidGlass>
  );
}
