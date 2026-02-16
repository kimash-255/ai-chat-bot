# Canonical Architecture (`src/`)

This file is canonical for backend/core architecture.
Canonical UI route/component structure is documented in `src/components/readme.md`.

## Setup Notes

```bash
npm install redis
npm install @prisma/client
npm install -D prisma
npx prisma init --datasource-provider postgresql
```

Connect existing DB:
1. Configure `DATABASE_URL` in `prisma.config.ts`.
2. Run `prisma db pull`.

Create new DB:
1. Local: `npx prisma dev`
2. Cloud: `npx create-db`

Then define models in `prisma/schema.prisma` and run `prisma migrate dev`.

## Core Layout

```text
src/
  core/
    orchestrator/
      index.js
      input.js
      policy.js
      memory.js
      prompt.js
      routing.js
      output.js
      persist.js

    models/
      index.js
      huggingface.js

    memory/
      short/
        index.js
        redis.js
      long/
        index.js
        retrieval.js
        summarization.js

    prompts/
      system.js
      personas.js
      tools.js

    types/
      message.js
      model.js
      memory.js

  lib/
    env.js
    logger.js
    stream.js
    utils.js

  pages/
    api/
      chat.js
```

## Notes

1. `pages/` is transport-only. Feature pages stay in the nested route layout in `src/components/readme.md`.
2. `pages/api/chat.js` is the chat transport endpoint and calls the orchestrator.
3. `core/orchestrator/*` is the AI control flow (input, policy, memory, prompt, routing, output, persist).
4. `core/models/*` provides unified model adapters and routing.
5. `core/memory/*` splits short-term and long-term memory access.

## Canonical Tags

- `chat`
- `refine_prompt`
- `summarize`
- `code`
- `embed`
- `classify`
- `translate`
- `multimodal`
- `knowledge_retrieval`
- `system_instruction`
- `tool_call`
