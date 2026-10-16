import { describe, expect, it, vi } from 'vitest';
import { Request, Response } from 'express';
import { env } from '../../config/env';
import { logout } from '../auth.controller';

function createRes() {
  return { clearCookie: vi.fn(), json: vi.fn() } as unknown as Response;
}

// AC: feature-design.md §4 AC2 / testcases-ut.md UT6.1
describe('auth.controller logout', () => {
  it('clears the session cookie with the same options used when setting it and returns 200', async () => {
    const req = {} as Request;
    const res = createRes();

    await logout(req, res, vi.fn());

    expect(res.clearCookie).toHaveBeenCalledTimes(1);
    // Literal `secure: false`, not re-derived from `isProd` like the
    // implementation does - asserting `secure: isProd` here would stay
    // green even if `clearSession` hardcoded `secure: false`. The
    // production case below proves the `secure: true` branch separately.
    expect(res.clearCookie).toHaveBeenCalledWith(env.cookieName, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
  });

  it('clears the cookie and returns 200 even when the request has no cookie at all', async () => {
    const req = { cookies: {} } as unknown as Request;
    const res = createRes();

    await logout(req, res, vi.fn());

    expect(res.clearCookie).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
  });

  it('sets secure:true when NODE_ENV=production', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    vi.resetModules();

    try {
      const { logout: prodLogout } = await import('../auth.controller');
      const { env: prodEnv } = await import('../../config/env');
      const res = createRes();

      await prodLogout({} as Request, res, vi.fn());

      expect(res.clearCookie).toHaveBeenCalledWith(prodEnv.cookieName, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
      vi.resetModules();
    }
  });
});
