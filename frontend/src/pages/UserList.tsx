import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { User } from '../api/client';

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN'>('USER');
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.users);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Delete failed');
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreateMessage(null);
    setCreating(true);
    try {
      const { data } = await api.post('/users', { name: newName, email: newEmail, role: newRole });
      setUsers((prev) => [data.user, ...prev]);
      setCreateMessage(`Invited ${data.user.email} - they'll get an activation email to set their password.`);
      setNewName('');
      setNewEmail('');
      setNewRole('USER');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to create user');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Users</h1>
        <button onClick={() => setShowCreate((v) => !v)}>{showCreate ? 'Cancel' : 'New user'}</button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="form inline-form">
          <label>
            Name
            <input required value={newName} onChange={(e) => setNewName(e.target.value)} />
          </label>
          <label>
            Email
            <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </label>
          <label>
            Role
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as 'USER' | 'ADMIN')}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <button type="submit" disabled={creating}>{creating ? 'Sending invite...' : 'Send invite'}</button>
          {createMessage && <p className="success">{createMessage}</p>}
        </form>
      )}

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Provider</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><Link to={`/users/${u.id}`}>{u.name}</Link></td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <span className={`badge badge-${u.status.toLowerCase()}`}>{u.status}</span>
                </td>
                <td>{u.provider}</td>
                <td>
                  <button onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
