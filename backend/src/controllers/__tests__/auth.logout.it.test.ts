import { describe, expect, it } from 'vitest';
import request, { Response } from 'supertest';
import app from '../../app';
import { env } from '../../config/env';
import { signToken } from '../../utils/jwt';
import { Role } from '../../models/user.model';

// supertest/superagent types `set-cookie` as a single string, but Node's
// raw headers give one entry per Set-Cookie line - normalize to an array
// either way instead of casting through `unknown`.
function getSetCookies(res: Response): string[] {
  const header = res.headers['set-cookie'];
  if (!header) return [];
  return Array.isArray(header) ? header : [header];
}

// AC: feature-design.md §4 AC2 / testcases-it-st.md IT6.1, IT6.2
describe('POST /api/auth/logout', () => {
  it('IT6.1 - with a valid session cookie: returns 200 and a Set-Cookie header that clears it', async () => {
    const token = signToken({ id: 1, role: Role.USER });

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [`${env.cookieName}=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Logged out' });

    const cleared = getSetCookies(res).find((c) => c.startsWith(`${env.cookieName}=`));
    expect(cleared).toBeDefined();
    expect(cleared).toMatch(new RegExp(`^${env.cookieName}=;`));
    const lowered = cleared!.toLowerCase();
    expect(lowered).toMatch(/expires=thu, 01 jan 1970/);
    expect(lowered).toMatch(/samesite=lax/);
  });

  it('IT6.2 - with no cookie at all: still returns 200 (idempotent)', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Logged out' });
  });
});
