import { SYSTEM_CATEGORY_IDS } from '@/data/interviewQuestionPack';
import type { InterviewQuestionPackInput } from '@/types/interviewPractice';

export const fullstackJsTsRolePack: InterviewQuestionPackInput = {
  version: 1,
  categories: [
    {
      id: 'fullstack-system-design',
      name: 'Fullstack System Design',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
    {
      id: 'fullstack-api-and-data',
      name: 'Fullstack API and Data',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
    {
      id: 'fullstack-reliability-and-security',
      name: 'Fullstack Reliability and Security',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
  ],
  questions: [
    {
      id: 'full-general-role-balance',
      categoryId: SYSTEM_CATEGORY_IDS.general,
      difficulty: 'Easy',
      questionText: 'How do you balance frontend and backend priorities in a fullstack role?',
      modelAnswer:
        'Prioritize based on customer impact and bottlenecks, then sequence work to unblock end-to-end delivery.',
      tips: ['Speak in terms of outcomes.', 'Show context switching discipline.'],
      tags: ['general', 'fullstack'],
    },
    {
      id: 'full-behavioral-end-to-end-ownership',
      categoryId: SYSTEM_CATEGORY_IDS.behavioral,
      difficulty: 'Medium',
      questionText: 'Tell me about a feature you owned end-to-end across frontend and backend.',
      modelAnswer:
        'Explain architecture decisions across layers, tradeoffs made, and measurable user or business impact.',
      tips: ['Include data model/API/UI links.', 'Quantify outcome.'],
      tags: ['behavioral', 'ownership'],
    },
    {
      id: 'full-situational-scaling-feature',
      categoryId: SYSTEM_CATEGORY_IDS.situational,
      difficulty: 'Hard',
      questionText:
        'A successful feature suddenly receives 10x traffic. What is your response plan?',
      modelAnswer:
        'Protect availability first, identify bottlenecks by layer, scale critical paths, and communicate staged mitigation.',
      tips: ['Sequence by risk and impact.', 'Include rollback/feature flags.'],
      tags: ['situational', 'scalability'],
    },
    {
      id: 'full-design-boundaries',
      categoryId: 'fullstack-system-design',
      difficulty: 'Medium',
      questionText: 'How do you define service boundaries in a JavaScript/TypeScript system?',
      modelAnswer:
        'Use domain responsibilities, data ownership, and change frequency to create boundaries that reduce coupling.',
      tips: ['Discuss tradeoffs of over-splitting.', 'Mention team ownership.'],
      tags: ['design', 'architecture'],
    },
    {
      id: 'full-design-monolith-vs-services',
      categoryId: 'fullstack-system-design',
      difficulty: 'Hard',
      questionText: 'When is it better to keep a modular monolith instead of microservices?',
      modelAnswer:
        'Choose modular monolith when team size, operational complexity, and domain maturity do not justify service fragmentation.',
      tips: ['Use cost/complexity framing.', 'Avoid ideology-driven choices.'],
      tags: ['design', 'architecture'],
    },
    {
      id: 'full-design-async-workflows',
      categoryId: 'fullstack-system-design',
      difficulty: 'Hard',
      questionText: 'How do you design reliable async workflows across distributed components?',
      modelAnswer:
        'Use idempotency, retries with backoff, outbox/event patterns, and clear monitoring for eventual consistency workflows.',
      tips: ['Mention failure modes.', 'Show observability strategy.'],
      tags: ['design', 'distributed-systems'],
    },
    {
      id: 'full-api-contract-versioning',
      categoryId: 'fullstack-api-and-data',
      difficulty: 'Medium',
      questionText: 'What is your strategy for API versioning without breaking clients?',
      modelAnswer:
        'Prefer backward-compatible evolution first, use explicit deprecation policies, and provide migration windows and telemetry.',
      tips: ['Discuss schema evolution.', 'Include client communication.'],
      tags: ['api', 'versioning'],
    },
    {
      id: 'full-api-data-consistency',
      categoryId: 'fullstack-api-and-data',
      difficulty: 'Medium',
      questionText: 'How do you maintain consistency between UI state and backend truth?',
      modelAnswer:
        'Use clear source-of-truth ownership, conflict handling, and refresh/reconciliation patterns around critical operations.',
      tips: ['Address stale data risks.', 'Mention optimistic UI constraints.'],
      tags: ['api', 'data-consistency'],
    },
    {
      id: 'full-api-query-performance',
      categoryId: 'fullstack-api-and-data',
      difficulty: 'Hard',
      questionText: 'How would you diagnose and fix an API endpoint with growing latency?',
      modelAnswer:
        'Measure across application and database layers, identify hot paths, optimize queries/indexes, and validate with load tests.',
      tips: ['Use evidence not guesses.', 'Track p95/p99 improvements.'],
      tags: ['api', 'performance'],
    },
    {
      id: 'full-reliability-slo-thinking',
      categoryId: 'fullstack-reliability-and-security',
      difficulty: 'Hard',
      questionText: 'How do SLOs influence fullstack engineering decisions?',
      modelAnswer:
        'SLOs guide prioritization between feature velocity and reliability work by making service quality objectives explicit.',
      tips: ['Connect to error budgets.', 'Tie to roadmap tradeoffs.'],
      tags: ['reliability', 'slo'],
    },
    {
      id: 'full-security-authz-patterns',
      categoryId: 'fullstack-reliability-and-security',
      difficulty: 'Medium',
      questionText: 'How do you implement authorization safely across frontend and backend?',
      modelAnswer:
        'Enforce authorization on the backend as source of truth while keeping frontend checks as UX guidance only.',
      tips: ['Mention least privilege.', 'Avoid trusting client-only checks.'],
      tags: ['security', 'authorization'],
    },
    {
      id: 'full-reliability-incident-response',
      categoryId: 'fullstack-reliability-and-security',
      difficulty: 'Medium',
      questionText: 'What is your approach to incident response for fullstack systems?',
      modelAnswer:
        'Contain impact quickly, coordinate communication, run structured diagnosis, and capture follow-up actions with owners.',
      tips: ['Include customer communication.', 'Close the loop with learning.'],
      tags: ['reliability', 'incident-response'],
    },
  ],
};
