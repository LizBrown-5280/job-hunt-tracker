# Job Hunt Tracker

[![Reliability Smoke](actions/workflows/reliability-smoke.yml/badge.svg)](actions/workflows/reliability-smoke.yml)
[![Typecheck](actions/workflows/typecheck.yml/badge.svg)](actions/workflows/typecheck.yml)

A local-first job search workspace built with Vue 3, TypeScript, Quasar, Pinia, and Dexie. It helps track job applications, positions, companies, recruiters, follow-up actions, and interview practice from a browser-based SPA/PWA.

The application stores tracker records in the browser through IndexedDB. Authentication and access control are provided by Firebase; Firebase is not the primary store for job-search records.

For the full architecture, data flow, storage model, routing, and Mermaid diagrams, see [docs/project-overview.md](docs/project-overview.md).

## Applications

### Dashboard and Job Board (`/`)

The dashboard provides a visual view of active application journeys.

- Kanban-style status columns for application progress
- Drag-and-drop status updates
- Active journey, follow-up, and offer counts
- Today-focused next-action summary
- Favorite ratings for prioritizing opportunities
- Links to related companies and positions

### Applications and Journeys (`/applications`)

The applications area tracks each role pursuit from initial interest through its outcome.

- Create and edit application journeys
- Link applications to companies, positions, and recruiters
- Track status history as dated journey events
- Record next actions, follow-up dates, notes, and priority
- Search, filter, favorite, archive, and restore records
- Preserve linked-record consistency when related data changes

### Positions (`/positions`)

Positions represent role leads and job postings that may later become applications.

- Store role, company, recruiter, source, and posting information
- Track work mode, employment type, compensation, benefits, and closing dates
- Link positions to companies and recruiters
- Keep link history for relationship changes
- Archive and restore position records

### Companies (`/companies`)

Companies provide reusable organization records for job-search relationships.

- Store company identity, website, industry, size, funding, and status
- Track location, phone, notes, and important names
- Connect companies to positions, recruiters, and applications
- Archive and restore records without permanently deleting them

### Recruiters (`/recruiters`)

Recruiter records keep outreach and relationship information connected to the rest of the tracker.

- Store recruiter contact and relationship details
- Link recruiters to one or more companies
- Track industry focus, notes, and contact information
- Keep relationship history and connected application references

### Interview Training (`/training`)

Interview training is a local practice workflow backed by bundled and imported question packs.

- Browse questions by category and difficulty
- Start practice sessions with a selected question count
- Record responses and session progress
- Review ratings, favorites, needs-work tags, and reflection notes
- Persist question packs and practice sessions locally

### Insights (`/insights`)

The insights area provides a secondary view of tracker information and activity patterns. It shares the same local records and Pinia stores as the main application views.

## Tech Stack

| Layer                  | Technology                                      |
| ---------------------- | ----------------------------------------------- |
| Framework              | Vue 3 with Composition API and `<script setup>` |
| UI framework           | Quasar Framework                                |
| Language               | TypeScript with strict mode                     |
| Build tool             | Vite through Quasar CLI                         |
| State management       | Pinia                                           |
| Routing                | Vue Router                                      |
| Local database         | Dexie over IndexedDB                            |
| Authentication         | Firebase Authentication                         |
| Access control         | Firestore authorization allowlist               |
| Testing                | Vitest and Playwright reliability smoke         |
| Linting and formatting | ESLint and Prettier                             |
| Hosting                | Firebase Hosting                                |

For a deeper explanation of how these pieces fit together, see [Project Overview](docs/project-overview.md).

## Project Structure

```text
src/
   assets/                 # Global assets
   boot/                   # Firebase and other app initialization
   components/             # Reusable UI components and form sections
   composables/            # Shared Vue behavior and navigation handoffs
   css/                    # Global application styles
   data/                   # Bundled interview question packs
   db/                     # Dexie database definition
   layouts/                # Shared application shells
   pages/                  # Route-level views
   router/                 # Vue Router configuration and guards
   stores/                 # Pinia state, actions, and domain logic
   types/                  # Shared TypeScript domain models
src-pwa/
   manifest.json           # Installable PWA metadata
   register-sw.ts          # Service-worker registration
   sw/                     # PWA service-worker configuration
docs/
   project-overview.md     # Detailed architecture and data-flow overview
   deferred-smoke-log.md   # Reliability checks intentionally deferred
scripts/
   reliability-smoke.mjs   # Browser-based reliability smoke workflow
tests/
   fixtures/               # Test and sample data
.github/
   workflows/              # Typecheck, smoke, and deployment workflows
firebase.json             # Firebase Hosting and Firestore configuration
quasar.config.ts          # Quasar, Vite, PWA, and plugin configuration
package.json              # Dependencies and development scripts
```

## Development Setup

The repository uses pnpm through its lockfile and workspace configuration. npm also works for the standard package scripts.

### Install dependencies

```sh
pnpm install
```

### Start the development server

```sh
pnpm dev
```

Quasar starts the app with hot module replacement and opens the browser automatically when configured to do so.

### Type-check the application

```sh
pnpm typecheck
```

### Run unit tests

```sh
pnpm test
```

### Check formatting and linting

```sh
pnpm lint:check
```

To apply formatting and automatic lint fixes:

```sh
pnpm lint
```

### Build the production SPA

```sh
pnpm build
```

### Build both deployment targets

```sh
pnpm build:all
```

## Backup and Local Data

Tracker records are local to the current browser profile. The Settings panel provides JSON backup and restore operations for:

- Applications and journey history
- Companies
- Positions
- Recruiters
- Interview question categories and questions
- Interview practice sessions and responses
- Profile and backup metadata

Because the app is local-first, data entered in one browser or device is not automatically synchronized to another. Export a backup before clearing browser data or moving to another device.

## Deployment

The project supports both standard SPA and installable PWA builds:

```sh
pnpm build:all
```

Deployment is managed separately from the local development workflow.

## Feature Backlog Workflow

Use GitHub Issues as the source of truth for feature planning and execution.

- Substantial work: [.github/ISSUE_TEMPLATE/feature-request.md](.github/ISSUE_TEMPLATE/feature-request.md)
- Small scoped work: [.github/ISSUE_TEMPLATE/small-enhancement.md](.github/ISSUE_TEMPLATE/small-enhancement.md)

Recommended labels:

- `feature`
- `enhancement`
- `priority-high`, `priority-medium`, `priority-low`
- `area-applications`, `area-companies`, `area-positions`, `area-recruiters`

## Deferred Smoke Workflow

When reliability smoke is intentionally skipped for velocity, record it immediately:

1. Create a tracking issue with [.github/ISSUE_TEMPLATE/deferred-smoke-check.md](.github/ISSUE_TEMPLATE/deferred-smoke-check.md).
2. Add or update an entry in [docs/deferred-smoke-log.md](docs/deferred-smoke-log.md).
3. Close all pending deferred smoke entries before release.

Run the smoke workflow locally with:

```sh
pnpm smoke:reliability
```

## Configuration References

- [Detailed project architecture](docs/project-overview.md)
- [Quasar configuration](quasar.config.ts)
- [Package scripts and dependencies](package.json)
- [Deferred smoke log](docs/deferred-smoke-log.md)
