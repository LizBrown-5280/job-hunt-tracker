---
id: 'flashcard-components-library-2026-08-24'
status: 'done'
priority: 'high'
assignee: null
epic: 'interview-practice-feature-suite-2026-08-24'
dueDate: null
created: '2026-08-24T17:50:00.000Z'
modified: '2026-08-24T21:09:12.000Z'
completedAt: '2026-08-24T21:09:12.000Z'
labels: ['feature', 'ui', 'interviews', 'components']
order: 'aM'
---

# Flashcard Components Library

Build the small set of Vue 3 components needed for the first usable interview practice loop.

## Acceptance Criteria

- [x] Create `FlashcardCard.vue` with question text, response textarea, and reveal-answer action
- [x] Create `WizardNavigation.vue` with previous/next buttons, progress, restart, and finish actions
- [x] Render category and difficulty context without requiring a separate category-management screen
- [x] Wire the components to the wizard state and local response save behavior
- [x] Style all components with consistent design system
- [x] Test the basic practice loop on desktop and mobile widths

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

## Implementation

- Added `src/components/interview/FlashcardCard.vue` for question rendering, response capture, and reveal/hide model-answer action.
- Added `src/components/interview/WizardNavigation.vue` for previous/next controls, progress, restart, and finish actions.
- Added `src/components/interview/InterviewPracticeWizard.vue` as the container wiring the UI to the interview-practice Pinia store session state and response updates.
- Updated `src/pages/TrainingPage.vue` to render the interview practice wizard.
- Added `/training` route in `src/router/routes.ts` and a Training nav item in `src/layouts/MainLayout.vue` for access.
- Implemented responsive comparison layout in `FlashcardCard.vue` using stacked panels on narrow widths and side-by-side panels on wider widths.

## Validation

- `pnpm typecheck` passed.
- `pnpm lint:check` passed.
- `pnpm test -- src/stores/interviewPractice.test.ts` passed.
