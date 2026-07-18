import { Link } from 'react-router-dom';
import { Mail, MapPinned } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RouteLine from '../ui/RouteLine';

export default function Footer() {
  const { isAuthed } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-asphalt text-paper print:hidden">
      {/* route line runs along the seam between the app and the footer */}
      <RouteLine className="h-6 w-full text-danfo" />

      <div className="mx-auto max-w-6xl px-6 pb-10 pt-4">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block font-display text-xl font-extrabold tracking-tight text-paper">
              Tasha<span className="text-danfo">Xpress</span>
            </Link>
            <p className="mt-4 max-w-sm font-body text-sm text-paper/70">
              Intercity bus booking for Nigeria — search a route, pick your
              seat, and hold a ticket that's ready the moment you pay.
            </p>
            <div className="mt-5 flex items-center gap-2 font-mono text-xs text-paper/50">
              <MapPinned size={14} />
              Terminals nationwide, one search away.
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-paper/90">
              Get around
            </h3>
            <ul className="mt-4 space-y-3 font-body text-sm text-paper/70">
              <li>
                <Link to="/" className="transition-colors hover:text-danfo">
                  Search a route
                </Link>
              </li>
              <li>
                <Link
                  to={isAuthed ? '/dashboard/bookings' : '/login'}
                  className="transition-colors hover:text-danfo"
                >
                  My bookings
                </Link>
              </li>
              <li>
                <Link
                  to={isAuthed ? '/profile' : '/register'}
                  className="transition-colors hover:text-danfo"
                >
                  {isAuthed ? 'Profile' : 'Create an account'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-paper/90">
              Support
            </h3>
            <ul className="mt-4 space-y-3 font-body text-sm text-paper/70">
              <li>
                <a
                  href="mailto:support@tashaxpress.com"
                  className="inline-flex items-center gap-2 transition-colors hover:text-danfo"
                >
                  <Mail size={14} />
                  support@tashaxpress.com
                </a>
              </li>
              <li className="font-mono text-xs text-paper/50">
                We reply within one business day.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-paper/10 pt-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono">© {year} TashaXpress. All rights reserved.</span>
          <span className="font-mono">Book your route. Hold your seat. Travel Nigeria.</span>
        </div>
      </div>
    </footer>
  );
}
