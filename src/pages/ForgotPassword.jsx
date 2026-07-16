import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setErrors({});
    setLoading(true);
    try {
      await forgotPassword({ email });
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <PageHeader
        eyebrow="Password reset"
        title="Forgot your password?"
        subtitle="We'll email you a reset code."
      />

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Field
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email?.[0]}
          required
        />

        {formError && <p className="font-mono text-sm text-alert">{formError}</p>}

        <Button type="submit" loading={loading} className="w-full">
          Send reset code
        </Button>
      </form>

      <p className="mt-8 text-center font-mono text-xs text-slate">
        Remembered it?{' '}
        <Link to="/login" className="text-asphalt underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
