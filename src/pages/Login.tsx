import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { signIn, continueWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as {from?: string;} | null)?.from ?? '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email, password, remember);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your workspace."
      footer={
      <span>
          New to SCHEMA BUREAU?{' '}
          <Link to="/signup" className="text-accent hover:underline">
            Create an account
          </Link>
        </span>
      }>
      
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
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com" />
        

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="flex h-7 w-7 items-center justify-center rounded text-faint transition-colors duration-150 ease-out hover:text-fg">
              
                {showPassword ? <EyeOffIcon className="h-3.5 w-3.5" /> : <EyeIcon className="h-3.5 w-3.5" />}
              </button>
            } />
          
          <div className="mt-2.5 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-3.5 w-3.5 rounded-sm border-line2 bg-surface2 accent-[var(--nx-accent)]" />
              
              Remember me
            </label>
            <Link to="/forgot-password" className="text-xs text-muted transition-colors duration-150 ease-out hover:text-accent">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={busy}>
          Sign In
        </Button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-line" />
          <span className="text-2xs uppercase tracking-[0.12em] text-faint">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <Button
          type="button"
          size="lg"
          fullWidth
          loading={googleBusy}
          onClick={async () => {
            setGoogleBusy(true);
            setError('');
            try {
              await continueWithGoogle();
              navigate(from, { replace: true });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not continue with Google.');
            } finally {
              setGoogleBusy(false);
            }
          }}
          icon={
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
              <path fill="currentColor" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.63 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.94S8.78 6.3 12 6.3c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.7 3.74 14.55 2.85 12 2.85 6.98 2.85 2.9 6.93 2.9 11.95S6.98 21.05 12 21.05c5.5 0 9.15-3.87 9.15-9.32 0-.63-.07-1.1-.16-1.63" />
            </svg>
          }>
          
          Continue with Google
        </Button>

        <p className="pt-1 text-2xs leading-relaxed text-faint">
          Authentication runs against a local adapter in this environment. The same interface accepts a JWT backend,
          Firebase or Supabase without changing the screens.
        </p>
      </form>
    </AuthLayout>);

}