import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, CheckIcon } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

const RULES = [
{ id: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
{ id: 'letter', label: 'Contains a letter', test: (v: string) => /[a-zA-Z]/.test(v) },
{ id: 'number', label: 'Contains a number', test: (v: string) => /\d/.test(v) }];


export function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const valid = RULES.every((rule) => rule.test(password)) && /\S+@\S+\.\S+/.test(email);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!valid) {
      setError('Enter a valid email and a password that meets every requirement.');
      return;
    }
    setBusy(true);
    try {
      await signUp(name, email, password);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Set up a workspace to save and revisit your schemas."
      footer={
      <span>
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
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

        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" />
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email" />
        
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          autoComplete="new-password" />
        

        <ul className="space-y-1">
          {RULES.map((rule) => {
            const passed = rule.test(password);
            return (
              <li key={rule.id} className={cn('flex items-center gap-1.5 text-2xs', passed ? 'text-ok' : 'text-faint')}>
                <CheckIcon className={cn('h-3 w-3', passed ? 'opacity-100' : 'opacity-30')} aria-hidden />
                {rule.label}
              </li>);

          })}
        </ul>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={busy}>
          Create account
        </Button>
      </form>
    </AuthLayout>);

}