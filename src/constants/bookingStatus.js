// Single source of truth for booking status display, used by BookingDetail
// and MyBookings. Previously each page had its own identical copy of these
// two objects — a change to one (new status, different color) could easily
// be made in only one place and silently drift from the other.

export const BOOKING_STATUS_STYLES = {
  pending_payment: 'bg-danfo/20 text-danfo-dark',
  confirmed: 'bg-signal-soft text-signal',
  payment_failed: 'bg-alert-soft text-alert',
  cancelled: 'bg-asphalt/10 text-slate',
};

export const BOOKING_STATUS_LABEL = {
  pending_payment: 'Pending payment',
  confirmed: 'Confirmed',
  payment_failed: 'Payment failed',
  cancelled: 'Cancelled',
};

export function bookingStatusStyle(status) {
  return BOOKING_STATUS_STYLES[status] || 'bg-asphalt/10 text-slate';
}

export function bookingStatusLabel(status) {
  return BOOKING_STATUS_LABEL[status] || status;
}
