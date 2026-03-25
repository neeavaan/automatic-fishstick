### Project Overview

Local-only CSV ingestion → database → Excel export application. Runs in a single Docker container. No authentication. Mobile-first design.

### User Stories

All user stories with epics and acceptance criteria are in `.github/user-stories.md`. Before starting work on any feature or fix:

1. Open `.github/user-stories.md` alongside your working files so Copilot has the acceptance criteria in context.
2. Identify the relevant user story and work only within its scope.
3. Update the story's status in the Progress Tracker table and the individual Status field.
4. Reference the story in your commit message: `Ref: US-03`.

### Technology Stack

#### Frontend

| Concern | Technology |
|---|---|
| Framework | React 18+ with TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS (mobile-first breakpoints) |
| UI components | shadcn/ui (Radix + Tailwind, copied into `src/components/ui/`) |
| Data table | TanStack Table (headless) |
| Data fetching | TanStack Query for all API calls |
| Forms / validation | React Hook Form + Zod |
| CSV parsing | PapaParse |
| Layout | Tab-based single-page app (Upload, Review, Export) — no router |

#### Backend

| Concern | Technology |
|---|---|
| Framework | Fastify with TypeScript |
| Database | SQLite via `better-sqlite3` |
| Excel generation | `exceljs` |
| Migrations | Run on startup, tracked in a migrations table |

#### Container

| Concern | Detail |
|---|---|
| Dev | Vite dev server (frontend) + Fastify (API), volume-mounted `src/` for hot reload |
| Prod | Vite builds static assets, Fastify serves them and handles API |
| DB persistence | SQLite file volume-mounted at `/data/app.db` |
| Single command | `docker compose up` starts everything |

#### Architecture

```
Browser (React SPA — tab layout)
  ├── Upload tab → POST /api/upload (multipart CSV)
  ├── Review tab → GET /api/records?page=&filter=&sort=
  └── Export tab → GET /api/export (returns .xlsx download)
        │
  Fastify API (TypeScript)
        │
  SQLite (/data/app.db — volume-mounted)
```

#### Key Libraries — Do Not Substitute

These are the agreed project dependencies. Do not replace them with alternatives unless explicitly discussed:

- `react`, `react-dom` — UI framework
- `tailwindcss` — styling
- `@radix-ui/*` — accessible primitives (via shadcn/ui)
- `@tanstack/react-table` — data table
- `@tanstack/react-query` — data fetching
- `react-hook-form`, `zod` — forms and validation
- `papaparse` — CSV parsing
- `fastify` — backend API
- `better-sqlite3` — database
- `exceljs` — Excel export
- `clsx`, `tailwind-merge` — conditional class composition (`cn()` helper)
- `vitest` — test runner
- `@testing-library/react` — component testing

### Path-Specific Instructions

Detailed coding standards, behavioral rules, and conventions are in `.github/instructions/`. These are automatically applied by Copilot based on the file you are working on.
