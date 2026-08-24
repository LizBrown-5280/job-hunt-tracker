---
id: 'core-data-schema-crud-epic-2026-08-24'
status: 'backlog'
priority: 'high'
assignee: null
epic: null
dueDate: null
created: '2026-08-24T18:00:00.000Z'
modified: '2026-08-24T18:00:00.000Z'
completedAt: null
labels: ['epic', 'schema', 'data', 'foundation']
order: 'aR'
---

# Core Data Schema & CRUD (Epic)

Build the foundational data layer with all entity schemas and CRUD operations. This is the foundation for all other features.

## Related Feature Cards

- Implement Applications Schema and CRUD
- Implement Positions Schema and CRUD
- Implement Companies Schema and CRUD
- Implement Recruiters Schema and CRUD
- Implement Contacts Shared Entity
- Implement Application Interviews (Child Records)
- Implement Application Next Actions (Child Records)

## Dependencies

- Requires TEMPLATE LAYOUT foundation
- Requires Dexie.js setup
- Must complete before Dashboard & Visualization work

## Success Criteria

- All entity tables created in Dexie
- Full CRUD operations for each entity
- Relationships/foreign keys properly modeled
- Soft delete implemented across all entities
- Data model validated with TypeScript types
