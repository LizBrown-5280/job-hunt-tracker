---
id: 'step-by-step-navigation-logic-2026-08-24'
status: 'done'
priority: 'high'
assignee: null
epic: 'interview-practice-feature-suite-2026-08-24'
dueDate: null
created: '2026-08-24T17:50:00.000Z'
modified: '2026-08-24T21:06:35.000Z'
completedAt: '2026-08-24T21:06:35.000Z'
labels: ['feature', 'logic', 'interviews', 'state']
order: 'aL'
---

# Step-by-Step Navigation Logic

Implement the minimum wizard state and navigation needed to practice a loaded question pack.

## Acceptance Criteria

- [x] Set up a composable or store for selected category, question list, current step, and user responses
- [x] Implement previous/next handlers with bounds checking
- [x] Add progress tracking and a restart action
- [x] Allow finishing early without losing the current response
- [x] Support a single-question session and a mixed-category session
- [x] Test the basic flow with zero, one, and many loaded questions

## Notes

State management can use a Pinia store or Vue 3 composable. Keyboard navigation, resume state, browser history integration, and unsaved-response warnings are follow-up work.

## Implementation

- Added interview session state in `src/stores/interviewPractice.ts` for selected category, ordered session question IDs, current step, per-question responses, and session completion timestamp.
- Added bounded navigation actions: `goToPreviousQuestion`, `goToNextQuestion`, `restartSession`, and `finishSession`.
- Added `startSession` to support category-scoped sessions, single-question sessions, and mixed-category sessions.
- Added progress getters for total/current/percent and completion status.
- Preserved current response data when finishing a session early.

## Validation

- Added and passed tests for zero-question, single-question, and many-question flows in `src/stores/interviewPractice.test.ts`.
- `pnpm test -- src/stores/interviewPractice.test.ts` passed with 7 tests.
- `pnpm typecheck` passed.
- `pnpm lint:check` passed.
