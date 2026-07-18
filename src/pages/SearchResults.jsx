import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchTrips } from '../api/trips';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';

const BOOKING_TYPE_LABEL = {
  individual: 'Individual',
  private: 'Private vehicle',
};

function formatDuration(mins) {
  if (!mins && mins !== 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m ? ` ${m}m` : ''}`;
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
      setError('Missing search details — head back to the homepage and search again.');
      return;
    }

    setLoading(true);
    setError('');

    searchTrips(query)
      .then((res) => setSchedules(res.data?.schedules || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <PageHeader
        eyebrow="Search results"
        title="Pick a schedule"
        subtitle={
          <>
            {query.departure_date} · {query.passenger_count} passenger
            {query.passenger_count > 1 ? 's' : ''} · {BOOKING_TYPE_LABEL[query.booking_type]}
          </>
        }
      />

      {loading && <div className="mt-10 font-mono text-sm text-slate">Loading schedules…</div>}

      {!loading && error && (
        <div className="mt-10 rounded-[28px] bg-alert-soft p-5 font-mono text-sm text-alert">
          {error}
        </div>
      )}

      {!loading && !error && schedules.length === 0 && (
        <div className="mt-10 rounded-[28px] border border-dashed border-asphalt/20 p-8 text-center">
          <p className="font-mono text-sm text-slate">
            No schedules found with enough seats for this route and date.
          </p>
          <Link to="/" className="mt-4 inline-block font-mono text-xs text-asphalt underline">
            Try a different search
          </Link>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {schedules.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-4 rounded-2xl border border-asphalt/10 bg-paper p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2 font-display text-lg font-semibold text-asphalt">
                <span>{s.departure?.location?.name}</span>
                <span className="text-danfo">→</span>
                <span>{s.arrival?.location?.name}</span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-slate">
                <div>
                  {s.departure?.terminal?.name} → {s.arrival?.terminal?.name}
                </div>
                {(s.departure?.terminal?.address || s.departure?.terminal?.landmark) && (
                  <div className="mt-0.5 text-slate/70">
                    Board: {s.departure.terminal.address}
                    {s.departure.terminal.landmark && ` (near ${s.departure.terminal.landmark})`}
                  </div>
                )}
                {(s.arrival?.terminal?.address || s.arrival?.terminal?.landmark) && (
                  <div className="mt-0.5 text-slate/70">
                    Arrive: {s.arrival.terminal.address}
                    {s.arrival.terminal.landmark && ` (near ${s.arrival.terminal.landmark})`}
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-slate">
                <span>
                  {s.departure?.date} · {s.departure?.time?.slice(0, 5)} –{' '}
                  {s.arrival?.time?.slice(0, 5)}
                </span>
                {formatDuration(s.duration_mins) && <span>{formatDuration(s.duration_mins)}</span>}
                <span>{s.available_seats} seats left</span>
                {s.vehicle && (
                  <span>
                    {s.vehicle.make} {s.vehicle.model}
                  </span>
                )}
              </div>

              {s.fare?.adult && (
                <div className="mt-2 font-mono text-sm font-semibold text-asphalt">
                  ₦{Number(s.fare.adult).toLocaleString()}{' '}
                  <span className="font-normal text-slate">/ adult</span>
                </div>
              )}
            </div>

            <Link
              to={
                query.booking_type === 'private'
                  ? `/book-private/${s.id}?${params.toString()}`
                  : `/book/${s.id}?${params.toString()}`
              }
            >
              <Button className="w-full sm:w-auto">Book this trip</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
