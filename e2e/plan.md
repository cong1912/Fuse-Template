# plan.md — Sửa bộ E2E Playwright (Fuse Admin) cho chạy được

> Mục tiêu (user): "kịch bản test cho UI … tôi muốn nó test được, nắm lỗi và fix hết".
> Đầu ra: `pnpm run test:e2e` → `auth.spec.ts` + `dashboard.spec.ts` **PASS** trên backend thật.
> Trạng thái: **PHASE 2 — CHỜ DUYỆT**. Chưa được viết thêm code.

---

## PHASE 1 — AUDIT (2026-10-07 19:32, chỉ đọc)

### Hiện trạng `git status` (repo `D:\Work\Fuse-Template`, chưa commit)
| File | Trạng thái | Đánh giá |
|---|---|---|
| `e2e/config/global-setup.ts` | M | **Đúng hướng**: login API → ghi JWT vào `origins[].localStorage` (`jwt_access_token`, `authService=jwt`) — khớp `useJwtAuth.tsx:11,206` và `AuthRouteProvider.tsx:107-112`. Chưa chạy kiểm chứng. |
| `playwright.config.ts` | M | **HỎNG**: `webServer.command` gọi `npm run build:e2e` — script **không tồn tại** trong `package.json`. |
| `e2e/pom/DashboardPage.ts` | M | Hợp lệ: `/dashboards/project` + text "Welcome back" (có tại `ProjectDashboardAppHeader.tsx:70`). |
| `e2e/tests/auth.spec.ts` | M | Dùng `button[type=submit]` + try/catch screenshot thủ công → nên dùng `screenshot: only-on-failure` trong config. |
| `e2e/tests/dashboard.spec.ts` | M | Đổi `navigate()`→`goto()` cho khớp `BasePage`. OK. |
| `e2e/pom/LoginPage.ts` | không đổi | Lần ghi trước bị hủy. Nút submit bị `disabled` tới khi form dirty+valid (`JwtSignInTab.tsx`) → cần chờ `toBeEnabled()`. |
| `vite.config.mts` | M | `port: 3001`, `open: false`, proxy → `127.0.0.1:5269`. Hợp lý. |
| `pnpm-lock.yaml` | M (~19.5k dòng) | ⚠️ **STOP GATE (dependencies)** — thay đổi không rõ nguồn gốc (không phải chủ ý của wave E2E). Cần quyết định giữ/hoàn tác. |
| `page.html`, `screenshot.png`, `test-failure.png`, `test-screenshot.cjs`, `test-results/`, `vite.config.mts.timestamp-*.mjs`, `e2e/.auth/` | ?? | Rác debug / artifact. Xóa = **STOP GATE (xóa file)**. `e2e/.auth/` chứa JWT → phải vào `.gitignore`. |

### Nguyên nhân lỗi đã xác định
1. **Môi trường (chặn tất cả)**: Docker Desktop dừng (`com.docker.service` = Stopped, start bị từ chối quyền) → SQL Server chết → `/api/auth/login` timeout → test kẹt ở `/sign-in`. *Cần người dùng bật Docker (quyền Admin).*
2. **Auth state sai cơ chế**: global-setup cũ chỉ lưu cookie, app đọc JWT từ localStorage → dashboard.spec chạy chưa đăng nhập. (Đã có bản sửa, chưa kiểm chứng.)
3. **Dev server Vite treo/nhảy port** (3000/3001/3002/5173) → `page.goto` timeout. Hướng: chạy bản build qua `vite preview --port 3001 --strictPort`.
4. **Login chậm lần đầu** (~5.7s, EF warm-up + BCrypt) → cần timeout ≥15s.

### Phụ thuộc / rủi ro
- Không đụng Auth logic của app (chỉ test). Không đụng DB schema. Không thêm dependency.
- `tsc` trong `npm run build` từng treo >1 phút → wave build dùng `vite build` cho E2E, ghi nhận `tsc` là việc riêng.

---

## PHASE 2 — PLAN (các Wave, file độc quyền)

### Wave 0 — Dọn nền & quyết định STOP GATE *(cần duyệt riêng)*
- **Quyết định A**: `pnpm-lock.yaml` → `git checkout -- pnpm-lock.yaml` (hoàn tác) **hoặc** giữ.
- **Quyết định B**: xóa rác debug: `page.html`, `screenshot.png`, `test-failure.png`, `test-screenshot.cjs`, `vite.config.mts.timestamp-*.mjs`, `test-results/`.
- File độc quyền: `.gitignore` (thêm `e2e/.auth/`, `test-results/`, `playwright-report/`, `test-failure.png`).
- Gate: `git status --short` chỉ còn file E2E chủ đích.

### Wave 1 — Hạ tầng test (không cần backend)
- File độc quyền: `playwright.config.ts`, `package.json` (**chỉ thêm script**, không thêm dependency).
  - `package.json`: thêm `"build:e2e": "vite build"`.
  - `playwright.config.ts`: `webServer` = `npm run build:e2e && npm run preview -- --port 3001 --strictPort`; `timeout 60s`, `expect 15s`, `workers 1`, `screenshot/trace/video on failure`, reporter `list + html`.
- Gate: `npx playwright test --list` liệt kê đủ 2 test, không lỗi config; `npx tsc --noEmit -p` cho thư mục e2e (nếu có tsconfig) hoặc Playwright tự transpile không lỗi.

### Wave 2 — Kịch bản test
- File độc quyền: `e2e/pom/LoginPage.ts`, `e2e/tests/auth.spec.ts` (global-setup.ts + DashboardPage.ts giữ nguyên bản audit).
  - LoginPage: `getByRole('button', { name: 'Sign in', exact: true })`, chờ `toBeEnabled()`, thêm `login()`.
  - auth.spec: bỏ try/catch screenshot thủ công; assert URL `/dashboards` + "Welcome back".
- Gate: `npx playwright test --list` OK.

### Wave 3 — Chạy thật trên backend *(phụ thuộc: Docker đã bật)*
- Không sửa file. Lệnh:
  1. `docker compose -f docker/docker-compose.yml --env-file docker/.env up -d` (repo e-commerce)
  2. `dotnet run --project src/ECommerce.API` → chờ listen `:5269`
  3. `pnpm run test:e2e`
- Gate: **2/2 PASS**. Nếu FAIL → quay lại `systematic-debugging`, cập nhật plan.md, không sửa mò.

### Wave 4 — Ship
- `git diff --stat` khớp danh sách file độc quyền của Wave 0–2.
- Đề xuất commit: `test(e2e): inject JWT via localStorage storageState and stabilise Playwright webServer`.

---

## Câu hỏi cần duyệt
1. Duyệt Wave 0–4 như trên?
2. STOP GATE A — `pnpm-lock.yaml`: **hoàn tác** (khuyến nghị) hay giữ?
3. STOP GATE B — được phép **xóa** các file rác debug liệt kê ở Wave 0?
4. Bạn bật Docker Desktop (quyền Admin) để mở khóa Wave 3?
