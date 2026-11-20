import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SearchResults from './pages/SearchResults';
import BookTrip from './pages/BookTrip';
import BookPrivateTrip from './pages/BookPrivateTrip';
import BookingDetail from './pages/BookingDetail';
import MyBookings from './pages/MyBookings';
import SeatSelection from './pages/SeatSelection';
import Tickets from './pages/Tickets';
import PaymentCallback from './pages/PaymentCallback';
import SharedRide from './pages/SharedRide';
import RescheduleBooking from './pages/RescheduleBooking';
import Profile from './pages/Profile';
import Placeholder from './pages/Placeholder';
import ManageBooking from './pages/ManageBooking';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/share/:token" element={<SharedRide />} />

        {/* Booking: open to signed-in users and guests (guest access uses a per-booking token) */}
        <Route path="/manage-booking" element={<ManageBooking />} />
        <Route path="/book/:scheduleId" element={<BookTrip />} />
        <Route path="/book-private/:scheduleId" element={<BookPrivateTrip />} />
        <Route path="/bookings/:id" element={<BookingDetail />} />
        <Route path="/bookings/:id/seats" element={<SeatSelection />} />
        <Route path="/bookings/:id/tickets" element={<Tickets />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/bookings/:id/reschedule" element={<RescheduleBooking />} />

        {/* Account only */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Placeholder title="Page not found" note="That route doesn't exist yet." />} />
      </Route>
    </Routes>
  );
}
