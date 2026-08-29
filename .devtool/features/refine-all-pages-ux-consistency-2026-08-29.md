---
id: 'refine-all-pages-ux-consistency-2026-08-29'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'ux-polish-enhancements-epic-2026-08-24'
dueDate: null
created: '2026-08-29T00:00:00.000Z'
modified: '2026-08-29T00:00:00.000Z'
completedAt: null
labels: ['ux', 'polish', 'refinement']
order: 'aX'
---

# REFINEMENT: Go Through Each Page and Polish Forms/UX

Apply the same level of refinement done on the Positions page (sectioned forms with `text-subtitle2` titles, grouped related inputs, responsive layouts, radio/checkbox groups where appropriate, consistent add/quick-link button styling) across the rest of the app.

## Acceptance Criteria

- [ ] Companies page: review form sectioning and field grouping
- [ ] Recruiters page: review form sectioning and field grouping
- [ ] Applications (Journey) page: review form sectioning and field grouping
- [ ] Index/Dashboard page: review layout and content
- [ ] Training page: review layout and content
- [ ] Confirm consistent section title styling (`text-subtitle2`) across all pages
- [ ] Confirm consistent linked add-button styling (stacked icon/label) where company/recruiter/position quick-add appears
- [ ] Confirm responsive behavior (no wrapping/overlap) for any grid/option-group layouts
- [ ] Validate with typecheck + lint after each page's changes

## Notes

Positions page ([src/pages/PositionsPage.vue](../../src/pages/PositionsPage.vue)) is the reference implementation for this pass. Work through pages one at a time rather than all at once.
