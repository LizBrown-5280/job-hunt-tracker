---
id: 'implement-companies-schema-and-crud-2026-08-24'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'core-data-schema-crud-epic-2026-08-24'
dueDate: null
created: '2026-08-24T17:30:00.000Z'
modified: '2026-08-24T17:30:00.000Z'
completedAt: null
labels: ['feature', 'schema', 'companies']
order: 'a2'
---

# Implement Companies Schema and CRUD

Build out the Company entity with one-to-many relationships to recruiters, positions, and applications.

## Acceptance Criteria

- [ ] Create `companies` table schema in Dexie (name, legalName, website, industry, sizeRange, locationText, cycle linkage)
- [ ] Build CompaniesPage with table view
- [ ] Implement Add/Edit modal
- [ ] Support soft delete
- [ ] Add View/Edit/Delete row actions
- [ ] Show related recruiters, positions, applications counts or inline list
- [ ] Support cycle filtering

## Notes

Companies are the hub for recruiters and positions. One company can have many recruiters, many positions, and many applications.
