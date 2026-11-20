import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCw } from 'lucide-react';
import { fetchAllTrips } from '../../api/trips';
import Reveal from '../ui/Reveal';

const naira = (v) => `₦${Number(v).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

function formatDay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });
}

function searchLink(s) {
  const params = new URLSearchParams({
    departure_location_id: s.departure?.location?.id ?? '',
    arrival_location_id: s.arrival?.location?.id ?? '',
    departure_date: s.departure?.date ?? '',
    booking_type: 'individual',
    passenger_count: 1,
  });
  return `/search?${params}`;
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-asphalt/8" aria-hidden="true">
      <div className="skeleton h-4 w-2/3 rounded-lg" />
      <div className="skeleton mt-3 h-3 w-1/2 rounded-lg" />
      <div className="mt-6 flex justify-between">
        <div className="skeleton h-5 w-20 rounded-lg" />
        <div className="skeleton h-5 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export default function UpcomingDepartures() {
  const [schedules, setSchedules] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  const load = useCallback(() => {
    setStatus('loading');
    fetchAllTrips({ per_page: 6, booking_type: 'individual' })
      .then((res) => {
        setSchedules(res.data?.schedules || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(load, [load]);

  return (
    <section className="bg-paper-dim px-6 py-16 sm:py-20" aria-labelledby="departures-heading">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-rose">Live from the schedule</p>
            <h2 id="departures-heading" className="mt-2 font-display text-4xl font-bold leading-tight text-asphalt sm:text-5xl">
              Upcoming departures
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate">
              Buses with seats still available. Tap one to see times and book.
            </p>
          </div>
        </div>

        <div className="mt-8" aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'loading' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-asphalt/10 bg-white p-6">
              <p className="text-[15px] text-asphalt">We couldn't load upcoming departures.</p>
              <button
                type="button"
                onClick={load}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-danfo hover:text-danfo-dark"
              >
                <RotateCw size="1em" aria-hidden="true" /> Try again
              </button>
            </div>
          )}

          {status === 'ready' && schedules.length === 0 && (
            <div className="rounded-2xl border border-dashed border-asphalt/20 bg-white p-6">
              <p className="text-[15px] text-asphalt">No departures are open for booking right now.</p>
              <p className="mt-1 text-sm text-slate">
                New schedules are added regularly. Search your route above to check a specific date.
              </p>
            </div>
          )}

          {status === 'ready' && schedules.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {schedules.map((s, i) => (
                <Reveal as="li" key={s.id} delay={i * 60}>
                  <Link
                    to={searchLink(s)}
                    className="group relative block h-full overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-asphalt/8 transition-[transform,box-shadow] duration-300 ease-(--ease-out) hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(10,31,60,0.35)]"
                  >
                    <span className="absolute inset-y-0 left-0 w-1.5 bg-rose transition-[width] duration-300 ease-(--ease-out) group-hover:w-2.5" aria-hidden="true" />
                    <div className="flex items-center gap-2 font-display text-xl font-bold text-asphalt">
                      <span className="truncate">{s.departure?.location?.name}</span>
                      <ArrowRight
                        size="1em"
                        className="shrink-0 text-sky transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                      <span className="truncate">{s.arrival?.location?.name}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate">
                      {formatDay(s.departure?.date)} · {s.departure?.time?.slice(0, 5)}
                      {s.departure?.terminal?.name && ` · ${s.departure.terminal.name}`}
                    </p>
                    <div className="mt-5 flex items-baseline justify-between">
                      {s.fare?.adult ? (
                        <span className="font-mono text-2xl font-semibold text-asphalt">
                          {naira(s.fare.adult)}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          s.available_seats <= 3 ? 'text-rose' : 'text-slate'
                        }`}
                      >
                        {s.available_seats} {s.available_seats === 1 ? 'seat' : 'seats'} left
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
