import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export function Profile() {
  const { user, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshProfile();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="page">
      <h1>My profile</h1>
      <div className="profile-card">
        <div className="avatar-wrap">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="avatar" />
          ) : (
            <div className="avatar avatar-placeholder">{user.name.charAt(0).toUpperCase()}</div>
          )}
          <label className="avatar-upload">
            {uploading ? 'Uploading...' : 'Change avatar'}
            <input type="file" accept="image/*" hidden onChange={handleAvatarChange} disabled={uploading} />
          </label>
        </div>
        <dl>
          <dt>Name</dt>
          <dd>{user.name}</dd>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Role</dt>
          <dd>{user.role}</dd>
        </dl>
        {error && <p className="error">{error}</p>}
        <Link to="/profile/edit" className="button-link">Edit profile</Link>
      </div>
    </div>
  );
}
