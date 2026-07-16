import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { tokenStore } from '../api/client';
import * as authApi from '../api/auth';
import { fetchProfile } from '../api/profile';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | guest | authed

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetchProfile();
      setUser(res.data?.user || res.data);
      setStatus('authed');
    } catch {
      tokenStore.clear();
      setUser(null);
      setStatus('guest');
    }
  }, []);

  useEffect(() => {
    if (tokenStore.get()) {
      loadProfile();
    } else {
      setStatus('guest');
    }
  }, [loadProfile]);

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setStatus('guest');
    };
    window.addEventListener('tasha:unauthorized', onUnauthorized);
    return () => window.removeEventListener('tasha:unauthorized', onUnauthorized);
  }, []);

  const login = async (payload) => {
    const res = await authApi.login(payload);
    await loadProfile();
    return res;
  };

  const register = (payload) => authApi.register(payload);

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus('guest');
      // Prevent a stale booking id from an abandoned payment leaking into
      // whoever uses this browser next (relevant on shared/public devices).
      sessionStorage.removeItem('tasha_pending_payment_booking_id');
    }
  };

  const value = {
    user,
    status, // 'checking' | 'guest' | 'authed'
    isAuthed: status === 'authed',
    login,
    register,
    logout,
    refreshProfile: loadProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
