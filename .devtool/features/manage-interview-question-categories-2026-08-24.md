---
id: 'manage-interview-question-categories-2026-08-24'
status: 'todo'
priority: 'low'
assignee: null
epic: 'interview-practice-feature-suite-2026-08-24'
dueDate: null
created: '2026-08-24T19:46:30.000Z'
modified: '2026-08-24T20:20:00.000Z'
completedAt: null
labels: ['feature', 'interviews', 'categories', 'ux']
order: 'aQ'
---

# Manage Interview Question Categories (Follow-up)

Provide full in-app administration for the category hierarchy after bulk loading is working.

## Acceptance Criteria

- [ ] Display system categories and imported categories in a clear hierarchy
- [ ] Allow users to add custom child categories under Technical, such as JavaScript, TypeScript, Vue 3, Vitest, or GitHub
- [ ] Allow users to add custom categories under other appropriate parent categories when useful
- [ ] Store each category's `parentCategoryId` and `source` consistently with the question bank schema
- [ ] Allow users to rename, reorder, and archive their own categories
- [ ] Prevent editing, renaming, or deleting system categories
- [ ] Prevent duplicate category names among siblings without blocking the same name under a different parent
- [ ] Show the category hierarchy when selecting questions for practice
- [ ] Preserve questions when a user archives a category by offering reassignment or an archived state
- [ ] Test creating, nesting, renaming, archiving, and reloading custom categories

## Notes

Technical subcategories should be user-driven because the relevant stack depends on the user's experience and target roles. The initial MVP gets these categories from a bulk JSON pack; this story owns later category administration.
