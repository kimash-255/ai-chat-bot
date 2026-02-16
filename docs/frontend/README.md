# Frontend Docs

## Scope

- Next.js pages and component composition.
- Messaging-first chat UX with collapsible panes.
- Auth gate behavior and role routing (`user` vs `admin`).

## Key Routes

- `/login`, `/register`, `/forgot-password`
- User-scoped: `/:userId/dashboard`, `/:userId/chat`, `/:userId/datasets`, `/:userId/tools`, `/:userId/models`, `/:userId/tags`, `/:userId/prompts`, `/:userId/settings`
- Admin-scoped: `/admin/dashboard` (plus `/admin/*` scoped aliases)

## UX Notes

- No forced inactivity auto-logout in client.
- Composer supports `Enter` to send and `Shift+Enter` for newline.
- Emoji quick actions are available in chat and direct-message input.
