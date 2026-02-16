# Deployment Guide

## Environment Variables

- `DATABASE_URL`: Postgres connection (optional but recommended)
- `REDIS_URL`: Redis connection (optional but recommended)
- `AUTH_SECRET`: Session signing secret
- `AUTH_PEPPER`: Password hashing pepper
- `UPLINK_MASTER_KEY`: Attachment encryption key material
- `DATASET_DUMP_KEY`: Dataset dump encryption key
- `HF_TOKEN`: Hugging Face token for `@huggingface/inference`
- `HUGGINGFACE_API_KEY`: Hugging Face Inference API key
- `GROQ_API_KEY`: Groq API key
- `GOOGLE_AI_STUDIO_API_KEY` or `GEMINI_API_KEY`: Google AI Studio key

## Production Notes

1. Set all secrets before deploy.
2. Run behind HTTPS only.
3. Set secure cookie policy defaults (`NODE_ENV=production`).
4. Configure monitoring/alerts for auth and API errors.
5. Ensure Postgres backup and Redis persistence strategy.
6. Persist the `logs/` directory or ship it to centralized log storage.

## Seeded Admin

- Admin account can be seeded by auth bootstrap logic.
- Change admin credentials immediately after first deployment.
