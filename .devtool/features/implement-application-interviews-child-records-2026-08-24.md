---
id: 'implement-application-interviews-child-records-2026-08-24'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'core-data-schema-crud-epic-2026-08-24'
dueDate: null
created: '2026-08-24T17:30:00.000Z'
modified: '2026-08-24T17:30:00.000Z'
completedAt: null
labels: ['feature', 'schema', 'applications', 'interviews']
order: 'a5'
---

# Implement Application Interviews (Child Records)

Build out the application_interviews child entity with full CRUD and rich interview details.

## Acceptance Criteria

- [ ] Create `application_interviews` table schema in Dexie (applicationId, cycleId, title, scheduledAt, mode, modeDetails, addressText, phoneNumber, appName, appUrl, orgType, orgId, interviewerContactIds, interviewerNamesFreeText, additionalNotes, interviewNotes, soft delete)
- [ ] Build interviews sub-section in ApplicationsPage detail view
- [ ] Implement Add/Edit modal for interviews
- [ ] Support mode selector (in_person, phone, app, other) with dynamic fields
- [ ] Allow adding interviewer contacts and free-text names
- [ ] Support interview notes (1000 chars approx)
- [ ] Add View/Edit/Delete actions per interview

## Notes

Interviews are owned by applications and tracked as a journey of interactions during the application process.
