import client from './client';

// Confirmed: GET /profile returns { data: { user: {...} }, message, success }
// Full editable field set is a superset of what the docs' request table and
// example body show: first_name, last_name, phone_number, profile_photo
// (file), gender, date_of_birth, residential_address,
// emergency_contact_name, emergency_contact_phone. Only send the fields
// you want changed — omitted fields are left as-is.

export const fetchProfile = () => client.get('/profile');

// If `payload.profile_photo` is a File, we can't send this as JSON — the
// shared client always sets Content-Type: application/json, which would
// silently drop the file. Switch to multipart/form-data only when a file
// is actually present, so the plain-field-only case (the common one)
// keeps working exactly as before.
//
// IMPORTANT: don't set Content-Type to the string 'multipart/form-data'
// yourself — that string has no `boundary=` parameter, and without it the
// backend can't parse the body at all. The browser computes the correct
// boundary automatically, but only if it's the one setting the header.
// Setting Content-Type to `false` here removes our client's default
// 'application/json' header so the browser can take over.
export const editProfile = (payload) => {
  if (payload.profile_photo instanceof File) {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) form.append(key, value);
    });
    return client.post('/profile', form, {
      headers: { 'Content-Type': false },
    });
  }
  return client.post('/profile', payload);
};
