import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';

export function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Reset failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page auth-page">
      <h1>Reset password</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          New password
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Set new password'}</button>
      </form>
      <p><Link to="/login">Back to login</Link></p>
    </div>
  );
}
