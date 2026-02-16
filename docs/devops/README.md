# DevOps Docs

## Scope

- deployment variables
- database and redis runtime setup
- logs and operational files

## Required Environment

- `DATABASE_URL`
- `REDIS_URL`
- `AUTH_SECRET`
- `AUTH_PEPPER`
- `UPLINK_MASTER_KEY`
- `DATASET_DUMP_KEY`
- `HUGGINGFACE_API_KEY` (or provider `api_key_ref` env variable)

## Logs

- App logs: `logs/app/YYYY-MM-DD/HH.log`
- Access logs: `logs/access/YYYY-MM-DD/HH.log`
- Activity logs: `logs/activity/YYYY-MM-DD/HH.log`
- Error tag index: `logs/error-tags.json`
- Auth fallback store (non-DB mode): `logs/auth-store.json`
- Log output is file-based and timestamped.
- No console output is used by the central logger.
