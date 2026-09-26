import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export function Signup() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const responseMessage = await signup(name, email);
      setMessage(responseMessage);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Sign up failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSuccess(credential: string) {
    setError(null);
    try {
      // Google has already verified the email, so this both creates the
      // account (if new) and logs in immediately - no activation step.
      await loginWithGoogle(credential, false);
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Google sign-in failed');
    }
  }

  return (
    <div className="page auth-page">
      <h1>Sign up</h1>

      {message ? (
        <div className="profile-card">
          <p className="success">{message}</p>
          <Link to="/login">Back to login</Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Name
              <input required value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Email
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <p className="hint">
              We'll email you a link to set your password and activate your account - no password needed here.
            </p>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Create account'}</button>
          </form>

          <div className="divider"><span>or</span></div>

          <div className="google-button-wrap">
            <GoogleLogin
              onSuccess={(res) => res.credential && handleGoogleSuccess(res.credential)}
              onError={() => setError('Google sign-in failed')}
              useOneTap={false}
            />
          </div>
        </>
      )}

      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
