import client from './client';

// ---- Locations & discovery ----------------------------------------------

export const getLocations = () => client.get('/trips/locations');

export const fetchAllTrips = (params = {}) =>
  // Confirmed optional query params: departure_location_id, arrival_location_id,
  // departure_date, booking_type, per_page. Returns paginated results
  // (data.pagination: { total, per_page, current_page, last_page, has_more }).
  client.get('/trips', { params });

export const searchTrips = (payload) =>
  // payload: { departure_location_id, arrival_location_id, departure_date, booking_type, passenger_count }
  // booking_type: 'individual' | 'private'
  client.post('/trips/search', payload);

// "Public trip detail" in the docs sidebar turned out to be the exact same
// endpoint as the Share Ride flow's public view — GET /share/{token}, not a
// separate per-trip route. Use getSharedRide(token) for that screen; there's
// no getPublicTripDetail(tripId) because it doesn't exist as its own thing.

export const getScheduleSeats = (scheduleId) =>
  // Confirmed. Returns { schedule_id, vehicle, seats: [{ id, seat_number,
  // seat_label, seat_type, additional_fee, status }] }.
  // status: available | booked | held | unavailable
  // Docs explicitly mark this as "Step 5 (post-payment seat selection)" —
  // the real flow is: book (no seats) -> pay -> verify -> pick seats ->
  // tickets. Don't gate this call on having a booking id; it only needs
  // scheduleId, which search results already give us.
  client.get(`/trips/schedules/${scheduleId}/seats`);

// ---- Booking (individual & private) --------------------------------------

export const bookTrip = (payload) =>
  // Confirmed. Payload:
  // {
  //   schedule_id: integer,
  //   passengers: [{ title, first_name, last_name, gender, phone_number, email,
  //                   date_of_birth, passenger_category: 'adult'|'child'|'infant',
  //                   id_type, id_number, special_assistance }],
  //   contact_first_name, contact_last_name, contact_email, contact_phone, contact_alt_phone,
  //   emergency_contact_name, emergency_contact_phone,
  // }
  // Note: the docs' field table also lists contact_name/contact_phone and a
  // required emergency_contact_relationship, but the actual working example
  // uses contact_first_name/contact_last_name and omits the relationship
  // field — going with what the real request/response show.
  // Returns { booking: { id, reference, status: 'pending_payment', total_fare,
  // service_charge, total_amount_payable, passengers: [...] } }.
  // Do NOT send a price — fare is calculated server-side.
  client.post('/trips/bookings/individual', payload);

export const bookPrivateTrip = (payload) =>
  // Confirmed. Payload:
  // {
  //   schedule_id, passenger_count, pickup_location, pickup_landmark,
  //   dropoff_location, preferred_pickup_time (ISO string),
  //   special_requirements?, additional_stops?: string[],
  //   contact_first_name, contact_last_name, contact_email, contact_phone, contact_alt_phone,
  //   emergency_contact_name, emergency_contact_phone,
  // }
  // No seat selection for private bookings — the whole vehicle is reserved.
  // After payment confirms, go straight to GET /trips/bookings/{id}/tickets.
  client.post('/trips/bookings/private', payload);

export const getBookingDetail = (bookingId) =>
  // Confirmed — this is also the exact endpoint behind "Dashboard: View
  // Booking Detail" (same path, same response). Full shape:
  // { booking: { id, reference, booking_type, status, passenger_count,
  //     total_fare, service_charge, total_amount_payable, schedule: {...},
  //     passengers: [...], held_seats, tickets, contact, emergency_contact,
  //     group, private, created_at },
  //   payment_history: [{ reference, amount, currency, status, provider, paid_at }],
  //   share: { active, share_url } }
  // status: pending_payment | confirmed | payment_failed | cancelled
  client.get(`/trips/bookings/${bookingId}`);

export const getMyBookings = (params = {}) =>
  // Confirmed. Params: { status, filter, per_page, page }.
  // status (booking state): pending_payment | confirmed | payment_failed | cancelled
  // filter (dashboard tab): upcoming | completed | rescheduled | private
  // Returns { bookings: [{ id, reference, booking_type, status,
  // passenger_count, total_amount_payable, created_at,
  // schedule: { id, departure_date, departure_time, route: { from, to } } }],
  // pagination: { total, per_page, current_page, last_page, has_more } }.
  client.get('/trips/bookings', { params });

export const assignSeats = (bookingId, payload) =>
  // Confirmed. payload: { seat_ids: [14, 15, ...] } — a flat array, count
  // must exactly match booking.passenger_count, order maps to passenger
  // order. All seats must be status: 'available'. Booking must already be
  // 'confirmed' (paid) — the API can respond success:false with a message
  // instead of throwing, e.g. "Seat selection is only available for
  // confirmed (paid) bookings," so check res.success, don't just catch.
  client.post(`/trips/bookings/${bookingId}/seats`, payload);

// ---- Payment --------------------------------------------------------------

export const initiatePayment = (bookingId) =>
  // Confirmed. No body needed. Returns { payment_reference, checkout_url,
  // breakdown: { base_fare, service_charge, total } }.
  // Idempotent — safe to call again before payment completes; returns the
  // same stored checkout_url. Redirect the user to checkout_url, Paystack
  // sends them back to a callback URL (configured backend-side), then call
  // verifyPayment immediately on that redirect.
  client.post(`/trips/bookings/${bookingId}/payment/initiate`);

export const verifyPayment = (bookingId) =>
  // Confirmed. Returns { booking_status, payment_reference }.
  // booking_status: confirmed | payment_failed | pending_payment | cancelled
  // On confirmed: individual bookings -> seat selection; private bookings -> tickets directly.
  client.get(`/trips/bookings/${bookingId}/payment/verify`);

// ---- Tickets & check-in -----------------------------------------------------

export const getTicketData = (bookingId) =>
  // Confirmed. Returns:
  // {
  //   booking_reference, booking_type, total,
  //   tickets: [{
  //     id, ticket_number, status, issued_at,
  //     passenger: { id, name, gender, passenger_category, seat_id },
  //     ticket_data: {
  //       ticket_number, booking_reference, passenger_name, passenger_category,
  //       route: "Kano → Abuja" (single formatted string, not an object),
  //       departure_date (formatted, e.g. "Thu, 02 Jul 2026"), departure_time,
  //       boarding_terminal, dropoff_terminal, vehicle_category,
  //       seat_number (can be null even on an active ticket if seats
  //       haven't been assigned yet), booking_type,
  //     },
  //   }],
  // }
  client.get(`/trips/bookings/${bookingId}/tickets`);

export const checkIn = (bookingId, payload = {}) =>
  // Path confirmed: POST /trips/bookings/{id}/checkin. The example body
  // shown in the docs was identical to Book Trip's (full passenger
  // re-submission), which looks like a copy-paste leftover rather than the
  // real payload — the response we got ("Check-in is not yet open...")
  // was a scheduling check unrelated to passenger data. Left flexible
  // (empty object by default) until the real body shape is confirmed —
  // likely nothing, or just a passenger_id.
  client.post(`/trips/bookings/${bookingId}/checkin`, payload);

// ---- Reschedule -------------------------------------------------------------

export const getRescheduleOptions = (bookingId) =>
  // Confirmed (day one). Returns { schedules: [{ id, reference,
  // departure_date, departure_time, arrival_date, arrival_time,
  // boarding_terminal, dropoff_terminal, available_seats,
  // fare: { adult, private_vehicle, service_charge, reschedule_fee } }], total }.
  // Booking must be status: confirmed, trip not yet departed.
  client.get(`/trips/bookings/${bookingId}/reschedule/options`);

export const initiateReschedule = (bookingId, payload) =>
  // Confirmed (day one). payload: { new_schedule_id, reason }.
  // Returns either:
  //   { reschedule_id, status: 'pending_payment', payment_reference,
  //     checkout_url, breakdown: { fare_difference, rescheduling_fee, service_charge, total } }
  //   or { status: 'completed', ... } when no fee applies (finalized immediately).
  client.post(`/trips/bookings/${bookingId}/reschedule`, payload);

// ---- Sharing ----------------------------------------------------------------

export const shareRide = (bookingId) =>
  // Confirmed. Returns { share_url, share_token, expires }.
  // IMPORTANT: share_url points at the BACKEND's own host/API path
  // (e.g. "http://127.0.0.1:8000/api/v1/share/{token}"), not our frontend.
  // Always build the actual shareable link from share_token via
  // utils/shareUrl.js's buildShareUrl() — never hand share_url to a user
  // directly, or they'll open a raw JSON API response instead of the
  // rendered SharedRide page.
  // Regenerates on every call — the previous link stops working immediately.
  // Booking must be status: confirmed.
  client.post(`/trips/bookings/${bookingId}/share`);

export const getSharedRide = (token) =>
  // Confirmed. Returns:
  // {
  //   booking_ref (masked), booking_type, trip_phase,
  //   route: { from, to, boarding_terminal, boarding_address,
  //             dropoff_terminal, dropoff_address, estimated_duration },
  //   schedule: { departure_date, departure_time, arrival_date, arrival_time, booking_deadline },
  //   vehicle: { category, make, model, color, registration_number },
  //   driver: { name, profile_photo },
  //   passengers: { count, manifest: [{ name, passenger_category }] },
  // }
  client.get(`/share/${token}`);

// ---- Guest access -------------------------------------------------------------

export const lookupGuestBooking = (payload) =>
  // payload: { reference, email }. Returns { booking_id, reference, status,
  // guest_token }. 404 when reference/email don't match; 409 when the
  // booking belongs to an account (sign in instead).
  client.post('/trips/bookings/lookup', payload);
