import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './msw-server';

// MSW: chặn mọi HTTP call thật ra ngoài trong lúc test (api.ts gọi tới
// http://localhost:4000/api/...) — theo đúng convention "Vitest + RTL +
// MSW" đã định trong tdd-implement. Test nào gọi request chưa có handler
// sẽ FAIL rõ ràng (onUnhandledRequest: 'error'), không âm thầm pass giả.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// vitest.config.ts không bật `test.globals`, nên RTL không tự nhận ra
// `afterEach` toàn cục để auto-cleanup DOM giữa các test (xem RTL docs:
// auto-cleanup chỉ hoạt động khi phát hiện global test framework). Thiếu
// dòng này, nhiều `it()` trong cùng 1 file sẽ render chồng DOM lên nhau.
afterEach(() => cleanup());

// Test nào set token (VD giả lập đã đăng nhập) mà fail trước khi tự xoá sẽ
// làm localStorage rò sang test sau trong cùng file - dọn sau mỗi test.
afterEach(() => localStorage.clear());
