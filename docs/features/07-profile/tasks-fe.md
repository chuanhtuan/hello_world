# Tasks FE — Profile

| ID | Task | Input | Output | Trace |
|---|---|---|---|---|
| F07-01 | Component test `Profile.tsx`: mock `useAuth()` + `api.post` avatar; verify hiển thị đúng badge status/provider, upload thành công gọi `refreshProfile`, upload lỗi hiển thị message giữ nguyên avatar cũ | `testcases-ut.md` | `Profile.test.tsx` | AC1, AC4, AC5 |
| F07-02 | Component test `EditProfile.tsx`: mock `api.put`; verify submit thành công điều hướng `/profile`, lỗi 409 hiển thị đúng, input giữ nguyên | `testcases-ut.md` | `EditProfile.test.tsx` | AC2, AC3 |
