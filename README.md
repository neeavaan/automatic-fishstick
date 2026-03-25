# Automatic Fishstick

Local-only CSV ingestion → database → Excel export application. Built with React, TypeScript, Tailwind CSS, Fastify, and SQLite. Runs entirely in Docker.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Docker Engine 20+ with Compose V2)
- Git

No local Node.js installation required — everything runs inside the container.

## Getting Started

```bash
git clone https://github.com/neeavaan/automatic-fishstick.git
cd automatic-fishstick
docker compose up
```

The app will be available at **http://localhost:3000** (frontend) with the API at **http://localhost:3000/api**.

## Development

### Dev Mode

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: Vite dev server with hot module replacement — changes to `src/` reflect in 1–2 seconds
- Backend: Fastify with watch mode — API changes restart automatically
- Database: SQLite file at `/data/app.db`, volume-mounted for persistence across restarts

### Rebuilding

Hot reload handles most changes. Rebuild the container when:

- Dependencies change (`package.json`)
- Dockerfile is modified
- Docker Compose config is modified

```bash
docker compose -f docker-compose.dev.yml up --build
```

### Database Reset

To wipe all data and start fresh:

```bash
docker compose down -v
docker compose -f docker-compose.dev.yml up
```

The `-v` flag removes the volume containing the SQLite database.

### Production Build

```bash
docker compose up --build
```

Vite builds static assets, Fastify serves them and handles the API. Single container, single command.

## Project Structure

```
├── .github/
│   ├── copilot-instructions.md          # Repo-wide Copilot context
│   ├── user-stories.md                  # User stories with acceptance criteria
│   └── instructions/                    # Path-scoped Copilot instruction files
│       ├── branch-strategy.instructions.md
│       ├── typescript.instructions.md
│       ├── tailwind.instructions.md
│       ├── backend.instructions.md
│       └── copilot-behavior.instructions.md
├── src/                                 # Frontend source (React/TS/Tailwind)
│   ├── components/
│   │   └── ui/                          # shadcn/ui components
│   ├── hooks/                           # Custom React hooks
│   └── utils/                           # Shared utilities
├── backend/                             # Backend source (Fastify/TS)
│   ├── routes/                          # API route handlers
│   ├── db/                              # Database access and migrations
│   └── migrations/                      # SQL migration files
├── Dockerfile
├── docker-compose.yml                   # Production compose
├── docker-compose.dev.yml               # Development compose with hot reload
└── README.md
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18+, TypeScript, Vite, Tailwind CSS |
| UI Components | shadcn/ui (Radix + Tailwind) |
| Data Table | TanStack Table |
| Data Fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| CSV Parsing | PapaParse |
| Backend | Fastify, TypeScript |
| Database | SQLite (better-sqlite3) |
| Excel Export | exceljs |
| Testing | Vitest, @testing-library/react |

## Workflow

1. Read `.github/user-stories.md` — pick a story, check its acceptance criteria
2. Create a branch: `git checkout -b feature/us-03-csv-file-upload`
3. Open `.github/user-stories.md` alongside your working files so Copilot has context
4. Develop and test locally in the dev container
5. Update the story status in `.github/user-stories.md`
6. Commit with conventional commits: `feat(upload): add CSV file picker` + `Ref: US-03`
7. Merge to `main`, push, delete the branch

See `.github/instructions/branch-strategy.instructions.md` for full details.
