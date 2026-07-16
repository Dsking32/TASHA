import { getBookingDetail, getTicketData, getMyBookings } from './trips';

/**
 * Confirmed: the Dashboard folder's endpoints ARE the Trips/Profile
 * endpoints, just organized differently in the sidebar —
 *   view all bookings   -> GET /trips/bookings
 *   view booking detail -> GET /trips/bookings/{id}
 *   view/download tickets -> GET /trips/bookings/{id}/tickets
 *   share from detail   -> POST /trips/bookings/{id}/share
 *   reschedule          -> the RESCHEDULES folder endpoints
 *   update profile       -> POST /profile
 * No separate /dashboard/... routes exist. This module just re-exports the
 * trips.js calls under dashboard-flavored names for pages that want them.
 */

export const viewAllBookings = (params) => getMyBookings(params);

export const viewBookingDetail = (bookingId) => getBookingDetail(bookingId);

export const viewTicket = (bookingId) => getTicketData(bookingId);
