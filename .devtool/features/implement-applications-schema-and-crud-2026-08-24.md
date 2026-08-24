---
id: 'implement-applications-schema-and-crud-2026-08-24'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'core-data-schema-crud-epic-2026-08-24'
dueDate: null
created: '2026-08-24T17:30:00.000Z'
modified: '2026-08-24T17:30:00.000Z'
completedAt: null
labels: ['feature', 'schema', 'applications']
order: 'a0'
---

# Implement Applications Schema and CRUD

Build out the core Application entity with full CRUD operations, including linked records and journey tracking.

## Acceptance Criteria

- [ ] Create `applications` table schema in Dexie (with all fields: status, sentimentScore, sentimentNote, source, postingUrl, priority, processStartedAt, appliedAt, processEndedAt, contacts, notes, etc.)
- [ ] Implement ApplicationsPage with table/sectioned view showing all applications
- [ ] Build Add/Edit modal for applications
- [ ] Support cascading selectors: choose recruiter/company → select contact
- [ ] Display correlated contact details inline
- [ ] Implement soft delete with deletedAt marker
- [ ] Add View/Edit/Delete row actions
- [ ] Support "Show Current" vs "Show All" (cycle filtering)

## Notes

Per schema v1 candidate: applications own interviews and next_actions as child records. Contacts are shared but application stores references to selected contacts.
