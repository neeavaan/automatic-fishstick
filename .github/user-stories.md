## User Stories

### Progress Tracker

| Story | Title | Epic | Status |
|---|---|---|---|
| US-01 | Docker Container Bootstrap | E1 – Application Setup | Done |
| US-02 | Application Shell | E1 – Application Setup | Done |
| US-03 | CSV File Upload | E2 – CSV Ingestion | Done |
| US-04 | CSV Parsing and Preview | E2 – CSV Ingestion | Done |
| US-05 | CSV Validation | E2 – CSV Ingestion | Done |
| US-06 | Persist CSV Data to Database | E3 – Data Storage | Done |
| US-07 | Duplicate Handling | E3 – Data Storage | Done |
| US-08 | Clear / Reset Data | E3 – Data Storage | Done |
| US-09 | Browse Stored Records | E4 – Data Review | Done |
| US-10 | Search and Filter Records | E4 – Data Review | Done |
| US-11 | Export to Excel | E5 – Excel Export | Done |
| US-12 | Export Format Compliance | E5 – Excel Export | Done |
| US-13 | Export Confirmation and Feedback | E5 – Excel Export | Done |
| US-14 | GH Copilot Workspace Configuration | E6 – Developer Experience | Done |
| US-15 | Local Development Hot Reload | E6 – Developer Experience | Done |
| US-16 | Database Migration / Schema Init | E6 – Developer Experience | Done |
| US-17 | Mobile and Tablet Layout | E7 – Responsive Design | Done |
| US-18 | Responsive Data Table | E7 – Responsive Design | Done |
| US-19 | Responsive Export and Actions | E7 – Responsive Design | Done |

**Statuses:** `Not Started` | `In Progress` | `Done` | `Blocked`

---

### Epics Overview

| Epic | Description |
|---|---|
| **E1 – Application Setup** | Docker-based local environment, React/TS/Tailwind scaffold |
| **E2 – CSV Ingestion** | File upload, parsing, and validation |
| **E3 – Data Storage** | Persisting parsed data into a local database |
| **E4 – Data Review** | Viewing and managing stored records in the UI |
| **E5 – Excel Export** | Generating the expected Excel output |
| **E6 – Developer Experience** | GH Copilot workspace setup, tooling, and code quality |
| **E7 – Responsive Design** | Mobile and tablet optimized UI |

---

### E1 – Application Setup

#### US-01 – Docker Container Bootstrap

**Status:** `Done`

> As a user, I want to run the application locally using a single Docker command so that I don't need to install any runtime dependencies on my machine.

**Acceptance criteria:**
- `docker compose up` starts the application with no additional config
- App is accessible at `http://localhost:<port>` in the browser
- Container includes React frontend and database service

---

#### US-02 – Application Shell

**Status:** `Done`

> As a user, I want to see a clean, minimal UI layout when I open the app so that I can immediately understand the available actions.

**Acceptance criteria:**
- App renders a navigation/header area with the app name
- Main content area is visible with placeholder sections for Upload, Data View, and Export
- Tailwind styling applied consistently; responsive to common desktop viewports

---

### E2 – CSV Ingestion

#### US-03 – CSV File Upload

**Status:** `Done`

> As a user, I want to upload a CSV file via the UI so that the application can process its contents.

**Acceptance criteria:**
- Drag-and-drop and file picker (click-to-browse) are both supported
- Only `.csv` files are accepted; other formats show a validation error
- File name and size are shown after selection, before confirming upload

---

#### US-04 – CSV Parsing and Preview

**Status:** `Done`

> As a user, I want to see a preview of the parsed CSV data before saving it so that I can confirm the contents are correct.

**Acceptance criteria:**
- First N rows (e.g. 10) are displayed in a table with headers derived from the CSV
- Row count and column count are displayed
- If the CSV is malformed (missing headers, inconsistent columns), a clear error message is shown

---

#### US-05 – CSV Validation

**Status:** `Done`

> As a user, I want the application to validate the CSV structure against an expected schema so that only well-formed data is saved to the database.

**Acceptance criteria:**
- Required columns are checked; missing columns produce a named error per column
- Data type mismatches (e.g. text in a numeric field) are flagged with row/column references
- User can dismiss errors and re-upload a corrected file

---

### E3 – Data Storage

#### US-06 – Persist CSV Data to Database

**Status:** `Done`

> As a user, I want the parsed CSV data to be saved into a local database so that records are available for review and export after ingestion.

**Acceptance criteria:**
- Confirmed upload triggers an insert operation into the local DB
- A success message with the total records saved is shown
- Data persists across container restarts (volume-mounted DB file)

---

#### US-07 – Duplicate Handling

**Status:** `Done`

> As a user, I want the application to handle duplicate records gracefully so that re-uploading the same file doesn't create duplicate entries.

**Acceptance criteria:**
- Configurable strategy: skip duplicates, overwrite, or append
- User is informed how many records were skipped/overwritten
- The active strategy is clearly labeled in the UI

---

#### US-08 – Clear / Reset Data

**Status:** `Done`

> As a user, I want to clear all stored data from the database so that I can start fresh with a new dataset.

**Acceptance criteria:**
- A "Clear all data" action is available with a confirmation prompt
- On confirmation, all records are deleted and the record count resets to 0
- Action is reversible only by re-uploading the source CSV

---

### E4 – Data Review

#### US-09 – Browse Stored Records

**Status:** `Done`

> As a user, I want to view all records currently stored in the database so that I can verify the data before exporting.

**Acceptance criteria:**
- A paginated table displays all records with sortable columns
- Record count is displayed in the table header
- Empty state is shown with a prompt to upload a CSV when no data exists

---

#### US-10 – Search and Filter Records

**Status:** `Done`

> As a user, I want to search and filter the stored records so that I can quickly find specific entries.

**Acceptance criteria:**
- Free-text search filters visible rows in real time
- At least one column-level filter is available (dropdown or date range, depending on schema)
- Filters can be cleared individually or all at once

---

### E5 – Excel Export

#### US-11 – Export to Excel

**Status:** `Done`

> As a user, I want to export the stored data as an Excel file so that I can share it in the expected format.

**Acceptance criteria:**
- An "Export to Excel" button triggers a `.xlsx` file download
- The exported file matches the expected column layout and formatting spec
- Only currently filtered/visible records are exported if filters are active (or all records if no filter)

---

#### US-12 – Export Format Compliance

**Status:** `Done`

> As a user, I want the Excel export to conform to the predefined output template so that downstream consumers can process it without changes.

**Acceptance criteria:**
- Column names, order, and data types match the expected output spec exactly
- Date and number formatting in cells matches the target format
- Sheet is named correctly; no extra sheets or metadata tabs are included

---

#### US-13 – Export Confirmation and Feedback

**Status:** `Done`

> As a user, I want to see confirmation after the Excel file is generated so that I know the export completed successfully.

**Acceptance criteria:**
- A success notification is shown after the file download triggers
- If the database is empty, the export button is disabled with a tooltip explaining why
- Export errors (e.g. write failure) surface a descriptive error message

---

### E6 – Developer Experience

#### US-14 – GH Copilot Workspace Configuration

**Status:** `Done`

> As a developer, I want Copilot instruction files configured for the project stack so that Copilot suggestions are context-aware and consistent.

**Acceptance criteria:**
- `.github/copilot-instructions.md` contains repo-wide context: project overview, tech stack, and library list
- `.github/instructions/` contains path-scoped instruction files for TypeScript, Tailwind, backend, branch strategy, and Copilot behavior
- Instructions reference React, TypeScript, Tailwind, Fastify, SQLite, and all agreed libraries
- Instructions include naming conventions, component structure, and test patterns
- All instruction files are committed to the repository

---

#### US-15 – Local Development Hot Reload

**Status:** `Done`

> As a developer, I want the Docker container to support hot reload during development so that UI changes are reflected immediately without rebuilding the image.

**Acceptance criteria:**
- Volume mount maps `src/` into the container
- Vite (or equivalent) dev server reflects changes within 1–2 seconds
- A separate `docker-compose.dev.yml` or dev target exists to distinguish dev vs. production builds

---

#### US-16 – Database Migration / Schema Init

**Status:** `Done`

> As a developer, I want the database schema to be initialized automatically on first run so that no manual setup is required.

**Acceptance criteria:**
- Migration script runs as part of container startup
- Schema version is tracked (e.g. via a migrations table)
- Re-running migrations on an already-initialized DB is a no-op

---

### E7 – Responsive Design

#### US-17 – Mobile and Tablet Layout

**Status:** `Done`

> As a user, I want the application to be fully usable on mobile phones and tablets so that I can upload, review, and export data from any device.

**Acceptance criteria:**
- All views (upload, data review, export) adapt to viewports below 768px (mobile) and 768–1024px (tablet)
- Navigation collapses into a hamburger menu or bottom nav on small screens
- Tables switch to a card-based or horizontally scrollable layout on narrow viewports
- Touch targets (buttons, dropdowns, drag-and-drop zone) meet minimum 44×44px tap size
- File upload drag-and-drop gracefully falls back to tap-to-browse on touch devices
- No horizontal overflow or content clipping at any supported breakpoint

---

#### US-18 – Responsive Data Table

**Status:** `Done`

> As a user, I want the data table to remain readable and interactive on small screens so that I can review records without a desktop.

**Acceptance criteria:**
- On mobile, the table either switches to a stacked card layout or provides smooth horizontal scroll with a fixed first column
- Sort and filter controls remain accessible and do not overlap content
- Pagination controls are touch-friendly and visible without scrolling
- Column visibility can be toggled on small screens to reduce clutter

---

#### US-19 – Responsive Export and Actions

**Status:** `Done`

> As a user, I want export and data actions to be easy to reach on mobile so that I can complete my workflow on any device.

**Acceptance criteria:**
- "Export to Excel" and "Clear all data" buttons are reachable without excessive scrolling on small screens
- Confirmation dialogs are centered and sized appropriately for mobile viewports
- Success/error notifications do not obscure primary content on narrow screens
- Export button disabled state and tooltip are accessible via tap (not just hover)
