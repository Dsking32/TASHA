import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail, sendVerificationToken } from '../api/auth';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import AuthShell from '../components/layout/AuthShell';

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

  useEffect(() => {
    if (location.state?.justSent) {
      setNotice(`We've sent a verification code to ${location.state.email}.`);
    } else if (location.state?.justSent === false) {
      setFormError(
        "We couldn't send your verification code automatically — tap \"Resend code\" below to get one."
      );
    }
    // Only meant to run once, off the state this page was entered with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setErrors({});
    setLoading(true);
    try {
      const res = await verifyEmail({ email, otp });
      if (res?.success === false) {
        setFormError(res.message || 'That code didn\u2019t work — check it and try again.');
        return;
      }
      navigate('/login', { state: { verified: true, from: location.state?.from } });
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
      const res = await sendVerificationToken({ email });
      if (res?.success === false) {
        setFormError(res.message || "That didn't go through — please try again in a moment.");
        return;
      }
      setNotice('A new verification code is on its way — check spam if it doesn\u2019t show up soon.');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell eyebrow="One more step" title="Verify your email" subtitle="Enter the code we sent to your email to activate your account.">

      <form onSubmit={onSubmit} className="space-y-5">
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
    </AuthShell>
  );
}
