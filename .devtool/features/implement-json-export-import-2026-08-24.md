---
id: 'implement-json-export-import-2026-08-24'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'data-features-epic-2026-08-24'
dueDate: null
created: '2026-08-24T17:30:00.000Z'
modified: '2026-08-24T17:30:00.000Z'
completedAt: null
labels: ['feature', 'data', 'export-import']
order: 'aA'
---

# Implement JSON Export/Import

Add data portability via JSON export and import for all entities.

## Acceptance Criteria

- [ ] Build export dialog to download all application, position, company, recruiter, contact data as JSON
- [ ] Implement import flow to restore from JSON backup
- [ ] Support selective import (choose which entities to restore)
- [ ] Add timestamp and version metadata to exports
- [ ] Validate import data structure before applying
- [ ] Test round-trip (export → import → verify data integrity)

## Notes

Ensures data portability and backup capability. Local-first architecture means users should own their data exports.
