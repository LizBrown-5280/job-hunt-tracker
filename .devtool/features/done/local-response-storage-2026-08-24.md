---
id: 'local-response-storage-2026-08-24'
status: 'done'
priority: 'medium'
assignee: null
epic: 'interview-practice-feature-suite-2026-08-24'
dueDate: null
created: '2026-08-24T17:50:00.000Z'
modified: '2026-08-24T21:37:57.000Z'
completedAt: '2026-08-24T21:37:57.000Z'
labels: ['feature', 'data', 'interviews', 'storage']
order: 'aO'
---

# Local Response Storage

Save responses locally so the first practice session is useful without requiring a backend.

## Acceptance Criteria

- [x] Create minimal `interview_responses` and practice-session tables in Dexie
- [x] Save the current response when the user changes questions or finishes
- [x] Retrieve responses by practice session and question
- [x] Restore the current session response when navigating backward
- [x] Test save, retrieve, and reload behavior

## Notes

Sessions allow the user to review a practice attempt later. Debounced typing autosave, search, ratings, soft delete, quota UX, and export are follow-up work.

## Implementation

- Added `interviewPracticeSessions` and `interviewResponses` tables to Dexie schema version 9 in `src/db/database.ts`.
- Added response and session record types in `src/types/interviewPractice.ts`.
- Persisted session creation, current step progress, finish state, and question responses in `src/stores/interviewPractice.ts`.
- Added `resumeLastSession` logic and wired the wizard to resume the most recent session on load in `src/components/interview/InterviewPracticeWizard.vue`.
- Added `getResponsesForSession` helper for session-level retrieval.

## Validation

- Added and passed persistence/resume tests in `src/stores/interviewPractice.test.ts`.
- `pnpm test -- src/stores/interviewPractice.test.ts` passed with 8 tests.
- `pnpm typecheck` passed.
- `pnpm lint:check` passed.
