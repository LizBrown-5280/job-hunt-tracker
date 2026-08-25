import { SYSTEM_CATEGORY_IDS } from '@/data/interviewQuestionPack';
import type { InterviewQuestionPackInput } from '@/types/interviewPractice';

export const frontendMidRolePack: InterviewQuestionPackInput = {
  version: 1,
  categories: [
    {
      id: 'mid-frontend-core-vue',
      name: 'Mid Frontend Core Vue',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
    {
      id: 'mid-frontend-state-and-data',
      name: 'Mid Frontend State and Data',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
    {
      id: 'mid-frontend-testing',
      name: 'Mid Frontend Testing',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
  ],
  questions: [
    {
      id: 'mid-general-strength-fit',
      categoryId: SYSTEM_CATEGORY_IDS.general,
      difficulty: 'Easy',
      questionText: 'What strengths make you effective as a mid-level frontend engineer?',
      modelAnswer:
        'Highlight execution consistency, ownership of feature slices, and strong communication with design and product.',
      tips: ['Use examples from shipped work.', 'Focus on team outcomes.'],
      tags: ['general', 'frontend'],
    },
    {
      id: 'mid-behavioral-feedback-loop',
      categoryId: SYSTEM_CATEGORY_IDS.behavioral,
      difficulty: 'Medium',
      questionText: 'Tell me about feedback that changed your frontend implementation approach.',
      modelAnswer:
        'Describe the original approach, feedback source, what changed, and measurable impact on maintainability or UX.',
      tips: ['Show coachability.', 'Name technical change clearly.'],
      tags: ['behavioral', 'feedback'],
    },
    {
      id: 'mid-situational-feature-ambiguity',
      categoryId: SYSTEM_CATEGORY_IDS.situational,
      difficulty: 'Medium',
      questionText: 'How would you handle a frontend story with unclear requirements?',
      modelAnswer:
        'Clarify user outcomes, propose assumptions, align on acceptance criteria, and deliver in small validated increments.',
      tips: ['Mention early demos.', 'Reduce ambiguity via examples.'],
      tags: ['situational', 'requirements'],
    },
    {
      id: 'mid-vue-component-design',
      categoryId: 'mid-frontend-core-vue',
      difficulty: 'Easy',
      questionText: 'How do you design reusable Vue components without over-engineering?',
      modelAnswer:
        'Start with concrete usage, keep APIs minimal, and extract variation points only after repeated patterns emerge.',
      tips: ['Discuss props/events contracts.', 'Avoid speculative abstractions.'],
      tags: ['vue', 'components'],
    },
    {
      id: 'mid-vue-composable-practical',
      categoryId: 'mid-frontend-core-vue',
      difficulty: 'Medium',
      questionText: 'When should logic move from a component into a composable?',
      modelAnswer:
        'Move logic when it is reused, hard to test inline, or mixes multiple concerns that reduce component readability.',
      tips: ['Mention reusability and testability.', 'Give one concrete example.'],
      tags: ['vue', 'composition-api'],
    },
    {
      id: 'mid-vue-error-handling',
      categoryId: 'mid-frontend-core-vue',
      difficulty: 'Medium',
      questionText: 'How do you handle async errors in Vue views while preserving UX quality?',
      modelAnswer:
        'Use explicit loading, empty, and error states with retry paths and user-friendly messages tied to actionable next steps.',
      tips: ['Talk through state transitions.', 'Avoid silent failures.'],
      tags: ['vue', 'async'],
    },
    {
      id: 'mid-state-source-of-truth',
      categoryId: 'mid-frontend-state-and-data',
      difficulty: 'Easy',
      questionText: 'How do you decide what belongs in Pinia store vs local component state?',
      modelAnswer:
        'Keep cross-view or shared domain state in stores and keep view-specific ephemeral UI state local to components.',
      tips: ['Name ownership boundaries.', 'Use concrete examples.'],
      tags: ['pinia', 'state'],
    },
    {
      id: 'mid-state-api-normalization',
      categoryId: 'mid-frontend-state-and-data',
      difficulty: 'Medium',
      questionText: 'What is your approach to normalizing API data for frontend use?',
      modelAnswer:
        'Map API payloads into stable internal shapes, centralize transformations, and avoid leaking backend quirks into UI code.',
      tips: ['Discuss typing and mapping layers.', 'Mention maintainability.'],
      tags: ['state', 'api'],
    },
    {
      id: 'mid-state-optimistic-updates',
      categoryId: 'mid-frontend-state-and-data',
      difficulty: 'Hard',
      questionText: 'How would you implement optimistic updates safely?',
      modelAnswer:
        'Apply local optimistic state with rollback metadata, reconcile with server response, and handle failure paths explicitly.',
      tips: ['Mention race conditions.', 'Show rollback strategy.'],
      tags: ['state', 'optimistic-ui'],
    },
    {
      id: 'mid-testing-unit-vs-component',
      categoryId: 'mid-frontend-testing',
      difficulty: 'Easy',
      questionText: 'How do you choose between unit and component tests in frontend work?',
      modelAnswer:
        'Use unit tests for pure logic and component tests for rendered behavior, events, and integration of reactive state.',
      tips: ['Prioritize behavior over implementation details.', 'Name tradeoffs.'],
      tags: ['testing', 'vitest'],
    },
    {
      id: 'mid-testing-regression',
      categoryId: 'mid-frontend-testing',
      difficulty: 'Medium',
      questionText: 'What tests do you add after fixing a frontend production bug?',
      modelAnswer:
        'Add a focused regression test near the failure boundary and update related scenarios to prevent similar breakages.',
      tips: ['Use the bug as test case.', 'Keep assertions precise.'],
      tags: ['testing', 'regression'],
    },
    {
      id: 'mid-testing-ci-confidence',
      categoryId: 'mid-frontend-testing',
      difficulty: 'Medium',
      questionText: 'How do you keep CI test suites fast without losing confidence?',
      modelAnswer:
        'Run lean PR checks for high-signal tests, parallelize where possible, and reserve broader suites for scheduled runs.',
      tips: ['Mention risk-based coverage.', 'Track flaky test metrics.'],
      tags: ['testing', 'ci'],
    },
  ],
};
