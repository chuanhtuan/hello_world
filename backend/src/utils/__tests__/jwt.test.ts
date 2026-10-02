import { describe, expect, it } from 'vitest';
import { Role } from '../../models/user.model';
import { signToken, verifyToken } from '../jwt';

// Smoke test cho tooling Vitest (code UT, white-box) — xác nhận pipeline
// chạy được trước khi Dev viết test thật cho từng task qua `tdd-implement`.
// Trace: không gắn AC cụ thể, đây chỉ là bài kiểm tra hạ tầng test.
describe('jwt utils', () => {
  it('signs a token and verifies it back to the same payload', () => {
    const payload = { id: 42, role: Role.USER };

    const token = signToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.id).toBe(42);
    expect(decoded.role).toBe('USER');
  });

  it('throws when verifying a tampered/invalid token', () => {
    expect(() => verifyToken('not-a-real-token')).toThrow();
  });
});
