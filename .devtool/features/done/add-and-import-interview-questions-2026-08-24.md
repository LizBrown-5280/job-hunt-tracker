---
id: 'add-and-import-interview-questions-2026-08-24'
status: 'done'
priority: 'medium'
assignee: null
epic: 'interview-practice-feature-suite-2026-08-24'
dueDate: null
created: '2026-08-24T19:46:30.000Z'
modified: '2026-08-24T21:39:02.000Z'
completedAt: '2026-08-24T21:39:02.000Z'
labels: ['feature', 'interviews', 'questions', 'import']
order: 'aN'
---

# Load Bulk Interview Question Packs

Let the user add a whole prepared group of role-specific categories and questions in one operation instead of entering questions individually.

## Acceptance Criteria

- [x] Accept a single JSON file or pasted JSON payload containing many categories and questions
- [x] Support nested categories through `parentCategoryId`, including children under Technical
- [x] Load questions with optional model answers, tips, difficulty, and tags
- [x] Mark loaded content with `source: 'imported'`
- [x] Validate the pack version, required fields, category references, and supported difficulty values before writing
- [x] Prevent duplicate IDs from overwriting existing questions or categories without an explicit replacement decision
- [x] Show a concise success or failure result after the bulk load
- [x] Include a starter pack fixture for JavaScript, TypeScript, Vue 3, Vitest, and GitHub questions
- [x] Test loading a multi-question pack and practicing from the imported categories

## Notes

JSON is the MVP input because it preserves category hierarchy and structured fields. In-app question editing, CSV, export, and detailed per-record error recovery are follow-up work.

## Implementation

- Added starter pack fixture in `src/data/interviewStarterPack.ts` with JavaScript, TypeScript, Vue 3, Vitest, and GitHub technical subcategories and questions.
- Extended `src/components/interview/InterviewPracticeWizard.vue` with:
  - JSON paste import
  - JSON file import
  - Starter pack quick-load
  - Starter pack JSON download
  - concise success/failure import messaging
- Reused existing validated loader in `src/stores/interviewPractice.ts` to enforce version, schema references, difficulty, and duplicate-ID constraints while preserving `source: 'imported'` behavior.

## Validation

- Added test coverage in `src/stores/interviewPractice.test.ts` for loading the starter pack and practicing imported categories.
- `pnpm test -- src/stores/interviewPractice.test.ts` passed with 9 tests.
- `pnpm typecheck` passed.
- `pnpm lint:check` passed.
