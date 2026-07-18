import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Armchair,
  ArrowLeftRight,
  Calendar,
  MapPin,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react';
import { getLocations } from '../api/trips';
import Button from '../components/ui/Button';
import TicketCard from '../components/ui/TicketCard';
import Reveal from '../components/ui/Reveal';

// Hero background image
const HERO_IMAGE =
  'https://res.cloudinary.com/dvpfdgnkw/image/upload/v1784401447/Gemini_Generated_Image_42lprl42lprl42lp_cbr4eb.png';

export default function Home() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    departure_location_id: '',
    arrival_location_id: '',
    departure_date: '',
    booking_type: 'individual',
    passenger_count: 1,
  });

  useEffect(() => {
    getLocations()
      .then((res) => setLocations(res.data?.locations || []))
      .catch(() => setLoadError('Could not reach the backend to load locations.'));
  }, []);

  const swapLocations = () => {
    setForm((f) => ({
      ...f,
      departure_location_id: f.arrival_location_id,
      arrival_location_id: f.departure_location_id,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.departure_location_id === form.arrival_location_id) {
      setFormError("Departure and arrival can't be the same city.");
      return;
    }
    setFormError('');
    const params = new URLSearchParams(form).toString();
    navigate(`/search?${params}`);
  };

  return (
    <div>
      {/* Hero — full-bleed photo, dark gradient, minimal type */}
      <section
        className="relative flex min-h-[600px] items-center justify-center bg-asphalt bg-cover bg-center px-6 pb-32 pt-28 text-center sm:min-h-[660px]"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.6) 55%, rgba(15,23,42,0.88) 100%), url(${HERO_IMAGE})` }}
      >
        <div className="relative z-10 mx-auto max-w-2xl animate-[fade-up_0.6s_ease-out]">
          <span className="inline-block rounded-full border border-white/20 px-4 py-1.5 font-body text-[11px] font-semibold uppercase tracking-wider text-white/80">
            Nigeria's intercity network
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Travel across Nigeria with confidence.
          </h1>
          <p className="mx-auto mt-5 max-w-lg font-body text-base leading-relaxed text-white/75">
            Search a route, pick your schedule, and hold your seat across
            Nigeria's terminals — simple, secure, and precise.
          </p>

          <div className="mt-9 flex justify-center">
            <Button
              size="lg"
              onClick={() =>
                document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Search a route
            </Button>
          </div>

          <p className="mt-10 font-body text-xs tracking-wide text-white/45">
            40+ terminals&nbsp; · &nbsp;12,000+ tickets issued&nbsp; · &nbsp;4.8 average rating
          </p>
        </div>
      </section>

      {/* Search widget — clean card, gently overlapping the hero seam */}
      <section className="px-6">
        <form
          onSubmit={handleSubmit}
          className="relative z-10 mx-auto -mt-16 flex w-full max-w-5xl flex-col gap-5 rounded-2xl bg-white p-6 text-left shadow-2xl shadow-asphalt/[0.12] sm:p-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:gap-3">
            <label className="block lg:flex-[1.2]">
              <span className="mb-1.5 flex items-center gap-1.5 font-body text-[13px] font-semibold text-slate">
                <MapPin size={13} className="text-danfo" /> Origin
              </span>
              <select
                required
                value={form.departure_location_id}
                onChange={(e) =>
                  setForm({ ...form, departure_location_id: e.target.value })
                }
                className="w-full cursor-pointer rounded-xl border border-asphalt/12 bg-white px-4 py-3 text-sm text-asphalt transition-colors focus:border-danfo focus:outline-none focus:ring-4 focus:ring-danfo/10"
              >
                <option value="">e.g., Lagos</option>
                {locations.map((loc) => (
                  <option
                    key={loc.id}
                    value={loc.id}
                    disabled={String(loc.id) === form.arrival_location_id}
                  >
                    {loc.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={swapLocations}
              aria-label="Swap origin and destination"
              className="mx-auto flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-paper-dim text-slate transition-all hover:rotate-180 hover:bg-danfo/10 hover:text-danfo lg:mx-0 lg:mb-[13px]"
            >
              <ArrowLeftRight size={15} />
            </button>

            <label className="block lg:flex-[1.2]">
              <span className="mb-1.5 flex items-center gap-1.5 font-body text-[13px] font-semibold text-slate">
                <MapPin size={13} className="text-danfo" /> Destination
              </span>
              <select
                required
                value={form.arrival_location_id}
                onChange={(e) =>
                  setForm({ ...form, arrival_location_id: e.target.value })
                }
                className="w-full cursor-pointer rounded-xl border border-asphalt/12 bg-white px-4 py-3 text-sm text-asphalt transition-colors focus:border-danfo focus:outline-none focus:ring-4 focus:ring-danfo/10"
              >
                <option value="">e.g., Abuja</option>
                {locations.map((loc) => (
                  <option
                    key={loc.id}
                    value={loc.id}
                    disabled={String(loc.id) === form.departure_location_id}
                  >
                    {loc.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block lg:flex-1">
              <span className="mb-1.5 flex items-center gap-1.5 font-body text-[13px] font-semibold text-slate">
                <Calendar size={13} className="text-danfo" /> Departure Date
              </span>
              <input
                required
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={form.departure_date}
                onChange={(e) => setForm({ ...form, departure_date: e.target.value })}
                className="w-full cursor-pointer rounded-xl border border-asphalt/12 bg-white px-4 py-3 text-sm text-asphalt transition-colors focus:border-danfo focus:outline-none focus:ring-4 focus:ring-danfo/10"
              />
            </label>

            <label className="block lg:flex-1">
              <span className="mb-1.5 flex items-center gap-1.5 font-body text-[13px] font-semibold text-slate">
                <Users size={13} className="text-danfo" /> Passengers
              </span>
              <select
                value={form.passenger_count}
                onChange={(e) => setForm({ ...form, passenger_count: e.target.value })}
                className="w-full cursor-pointer rounded-xl border border-asphalt/12 bg-white px-4 py-3 text-sm text-asphalt transition-colors focus:border-danfo focus:outline-none focus:ring-4 focus:ring-danfo/10"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} Passenger{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </label>

            <Button type="submit" size="lg" className="w-full lg:w-auto">
              Search
            </Button>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-asphalt/8 pt-5 sm:flex-row sm:items-center sm:gap-3">
            <span className="font-body text-[13px] font-semibold text-slate">
              Booking type
            </span>
            <div className="flex gap-2">
              {[
                { value: 'individual', label: 'Individual' },
                { value: 'private', label: 'Private vehicle' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, booking_type: opt.value })}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    form.booking_type === opt.value
                      ? 'border-danfo bg-danfo/8 text-danfo'
                      : 'border-asphalt/12 text-slate hover:border-asphalt/25'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {formError && <p className="font-body text-sm text-alert">{formError}</p>}
          {loadError && <p className="font-body text-sm text-alert">{loadError}</p>}
        </form>
      </section>

      {/* Trust pillars — one accent color throughout, distinguished by icon only */}
      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {[
            {
              Icon: Armchair,
              title: 'Real-time seat selection',
              copy: 'Choose your preferred seat directly from our live seat map — no surprises, just your choice.',
            },
            {
              Icon: ShieldCheck,
              title: 'Secure payments',
              copy: 'Bank-grade encryption on every transaction, powered by Paystack, with total peace of mind.',
            },
            {
              Icon: Ticket,
              title: 'Digital tickets',
              copy: 'Go paperless. Access your ticket instantly on your phone — print, save, or share it.',
            },
          ].map(({ Icon, title, copy }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div className="flex h-full flex-col items-start rounded-2xl bg-white p-7 shadow-sm shadow-asphalt/[0.04] transition-shadow duration-300 hover:shadow-lg hover:shadow-asphalt/[0.06]">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-danfo/8">
                  <Icon className="text-danfo" size={20} strokeWidth={2} />
                </div>
                <h3 className="font-display text-base font-bold text-asphalt">{title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-slate">{copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Signature ticket preview */}
      <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-24">
        <Reveal>
          <div className="inline-block rounded-full bg-danfo/8 px-3 py-1 font-body text-xs font-bold text-danfo">
            Why TashaXpress
          </div>
          <h2 className="mt-6 max-w-lg font-display text-3xl font-bold text-asphalt">
            What you'll hold, the moment you pay.
          </h2>
          <p className="mt-3 max-w-md font-body text-sm text-slate">
            Every confirmed booking becomes a ticket like this — seat, route,
            and reference, ready to show at the terminal.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <div className="mt-8">
            <TicketCard
              reference="TXP-BK-DEMO0001"
              from="Kano"
              to="Abuja"
              date="2026-07-10"
              time="07:00 AM"
              passengerName="Sample Passenger"
              seatNumber="12A"
              status="confirmed"
            />
          </div>
        </Reveal>
      </section>

      {/* CTA band */}
      <section className="mx-6 mb-6 rounded-2xl bg-asphalt px-6 py-16 text-center sm:mx-10 sm:py-20">
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          Ready for your next trip?
        </h2>
        <p className="mx-auto mt-3 max-w-md font-body text-sm text-white/60">
          Search a route above and hold your seat in under two minutes.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            variant="primary"
            onClick={() =>
              document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Book a Trip Now
          </Button>
        </div>
      </section>
    </div>
  );
}
