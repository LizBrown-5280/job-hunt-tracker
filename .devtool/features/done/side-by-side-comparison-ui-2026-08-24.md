---
id: 'side-by-side-comparison-ui-2026-08-24'
status: 'done'
priority: 'medium'
assignee: null
epic: 'interview-practice-feature-suite-2026-08-24'
dueDate: null
created: '2026-08-24T17:50:00.000Z'
modified: '2026-08-24T21:09:25.000Z'
completedAt: '2026-08-24T21:09:25.000Z'
labels: ['feature', 'ui', 'interviews', 'ux']
order: 'aP'
---

# Side-by-Side Comparison UI

Build the basic reveal view for comparing a response with its model answer after the user has attempted a question.

## Acceptance Criteria

- [x] Keep the model answer hidden until the user chooses to reveal it
- [x] Show clear "Your Response" and "Model Answer" labels
- [x] Use a stacked layout on narrow screens and a comparison layout on wider screens
- [x] Ensure readable text wrapping and sufficient contrast
- [x] Test reveal and responsive behavior in the MVP wizard

## Notes

This is part of the MVP flashcard loop. Difference highlighting, counts, and copy-to-clipboard can follow once the core flow is useful.

## Implementation

- Delivered through `src/components/interview/FlashcardCard.vue` and `src/components/interview/InterviewPracticeWizard.vue`.
- Model answer is hidden by default and only shown after the explicit reveal action.
- Comparison panels use clear labels: "Your Response" and "Model Answer".
- Responsive layout stacks panels by default and switches to side-by-side at wider breakpoints.
- Text content uses wrapping and readable contrast-focused panel styles.

## Validation

- Verified in the MVP wizard flow rendered on `src/pages/TrainingPage.vue`.
- `pnpm typecheck` passed.
- `pnpm lint:check` passed.
