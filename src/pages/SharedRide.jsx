import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedRide } from '../api/trips';

export default function SharedRide() {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSharedRide(token)
      .then((res) => {
        if (res.success === false) {
          setError(res.message || 'This share link is no longer valid.');
          return;
        }
        setTrip(res.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center font-mono text-sm text-slate">
        Loading ride details…
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center font-mono text-sm text-alert">
        {error || 'This share link is no longer valid.'}
      </div>
    );
  }

  const { route = {}, schedule = {}, vehicle, driver, passengers } = trip;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-danfo">
        Shared ride · {trip.booking_ref}
      </span>
      <h1 className="mt-2 flex items-center gap-2 font-display text-3xl font-bold leading-none text-asphalt sm:text-4xl">
        <span>{route.from || '—'}</span>
        <span className="text-danfo">→</span>
        <span>{route.to || '—'}</span>
      </h1>
      <p className="mt-1 font-mono text-xs text-slate">
        {schedule.departure_date} · {schedule.departure_time?.slice(0, 5)} –{' '}
        {schedule.arrival_time?.slice(0, 5)}
        {route.estimated_duration && ` · ${route.estimated_duration}`}
      </p>

      <div className="mt-6 space-y-4 rounded-3xl bg-white p-5 ring-1 ring-asphalt/8">
        <div className="font-mono text-xs text-slate">
          <div className="uppercase tracking-wider text-slate/60">Boarding</div>
          <div className="text-asphalt">{route.boarding_terminal}</div>
          {route.boarding_address}
        </div>
        <div className="font-mono text-xs text-slate">
          <div className="uppercase tracking-wider text-slate/60">Drop-off</div>
          <div className="text-asphalt">{route.dropoff_terminal}</div>
          {route.dropoff_address}
        </div>
      </div>

      <div className="mt-4 rounded-3xl bg-white p-5 ring-1 ring-asphalt/8">
        <h2 className="font-display text-sm font-semibold text-asphalt">Driver & vehicle</h2>
        <div className="mt-3 flex items-center gap-3">
          {driver?.profile_photo ? (
            <img
              src={driver.profile_photo}
              alt={driver.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-asphalt/10 font-display text-sm font-semibold text-asphalt">
              {driver?.name?.[0] || '?'}
            </div>
          )}
          <div className="font-mono text-xs text-slate">
            <div className="text-asphalt">{driver?.name}</div>
            <div>
              {[vehicle?.color, vehicle?.make, vehicle?.model].filter(Boolean).join(' ')}
              {vehicle?.registration_number && ` · ${vehicle.registration_number}`}
            </div>
          </div>
        </div>
      </div>

      {passengers?.manifest?.length > 0 && (
        <div className="mt-4 rounded-3xl bg-white p-5 ring-1 ring-asphalt/8">
          <h2 className="font-display text-sm font-semibold text-asphalt">
            Travelling ({passengers.count})
          </h2>
          <ul className="mt-2 space-y-1 font-mono text-xs text-slate">
            {passengers.manifest.map((p, i) => (
              <li key={i}>
                {p.name} <span className="text-slate/50">· {p.passenger_category}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 text-center font-mono text-[11px] text-slate/60">
        Payment details, contact info, and seat numbers are kept private on
        shared ride links.
      </p>
    </div>
  );
}
