import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';

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
      // verifying before login is fully unlocked — send them there.
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <PageHeader eyebrow="Get started" title="Create your account" />

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
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

      <p className="mt-8 text-center font-mono text-xs text-slate">
        Already have an account?{' '}
        <Link to="/login" className="text-asphalt underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
