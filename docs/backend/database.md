# Database Location and Creation

## Where DB objects are created

- File: `src/core/auth/store.js`
  - `ensureTables()` creates:
    - `app_users`
    - `app_sessions`
    - `model_provider_configs`
- This runs automatically the first time auth/model store functions are called.

## Connection source

- File: `src/db/deep/postgres.js`
- Uses `DATABASE_URL`.
- If unavailable, runtime uses in-memory fallback maps (non-persistent).

## Tenant activation

- File: `src/core/tenancy/service.js`
- Called from auth flows to activate per-user tenant scope when Postgres is available.
