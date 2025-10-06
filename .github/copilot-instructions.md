## Quick orientation

This repo contains three primary components:
- `mobile/` — Expo (React Native) app (file-based routing in `mobile/app/`). Key files: `mobile/app/_layout.tsx`, `mobile/constants/netvar.ts`, `mobile/constants/contexts/*`.
- `server/` — Flask API + ML integration. Main runtime lives in `server/main.py` and `server/app.py` (Flask app factory). DB config in `server/config.py` and dependencies in `server/requirements.txt`.
- `web/` — React + Vite admin dashboard (`web/src/`).

Read these files first for the contract and naming conventions: `server/main.py` (routes & handlers), `mobile/constants/netvar.ts` (API host discovery), and `mobile/constants/contexts/AdminSQLContext.tsx` (how frontend calls the API).

## Big-picture data flow (explicit)
- User creates a report in the mobile app -> mobile sends multipart/form-data POST with a `report` JSON string + one file key (`video` or `image`) to the Flask API endpoints:
  - `/reports/upload/video` or `/reports/upload/image` (see `server/main.py`).
- Server stores raw blobs in MySQL table `media_storage` (BLOB) via `add_media_file` and creates a row in `preverified_reports`.
- Background thread `start_background_verification` (in `server/main.py`) loads the Hermes TF model and periodically processes unverified `preverified_reports`. It writes results to `postverified_reports` and updates `preverified_reports`.
- Mobile subscribes to server-sent events at `/notifications/stream` and shows notifications using Expo Notifications (see `mobile/app/_layout.tsx`).

## API & payload conventions (must-follow)
- Many endpoints use POST for read/update/delete (not strictly RESTful). Example routes in `server/main.py`:
  - `/user/get/one` expects JSON {"UA_user_id": number}
  - `/user/add`, `/user/update`, `/user/delete` expect JSON with fields named exactly as DB columns (e.g. `UA_username`, `UA_password`, `UA_user_role`).
  - Upload endpoints expect multipart/form-data with:
    - `report` field: a JSON string (report metadata) and
    - exactly one file field: `video` or `image`.
- Responses often return Flask Response/JSON tuples (object, status_code). Handlers sometimes return raw dicts — check the caller for expected shape.

## Important code patterns & conventions
- DB access uses Flask-MySQL (MySQL connector) and raw SQL strings (see `server/main.py`). Expect direct cursor.execute(...) usage and manual commit/close handling.
- Background verification is implemented as a daemon thread inside `server/main.py` using `HermesModel` from `server/model/src/inference.py`. Model artifacts live under `server/model/models/deployed/`.
- Frontend caching/merge pattern: AdminSQLContext builds a typed `AdminSQLState` and exposes `fetchX()` + `combineReports()` which merges `preverifiedReports` and `postverifiedReports` into CombinedReport arrays. Use these methods when modifying API shape to keep front-end compatibility.
- Network constants: mobile reads `SERVER_LINK` from Expo extra config (set in `mobile/app.json` -> `expo.extra.SERVER_LINK`) and `mobile/constants/netvar.ts` exports it. When changing server host for dev, update `app.json` or use Expo runtime vars.

## Developer workflows (how to run & debug)
- Mobile (Windows cmd.exe):
  ```cmd
  cd mobile
  npm install
  npx expo start
  ```
  - To change API host used by the app, edit `mobile/app.json` -> `expo.extra.SERVER_LINK` or set Expo environment overrides.

- Server (recommended virtualenv, Windows cmd.exe):
  ```cmd
  cd server
  python -m venv .venv
  .venv\Scripts\activate
  pip install -r requirements.txt
  python main.py
  ```
  - Default server host/port in `main.py` is `0.0.0.0:5821`. Update `server/config.py` for MySQL credentials (defaults are local MySQL). The project expects a MySQL DB named `apollo_system` matching SQL scripts in `sql/`.

- Web dashboard (dev):
  ```cmd
  cd web
  npm install
  npm run dev
  ```

## Tests & linting
- Mobile ships a Jest preset (`package.json` has `jest: jest-expo`). No server tests are provided. Use `npm run test` inside `mobile/` for frontend tests.

## Safety checks for code edits (agent rules)
- Before changing an API path or request/response shape, update both `server/main.py` and all frontend callers in `mobile/components/*` and `web/src/*` (search for `SERVER_LINK` usages or endpoint strings).
- Prefer changing/adding new endpoints over mutating existing endpoint payloads to avoid breaking clients.
- When modifying DB schema, list the exact SQL changes and update `sql/` migration files. If you change a table name or column, update all raw SQL queries in `server/main.py` and any references in `mobile`/`web`.

## Useful file pointers (start here)
- API surface & behavior: `server/main.py` (handlers + route definitions)
- Flask app factory & MySQL init: `server/app.py` and `server/config.py`
- Background ML verification: search for `start_background_verification` in `server/main.py` and `HermesModel` in `server/model/`.
- Client base URL & runtime flags: `mobile/constants/netvar.ts` and `mobile/app.json` (expo.extra.SERVER_LINK)
- Frontend data fetching pattern: `mobile/constants/contexts/AdminSQLContext.tsx`

---
If anything here is unclear or you want more fine-grained guidance (examples of request payloads, table schemas, or a suggested small refactor to make agents safer), tell me which area and I'll expand or adjust this file.
