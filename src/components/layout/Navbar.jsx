import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, Menu, Ticket, UserRound, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Signed in: "My bookings" (account dashboard). Guests: "Manage booking"
// (find a booking by reference + email).
const linksFor = (isAuthed) => [
  { to: '/', label: 'Book a trip', end: true },
  isAuthed
    ? { to: '/dashboard/bookings', label: 'My bookings' }
    : { to: '/manage-booking', label: 'Manage booking' },
];

/**
 * Floating pill navigation.
 * - Over the homepage hero it is frosted glass with white text.
 * - Once you scroll (or on any other page) it turns solid white.
 * - The active link is marked with a pink dot under it.
 * - On phones the pill holds the logo and a pink menu button; the menu
 *   opens as a card under the pill with large tap targets.
 */
export default function Navbar() {
  const { isAuthed, user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the phone menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  // The profile API returns first_name/last_name separately.
  const firstName = user?.first_name || user?.email?.split('@')[0];

  const LINKS = linksFor(isAuthed);
  const isHome = pathname === '/';
  const light = isHome && !scrolled && !menuOpen;

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setMenuOpen(false);
      navigate('/', { replace: true });
    }
  };

  const linkClass = ({ isActive }) =>
    `relative px-1 py-2 text-[15px] font-semibold transition-colors duration-200 ${
      light ? (isActive ? 'text-white' : 'text-white/75 hover:text-white') : isActive ? 'text-asphalt' : 'text-slate hover:text-asphalt'
    }`;

  return (
    <header
      className={`${isHome ? 'fixed inset-x-0' : 'sticky'} top-0 z-30 px-3 pt-3 sm:px-6 sm:pt-4 print:hidden`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full py-2 pl-5 pr-2 transition-[background-color,box-shadow,padding] duration-300 ease-(--ease-out) sm:pl-6 ${
          light
            ? 'bg-white/10 ring-1 ring-white/25 backdrop-blur-md'
            : 'bg-white/95 shadow-[0_10px_30px_-12px_rgba(10,31,60,0.35)] ring-1 ring-asphalt/8 backdrop-blur-md'
        } ${scrolled ? 'sm:py-1.5' : 'sm:py-2.5'}`}
      >
        <Link to="/" aria-label="TASHA home" className="shrink-0">
          <img
            src={light ? '/logo-wordmark-light.svg' : '/logo-wordmark.svg'}
            alt="TASHA Nigeria Limited"
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {({ isActive }) => (
                <>
                  {l.label}
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-rose transition-[opacity,transform] duration-300 ease-(--ease-out) ${
                      isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <>
              <Link
                to="/profile"
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                  light ? 'text-white hover:bg-white/10' : 'text-asphalt hover:bg-asphalt/5'
                }`}
              >
                <UserRound size="1.1em" aria-hidden="true" /> {firstName}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                  light ? 'text-white/85 hover:bg-white/10' : 'text-slate hover:bg-asphalt/5'
                }`}
              >
                {loggingOut ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <LogOut size="1.1em" aria-hidden="true" />
                )}
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                  light ? 'text-white hover:bg-white/10' : 'text-asphalt hover:bg-asphalt/5'
                }`}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="group inline-flex items-center gap-1.5 rounded-full bg-rose px-5 py-2.5 text-sm font-bold text-white transition-[background-color,transform] duration-200 ease-(--ease-out) hover:-translate-y-px hover:bg-rose-dark"
              >
                Create account
                <ArrowRight size="1.05em" className="transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>

        {/* Phone: one pink button opens the menu card */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-rose text-white transition-transform duration-200 active:scale-95 md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="mx-auto mt-2 max-w-6xl animate-[fade-up_0.3s_var(--ease-out)_both] rounded-3xl bg-white p-3 shadow-[0_20px_40px_-16px_rgba(10,31,60,0.4)] ring-1 ring-asphalt/8 md:hidden"
        >
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-semibold ${
                  isActive ? 'bg-rose-soft text-rose' : 'text-asphalt hover:bg-paper-dim'
                }`
              }
            >
              {l.label}
              {l.to !== '/' ? <Ticket size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
            </NavLink>
          ))}

          <div className="mt-2 border-t border-asphalt/8 pt-3">
            {isAuthed ? (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/profile" className="flex items-center justify-center gap-2 rounded-full bg-paper-dim py-3 text-sm font-semibold text-asphalt">
                  <UserRound size={16} aria-hidden="true" /> {firstName || 'Profile'}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-asphalt/15 py-3 text-sm font-semibold text-asphalt disabled:opacity-60"
                >
                  <LogOut size={16} aria-hidden="true" /> Log out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" className="flex items-center justify-center rounded-full border border-asphalt/15 py-3 text-sm font-semibold text-asphalt">
                  Sign in
                </Link>
                <Link to="/register" className="flex items-center justify-center rounded-full bg-rose py-3 text-sm font-bold text-white">
                  Create account
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
