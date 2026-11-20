// Guest bookings are opened with a private token the API returns once (on
// booking, or via "Manage booking" lookup). We keep it on this device so the
// guest can pay, pick seats and see tickets without an account. The API
// client sends it as X-Booking-Token on /trips/bookings/{id}/... requests.

const KEY = 'tasha_guest_bookings';
const CHECKOUT_KEY = 'tasha_checkout_as_guest';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function write(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // Storage blocked (private mode etc.) — the booking still works this
    // session only until reload; nothing else to do.
  }
}

export const guestBookings = {
  token: (bookingId) => read()[String(bookingId)]?.token || null,
  save: (bookingId, token, reference) => {
    if (!bookingId || !token) return;
    const map = read();
    map[String(bookingId)] = { token, reference: reference || map[String(bookingId)]?.reference || null };
    write(map);
  },
  list: () =>
    Object.entries(read()).map(([id, v]) => ({ id: Number(id), reference: v.reference })),
  clear: () => write({}),
};

// "Continue as guest" choice, remembered for this browser tab only.
export const guestCheckout = {
  chosen: () => {
    try {
      return sessionStorage.getItem(CHECKOUT_KEY) === '1';
    } catch {
      return false;
    }
  },
  choose: () => {
    try {
      sessionStorage.setItem(CHECKOUT_KEY, '1');
    } catch {
      // ignore
    }
  },
};
