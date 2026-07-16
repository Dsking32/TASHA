import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: location.state?.email || '',
    otp: '',
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
      await resetPassword(form);
      navigate('/login', { state: { passwordReset: true } });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <PageHeader eyebrow="Almost there" title="Set a new password" />

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Field
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          error={errors.email?.[0]}
          required
        />
        <Field
          label="OTP"
          name="otp"
          value={form.otp}
          onChange={onChange}
          error={errors.otp?.[0]}
          required
        />
        <Field
          label="New password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          error={errors.password?.[0]}
          required
        />
        <Field
          label="Confirm new password"
          name="password_confirmation"
          type="password"
          value={form.password_confirmation}
          onChange={onChange}
          error={errors.password_confirmation?.[0]}
          required
        />

        {formError && <p className="font-mono text-sm text-alert">{formError}</p>}

        <Button type="submit" loading={loading} className="w-full">
          Reset password
        </Button>
      </form>
    </div>
  );
}
