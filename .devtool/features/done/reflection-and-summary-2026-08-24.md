---
id: 'reflection-and-summary-2026-08-24'
status: 'done'
priority: 'low'
assignee: null
epic: 'interview-practice-feature-suite-2026-08-24'
dueDate: null
created: '2026-08-24T17:50:00.000Z'
modified: '2026-08-24T21:44:21.000Z'
completedAt: '2026-08-24T21:44:21.000Z'
labels: ['feature', 'ui', 'interviews', 'summary']
order: 'aR'
---

# Reflection & Summary (Follow-up)

Build post-practice review UI after the basic question-and-response loop is working.

## Acceptance Criteria

- [x] Create a summary page shown after a practice session ends
- [x] Display metrics: questions completed, time spent, favorited questions count
- [x] List all questions from session with user ratings (e.g., "How well did I answer?")
- [x] Support marking questions as "favorites" or "needs work" for targeted review
- [x] Allow adding reflection notes per session (e.g., "Focus on industry examples next time")
- [ ] Show "recommended next steps" based on weak areas (optional)
- [x] Implement "review responses" view to re-read past answers
- [x] Support exporting summary as PDF or text (optional)

## Notes

Summary reinforces learning and helps users identify areas for improvement. This is intentionally outside the first usable MVP; favorites, recommendations, and export can be added later.

## Implementation

- Added `src/components/interview/ReflectionSummary.vue` for post-session review UI.
- Integrated summary flow into `src/components/interview/InterviewPracticeWizard.vue`:
  - shows summary after finishing a session
  - resumes into summary if a finished session is reopened
  - supports ratings and review tags per question
  - supports reflection note editing
  - supports text export of summary and responses
- Extended persistence model:
  - `reflectionNote` on sessions
  - `rating` and `reviewTag` on responses
  - migrated via Dexie schema version 10 in `src/db/database.ts`
- Added store actions and aggregation helpers in `src/stores/interviewPractice.ts`:
  - `setResponseRating`
  - `setResponseReviewTag`
  - `setSessionReflectionNote`
  - `getSessionSummary`

## Validation

- Added test for reflection notes, ratings/tags, and summary metrics in `src/stores/interviewPractice.test.ts`.
- `pnpm test -- src/stores/interviewPractice.test.ts` passed with 10 tests.
- `pnpm typecheck` passed.
- `pnpm lint:check` passed.
