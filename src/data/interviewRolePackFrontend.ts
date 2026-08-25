import { SYSTEM_CATEGORY_IDS } from '@/data/interviewQuestionPack';
import type { InterviewQuestionPackInput } from '@/types/interviewPractice';

export const frontendVueTypeScriptRolePack: InterviewQuestionPackInput = {
  version: 1,
  categories: [
    {
      id: 'role-frontend-architecture',
      name: 'Frontend Architecture',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
    {
      id: 'role-frontend-state-management',
      name: 'State Management',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
    {
      id: 'role-frontend-performance',
      name: 'Frontend Performance',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
    {
      id: 'role-frontend-testing',
      name: 'Frontend Testing Strategy',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
  ],
  questions: [
    {
      id: 'role-general-front-role-fit',
      categoryId: SYSTEM_CATEGORY_IDS.general,
      difficulty: 'Easy',
      questionText: 'Why are you a strong fit for a senior frontend role on this team?',
      modelAnswer:
        'Tie your frontend architecture decisions, product collaboration style, and delivery track record directly to the team roadmap.',
      tips: ['Connect to user impact.', 'Anchor claims with outcomes.'],
      tags: ['general', 'frontend-role'],
    },
    {
      id: 'role-general-frontend-90-day-plan',
      categoryId: SYSTEM_CATEGORY_IDS.general,
      difficulty: 'Medium',
      questionText: 'What would your first 90 days look like on a Vue product team?',
      modelAnswer:
        'Describe discovery, technical baseline improvements, and product delivery milestones with measurable outcomes.',
      tips: ['Use 30/60/90 structure.', 'Balance listening and shipping.'],
      tags: ['general', 'onboarding'],
    },
    {
      id: 'role-behavioral-cross-functional',
      categoryId: SYSTEM_CATEGORY_IDS.behavioral,
      difficulty: 'Medium',
      questionText:
        'Tell me about a time you aligned engineering, design, and product under pressure.',
      modelAnswer:
        'Show how you reframed disagreement around user outcomes, clarified constraints, and shipped in manageable increments.',
      tips: ['Focus on facilitation.', 'Quantify result quality and speed.'],
      tags: ['behavioral', 'cross-functional'],
    },
    {
      id: 'role-behavioral-front-incident',
      categoryId: SYSTEM_CATEGORY_IDS.behavioral,
      difficulty: 'Hard',
      questionText: 'Describe a frontend incident you owned and what changed afterward.',
      modelAnswer:
        'Cover detection, mitigation, communication, and permanent fixes including tests, observability, and process updates.',
      tips: ['Show ownership.', 'Highlight prevention, not just recovery.'],
      tags: ['behavioral', 'incident-response'],
    },
    {
      id: 'role-situational-degraded-release',
      categoryId: SYSTEM_CATEGORY_IDS.situational,
      difficulty: 'Hard',
      questionText: 'A release caused a large drop in conversion. What do you do first?',
      modelAnswer:
        'Stabilize user impact, assess blast radius, roll back or feature-flag quickly, then triage root causes with product and analytics.',
      tips: ['Prioritize customer impact first.', 'Show data-driven triage.'],
      tags: ['situational', 'conversion'],
    },
    {
      id: 'role-situational-large-refactor',
      categoryId: SYSTEM_CATEGORY_IDS.situational,
      difficulty: 'Medium',
      questionText: 'How would you approach a risky Vue 2 to Vue 3 migration on a live product?',
      modelAnswer:
        'Use phased migration, compatibility layers, risk-based test coverage, and incremental rollout with clear rollback paths.',
      tips: ['Discuss migration boundaries.', 'Include stakeholder communication.'],
      tags: ['situational', 'migration'],
    },
    {
      id: 'role-tech-frontend-architecture-boundaries',
      categoryId: 'role-frontend-architecture',
      difficulty: 'Medium',
      questionText:
        'How do you define boundaries between components, composables, and stores in Vue 3?',
      modelAnswer:
        'Keep presentational concerns in components, shared domain logic in composables, and cross-view state in stores with explicit ownership.',
      tips: ['Mention testability.', 'Discuss coupling and cohesion.'],
      tags: ['vue', 'architecture'],
    },
    {
      id: 'role-tech-frontend-architecture-design-system',
      categoryId: 'role-frontend-architecture',
      difficulty: 'Medium',
      questionText: 'What principles guide a scalable design-system component library?',
      modelAnswer:
        'Favor API consistency, accessibility defaults, controlled extension points, and strong documentation with usage constraints.',
      tips: ['Include versioning strategy.', 'Mention visual regression testing.'],
      tags: ['design-system', 'architecture'],
    },
    {
      id: 'role-tech-state-management-source-truth',
      categoryId: 'role-frontend-state-management',
      difficulty: 'Easy',
      questionText: 'How do you prevent duplicated sources of truth in a Pinia-based app?',
      modelAnswer:
        'Define canonical ownership per state domain, derive secondary values, and avoid mutating mirrored state in multiple places.',
      tips: ['Use explicit read/write boundaries.', 'Call out normalization patterns.'],
      tags: ['pinia', 'state-management'],
    },
    {
      id: 'role-tech-state-management-server-cache',
      categoryId: 'role-frontend-state-management',
      difficulty: 'Hard',
      questionText: 'When should server state stay in API caches versus local app state?',
      modelAnswer:
        'Keep authoritative remote data in cache/query layers and reserve local state for UI/session intent and optimistic interaction flow.',
      tips: ['Differentiate client and server concerns.', 'Mention invalidation rules.'],
      tags: ['state-management', 'data-fetching'],
    },
    {
      id: 'role-tech-performance-render-bottlenecks',
      categoryId: 'role-frontend-performance',
      difficulty: 'Medium',
      questionText: 'How do you investigate and fix excessive re-renders in a Vue page?',
      modelAnswer:
        'Profile component updates, isolate reactive hot paths, reduce broad dependencies, and restructure data flow for selective updates.',
      tips: ['Use profiler evidence.', 'Prioritize biggest wins first.'],
      tags: ['performance', 'vue'],
    },
    {
      id: 'role-tech-performance-web-vitals',
      categoryId: 'role-frontend-performance',
      difficulty: 'Hard',
      questionText: 'What concrete steps improve Core Web Vitals in a SPA?',
      modelAnswer:
        'Optimize bundle splitting, critical rendering path, image strategy, hydration work, and interaction latency instrumentation.',
      tips: ['Map each step to LCP, CLS, or INP.', 'Discuss monitoring after release.'],
      tags: ['web-vitals', 'performance'],
    },
    {
      id: 'role-tech-testing-pyramid',
      categoryId: 'role-frontend-testing',
      difficulty: 'Easy',
      questionText: 'What is your test strategy across unit, component, and E2E levels?',
      modelAnswer:
        'Use fast unit/component tests for logic and rendering contracts, with focused E2E coverage for critical user journeys.',
      tips: ['Avoid over-reliance on E2E.', 'Tie strategy to risk.'],
      tags: ['testing', 'strategy'],
    },
    {
      id: 'role-tech-testing-flaky-e2e',
      categoryId: 'role-frontend-testing',
      difficulty: 'Medium',
      questionText: 'How do you reduce flaky Playwright tests without lowering confidence?',
      modelAnswer:
        'Stabilize selectors and app state, eliminate timing assumptions, use deterministic fixtures, and assert meaningful outcomes.',
      tips: ['Avoid blind waits.', 'Treat flakiness as a product-quality signal.'],
      tags: ['testing', 'playwright'],
    },
    {
      id: 'role-tech-testing-pr-quality-gates',
      categoryId: 'role-frontend-testing',
      difficulty: 'Medium',
      questionText: 'What quality gates should a frontend PR pass before merge?',
      modelAnswer:
        'Require lint/type/test checks, accessibility checks, high-risk path validation, and clear rollback understanding for user-facing changes.',
      tips: ['Mention scope-based rigor.', 'Balance speed and reliability.'],
      tags: ['testing', 'code-review'],
    },
  ],
};
