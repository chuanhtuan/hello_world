import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { User } from '../api/client';

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/users/${id}`)
      .then(({ data }) => setUser(data.user))
      .catch((err) => setError(err.response?.data?.message ?? 'Failed to load user'));
  }, [id]);

  if (error) return <div className="page"><p className="error">{error}</p></div>;
  if (!user) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>{user.name}</h1>
      <div className="profile-card">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="avatar" />
        ) : (
          <div className="avatar avatar-placeholder">{user.name.charAt(0).toUpperCase()}</div>
        )}
        <dl>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Role</dt>
          <dd>{user.role}</dd>
          <dt>Joined</dt>
          <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
        </dl>
        <Link to="/users">Back to users</Link>
      </div>
    </div>
  );
}
