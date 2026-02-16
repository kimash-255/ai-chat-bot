# Backend Docs

## Scope

- API routes under `src/pages/api/*`
- Authentication/session and role checks
- Messaging, memory, tenancy, datasets
- Hugging Face inference integration
- `database.md` describes where tables are created and how tenancy is activated

## Auth

- Session cookie: `app_session` (HttpOnly, SameSite=Strict)
- Admin login requires philosophy verification answer.
- Recovery flow is 4-step and includes friend-code verification.

## AI Provider

- Supported providers: `huggingface`, `groq`, `google`.
- Runtime model calls:
  - Hugging Face: `@huggingface/inference` (`InferenceClient`)
  - Groq: OpenAI-compatible chat completions endpoint
  - Google AI Studio: Gemini REST (`generateContent` / `embedContent`)
- Supported task handling in model adapter:
  - text generation
  - image/video generation payload forwarding
  - retrieval/vector-like extraction tasks
  - traditional ML task forwarding

## Install

- `npm install @huggingface/inference`

## Token

- Preferred: `HF_TOKEN`
- Also supported: `HUGGINGFACE_API_KEY`
