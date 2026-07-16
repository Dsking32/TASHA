import client, { tokenStore } from './client';

/**
 * Confirmed against the real Postman docs: register, login, forgot-password,
 * reset-password, and locations all matched exactly (no `/auth/` prefix —
 * routes sit directly under `/api/v1/`). "Send Verification Token" and
 * "verify email" were only named in the sidebar, not shown as full request
 * pages, so those two paths below are still a best guess — confirm them the
 * same way (click into the endpoint in the docs tool) before relying on them.
 */

export const register = (payload) =>
  // payload: { first_name, last_name, email, dob, password, password_confirmation, phone_number }
  client.post('/register', payload);

export const login = async (payload) => {
  // payload: { email, password }
  const res = await client.post('/login', payload);
  const token = res?.data?.access_token || res?.data?.token;
  if (token) tokenStore.set(token);
  return res;
};

export const forgotPassword = (payload) =>
  // payload: { email }
  client.post('/forgot-password', payload);

export const resetPassword = (payload) =>
  // payload: { email, otp, password, password_confirmation }
  client.post('/reset-password', payload);

export const sendVerificationToken = (payload) =>
  // payload: { email }
  client.post('/send-token', payload);

export const verifyEmail = (payload) =>
  // payload: { email, otp } — confirmed path is /verify-email; field name
  // assumed to be "otp" to match reset-password's confirmed shape. If the
  // app still fails here, check the 422 response body for the real field
  // name Laravel is expecting and swap it in VerifyEmail.jsx + here.
  client.post('/verify-email', payload);

export const logout = async () => {
  // NOTE: guessed path — confirm "logout" in the docs.
  const res = await client.post('/logout');
  tokenStore.clear();
  return res;
};
