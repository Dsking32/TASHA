import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import AuthShell from '../components/layout/AuthShell';

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
      // Return to the exact page (including ?passenger_count etc.) that
      // sent the user here, not just its path.
      const from = location.state?.from;
      const destination = from ? `${from.pathname}${from.search || ''}${from.hash || ''}` : '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your account"
      subtitle="See your tickets, check in and manage your trips."
      notice={successNotice}
    >
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
              <span className="mb-1.5 block text-[13px] font-bold text-asphalt">
                Password
              </span>
              <Link to="/forgot-password" className="mb-1.5 text-[13px] font-semibold text-danfo hover:text-danfo-dark">
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
            Sign in
          </Button>
        </form>

        <p className="mt-8 text-center font-body text-sm text-slate">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-rose hover:text-rose-dark">
            Create an account
          </Link>
        </p>
    </AuthShell>
  );
}
