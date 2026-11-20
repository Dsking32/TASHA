import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchTrips } from '../api/trips';
import { ArrowRight, Armchair, Bus, CalendarDays, Flag, MapPin, Pencil, Users } from 'lucide-react';
import Reveal from '../components/ui/Reveal';
import { img, PHOTOS } from '../constants/images';
import { formatDuration, nearText } from '../utils/places';

const BOOKING_TYPE_LABEL = {
  individual: 'Seats on a shared bus',
  private: 'Whole bus hire',
};

const naira = (v) => `₦${Number(v).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

function formatDay(dateStr) {
  if (!dateStr) return '';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function SearchResults() {
  const [params] = useSearchParams();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const query = useMemo(
    () => ({
      departure_location_id: params.get('departure_location_id'),
      arrival_location_id: params.get('arrival_location_id'),
      departure_date: params.get('departure_date'),
      booking_type: params.get('booking_type') || 'individual',
      passenger_count: Number(params.get('passenger_count')) || 1,
    }),
    [params]
  );

  useEffect(() => {
    if (!query.departure_location_id || !query.arrival_location_id || !query.departure_date) {
      setLoading(false);
      setError('Some search details are missing. Go back and search again.');
      return;
    }

    setLoading(true);
    setError('');

    searchTrips(query)
      .then((res) => setSchedules(res.data?.schedules || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [query]);

  const isPrivate = query.booking_type === 'private';
  const first = schedules[0];
  const routeTitle =
    first?.departure?.location?.name && first?.arrival?.location?.name
      ? `${first.departure.location.name} to ${first.arrival.location.name}`
      : 'Available buses';

  return (
    <div className="px-3 pb-6 pt-4 sm:px-6">
      {/* Summary band */}
      <section className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-asphalt px-6 py-10 text-white sm:px-10">
        <img src={img(PHOTOS.hero, 1600, 500)} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-asphalt via-asphalt/85 to-asphalt/40" aria-hidden="true" />
        <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-rose">
          <span className="h-2 w-2 rounded-full bg-rose" aria-hidden="true" /> {BOOKING_TYPE_LABEL[query.booking_type]}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl">{routeTitle}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 ring-1 ring-white/20">
            <CalendarDays size="1.05em" aria-hidden="true" /> {formatDay(query.departure_date)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 ring-1 ring-white/20">
            <Users size="1.05em" aria-hidden="true" /> {query.passenger_count} passenger{query.passenger_count > 1 ? 's' : ''}
          </span>
          <Link to="/#search" className="inline-flex items-center gap-1.5 rounded-full bg-rose px-3.5 py-1.5 text-white transition-colors hover:bg-rose-dark">
            <Pencil size="1em" aria-hidden="true" /> Change search
          </Link>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-6xl" aria-live="polite" aria-busy={loading}>
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-white p-6 ring-1 ring-asphalt/8" aria-hidden="true">
                <div className="skeleton h-6 w-1/3 rounded-lg" />
                <div className="skeleton mt-4 h-4 w-1/2 rounded-lg" />
                <div className="skeleton mt-6 h-10 w-40 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div role="alert" className="rounded-3xl bg-alert-soft p-6 text-[15px] font-semibold text-alert">
            {error}
          </div>
        )}

        {!loading && !error && schedules.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-asphalt/15 bg-white p-10 text-center">
            <Bus size={36} className="mx-auto text-sky" aria-hidden="true" />
            <p className="mt-4 font-display text-2xl font-bold text-asphalt">No buses with enough seats</p>
            <p className="mt-2 text-[15px] text-slate">Try another date, or fewer passengers.</p>
            <Link
              to="/#search"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-bold text-white hover:bg-rose-dark"
            >
              Change search <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}

        <ul className="space-y-4">
          {schedules.map((s, i) => {
            const price = isPrivate ? s.fare?.private_vehicle : s.fare?.adult;
            const href = isPrivate ? `/book-private/${s.id}?${params.toString()}` : `/book/${s.id}?${params.toString()}`;
            return (
              <Reveal as="li" key={s.id} delay={i * 60}>
                <article className="grid overflow-hidden rounded-3xl bg-white ring-1 ring-asphalt/8 transition-shadow duration-300 ease-(--ease-out) hover:shadow-[0_24px_50px_-30px_rgba(10,31,60,0.5)] md:grid-cols-[1fr_auto]">
                  <div className="p-6">
                    {/* Times */}
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-display text-3xl font-bold tabular-nums text-asphalt">{s.departure?.time?.slice(0, 5)}</p>
                        <p className="text-sm font-semibold text-slate">{s.departure?.location?.name}</p>
                      </div>
                      <div className="flex flex-1 flex-col items-center gap-1 px-2">
                        <span className="text-xs font-bold text-slate">{formatDuration(s.duration_mins)}</span>
                        <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="h-2 w-full text-rose" aria-hidden="true">
                          <line x1="4" y1="4" x2="96" y2="4" stroke="currentColor" strokeWidth="2" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" />
                          <circle cx="4" cy="4" r="3" fill="currentColor" />
                          <circle cx="96" cy="4" r="3" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-3xl font-bold tabular-nums text-asphalt">{s.arrival?.time?.slice(0, 5)}</p>
                        <p className="text-sm font-semibold text-slate">{s.arrival?.location?.name}</p>
                      </div>
                    </div>

                    {/* Terminals */}
                    <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="flex gap-2.5">
                        <MapPin size={16} className="mt-0.5 shrink-0 text-danfo" aria-hidden="true" />
                        <div>
                          <dt className="font-bold text-asphalt">Board at {s.departure?.terminal?.name}</dt>
                          {(s.departure?.terminal?.address || s.departure?.terminal?.landmark) && (
                            <dd className="text-slate">
                              {s.departure.terminal.address}
                              {s.departure.terminal.landmark && ` (${nearText(s.departure.terminal.landmark)})`}
                            </dd>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2.5">
                        <Flag size={16} className="mt-0.5 shrink-0 text-danfo" aria-hidden="true" />
                        <div>
                          <dt className="font-bold text-asphalt">Arrive at {s.arrival?.terminal?.name}</dt>
                          {(s.arrival?.terminal?.address || s.arrival?.terminal?.landmark) && (
                            <dd className="text-slate">
                              {s.arrival.terminal.address}
                              {s.arrival.terminal.landmark && ` (${nearText(s.arrival.terminal.landmark)})`}
                            </dd>
                          )}
                        </div>
                      </div>
                    </dl>

                    <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
                      {s.vehicle && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-soft px-3 py-1.5 text-danfo">
                          <Bus size="1.1em" aria-hidden="true" /> {s.vehicle.make} {s.vehicle.model}
                        </span>
                      )}
                      {!isPrivate && (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
                            s.available_seats <= 3 ? 'bg-rose-soft text-rose' : 'bg-paper-dim text-asphalt'
                          }`}
                        >
                          <Armchair size="1.1em" aria-hidden="true" /> {s.available_seats} {s.available_seats === 1 ? 'seat' : 'seats'} left
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price + action, styled like a ticket stub */}
                  <div className="flex items-center justify-between gap-4 border-t-2 border-dashed border-asphalt/10 bg-paper-dim p-6 md:min-w-60 md:flex-col md:items-stretch md:justify-center md:border-l-2 md:border-t-0">
                    {price && (
                      <div className="md:text-center">
                        <p className="font-display text-3xl font-bold tabular-nums text-asphalt">{naira(price)}</p>
                        <p className="text-xs font-semibold text-slate">{isPrivate ? 'whole vehicle' : 'per adult'}</p>
                      </div>
                    )}
                    <Link
                      to={href}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-rose px-6 py-3.5 text-sm font-bold text-white transition-[background-color,transform] duration-200 ease-(--ease-out) hover:-translate-y-px hover:bg-rose-dark"
                    >
                      {isPrivate ? 'Hire this bus' : 'Book seats'} <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
