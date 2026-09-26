import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/client';
import type { User } from '../api/client';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Email + password login. `remember` controls session length (see backend utils/session.ts). */
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  /** Self sign-up: name + email only. Does NOT log the user in - an activation email is sent instead. */
  signup: (name: string, email: string) => Promise<string>;
  /** Google Identity Services credential (ID token) -> sign up or log in. */
  loginWithGoogle: (credential: string, remember: boolean) => Promise<void>;
  /** Sets the password for a pending account and logs the user in. */
  activateAccount: (token: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistSession(token: string, user: User) {
  // The token itself always carries its own expiry (short by default,
  // long when "Remember me" is checked) - see backend utils/jwt.ts -
  // so storing it here doesn't override that server-side decision.
  localStorage.setItem('token', token);
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    try {
      const { data } = await api.get('/users/me');
      setUser(data.user);
    } catch {
      setUser(null);
      localStorage.removeItem('token');
    }
  }

  useEffect(() => {
    refreshProfile().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string, remember: boolean) {
    const { data } = await api.post('/auth/login', { email, password, remember });
    setUser(persistSession(data.token, data.user));
  }

  async function signup(name: string, email: string): Promise<string> {
    const { data } = await api.post('/auth/signup', { name, email });
    return data.message as string;
  }

  async function loginWithGoogle(credential: string, remember: boolean) {
    const { data } = await api.post('/auth/google', { credential, remember });
    setUser(persistSession(data.token, data.user));
  }

  async function activateAccount(token: string, password: string) {
    const { data } = await api.post(`/auth/activate/${token}`, { password });
    setUser(persistSession(data.token, data.user));
  }

  async function logout() {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, loginWithGoogle, activateAccount, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
