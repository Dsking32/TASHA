import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, Wallet, Ticket, Search, Plus, ChevronRight } from 'lucide-react';
import { getMyBookings } from '../api/trips';
import Button from '../components/ui/Button';
import { bookingStatusStyle, bookingStatusLabel } from '../constants/bookingStatus';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending_payment', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'payment_failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Confirmed — powers the dashboard tab UI, separate from booking status.
const PHASE_TABS = [
  { value: '', label: 'Any type' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'private', label: 'Private' },
];

function money(n) {
  const num = Number(n);
  return Number.isFinite(num) ? num.toLocaleString() : '0';
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('');
  const [phase, setPhase] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setPage(1);
    const params = {};
    if (status) params.status = status;
    if (phase) params.filter = phase;
    getMyBookings(params)
      .then((res) => {
        setBookings(res.data?.bookings || []);
        setHasMore(!!res.data?.pagination?.has_more);
        setTotalCount(res.data?.pagination?.total ?? res.data?.bookings?.length ?? 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status, phase]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    const params = { page: nextPage };
    if (status) params.status = status;
    if (phase) params.filter = phase;
    getMyBookings(params)
      .then((res) => {
        setBookings((prev) => [...prev, ...(res.data?.bookings || [])]);
        setHasMore(!!res.data?.pagination?.has_more);
        setTotalCount(res.data?.pagination?.total ?? totalCount);
        setPage(nextPage);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingMore(false));
  };

  // `total` comes straight from the API's pagination.total, so it's correct
  // even when only page 1 is loaded. `confirmed`/`totalSpent` can only be
  // computed from bookings we actually have in memory — there's no
  // dedicated stats endpoint — so they're accurate once everything is
  // loaded, but may undercount while more pages remain (see `hasMore`).
  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === 'confirmed');
    const totalSpent = confirmed.reduce((sum, b) => sum + Number(b.total_amount_payable || 0), 0);
    return {
      total: totalCount || bookings.length,
      confirmed: confirmed.length,
      totalSpent,
    };
  }, [bookings, totalCount]);

  const visibleBookings = useMemo(() => {
    // Server-side filtering (status param) may or may not be honored by
    // the backend — filter client-side too as a guarantee, using the
    // `status` field every booking object already carries. If the server
    // already filtered correctly this is a no-op; if it didn't, this is
    // what actually makes the tabs work.
    let list = status ? bookings.filter((b) => b.status === status) : bookings;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.reference?.toLowerCase().includes(q) ||
          b.schedule?.route?.from?.toLowerCase().includes(q) ||
          b.schedule?.route?.to?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [bookings, status, query]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-asphalt">My bookings</h1>
          <p className="mt-1 font-body text-sm text-slate">
            Every trip you've booked, in one place.
          </p>
        </div>
        <Link to="/">
          <Button className="gap-2">
            <Plus size={16} />
            New trip
          </Button>
        </Link>
      </div>

      {/* Stat summary */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-asphalt/8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-soft text-danfo">
            <Bus size={20} />
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-asphalt">{stats.total}</div>
            <div className="font-body text-xs text-slate">Total bookings</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-asphalt/8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-signal-soft text-signal">
            <Ticket size={20} />
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-asphalt">{stats.confirmed}</div>
            <div className="font-body text-xs text-slate">
              Confirmed{hasMore ? ' (loaded so far)' : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-asphalt/8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-soft text-rose">
            <Wallet size={20} />
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-asphalt">
              ₦{money(stats.totalSpent)}
            </div>
            <div className="font-body text-xs text-slate">
              Total spent (confirmed{hasMore ? ', loaded so far' : ''})
            </div>
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="mt-8 flex flex-col gap-4">
        <div className="relative max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by route or reference"
            className="w-full rounded-full border border-transparent bg-paper-dim py-2.5 pl-9 pr-4 text-sm font-medium text-asphalt focus:border-danfo focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-full bg-paper-dim p-1">
          {STATUS_TABS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`cursor-pointer rounded-md px-3 py-1.5 font-body text-xs font-medium transition-colors ${
                status === f.value
                  ? 'bg-danfo text-white'
                  : 'text-slate hover:bg-paper-dim hover:text-asphalt'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {PHASE_TABS.map((f) => (
            <button
              key={f.value}
              onClick={() => setPhase(f.value)}
              className={`cursor-pointer rounded-full border px-3 py-1 font-body text-xs font-medium transition-colors ${
                phase === f.value
                  ? 'border-premium/40 bg-premium-soft text-premium'
                  : 'border-asphalt/15 text-slate hover:border-asphalt/30'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="mt-10 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-3xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-10 rounded-3xl border border-alert/20 bg-alert-soft p-5 font-body text-sm text-alert">
          {error}
        </div>
      )}

      {!loading && !error && visibleBookings.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-asphalt/20 bg-white p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-dim text-slate">
            <Bus size={20} />
          </div>
          <p className="mt-4 font-body text-sm text-slate">
            {bookings.length === 0
              ? "No bookings yet — let's fix that."
              : 'No bookings match your current filters.'}
          </p>
          {bookings.length === 0 && (
            <Link to="/" className="mt-4">
              <Button variant="ghost">Search a trip</Button>
            </Link>
          )}
        </div>
      )}

      {/* Booking list */}
      <div className="mt-6 space-y-3">
        {visibleBookings.map((b) => {
          const quickAction =
            b.status === 'confirmed'
              ? { label: 'Print ticket', icon: Ticket, to: `/bookings/${b.id}/tickets` }
              : b.status === 'pending_payment'
                ? { label: 'Pay now', icon: Wallet, to: `/bookings/${b.id}` }
                : b.status === 'payment_failed'
                  ? { label: 'Retry payment', icon: Wallet, to: `/bookings/${b.id}` }
                  : null;

          return (
            <div
              key={b.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/bookings/${b.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate(`/bookings/${b.id}`);
              }}
              className="group flex cursor-pointer items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-asphalt/8 transition-[box-shadow] duration-300 hover:ring-danfo/30 hover:shadow-[0_18px_40px_-24px_rgba(10,31,60,0.4)]"
            >
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-paper-dim text-slate sm:flex">
                <Bus size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-display text-base font-semibold text-asphalt">
                  <span className="truncate">{b.schedule?.route?.from}</span>
                  <span className="text-danfo">→</span>
                  <span className="truncate">{b.schedule?.route?.to}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-body text-xs text-slate">
                  <span className="font-mono">{b.reference}</span>
                  <span>
                    {b.schedule?.departure_date?.slice(0, 10)} ·{' '}
                    {b.schedule?.departure_time?.slice(0, 5)}
                  </span>
                  <span>
                    {b.passenger_count} passenger{b.passenger_count > 1 ? 's' : ''}
                  </span>
                </div>
                {quickAction && (
                  <Link
                    to={quickAction.to}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-rose-soft px-3 py-1 font-body text-xs font-semibold text-rose transition-colors hover:bg-rose hover:text-white"
                  >
                    <quickAction.icon size={13} />
                    {quickAction.label}
                  </Link>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right">
                  <div className="font-display text-sm font-semibold text-asphalt">
                    ₦{money(b.total_amount_payable)}
                  </div>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide ${bookingStatusStyle(
                      b.status
                    )}`}
                  >
                    {bookingStatusLabel(b.status)}
                  </span>
                </div>
                <ChevronRight
                  size={18}
                  className="hidden text-slate/40 transition-transform group-hover:translate-x-0.5 group-hover:text-danfo sm:block"
                />
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          loading={loadingMore}
          onClick={loadMore}
          className="mt-6 w-full"
        >
          Load more
        </Button>
      )}
    </div>
  );
}