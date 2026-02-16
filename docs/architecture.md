# Architecture

## Core Areas

1. Authentication and sessions
- Local credential auth only (`/api/auth/*`)
- Admin verification challenge for admin account login
- Session cookie with signed token
- No forced client inactivity timeout

2. Tenancy and data isolation
- User tenant activation on register/login
- Tenant schema provisioning for Postgres when configured
- User-scoped memory keys and dataset ownership

3. Messaging
- Thread/message APIs (`/api/messages/*`)
- Keyboard-first UX (`Enter` send, `Shift+Enter` newline)
- Uplink attachments with view-once option
- Encrypted payload envelopes and compressed upload payloads

4. AI orchestration
- Orchestrator pipeline in `src/core/orchestrator/*`
- Hugging Face provider config managed in admin
- Runtime model calls use Hugging Face Inference API

5. Admin
- Provider config management
- Analytics and sandbox testing endpoints
- Dataset encrypted dump generation
