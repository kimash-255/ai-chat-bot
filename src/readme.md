
npm install redis
npm install @prisma/client
npm install -D prisma
npx prisma init --datasource-provider postgresql


CONNECT EXISTING DATABASE:
  1. Configure your DATABASE_URL in prisma.config.ts
  2. Run prisma db pull to introspect your database.

CREATE NEW DATABASE:
  Local: npx prisma dev (runs Postgres locally in your terminal)
  Cloud: npx create-db (creates a free Prisma Postgres database)

Then, define your models in prisma/schema.prisma and run prisma migrate dev to apply your schema.

Learn more: https://pris.ly/getting-started


---

# ✅ Full File Layout (`src/`)

```text
src/
├── pages/
│   ├── _app.js
│   ├── _document.js
│   ├── index.js
│   ├── chat.js
│   └── api/
│       └── chat.js
│
├── core/
│   ├── orchestrator/
│   │   ├── index.js
│   │   ├── input.js
│   │   ├── policy.js
│   │   ├── memory.js
│   │   ├── prompt.js
│   │   ├── routing.js
│   │   ├── output.js
│   │   └── persist.js
│   │
│   ├── models/
│   │   ├── index.js
│   │   ├── openai.js
│   │   ├── anthropic.js
│   │   ├── mistral.js
│   │   └── local.js
│   │
│   ├── memory/
│   │   ├── short/
│   │   │   ├── index.js
│   │   │   └── redis.js
│   │   │
│   │   └── long/
│   │       ├── index.js
│   │       ├── retrieval.js
│   │       └── summarization.js
│   │
│   ├── prompts/
│   │   ├── system.js
│   │   ├── personas.js
│   │   └── tools.js
│   │
│   └── types/
│       ├── message.js
│       ├── model.js
│       └── memory.js
│
├── lib/
│   ├── env.js
│   ├── logger.js
│   ├── stream.js
│   └── utils.js
│
├── db/
│   ├── fast/       # Redis helpers or connection code
│   └── deep/       # Postgres or vector DB helpers
│
├── scripts/
│   ├── summarize.js
│   └── embed.js
│
└── middleware.js
```

---

### ✅ Notes / Guidance

1. **`pages/`** → only transport

   * `_app.js`, `_document.js`, `index.js` → app wrapper / landing page
   * `chat.js` → chat UI entry point
   * `api/chat.js` → single serverless endpoint → calls orchestrator

2. **`core/orchestrator/`** → AI brain

   * `index.js` → main entry function
   * `input.js` → sanitize + validate
   * `policy.js` → anti-corruption / rules
   * `memory.js` → orchestrates short & deep memory fetch/store
   * `prompt.js` → build the prompt array
   * `routing.js` → fan-out to multiple models
   * `output.js` → validate model output
   * `persist.js` → decide what to write to memory

3. **`core/models/`** → unified model interface

   * Each file handles **one provider**
   * `index.js` exports `callModel()` and registry

4. **`core/memory/`** → memory access layer

   * `short/` → Redis / fast memory
   * `long/` → Postgres / deep memory
   * `retrieval.js` → RAG / vector search
   * `summarization.js` → compress deep memory

5. **`core/prompts/`** → immutable prompts

   * `system.js` → fixed system instructions
   * `personas.js` → optional personalities
   * `tools.js` → tool instructions or rules

6. **`core/types/`** → optional runtime contracts (JS objects only)

7. **`lib/`** → helpers

   * `env.js` → environment variables validation
   * `logger.js` → console/file logging
   * `stream.js` → streaming utilities for model responses
   * `utils.js` → misc helpers

8. **`db/`** → database connection helpers (you’ll implement later)

9. **`scripts/`** → background jobs

   * Summarization, embedding, periodic tasks

10. **`middleware.js`** → auth / rate-limiting / security

---

# Cannonical Tags

| Tag                   | Description / Usage                                                           |
| --------------------- | ----------------------------------------------------------------------------- |
| `chat`                | General conversation, Q&A, casual dialogue                                    |
| `refine_prompt`       | Prompt refinement, rewriting, or cleaning before sending to downstream models |
| `summarize`           | Summarization of long text or conversation history                            |
| `code`                | Coding, code explanation, debugging, generation                               |
| `embed`               | Embedding generation for semantic search / RAG                                |
| `classify`            | Classification tasks (sentiment, labeling, tagging)                           |
| `translate`           | Language translation tasks                                                    |
| `multimodal`          | Image + text or multimodal input processing                                   |
| `knowledge_retrieval` | RAG / memory retrieval / query over vector DB                                 |
| `system_instruction`  | System-level instructions / admin operations                                  |
| `tool_call`           | External tool invocation (like calculators, web search, API call)             |

---

