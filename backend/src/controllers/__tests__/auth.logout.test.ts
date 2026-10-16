import { describe, expect, it, vi } from 'vitest';
import { Request, Response } from 'express';
import { env, isProd } from '../../config/env';
import { logout } from '../auth.controller';

// AC: feature-design.md §4 AC2 / testcases-ut.md UT6.1
describe('auth.controller logout', () => {
  it('clears the session cookie with the same options used when setting it and returns 200', async () => {
    const req = {} as Request;
    const res = {
      clearCookie: vi.fn(),
      json: vi.fn(),
    } as unknown as Response;

    await logout(req, res, vi.fn());

    expect(res.clearCookie).toHaveBeenCalledTimes(1);
    expect(res.clearCookie).toHaveBeenCalledWith(env.cookieName, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
    });
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
  });

  it('clears the cookie and returns 200 even when the request has no cookie at all', async () => {
    const req = { cookies: {} } as unknown as Request;
    const res = {
      clearCookie: vi.fn(),
      json: vi.fn(),
    } as unknown as Response;

    await logout(req, res, vi.fn());

    expect(res.clearCookie).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
  });
});
