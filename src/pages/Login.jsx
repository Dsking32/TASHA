import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const successNotice = location.state?.verified
    ? 'Email verified — you can log in now.'
    : location.state?.passwordReset
      ? 'Password reset — log in with your new password.'
      : '';

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setErrors({});
    setLoading(true);
    try {
      await login(form);
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-[28px] border border-asphalt/10 bg-white p-8 shadow-sm sm:p-12">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-bold text-danfo">TashaXpress</span>
          <h1 className="mt-2 font-display text-2xl font-bold text-asphalt">
            Sign in to your account
          </h1>
          <p className="mt-2 font-body text-sm text-slate">
            Welcome back to intercity travel efficiency.
          </p>
        </div>

        {successNotice && (
          <p className="mb-6 rounded-lg bg-signal-soft px-4 py-3 font-body text-sm text-signal">
            {successNotice}
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
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
          <div>
            <div className="flex items-center justify-between">
              <span className="mb-1.5 block font-body text-[12px] font-semibold uppercase tracking-[0.05em] text-slate">
                Password
              </span>
              <Link to="/forgot-password" className="font-body text-xs font-medium text-danfo hover:underline">
                Forgot password?
              </Link>
            </div>
            <Field
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              error={errors.password?.[0]}
              required
              autoComplete="current-password"
            />
          </div>

          {formError && <p className="font-body text-sm text-alert">{formError}</p>}

          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-8 text-center font-body text-sm text-slate">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-danfo hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
