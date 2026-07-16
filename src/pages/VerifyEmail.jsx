import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail, sendVerificationToken } from '../api/auth';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setErrors({});
    setLoading(true);
    try {
      await verifyEmail({ email, otp });
      navigate('/login', { state: { verified: true } });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setNotice('');
    setFormError('');
    setResending(true);
    try {
      await sendVerificationToken({ email });
      setNotice('A new verification code is on its way — check spam if it doesn\u2019t show up soon.');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <PageHeader
        eyebrow="One more step"
        title="Verify your email"
        subtitle="Enter the code we sent to your email to activate your account."
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
        <Field
          label="Verification code (OTP)"
          name="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          error={errors.otp?.[0]}
          required
        />

        {formError && <p className="font-mono text-sm text-alert">{formError}</p>}
        {notice && <p className="font-mono text-sm text-signal">{notice}</p>}

        <Button type="submit" loading={loading} className="w-full">
          Verify email
        </Button>
        <Button
          type="button"
          variant="ghost"
          loading={resending}
          onClick={onResend}
          className="w-full"
        >
          Resend code
        </Button>
      </form>
    </div>
  );
}
