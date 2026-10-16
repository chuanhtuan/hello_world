import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { env } from '../../config/env';
import { signToken } from '../../utils/jwt';
import { Role } from '../../models/user.model';

// AC: feature-design.md §4 AC2 / testcases-it-st.md IT6.1, IT6.2
describe('POST /api/auth/logout', () => {
  it('IT6.1 - with a valid session cookie: returns 200 and a Set-Cookie header that clears it', async () => {
    const token = signToken({ id: 1, role: Role.USER });

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [`${env.cookieName}=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Logged out' });

    const setCookie = ([] as string[]).concat(res.headers['set-cookie'] as unknown as string | string[]);
    const cleared = setCookie.find((c) => c.startsWith(`${env.cookieName}=`));
    expect(cleared).toBeDefined();
    expect(cleared).toMatch(new RegExp(`^${env.cookieName}=;`));
    expect(cleared!.toLowerCase()).toMatch(/expires=thu, 01 jan 1970/);
  });

  it('IT6.2 - with no cookie at all: still returns 200 (idempotent)', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Logged out' });
  });
});
