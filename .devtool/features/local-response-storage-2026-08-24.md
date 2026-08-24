---
id: 'local-response-storage-2026-08-24'
status: 'todo'
priority: 'medium'
assignee: null
epic: 'interview-practice-feature-suite-2026-08-24'
dueDate: null
created: '2026-08-24T17:50:00.000Z'
modified: '2026-08-24T20:20:00.000Z'
completedAt: null
labels: ['feature', 'data', 'interviews', 'storage']
order: 'aO'
---

# Local Response Storage

Save responses locally so the first practice session is useful without requiring a backend.

## Acceptance Criteria

- [ ] Create minimal `interview_responses` and practice-session tables in Dexie
- [ ] Save the current response when the user changes questions or finishes
- [ ] Retrieve responses by practice session and question
- [ ] Restore the current session response when navigating backward
- [ ] Test save, retrieve, and reload behavior

## Notes

Sessions allow the user to review a practice attempt later. Debounced typing autosave, search, ratings, soft delete, quota UX, and export are follow-up work.
