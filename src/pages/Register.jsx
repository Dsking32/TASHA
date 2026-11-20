import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendVerificationToken } from '../api/auth';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import AuthShell from '../components/layout/AuthShell';
import { PHOTOS } from '../constants/images';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    dob: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      // Registration already returns a token, but email still needs
      // verifying before login is fully unlocked. The backend doesn't
      // reliably auto-send the code on registration, so trigger it
      // ourselves here — this is the same /send-token call the "Resend
      // code" button uses, just fired immediately instead of waiting for
      // the user to notice nothing arrived and click resend themselves.
      // Best-effort: if this call fails, still send them to the verify
      // page — "Resend code" there is the fallback.
      let sent = true;
      try {
        const res = await sendVerificationToken({ email: form.email });
        if (res?.success === false) sent = false;
      } catch {
        sent = false;
      }
      navigate('/verify-email', { state: { email: form.email, justSent: sent } });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="Get started" title="Create your account" subtitle="Save your details once and book faster next time." photo={PHOTOS.traveller}>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="First name"
            name="first_name"
            value={form.first_name}
            onChange={onChange}
            error={errors.first_name?.[0]}
            required
            autoComplete="given-name"
          />
          <Field
            label="Last name"
            name="last_name"
            value={form.last_name}
            onChange={onChange}
            error={errors.last_name?.[0]}
            required
            autoComplete="family-name"
          />
        </div>
        <Field
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          error={errors.email?.[0]}
          required
          autoComplete="email"
        />
        <Field
          label="Date of birth"
          name="dob"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          value={form.dob}
          onChange={onChange}
          error={errors.dob?.[0]}
          required
        />
        <Field
          label="Phone number"
          name="phone_number"
          type="tel"
          value={form.phone_number}
          onChange={onChange}
          error={errors.phone_number?.[0]}
          required
          autoComplete="tel"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          error={errors.password?.[0]}
          required
          autoComplete="new-password"
        />
        <Field
          label="Confirm password"
          name="password_confirmation"
          type="password"
          value={form.password_confirmation}
          onChange={onChange}
          error={errors.password_confirmation?.[0]}
          required
          autoComplete="new-password"
        />

        {formError && <p className="font-mono text-sm text-alert">{formError}</p>}

        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-rose hover:text-rose-dark">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
