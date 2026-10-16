// Test-only env defaults so importing modules that read `env.ts` (e.g.
// anything that pulls in `utils/jwt.ts`) doesn't throw "Missing required
// environment variable" when run under Vitest. Never read real secrets
// here - these are dummy values, not connected to any real DB/SMTP.
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
// Unconditional, not `?? fallback`: tests sign real JWTs (see
// auth.logout.it.test.ts) - if an ambient JWT_SECRET from the shell/CI env
// leaked in here, a test could mint a token valid against a real secret.
process.env.JWT_SECRET = 'test-secret-do-not-use-in-prod';
process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
process.env.DB_NAME = process.env.DB_NAME ?? 'hello_world_test';
process.env.DB_USER = process.env.DB_USER ?? 'test';
