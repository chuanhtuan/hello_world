import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password, remember);
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSuccess(credential: string) {
    setError(null);
    try {
      await loginWithGoogle(credential, remember);
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Google sign-in failed');
    }
  }

  return (
    <div className="page auth-page">
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Logging in...' : 'Log in'}</button>
      </form>

      <div className="divider"><span>or</span></div>

      <div className="google-button-wrap">
        <GoogleLogin
          onSuccess={(res) => res.credential && handleGoogleSuccess(res.credential)}
          onError={() => setError('Google sign-in failed')}
          useOneTap={false}
        />
      </div>

      <p><Link to="/forgot-password">Forgot password?</Link></p>
      <p>No account? <Link to="/signup">Sign up</Link></p>
    </div>
  );
}
