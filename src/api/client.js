import axios from 'axios';
import { guestBookings } from '../utils/guestBookings';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

if (!import.meta.env.VITE_API_BASE_URL) {
  // Falling back silently here means a missing .env in a real deploy would
  // just look like every request is "network error" with no clue why —
  // this makes the actual cause obvious immediately in devtools.
  console.error(
    '[TashaXpress] VITE_API_BASE_URL is not set — falling back to ' +
      BASE_URL +
      '. Copy .env.example to .env and set the real API URL, then restart the dev/build.'
  );
}

const TOKEN_KEY = 'tasha_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Attach bearer token to every request when present.
client.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Guest bookings: send the booking's access token on its own endpoints.
  const match = /\/trips\/bookings\/(\d+)(\/|$)/.exec(config.url || '');
  const guestToken = match && guestBookings.token(match[1]);
  if (guestToken) {
    config.headers['X-Booking-Token'] = guestToken;
  }
  return config;
});

/**
 * Every TashaXpress response follows { data, message, success }.
 * We unwrap that here so API modules can just return `res.data`
 * (the inner payload) and callers don't repeat `.data.data` everywhere.
 * Validation errors (422) come back without a `success` key — we
 * normalize those into a consistent shape too.
 */
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const body = error.response?.data;

    if (status === 422) {
      return Promise.reject({
        status,
        message: body?.message || 'Please check the highlighted fields.',
        errors: body?.errors || {},
      });
    }

    if (status === 401) {
      tokenStore.clear();
      // Clearing localStorage alone doesn't update AuthContext's in-memory
      // state — without this, the Navbar/ProtectedRoute would keep acting
      // logged-in until the next full page reload. This lets AuthContext
      // react immediately.
      window.dispatchEvent(new Event('tasha:unauthorized'));
    }

    return Promise.reject({
      status: status || 0,
      message: body?.message || error.message || 'Something went wrong. Please try again.',
      errors: body?.errors || {},
    });
  }
);

export default client;
