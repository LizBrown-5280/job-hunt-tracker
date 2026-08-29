---
id: 'gh-3-feature-delete-data-account-2026-08-24'
status: 'todo'
priority: 'medium'
assignee: null
epic: 'foundation-architecture-epic-2026-08-24'
dueDate: null
created: '2026-08-24T17:30:00.000Z'
modified: '2026-08-29T18:09:26.614Z'
completedAt: null
labels: ['feature', 'data-privacy']
order: 'a1'
---

# Feature: Manage and Delete Local Data

Add a user-facing data management area to Settings so users can selectively delete local tracker data or clear all local data.

## Acceptance Criteria

- [ ] Add a **Data Management** or **Danger Zone** section to the existing Settings dialog
- [ ] List selectable data groups: Applications, Positions, Companies, Recruiters, Interview Practice, Interview Question Bank, and Profile/Settings
- [ ] Provide a Select All control and a Clear Selected Data action
- [ ] Require explicit confirmation before deleting selected data
- [ ] Show a stronger, clearly worded confirmation for clearing all data
- [ ] Keep Export Backup available before deletion
- [ ] Remove company, position, and recruiter records from their corresponding Dexie tables when selected
- [ ] Remove profile and backup metadata from their localStorage keys when selected
- [ ] Remove application and interview groups from their corresponding Dexie tables when selected
- [ ] Preserve unselected data when a partial deletion is performed
- [ ] Reset affected in-memory Pinia stores after deletion
- [ ] Verify selected data is unrecoverable while unselected data remains available
- [ ] Add focused tests for selective deletion and clear-all behavior

## Notes

The app stores companies, positions, recruiters, applications, and interview-practice records in Dexie/IndexedDB. Profile data and backup metadata remain in localStorage as lightweight settings.

The existing developer-only `Clear local data` action is a starting point for the clear-all operation, but this feature should move the capability into Settings and add per-data-group selection.

Authentication, password verification, sign-out, server-side account deletion, and deletion event logging are deferred until an account backend exists.

**GitHub Issue:** #3
**Label:** feature
