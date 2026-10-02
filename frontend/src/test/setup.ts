import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './msw-server';

// MSW: chặn mọi HTTP call thật ra ngoài trong lúc test (api.ts gọi tới
// http://localhost:4000/api/...) — theo đúng convention "Vitest + RTL +
// MSW" đã định trong tdd-implement. Test nào gọi request chưa có handler
// sẽ FAIL rõ ràng (onUnhandledRequest: 'error'), không âm thầm pass giả.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
