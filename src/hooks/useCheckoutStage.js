import { useAuth } from '../context/AuthContext';
import { guestCheckout } from '../utils/guestBookings';

/**
 * Decides whether to show the gate. Returns 'checking' while the session is
 * being restored, 'gate' when a guest hasn't chosen yet, else 'form'.
 */
export default function useCheckoutStage(guestChosen) {
  const { status } = useAuth();
  if (status === 'checking') return 'checking';
  if (status === 'authed' || guestChosen || guestCheckout.chosen()) return 'form';
  return 'gate';
}
