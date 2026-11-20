import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, LogIn, UserPlus, UserRound } from 'lucide-react';
import { guestCheckout } from '../../utils/guestBookings';

/**
 * Shown before the passenger form when nobody is signed in. Booking never
 * requires an account: guests continue straight away, and signing in brings
 * them back to this exact page (search details included).
 */
export default function CheckoutGate({ onGuest }) {
  const location = useLocation();
  const from = { pathname: location.pathname, search: location.search };

  const continueAsGuest = () => {
    guestCheckout.choose();
    onGuest();
  };

  return (
    <div className="mx-auto max-w-3xl px-3 pb-6 pt-4 sm:px-6">
      <div className="rounded-[32px] bg-white p-6 ring-1 ring-asphalt/8 shadow-[0_30px_80px_-40px_rgba(10,31,60,0.45)] sm:p-10">
        <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-rose">
          <span className="h-2 w-2 rounded-full bg-rose" aria-hidden="true" /> Almost there
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-asphalt">How do you want to book?</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate">
          You don't need an account to travel. Signing in just fills in your details and keeps your trips in one place.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={continueAsGuest}
            className="group flex cursor-pointer flex-col items-start rounded-3xl bg-rose p-6 text-left text-white transition-[background-color,transform] duration-200 ease-(--ease-out) hover:-translate-y-0.5 hover:bg-rose-dark"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
              <UserRound size={20} aria-hidden="true" />
            </span>
            <span className="mt-4 font-display text-2xl font-bold">Continue as guest</span>
            <span className="mt-1 text-[15px] text-white/85">
              Book with your name, phone and email. Keep your booking reference to find your trip again.
            </span>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold">
              Continue <ArrowRight size={16} className="transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </button>

          <div className="flex flex-col rounded-3xl bg-paper-dim p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-danfo">
              <LogIn size={20} aria-hidden="true" />
            </span>
            <span className="mt-4 font-display text-2xl font-bold text-asphalt">I have an account</span>
            <span className="mt-1 text-[15px] text-slate">Sign in and you'll come straight back here.</span>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/login"
                state={{ from }}
                className="inline-flex items-center gap-1.5 rounded-full bg-asphalt px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-asphalt-soft"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                state={{ from }}
                className="inline-flex items-center gap-1.5 rounded-full border border-asphalt/15 px-5 py-2.5 text-sm font-bold text-asphalt transition-colors hover:border-rose hover:text-rose"
              >
                <UserPlus size={15} aria-hidden="true" /> Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
