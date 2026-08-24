---
id: 'add-and-import-interview-questions-2026-08-24'
status: 'todo'
priority: 'medium'
assignee: null
epic: 'interview-practice-feature-suite-2026-08-24'
dueDate: null
created: '2026-08-24T19:46:30.000Z'
modified: '2026-08-24T20:20:00.000Z'
completedAt: null
labels: ['feature', 'interviews', 'questions', 'import']
order: 'aN'
---

# Load Bulk Interview Question Packs

Let the user add a whole prepared group of role-specific categories and questions in one operation instead of entering questions individually.

## Acceptance Criteria

- [ ] Accept a single JSON file or pasted JSON payload containing many categories and questions
- [ ] Support nested categories through `parentCategoryId`, including children under Technical
- [ ] Load questions with optional model answers, tips, difficulty, and tags
- [ ] Mark loaded content with `source: 'imported'`
- [ ] Validate the pack version, required fields, category references, and supported difficulty values before writing
- [ ] Prevent duplicate IDs from overwriting existing questions or categories without an explicit replacement decision
- [ ] Show a concise success or failure result after the bulk load
- [ ] Include a starter pack fixture for JavaScript, TypeScript, Vue 3, Vitest, and GitHub questions
- [ ] Test loading a multi-question pack and practicing from the imported categories

## Notes

JSON is the MVP input because it preserves category hierarchy and structured fields. In-app question editing, CSV, export, and detailed per-record error recovery are follow-up work.
