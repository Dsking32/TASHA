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
      <RouteLine className="h-6 w-full text-sky" />

      <div className="mx-auto max-w-6xl px-6 pb-10 pt-4">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" aria-label="TASHA home" className="inline-block">
              <img src="/logo-wordmark-light.svg" alt="TASHA Nigeria Limited" className="h-9 w-auto" />
            </Link>
            <p className="mt-4 max-w-sm font-body text-sm text-paper/70">
              Intercity bus tickets across Nigeria. Choose your route, pay
              online, and show your ticket at the terminal.
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
                <Link to="/" className="transition-colors hover:text-sky">
                  Search a route
                </Link>
              </li>
              <li>
                <Link
                  to={isAuthed ? '/dashboard/bookings' : '/manage-booking'}
                  className="transition-colors hover:text-sky"
                >
                  {isAuthed ? 'My bookings' : 'Manage booking'}
                </Link>
              </li>
              <li>
                <Link
                  to={isAuthed ? '/profile' : '/register'}
                  className="transition-colors hover:text-sky"
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
                  className="inline-flex items-center gap-2 break-all transition-colors hover:text-sky"
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
          <span className="font-mono">© {year} Tasha Nigeria Limited. All rights reserved.</span>
                  </div>
      </div>
    </footer>
  );
}
