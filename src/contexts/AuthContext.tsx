import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

interface StoredAccount extends AuthUser {
  password: string;
}

interface AuthValue {
  user: AuthUser | null;
  ready: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  requestReset: (email: string) => Promise<string>;
  resetPassword: (token: string, password: string) => Promise<void>;
  continueWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

const ACCOUNTS_KEY = 'foundry.accounts.v1';
const SESSION_KEY = 'foundry.session.v1';
const RESET_KEY = 'foundry.reset.v1';

/**
 * Local authentication adapter. Every method is async and returns/throws the
 * same shapes a real backend would, so swapping in JWT, Firebase or Supabase
 * means replacing the bodies below and nothing else in the app.
 */
function readAccounts(): StoredAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]') as StoredAccount[];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {

    /* ignore */}
}

function persistSession(user: AuthUser, remember: boolean): void {
  const payload = JSON.stringify(user);
  try {
    if (remember) localStorage.setItem(SESSION_KEY, payload);else
    sessionStorage.setItem(SESSION_KEY, payload);
  } catch {

    /* ignore */}
}

function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {

    /* ignore */}
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {

      /* ignore */}
    setReady(true);
  }, []);

  const signIn = useCallback(async (email: string, password: string, remember: boolean) => {
    await delay(320);
    const normalized = email.trim().toLowerCase();
    const accounts = readAccounts();
    const account = accounts.find((a) => a.email === normalized);
    if (!account) throw new Error('No account exists for that email address.');
    if (account.password !== password) throw new Error('That password does not match our records.');
    const session: AuthUser = { id: account.id, email: account.email, name: account.name, createdAt: account.createdAt };
    persistSession(session, remember);
    setUser(session);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    await delay(360);
    const normalized = email.trim().toLowerCase();
    const accounts = readAccounts();
    if (accounts.some((a) => a.email === normalized)) throw new Error('An account with that email already exists.');
    const account: StoredAccount = {
      id: `usr_${Math.random().toString(36).slice(2, 10)}`,
      email: normalized,
      name: name.trim() || normalized.split('@')[0],
      password,
      createdAt: Date.now()
    };
    writeAccounts([...accounts, account]);
    const session: AuthUser = { id: account.id, email: account.email, name: account.name, createdAt: account.createdAt };
    persistSession(session, true);
    setUser(session);
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const requestReset = useCallback(async (email: string) => {
    await delay(320);
    const normalized = email.trim().toLowerCase();
    const accounts = readAccounts();
    if (!accounts.some((a) => a.email === normalized)) throw new Error('No account exists for that email address.');
    const token = Math.random().toString(36).slice(2, 8).toUpperCase();
    try {
      localStorage.setItem(RESET_KEY, JSON.stringify({ email: normalized, token, at: Date.now() }));
    } catch {

      /* ignore */}
    return token;
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    await delay(320);
    let record: {email: string;token: string;} | null = null;
    try {
      record = JSON.parse(localStorage.getItem(RESET_KEY) ?? 'null');
    } catch {
      record = null;
    }
    if (!record) throw new Error('No password reset was requested. Start again from "Forgot password".');
    if (record.token !== token.trim().toUpperCase()) throw new Error('That reset code is not valid.');
    const accounts = readAccounts().map((a) => a.email === record?.email ? { ...a, password } : a);
    writeAccounts(accounts);
    try {
      localStorage.removeItem(RESET_KEY);
    } catch {

      /* ignore */}
  }, []);

  const continueWithGoogle = useCallback(async () => {
    await delay(420);
    const accounts = readAccounts();
    const email = 'demo@foundry.local';
    let account = accounts.find((a) => a.email === email);
    if (!account) {
      account = {
        id: 'usr_google_demo',
        email,
        name: 'Demo Analyst',
        password: Math.random().toString(36),
        createdAt: Date.now()
      };
      writeAccounts([...accounts, account]);
    }
    const session: AuthUser = { id: account.id, email: account.email, name: account.name, createdAt: account.createdAt };
    persistSession(session, true);
    setUser(session);
  }, []);

  const value = useMemo(
    () => ({ user, ready, signIn, signUp, signOut, requestReset, resetPassword, continueWithGoogle }),
    [user, ready, signIn, signUp, signOut, requestReset, resetPassword, continueWithGoogle]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}