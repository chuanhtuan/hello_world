import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

// Attach the bearer token (fallback for browsers/dev setups where the
// httpOnly cookie set by the API isn't sent, e.g. cross-site requests).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}
