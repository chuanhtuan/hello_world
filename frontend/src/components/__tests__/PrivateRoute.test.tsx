import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { PrivateRoute } from '../PrivateRoute';

// AC: feature-design.md §4 AC3 / testcases-ut.md UT6.4
// `user=null` ở đây dùng chung cho cả 2 case "chưa đăng nhập" và "vừa
// logout" - với PrivateRoute, cả 2 là cùng 1 trạng thái AuthContext (xem
// msw-handlers.ts: GET /users/me mock trả 401 mặc định).
describe('PrivateRoute', () => {
  it('redirects to /login and does not render the child route when user is null', async () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route element={<PrivateRoute />}>
              <Route path="/protected" element={<div>Protected Content</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
