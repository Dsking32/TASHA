import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocations } from '../api/trips';
import Button from '../components/ui/Button';
import TicketCard from '../components/ui/TicketCard';

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
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative flex flex-col items-center px-6 pb-12 pt-20 text-center">
        {/* soft decorative blobs */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-[140%] rounded-full bg-danfo/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 left-1/2 h-72 w-72 translate-x-[60%] rounded-full bg-premium/10 blur-3xl" />

        <h1 className="relative max-w-3xl font-display text-4xl font-bold tracking-tight text-asphalt sm:text-5xl">
          Travel across Nigeria with confidence.
        </h1>
        <p className="relative mt-5 max-w-xl font-body text-base text-slate">
          Premium intercity bus booking made simple, secure, and precise —
          search a route, pick your schedule, and hold your seat across
          Nigeria's terminals.
        </p>

        {/* Search widget */}
        <form
          onSubmit={handleSubmit}
          className="relative mt-10 grid w-full max-w-5xl gap-6 rounded-[32px] border-2 border-asphalt/8 bg-white p-8 text-left shadow-lg shadow-asphalt/5 md:grid-cols-4"
        >
          <label className="block">
            <span className="mb-1.5 block font-body text-[13px] font-semibold text-slate">
              Origin
            </span>
            <select
              required
              value={form.departure_location_id}
              onChange={(e) =>
                setForm({ ...form, departure_location_id: e.target.value })
              }
              className="w-full rounded-2xl border-2 border-asphalt/10 bg-white px-4 py-3 text-sm focus:border-danfo focus:outline-none focus:ring-4 focus:ring-danfo/10"
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

          <label className="block">
            <span className="mb-1.5 block font-body text-[13px] font-semibold text-slate">
              Destination
            </span>
            <select
              required
              value={form.arrival_location_id}
              onChange={(e) =>
                setForm({ ...form, arrival_location_id: e.target.value })
              }
              className="w-full rounded-2xl border-2 border-asphalt/10 bg-white px-4 py-3 text-sm focus:border-danfo focus:outline-none focus:ring-4 focus:ring-danfo/10"
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

          <label className="block">
            <span className="mb-1.5 block font-body text-[13px] font-semibold text-slate">
              Departure Date
            </span>
            <input
              required
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={form.departure_date}
              onChange={(e) => setForm({ ...form, departure_date: e.target.value })}
              className="w-full rounded-2xl border-2 border-asphalt/10 bg-white px-4 py-3 text-sm focus:border-danfo focus:outline-none focus:ring-4 focus:ring-danfo/10"
            />
          </label>

          <div className="flex flex-col">
            <span className="mb-1.5 block font-body text-[13px] font-semibold text-slate">
              Passengers
            </span>
            <div className="flex h-full gap-2">
              <select
                value={form.passenger_count}
                onChange={(e) => setForm({ ...form, passenger_count: e.target.value })}
                className="w-full flex-1 rounded-2xl border-2 border-asphalt/10 bg-white px-4 py-3 text-sm focus:border-danfo focus:outline-none focus:ring-4 focus:ring-danfo/10"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} Passenger{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              <Button type="submit" className="px-5">
                Search
              </Button>
            </div>
          </div>

          <label className="block md:col-span-4">
            <span className="mb-1.5 block font-body text-[13px] font-semibold text-slate">
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
                  className={`cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                    form.booking_type === opt.value
                      ? 'border-danfo bg-danfo/10 text-danfo'
                      : 'border-asphalt/10 text-slate hover:border-asphalt/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </label>

          {formError && (
            <p className="font-body text-sm text-alert md:col-span-4">{formError}</p>
          )}
          {loadError && (
            <p className="font-body text-sm text-alert md:col-span-4">{loadError}</p>
          )}
        </form>
      </section>

      {/* Trust pillars */}
      <section className="bg-paper-dim px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-[28px] border-2 border-asphalt/8 bg-white p-8 text-center transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danfo/10 text-2xl">
              🪑
            </div>
            <h3 className="font-display text-lg font-bold text-asphalt">
              Real-time seat selection
            </h3>
            <p className="mt-3 font-body text-sm text-slate">
              Choose your preferred seat directly from our live seat map — no
              surprises, just your choice.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-[28px] border-2 border-asphalt/8 bg-white p-8 text-center transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-signal/10 text-2xl">
              🛡️
            </div>
            <h3 className="font-display text-lg font-bold text-asphalt">
              Secure payments
            </h3>
            <p className="mt-3 font-body text-sm text-slate">
              Bank-grade encryption on every transaction, powered by
              Paystack, with total peace of mind.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-[28px] border-2 border-asphalt/8 bg-white p-8 text-center transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-premium/10 text-2xl">
              🎫
            </div>
            <h3 className="font-display text-lg font-bold text-asphalt">
              Digital tickets
            </h3>
            <p className="mt-3 font-body text-sm text-slate">
              Go paperless. Access your ticket instantly on your phone —
              print, save, or share it.
            </p>
          </div>
        </div>
      </section>

      {/* Signature ticket preview */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="inline-block rounded-full bg-danfo/10 px-3 py-1 font-body text-xs font-bold text-danfo">
          Why TashaXpress
        </div>
        <h2 className="mt-6 max-w-lg font-display text-3xl font-bold text-asphalt">
          What you'll hold, the moment you pay.
        </h2>
        <p className="mt-3 max-w-md font-body text-sm text-slate">
          Every confirmed booking becomes a ticket like this — seat, route,
          and reference, ready to show at the terminal.
        </p>
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
      </section>

      {/* CTA band */}
      <section className="mx-6 mb-6 rounded-[40px] bg-danfo px-6 py-20 text-center sm:mx-10">
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          Ready for your next trip?
        </h2>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            variant="primary"
            className="!bg-white !text-danfo !shadow-none hover:!bg-white/90"
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
