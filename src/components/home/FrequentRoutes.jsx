import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock } from 'lucide-react';
import { getLocations } from '../../api/trips';
import { img, PHOTOS } from '../../constants/images';
import { formatDuration, localDate } from '../../utils/places';
import Reveal from '../ui/Reveal';
import Scribble from '../ui/Scribble';

// Matches the routes the backend runs (database/seeders/RouteSeeder.php).
// IDs are resolved from /trips/locations at runtime, by city name.
const ROUTES = [
  { from: 'Kano', to: 'Abuja', mins: 420, photo: PHOTOS.abujaMosque },
  { from: 'Abuja', to: 'Lagos', mins: 780, photo: PHOTOS.lagosBridge },
  { from: 'Kaduna', to: 'Abuja', mins: 210, photo: PHOTOS.abujaFlags },
  { from: 'Katsina', to: 'Kano', mins: 120, photo: PHOTOS.durbar },
  { from: 'Maiduguri', to: 'Bauchi', mins: 360, photo: PHOTOS.northernAttire },
];

function routeHref(route, byName) {
  const from = byName[route.from];
  const to = byName[route.to];
  if (!from || !to) return null;
  return `/search?${new URLSearchParams({
    departure_location_id: from.id,
    arrival_location_id: to.id,
    departure_date: localDate(0),
    booking_type: 'individual',
    passenger_count: 1,
  })}`;
}

function RouteCard({ route, href, large }) {
  const body = (
    <>
      <img
        src={img(route.photo, large ? 900 : 600)}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-(--ease-out) group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/40 to-transparent" aria-hidden="true" />

      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-asphalt backdrop-blur">
        <Clock size="1em" aria-hidden="true" /> About {formatDuration(route.mins)}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-center gap-2 text-white">
          <span className={`font-display font-bold ${large ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>{route.from}</span>
          <svg viewBox="0 0 60 8" className="h-2 w-10 shrink-0 text-rose sm:w-14" aria-hidden="true">
            <line x1="2" y1="4" x2="58" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 7" className="[animation:route-travel_1.2s_linear_infinite]" />
            <circle cx="56" cy="4" r="3.5" fill="currentColor" />
          </svg>
          <span className={`font-display font-bold ${large ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>{route.to}</span>
        </div>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-rose px-4 py-2 text-sm font-bold text-white transition-[gap,background-color] duration-300 ease-(--ease-out) group-hover:gap-2.5 group-hover:bg-rose-dark">
          {href ? 'See buses today' : 'Search this route'}
          <ArrowUpRight size="1.1em" aria-hidden="true" />
        </span>
      </div>
    </>
  );

  const className = `group relative block h-full min-h-[240px] overflow-hidden rounded-3xl bg-asphalt ${large ? 'sm:min-h-[500px]' : ''}`;

  return href ? (
    <Link to={href} className={className} aria-label={`${route.from} to ${route.to}, see buses today`}>
      {body}
    </Link>
  ) : (
    <a href="#search" className={className}>
      {body}
    </a>
  );
}

export default function FrequentRoutes() {
  const [byName, setByName] = useState({});

  useEffect(() => {
    getLocations()
      .then((res) => {
        const map = {};
        (res.data?.locations || []).forEach((l) => {
          map[l.name] = l;
        });
        setByName(map);
      })
      // Without IDs the cards fall back to scrolling up to the search form.
      .catch(() => setByName({}));
  }, []);

  return (
    <section className="px-6 py-20 sm:py-24" aria-labelledby="routes-heading">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-rose">Frequent routes</p>
            <h2 id="routes-heading" className="mt-2 max-w-xl font-display text-4xl font-bold leading-tight text-asphalt sm:text-5xl">
              Where Nigeria is <Scribble variant="underline" delay={300}>travelling</Scribble> this week
            </h2>
          </div>
          <p className="max-w-xs text-[15px] leading-relaxed text-slate">
            Tap a route to see today's buses, times and seats left.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr]">
          {ROUTES.map((route, i) => (
            <Reveal
              key={`${route.from}-${route.to}`}
              delay={i * 70}
              className={i === 0 ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2' : 'lg:[&>a]:min-h-[242px]'}
            >
              <RouteCard route={route} href={routeHref(route, byName)} large={i === 0} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
