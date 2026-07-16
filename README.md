# TashaXpress Frontend

React + Vite + Tailwind CSS v4 frontend for the TashaXpress e-ticketing platform.

## Getting started

```bash
npm install
cp .env.example .env   # then set VITE_API_BASE_URL to your backend's /api/v1 base
npm run dev
```

## What's built so far

- **Design system**: Tailwind v4 tokens in `src/index.css` (`@theme` block) — colors,
  fonts (Space Grotesk / Inter / IBM Plex Mono), and the perforated `TicketCard`
  signature component.
- **API layer** (`src/api/`): one module per docs folder — `auth.js`, `profile.js`,
  `trips.js`, `dashboard.js`, `ping.js` — all going through a shared `client.js` axios
  instance that attaches the bearer token and unwraps the `{ data, message, success }`
  envelope automatically.
- **Auth**: `AuthContext` (session check on load, login/register/logout), full pages for
  Login, Register, Verify Email, Forgot Password, Reset Password.
- **Routing**: `react-router-dom`, with `ProtectedRoute` guarding dashboard/profile
  routes and redirecting to `/login` when logged out.
- **Home**: departure-board style hero with a live route search widget wired to
  `GET /trips/locations`.
- **Placeholders**: Search results, booking detail, my bookings, profile — stubbed so
  the app runs end-to-end; these are next to build out.

## A note on API paths

Your Postman docs give full detail for `ping`, `trips/locations`, and the reschedule
endpoints, plus a complete path table in the "Booking Flow Summary" section — those are
wired up exactly. A few endpoints (auth's exact slugs, "My Bookings", "Public trip
detail") were only listed by name in the sidebar, not shown as full request pages, so
they follow the same REST conventions as the documented ones, with a comment on each
one in `src/api/*.js`. Grep for `NOTE:` in that folder to find and confirm them against
your backend dev's actual routes — nothing else in the app needs to change if a path
shifts.

## Next steps (in the order the flow needs them)

1. `/search` — trip results list + schedule picker (`POST /trips/search`)
2. Seat selection (`GET /trips/schedules/{id}/seats`, `POST /trips/bookings/{id}/seats`)
3. Booking + payment (`POST /trips/bookings/individual`, payment initiate/verify)
4. Ticket view + check-in (`TicketCard` already built — just needs live data)
5. Dashboard bookings list + reschedule flow
