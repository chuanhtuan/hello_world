import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

type CheckState = 'checking' | 'valid' | 'invalid';

export function ActivateAccount() {
  const { token } = useParams<{ token: string }>();
  const { activateAccount } = useAuth();
  const navigate = useNavigate();

  const [checkState, setCheckState] = useState<CheckState>('checking');
  const [invalidMessage, setInvalidMessage] = useState('');
  const [name, setName] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .get(`/auth/activate/${token}`)
      .then(({ data }) => {
        setName(data.name);
        setCheckState('valid');
      })
      .catch((err) => {
        setInvalidMessage(err.response?.data?.message ?? 'This activation link is invalid or has expired.');
        setCheckState('invalid');
      });
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await activateAccount(token, password);
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Activation failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (checkState === 'checking') {
    return <div className="page auth-page">Checking activation link...</div>;
  }

  if (checkState === 'invalid') {
    return (
      <div className="page auth-page">
        <h1>Activation link invalid</h1>
        <p className="error">{invalidMessage}</p>
        <p><Link to="/login">Back to login</Link></p>
      </div>
    );
  }

  return (
    <div className="page auth-page">
      <h1>Welcome, {name}</h1>
      <p className="hint">Set a password to activate your account.</p>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Password
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Activating...' : 'Activate account'}</button>
      </form>
    </div>
  );
}
