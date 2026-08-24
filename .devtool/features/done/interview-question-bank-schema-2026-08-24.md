---
id: 'interview-question-bank-schema-2026-08-24'
status: 'done'
priority: 'high'
assignee: null
epic: 'interview-practice-feature-suite-2026-08-24'
dueDate: null
created: '2026-08-24T17:50:00.000Z'
modified: '2026-08-24T20:55:00.000Z'
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

This is the first implementation slice. Full CRUD, detailed import diagnostics, and category administration are later work. The initial pack should support technical children such as JavaScript, TypeScript, Vue 3, Vitest, and GitHub.
