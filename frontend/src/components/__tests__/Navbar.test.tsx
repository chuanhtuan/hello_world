import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { Navbar } from '../Navbar';

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

describe('Navbar', () => {
  it('shows Login/Sign up links when no user is authenticated', async () => {
    renderNavbar();

    expect(await screen.findByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Profile' })).not.toBeInTheDocument();
  });
});
