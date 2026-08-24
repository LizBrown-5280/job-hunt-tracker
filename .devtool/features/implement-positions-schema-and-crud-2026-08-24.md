---
id: 'implement-positions-schema-and-crud-2026-08-24'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'core-data-schema-crud-epic-2026-08-24'
dueDate: null
created: '2026-08-24T17:30:00.000Z'
modified: '2026-08-24T17:30:00.000Z'
completedAt: null
labels: ['feature', 'schema', 'positions']
order: 'a1'
---

# Implement Positions Schema and CRUD

Build out the Position entity (job leads/prospects) with optional company and recruiter links.

## Acceptance Criteria

- [ ] Create `positions` table schema in Dexie (title, companyId, recruiterId, status, source, sourceUrl, postingClosesAt, postedAt, locationText, workplaceType, employmentType, salary fields, compensationText, priority, notes)
- [ ] Build PositionsPage with table view
- [ ] Implement Add/Edit modal with optional company/recruiter selectors and quick-add
- [ ] Support soft delete
- [ ] Add View/Edit/Delete row actions
- [ ] Show linked application state when present (one-to-one relationship)
- [ ] Support cycle filtering ("Show Current" vs "Show All")

## Notes

Positions can exist as independent leads before any application. Default sort: updatedAt desc.
