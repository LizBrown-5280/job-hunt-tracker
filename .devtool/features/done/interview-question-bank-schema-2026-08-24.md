---
id: 'interview-question-bank-schema-2026-08-24'
status: 'done'
priority: 'high'
assignee: null
epic: 'interview-practice-feature-suite-2026-08-24'
dueDate: null
created: '2026-08-24T17:50:00.000Z'
modified: '2026-08-24T20:55:23.000Z'
completedAt: '2026-08-24T20:55:00.000Z'
labels: ['feature', 'schema', 'interviews', 'data']
order: 'a0'
---

# Interview Question Bank & Schema

Create the smallest durable data layer needed to load a bulk interview question pack and practice from it immediately.

## Acceptance Criteria

- [x] Define the Dexie tables for categories and questions with stable IDs, parent category references, source, timestamps, difficulty, model answer, tips, and tags
- [x] Seed generic system categories for General, Behavioral, Situational, and Technical
- [x] Seed a small starter set of generic questions for General, Behavioral, and Situational; place "Tell me about yourself" under General
- [x] Load a bulk JSON question pack containing user-specific technical categories and questions
- [x] Preserve `source: 'system' | 'imported'` so seeded content is distinct from the user's imported content
- [x] Create query methods for category filtering and random or mixed question selection
- [x] Validate category references and supported difficulty values before saving a pack
- [x] Document the JSON question-pack format with one complete example
- [x] Test seed loading, bulk loading, nested categories, filtering, and round-trip integrity

## Notes

Completed as the first interview-practice implementation slice.

### Implementation

- Added typed interview category, question, and question-pack contracts in `src/types/interviewPractice.ts`.
- Added interview category and question tables to the shared `job-hunt-tracker` Dexie database at schema version 8.
- Consolidated application and interview data onto the shared Dexie database instance.
- Added generic system categories for General, Behavioral, Situational, and Technical.
- Added starter questions for General, Behavioral, and Situational, including "Tell me about yourself" under General.
- Added one-operation JSON loading for user-specific nested technical categories such as JavaScript, TypeScript, Vue 3, Vitest, and GitHub.
- Added category-reference, difficulty, duplicate-ID, and malformed-pack validation before transactional writes.
- Added category filtering and random or mixed question selection through the interview-practice Pinia store.
- Documented the question-pack JSON format in `docs/interview-question-pack-format.md`.

### Validation

- Added Vitest coverage for seed loading, nested bulk loading, filtering, random selection, and invalid-pack rollback.
- `pnpm test -- src/stores/interviewPractice.test.ts` passed with 4 tests.
- `pnpm typecheck` passed.
- Focused ESLint validation passed.
- `pnpm lint:check`, `pnpm smoke:reliability`, `pnpm build`, and `git diff --check` passed.

### Commits

- `10df06e feat: add interview question bank data layer`
- `a8a7ac4 test: complete interview question bank ticket`

Full CRUD, detailed import diagnostics, CSV support, category administration, and richer review analytics remain follow-up work.
