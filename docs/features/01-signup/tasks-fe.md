# Tasks FE — Signup

| ID | Task | Input | Output | Trace |
|---|---|---|---|---|
| F01-00 | Setup Vitest + `@testing-library/react` + `@testing-library/user-event` cho `frontend` (`vitest.config.ts`, script `npm test`, `jsdom` env) | `docs/plan/research.md` §2.5 | Chạy được `npm test` (rỗng, chưa có test case) | constraints.md §Task ID |
| F01-01 | Component test `Signup.tsx`: mock `useAuth()` (hoặc mock `api/client`), cover toàn bộ case ở `testcases-ut.md` | `testcases-ut.md` | File `Signup.test.tsx` cạnh `Signup.tsx`, tất cả case pass | spec.md US1.1-US1.3 |

**Không có task F02–F04** cho feature này — không có component mới, không
có refactor UI cần thiết.
