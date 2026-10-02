import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:4000/api';

// Default handlers dùng chung cho smoke test — mock đúng theo
// contracts/auth-contracts.md. Test cụ thể cho từng task sẽ override
// bằng server.use(...) trong file test đó, không sửa file này.
export const handlers = [
  http.get(`${API_BASE}/users/me`, () => {
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }),
];
