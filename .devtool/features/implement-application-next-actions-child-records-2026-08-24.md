---
id: 'implement-application-next-actions-child-records-2026-08-24'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'core-data-schema-crud-epic-2026-08-24'
dueDate: null
created: '2026-08-24T17:30:00.000Z'
modified: '2026-08-24T17:30:00.000Z'
completedAt: null
labels: ['feature', 'schema', 'applications', 'next-actions']
order: 'a6'
---

# Implement Application Next Actions (Child Records)

Build out the application_next_actions child entity for tracking follow-up tasks and reminders.

## Acceptance Criteria

- [ ] Create `application_next_actions` table schema in Dexie (id, applicationId, cycleId, title, dueAt, description, completedAt, soft delete markers)
- [ ] Build next-actions sub-section in ApplicationsPage detail view
- [ ] Implement Add/Edit modal for next actions
- [ ] Support due date picker and completion tracking
- [ ] Display checklist or list of next actions (hide completed by default or show toggle)
- [ ] Add View/Edit/Delete/Mark-Complete actions per action

## Notes

Next actions serve as reminders tied to specific applications. Integration with browser notifications (V1) is local-only.
