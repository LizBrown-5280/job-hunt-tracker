---
id: 'step-by-step-navigation-logic-2026-08-24'
status: 'todo'
priority: 'high'
assignee: null
epic: 'interview-practice-feature-suite-2026-08-24'
dueDate: null
created: '2026-08-24T17:50:00.000Z'
modified: '2026-08-24T20:20:00.000Z'
completedAt: null
labels: ['feature', 'logic', 'interviews', 'state']
order: 'aL'
---

# Step-by-Step Navigation Logic

Implement the minimum wizard state and navigation needed to practice a loaded question pack.

## Acceptance Criteria

- [ ] Set up a composable or store for selected category, question list, current step, and user responses
- [ ] Implement previous/next handlers with bounds checking
- [ ] Add progress tracking and a restart action
- [ ] Allow finishing early without losing the current response
- [ ] Support a single-question session and a mixed-category session
- [ ] Test the basic flow with zero, one, and many loaded questions

## Notes

State management can use a Pinia store or Vue 3 composable. Keyboard navigation, resume state, browser history integration, and unsaved-response warnings are follow-up work.
