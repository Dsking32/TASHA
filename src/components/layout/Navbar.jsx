import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 font-body text-sm font-semibold transition-colors ${
    isActive
      ? 'bg-danfo/10 text-danfo'
      : 'text-slate hover:bg-asphalt/5 hover:text-asphalt'
  }`;

const mobileNavLinkClass = ({ isActive }) =>
  `block py-3 font-body text-sm font-medium ${
    isActive ? 'text-danfo' : 'text-asphalt/80'
  }`;

export default function Navbar() {
  const { isAuthed, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // The profile API returns first_name/last_name separately — there's no
  // combined `name` field, so referencing user.name directly always
  // silently falls through to the email fallback below.
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email;

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      // Explicit redirect — don't rely on the user noticing the navbar
      // silently swapped to the logged-out state. This is the visible
      // confirmation that the action actually happened.
      navigate('/', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-asphalt/10 bg-paper print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-danfo">
          TashaXpress
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Search
          </NavLink>
          <NavLink to="/dashboard/bookings" className={navLinkClass}>
            My Bookings
          </NavLink>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {isAuthed ? (
            <>
              <Link to="/profile" className="font-body text-sm text-slate hover:text-danfo">
                {displayName}
              </Link>
              <Button variant="ghost" onClick={handleLogout} loading={loggingOut}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-body text-sm text-danfo hover:text-danfo-dark">
                Sign In
              </Link>
              <Link to="/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile nav */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="cursor-pointer text-asphalt md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-asphalt/10 px-6 pb-5 md:hidden">
          <NavLink to="/" end className={mobileNavLinkClass} onClick={closeMenu}>
            Search
          </NavLink>
          <NavLink to="/dashboard/bookings" className={mobileNavLinkClass} onClick={closeMenu}>
            My Bookings
          </NavLink>

          <div className="mt-3 border-t border-asphalt/10 pt-3">
            {isAuthed ? (
              <>
                <NavLink to="/profile" className={mobileNavLinkClass} onClick={closeMenu}>
                  {displayName || 'Profile'}
                </NavLink>
                <Button
                  variant="ghost"
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  loading={loggingOut}
                  className="mt-2 w-full"
                >
                  Log out
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <NavLink to="/login" className={mobileNavLinkClass} onClick={closeMenu}>
                  Sign In
                </NavLink>
                <Link to="/register" onClick={closeMenu}>
                  <Button variant="primary" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
