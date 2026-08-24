---
id: 'flashcard-components-library-2026-08-24'
status: 'todo'
priority: 'high'
assignee: null
epic: 'interview-practice-feature-suite-2026-08-24'
dueDate: null
created: '2026-08-24T17:50:00.000Z'
modified: '2026-08-24T20:20:00.000Z'
completedAt: null
labels: ['feature', 'ui', 'interviews', 'components']
order: 'aM'
---

# Flashcard Components Library

Build the small set of Vue 3 components needed for the first usable interview practice loop.

## Acceptance Criteria

- [ ] Create `FlashcardCard.vue` with question text, response textarea, and reveal-answer action
- [ ] Create `WizardNavigation.vue` with previous/next buttons, progress, restart, and finish actions
- [ ] Render category and difficulty context without requiring a separate category-management screen
- [ ] Wire the components to the wizard state and local response save behavior
- [ ] Style all components with consistent design system
- [ ] Test the basic practice loop on desktop and mobile widths

## Suggested Component Structure

```
- InterviewPracticeWizard.vue (main container, step state)
  - FlashcardCard.vue (Q display, input)
  - WizardNavigation.vue (prev/next + progress)
  - ModelAnswerPanel.vue (comparison view)
  - ReflectionSummary.vue (review & notes)
```

## Notes

Keep the first implementation small and integrated. Side-by-side comparison, reflection summary, broad theming, and Storybook documentation are follow-up work.
