import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';

export function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Choose a password of at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset the password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Enter the code you were issued and choose a new password."
      footer={
      <span>
          Need a new code?{' '}
          <Link to="/forgot-password" className="text-accent hover:underline">
            Request another
          </Link>
        </span>
      }>
      
      {done ?
      <div className="space-y-4">
          <div className="flex items-start gap-2 rounded border border-ok bg-okSoft px-3 py-3 text-xs text-ok">
            <CheckCircle2Icon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
            Your password has been updated. You can sign in with it now.
          </div>
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/login')}>
            Back to sign in
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
          label="Reset code"
          required
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="6-character code"
          className="font-mono uppercase tracking-[0.2em]" />
        
          <Input
          label="New password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password" />
        
          <Input
          label="Confirm password"
          type="password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          autoComplete="new-password" />
        
          <Button type="submit" variant="primary" size="lg" fullWidth loading={busy}>
            Update password
          </Button>
        </form>
      }
    </AuthLayout>);

}