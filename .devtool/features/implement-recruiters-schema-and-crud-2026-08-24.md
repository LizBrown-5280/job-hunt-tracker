---
id: 'implement-recruiters-schema-and-crud-2026-08-24'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'core-data-schema-crud-epic-2026-08-24'
dueDate: null
created: '2026-08-24T17:30:00.000Z'
modified: '2026-08-24T17:30:00.000Z'
completedAt: null
labels: ['feature', 'schema', 'recruiters']
order: 'a3'
---

# Implement Recruiters Schema and CRUD

Build out the Recruiter entity with one-to-many relationships to companies, positions, and applications.

## Acceptance Criteria

- [ ] Create `recruiters` table schema in Dexie (name, companyId, email, phone, linkedinUrl, notes, cycle linkage)
- [ ] Build RecruitersPage with table view
- [ ] Implement Add/Edit modal with optional company selector and quick-add
- [ ] Support soft delete
- [ ] Add View/Edit/Delete row actions
- [ ] Show related companies, positions, applications counts or inline list
- [ ] Support cycle filtering

## Notes

Recruiters can be associated with companies, positions, or work independently. One recruiter can have many positions and applications.
