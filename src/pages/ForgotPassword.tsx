import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircleIcon } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';

export function ForgotPassword() {
  const { requestReset } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const issued = await requestReset(email);
      setToken(issued);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the reset.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll issue a one-time code you can use to set a new password."
      footer={
      <span>
          Remembered it?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Back to sign in
          </Link>
        </span>
      }>
      
      {token ?
      <div className="space-y-4">
          <div className="rounded border border-line bg-surface2 px-3 py-3">
            <p className="text-xs text-muted">
              A reset code has been issued. In a deployed environment this is emailed; here it is shown directly.
            </p>
            <p className="mt-2 font-mono text-lg tracking-[0.3em] text-accent">{token}</p>
          </div>
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/reset-password')}>
            Continue to reset
          </Button>
        </div> :

      <form onSubmit={submit} className="space-y-4" noValidate>
          {error ?
        <div role="alert" className="flex items-start gap-2 rounded border border-danger bg-dangerSoft px-3 py-2 text-xs text-danger">
              <AlertCircleIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
              {error}
            </div> :
        null}
          <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          autoComplete="email" />
        
          <Button type="submit" variant="primary" size="lg" fullWidth loading={busy}>
            Send reset code
          </Button>
        </form>
      }
    </AuthLayout>);

}