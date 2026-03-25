---
applyTo: "backend/**,api/**,server/**,**/routes/**,**/db/**"
---

# Backend Standards (Fastify + SQLite)

## Fastify

- Use TypeScript for all backend code.
- Define request/response schemas using Fastify's built-in JSON schema validation.
- Use async route handlers — never block the event loop.
- Group routes by concern: `routes/upload.ts`, `routes/records.ts`, `routes/export.ts`.

## SQLite (better-sqlite3)

- Database file lives at `/data/app.db` (volume-mounted for persistence).
- Use parameterized queries — never interpolate user input into SQL strings.
- Wrap multi-row inserts in transactions for performance.
- Use `INTEGER PRIMARY KEY` for auto-increment IDs.

## Migrations

- Migration scripts run automatically on startup.
- Track applied migrations in a `migrations` table.
- Re-running migrations on an already-initialized DB must be a no-op.
- Each migration file is named with a sequence number: `001-create-records.sql`.

## API Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/upload` | Accept multipart CSV, parse, validate, persist |
| `GET` | `/api/records` | Paginated, sortable, filterable record list |
| `DELETE` | `/api/records` | Clear all data (with confirmation from frontend) |
| `GET` | `/api/export` | Generate and return `.xlsx` file download |

## Error Responses

- Return consistent error shapes: `{ error: string, details?: unknown }`.
- Use appropriate HTTP status codes (400 for validation, 500 for server errors).
- Never expose stack traces or internal paths in responses.

## Excel Export

- Use `exceljs` to generate `.xlsx` files server-side.
- Column names, order, and formatting must match the output spec.
- Stream the file as a download response, do not write to disk.
