import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { api } from '../../api/client';
import { AuthProvider } from '../../context/AuthContext';
import { API_BASE } from '../../test/msw-handlers';
import { server } from '../../test/msw-server';
import { Navbar } from '../Navbar';

// Theo contracts/auth-contracts.md + user-contracts.md (PublicUser shape).
const authedUser = {
  id: 1,
  name: 'Jane Doe',
  email: 'jane@example.com',
  avatarUrl: null,
  role: 'USER',
  status: 'ACTIVE',
  provider: 'LOCAL',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

// Smoke test cho tooling Vitest + RTL + MSW ở FE — xác nhận pipeline
// chạy được trước khi Dev viết test L2 thật cho từng task qua
// `tdd-implement`. Trace: không gắn AC cụ thể, đây chỉ là bài kiểm tra
// hạ tầng test. MSW mock GET /users/me trả 401 (xem src/test/msw-handlers.ts)
// nên AuthProvider coi như chưa đăng nhập.
function renderNavbar() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </MemoryRouter>,
  );
}

// user đã đăng nhập: override GET /users/me, và render trong 1 Routes nhỏ
// có cả /login - để F06-01's điều hướng sau logout dùng router thật, chứ
// không mock useNavigate.
function renderAuthedNavbar() {
  server.use(http.get(`${API_BASE}/users/me`, () => HttpResponse.json({ user: authedUser })));
  return render(
    <MemoryRouter initialEntries={['/profile']}>
      <AuthProvider>
        <Routes>
          <Route path="/profile" element={<Navbar />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('Navbar', () => {
  // AC: feature-design.md §4 AC1 / testcases-ut.md UT6.2
  it('shows Login/Sign up links and no Logout button when no user is authenticated', async () => {
    renderNavbar();

    expect(await screen.findByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Profile' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
  });

  // AC: feature-design.md §4 AC1 / testcases-ut.md UT6.2
  it('shows the Logout button (and no Login link) when a user is authenticated', async () => {
    renderAuthedNavbar();

    expect(await screen.findByRole('button', { name: 'Logout' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
  });

  // AC: feature-design.md §4 AC2 / testcases-ut.md UT6.3
  it('clicking Logout calls POST /auth/logout then navigates to /login', async () => {
    server.use(http.post(`${API_BASE}/auth/logout`, () => HttpResponse.json({ message: 'Logged out' })));
    const postSpy = vi.spyOn(api, 'post');
    localStorage.setItem('token', 'fake-token');

    renderAuthedNavbar();

    await userEvent.click(await screen.findByRole('button', { name: 'Logout' }));

    expect(postSpy).toHaveBeenCalledWith('/auth/logout');
    expect(await screen.findByText('Login Page')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  // Logout must clear local session + navigate even if the server call
  // fails - a failed request must not leave the token in localStorage on
  // a shared/kiosk machine (AuthContext.logout / Navbar.handleLogout).
  it('clicking Logout still clears the token and navigates to /login when the request fails', async () => {
    server.use(http.post(`${API_BASE}/auth/logout`, () => new HttpResponse(null, { status: 500 })));
    localStorage.setItem('token', 'fake-token');

    renderAuthedNavbar();

    await userEvent.click(await screen.findByRole('button', { name: 'Logout' }));

    expect(await screen.findByText('Login Page')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
