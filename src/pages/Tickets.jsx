import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTicketData, checkIn, shareRide, getBookingDetail, getScheduleSeats } from '../api/trips';
import { buildShareUrl } from '../utils/shareUrl';
import TicketCard from '../components/ui/TicketCard';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';

// Confirmed shape (see trips.js getTicketData comment). `route` comes back
// as a single formatted string like "Kano → Abuja", not a from/to object.
function normalizeTicket(t) {
  const d = t.ticket_data;
  if (!d) return null; // malformed entry — skip rather than crash the whole list
  const [from, to] = (d.route || '').split(' → ');
  return {
    key: t.id,
    reference: d.booking_reference,
    from: from || d.route,
    to: to || '',
    date: d.departure_date,
    time: d.departure_time?.slice(0, 5),
    passengerName: d.passenger_name,
    seatNumber: d.seat_number,
    // ticket_data.seat_number can come back null even when a seat really
    // is assigned — a gap in the backend's ticket serializer, confirmed
    // by passenger.seat_id being set on the same record. Keep seat_id
    // around so we can resolve the real seat number ourselves below.
    seatId: t.passenger?.seat_id ?? null,
    status: t.status, // 'active' etc — TicketCard falls back gracefully on unknown values
  };
}

export default function Tickets() {
  const { id } = useParams();
  const [tickets, setTickets] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareError, setShareError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await getTicketData(id);
        if (res.success === false) {
          if (!cancelled) {
            setNotice(res.message || 'Tickets are not available for this booking yet.');
          }
          return;
        }
        const raw = Array.isArray(res.data) ? res.data : res.data?.tickets || [];
        let normalized = raw.map(normalizeTicket).filter(Boolean);

        // Patch any ticket whose seat number is missing but whose seat_id
        // isn't — resolve it against the schedule's seat list so the
        // ticket shows the real seat instead of a dash. Best-effort: if
        // this lookup fails for any reason, the tickets still render fine
        // with whatever seat numbers the backend did provide.
        const needsResolve = normalized.some((t) => !t.seatNumber && t.seatId);
        if (needsResolve) {
          try {
            const detail = await getBookingDetail(id);
            const scheduleId = detail.data?.booking?.schedule?.id;
            if (scheduleId) {
              const seatRes = await getScheduleSeats(scheduleId);
              const seatMap = new Map(
                (seatRes.data?.seats || []).map((s) => [s.id, s.seat_label || s.seat_number])
              );
              normalized = normalized.map((t) =>
                !t.seatNumber && t.seatId && seatMap.has(t.seatId)
                  ? { ...t, seatNumber: seatMap.get(t.seatId) }
                  : t
              );
            }
          } catch {
            // Fallback lookup failed — leave seat numbers as-is rather
            // than blocking the whole tickets page over this.
          }
        }

        if (!cancelled) setTickets(normalized);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onCheckIn = async () => {
    setCheckinMessage('');
    setCheckinLoading(true);
    try {
      // Payload shape is unconfirmed (see trips.js comment) — sending
      // nothing for now. If your backend expects something specific,
      // this is the one line that needs to change.
      const res = await checkIn(id);
      setCheckinMessage(res.message || (res.success === false ? 'Check-in was not accepted.' : 'Checked in!'));
    } catch (err) {
      setCheckinMessage(err.message);
    } finally {
      setCheckinLoading(false);
    }
  };

  const onShare = async () => {
    setShareError('');
    setCopied(false);
    setShareLoading(true);
    try {
      const res = await shareRide(id);
      // Deliberately NOT using res.data.share_url — that points at the
      // backend's own API host/path, not our rendered /share/:token page.
      // See utils/shareUrl.js for why.
      setShareUrl(buildShareUrl(res.data?.share_token));
    } catch (err) {
      setShareError(err.message);
    } finally {
      setShareLoading(false);
    }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (permissions, non-secure context) — the URL
      // is still visible and selectable, so this isn't a hard failure.
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center font-mono text-sm text-slate">
        Loading your tickets…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center font-mono text-sm text-alert">
        {error}
      </div>
    );
  }

  if (notice) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-mono text-sm text-slate">{notice}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 print:py-0">
      <PageHeader
        eyebrow={tickets?.[0]?.reference ? `Booking ${tickets[0].reference}` : 'Your booking'}
        title="Your tickets"
        className="print:hidden"
      />

      <div className="mt-8 space-y-6">
        {tickets?.length === 0 && (
          <p className="font-mono text-sm text-slate">No tickets found for this booking yet.</p>
        )}
        {tickets?.map((t) => (
          <TicketCard
            key={t.key}
            reference={t.reference}
            from={t.from}
            to={t.to}
            date={t.date}
            time={t.time}
            passengerName={t.passengerName}
            seatNumber={t.seatNumber}
            status={t.status}
          />
        ))}
      </div>

      {checkinMessage && (
        <p className="mt-4 text-center font-mono text-sm text-slate print:hidden">
          {checkinMessage}
        </p>
      )}

      {tickets?.length > 0 && (
        <div className="mt-8 space-y-3 print:hidden">
          <Button onClick={onCheckIn} loading={checkinLoading} className="w-full">
            Check in
          </Button>
          <Button onClick={onShare} loading={shareLoading} variant="ghost" className="w-full">
            Share this ride
          </Button>
          {shareError && (
            <p className="text-center font-mono text-sm text-alert">{shareError}</p>
          )}
          {shareUrl && (
            <div className="flex items-center gap-2 rounded-lg border border-asphalt/15 bg-paper-dim p-3">
              <input
                readOnly
                value={shareUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 truncate bg-transparent font-mono text-xs text-asphalt outline-none"
              />
              <button
                type="button"
                onClick={onCopy}
                className="cursor-pointer whitespace-nowrap rounded-md bg-asphalt px-3 py-1.5 font-mono text-[11px] text-paper"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
          <Button onClick={() => window.print()} variant="ghost" className="w-full">
            Print / save as PDF
          </Button>
        </div>
      )}
    </div>
  );
}