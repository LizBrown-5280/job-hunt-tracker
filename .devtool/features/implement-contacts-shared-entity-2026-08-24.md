---
id: 'implement-contacts-shared-entity-2026-08-24'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'core-data-schema-crud-epic-2026-08-24'
dueDate: null
created: '2026-08-24T17:30:00.000Z'
modified: '2026-08-24T17:30:00.000Z'
completedAt: null
labels: ['feature', 'schema', 'contacts']
order: 'a4'
---

# Implement Contacts Shared Entity

Build out the shared Contacts entity owned by companies or recruiters, with applications storing references.

## Acceptance Criteria

- [ ] Create `contacts` table schema in Dexie (id, cycleId, ownerType, ownerId, fullName, roleTitle, email, phone, linkedinUrl, notes, soft delete markers)
- [ ] Implement contacts sub-form in Companies and Recruiters pages
- [ ] Build contact management UI (add/edit/delete contacts inline)
- [ ] Support cascading selector in applications (choose company/recruiter → select contact from that owner's list)
- [ ] Store contact IDs in application records for references
- [ ] Display resolved contact details inline when showing application

## Notes

Contacts are the source of truth for company/recruiter contact info. Applications reference but do not own contacts.
