import { SYSTEM_CATEGORY_IDS } from '@/data/interviewQuestionPack';
import type { InterviewQuestionPackInput } from '@/types/interviewPractice';

export const interviewStarterPack: InterviewQuestionPackInput = {
  version: 1,
  categories: [
    {
      id: 'technical-javascript',
      name: 'JavaScript',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
    {
      id: 'technical-typescript',
      name: 'TypeScript',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
    {
      id: 'technical-vue-3',
      name: 'Vue 3',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
    {
      id: 'technical-vitest',
      name: 'Vitest',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
    {
      id: 'technical-github',
      name: 'GitHub',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
  ],
  questions: [
    {
      id: 'starter-general-role-transition',
      categoryId: SYSTEM_CATEGORY_IDS.general,
      difficulty: 'Easy',
      questionText: 'Why are you interested in this role right now?',
      modelAnswer:
        'Connect your current strengths, target growth areas, and motivation for this company to explain why the timing and fit are strong.',
      tips: ['Use a present-future structure.', 'Show intent, not desperation.'],
      tags: ['general', 'motivation'],
    },
    {
      id: 'starter-general-value-prop',
      categoryId: SYSTEM_CATEGORY_IDS.general,
      difficulty: 'Medium',
      questionText: 'What value would you deliver in your first 90 days?',
      modelAnswer:
        'Outline discovery, quick wins, and measurable outcomes while showing you can align with team goals and constraints.',
      tips: ['Break response into 30-60-90.', 'Name specific outcomes.'],
      tags: ['general', 'impact'],
    },
    {
      id: 'starter-general-weakness',
      categoryId: SYSTEM_CATEGORY_IDS.general,
      difficulty: 'Medium',
      questionText: 'Tell me about a weakness and what you are doing about it.',
      modelAnswer:
        'Choose a real but non-fatal weakness, describe concrete improvement steps, and provide evidence of progress.',
      tips: ['Avoid fake weaknesses.', 'Show measurable improvement.'],
      tags: ['general', 'self-awareness'],
    },
    {
      id: 'starter-general-prioritization-style',
      categoryId: SYSTEM_CATEGORY_IDS.general,
      difficulty: 'Easy',
      questionText: 'How do you typically prioritize your work?',
      modelAnswer:
        'Describe your decision framework using impact, urgency, dependencies, and stakeholder alignment with regular re-evaluation.',
      tips: ['Mention tradeoffs.', 'Include communication cadence.'],
      tags: ['general', 'planning'],
    },
    {
      id: 'starter-general-company-question',
      categoryId: SYSTEM_CATEGORY_IDS.general,
      difficulty: 'Easy',
      questionText: 'What questions do you have for us?',
      modelAnswer:
        'Ask about success metrics, team priorities, current constraints, and growth opportunities to show strategic interest.',
      tips: ['Prepare 3 to 5 thoughtful questions.', 'Avoid only compensation questions.'],
      tags: ['general', 'closing'],
    },
    {
      id: 'starter-behavioral-conflict',
      categoryId: SYSTEM_CATEGORY_IDS.behavioral,
      difficulty: 'Medium',
      questionText: 'Tell me about a conflict with a teammate and how you resolved it.',
      modelAnswer:
        'Use STAR: state the disagreement, focus on shared goals, explain communication steps, and finish with improved outcomes.',
      tips: ['Take accountability.', 'Show respect for the other person.'],
      tags: ['behavioral', 'collaboration'],
    },
    {
      id: 'starter-behavioral-failure',
      categoryId: SYSTEM_CATEGORY_IDS.behavioral,
      difficulty: 'Hard',
      questionText: 'Describe a professional failure and what you learned.',
      modelAnswer:
        'Be specific about the miss, identify root causes, and show how your behavior changed to prevent recurrence.',
      tips: ['Do not blame others.', 'Name the concrete lesson.'],
      tags: ['behavioral', 'growth'],
    },
    {
      id: 'starter-behavioral-leadership',
      categoryId: SYSTEM_CATEGORY_IDS.behavioral,
      difficulty: 'Medium',
      questionText: 'Tell me about a time you led without formal authority.',
      modelAnswer:
        'Demonstrate influence through clarity, trust, and coordination while highlighting outcomes achieved via collaboration.',
      tips: ['Explain how you built alignment.', 'Quantify impact.'],
      tags: ['behavioral', 'leadership'],
    },
    {
      id: 'starter-behavioral-feedback',
      categoryId: SYSTEM_CATEGORY_IDS.behavioral,
      difficulty: 'Easy',
      questionText: 'How do you handle critical feedback?',
      modelAnswer:
        'Show that you seek understanding, avoid defensiveness, and convert feedback into a visible action plan.',
      tips: ['Use a real example.', 'Describe follow-through.'],
      tags: ['behavioral', 'feedback'],
    },
    {
      id: 'starter-behavioral-ambiguity',
      categoryId: SYSTEM_CATEGORY_IDS.behavioral,
      difficulty: 'Hard',
      questionText: 'Give an example of succeeding in an ambiguous situation.',
      modelAnswer:
        'Explain how you clarified goals, validated assumptions, and delivered progress with incremental checkpoints.',
      tips: ['Show structure under uncertainty.', 'Highlight decision rationale.'],
      tags: ['behavioral', 'ambiguity'],
    },
    {
      id: 'starter-situational-tight-deadline',
      categoryId: SYSTEM_CATEGORY_IDS.situational,
      difficulty: 'Medium',
      questionText: 'What would you do if a critical deadline is at risk?',
      modelAnswer:
        'Assess scope and blockers, communicate risk early, propose options, and execute a recovery plan with clear owners.',
      tips: ['Lead with transparency.', 'Offer tradeoff options.'],
      tags: ['situational', 'delivery'],
    },
    {
      id: 'starter-situational-stakeholder-disagree',
      categoryId: SYSTEM_CATEGORY_IDS.situational,
      difficulty: 'Medium',
      questionText: 'How would you respond when key stakeholders disagree on direction?',
      modelAnswer:
        'Surface decision criteria, map risks, facilitate tradeoff discussion, and seek alignment around desired outcomes.',
      tips: ['Center on goals, not personalities.', 'Document decisions.'],
      tags: ['situational', 'stakeholders'],
    },
    {
      id: 'starter-situational-new-domain',
      categoryId: SYSTEM_CATEGORY_IDS.situational,
      difficulty: 'Easy',
      questionText: 'How would you ramp up quickly in a new domain?',
      modelAnswer:
        'Prioritize core concepts, identify domain experts, learn from artifacts, and ship small validated increments early.',
      tips: ['Mention learning plan.', 'Tie learning to delivery.'],
      tags: ['situational', 'learning'],
    },
    {
      id: 'starter-situational-production-issue',
      categoryId: SYSTEM_CATEGORY_IDS.situational,
      difficulty: 'Hard',
      questionText: 'How would you handle a production incident during off-hours?',
      modelAnswer:
        'Stabilize user impact first, coordinate responders, communicate status clearly, and run a blameless follow-up.',
      tips: ['Sequence: mitigate, diagnose, communicate.', 'Include postmortem actions.'],
      tags: ['situational', 'incident'],
    },
    {
      id: 'starter-situational-priority-shift',
      categoryId: SYSTEM_CATEGORY_IDS.situational,
      difficulty: 'Medium',
      questionText: 'What if priorities change after weeks of work?',
      modelAnswer:
        'Reassess value, salvage reusable components, reset scope with stakeholders, and adapt plans without sunk-cost bias.',
      tips: ['Show emotional maturity.', 'Focus on business value.'],
      tags: ['situational', 'adaptability'],
    },
    {
      id: 'starter-technical-system-design-basics',
      categoryId: SYSTEM_CATEGORY_IDS.technical,
      difficulty: 'Medium',
      questionText: 'How do you approach designing a maintainable system?',
      modelAnswer:
        'Start with requirements, define boundaries and interfaces, optimize for observability and changeability, then iterate.',
      tips: ['Call out tradeoffs.', 'Mention non-functional requirements.'],
      tags: ['technical', 'design'],
    },
    {
      id: 'starter-technical-debugging-strategy',
      categoryId: SYSTEM_CATEGORY_IDS.technical,
      difficulty: 'Easy',
      questionText: 'Describe your debugging strategy for a hard-to-reproduce bug.',
      modelAnswer:
        'Reproduce with instrumentation, narrow scope via hypotheses, isolate variables, and validate root cause with tests.',
      tips: ['Be systematic.', 'Avoid random trial and error.'],
      tags: ['technical', 'debugging'],
    },
    {
      id: 'starter-technical-quality-bar',
      categoryId: SYSTEM_CATEGORY_IDS.technical,
      difficulty: 'Medium',
      questionText: 'How do you balance delivery speed with code quality?',
      modelAnswer:
        'Define non-negotiable quality gates, use incremental delivery, and pay down debt intentionally with visible ownership.',
      tips: ['Mention tests and reviews.', 'Be explicit about tradeoffs.'],
      tags: ['technical', 'quality'],
    },
    {
      id: 'starter-js-event-loop-basics',
      categoryId: 'technical-javascript',
      difficulty: 'Medium',
      questionText: 'Explain the JavaScript event loop and where microtasks run.',
      modelAnswer:
        'The event loop executes call stack work, then processes microtasks before rendering and before the next macrotask.',
      tips: ['Define call stack, task queue, and microtask queue.'],
      tags: ['javascript', 'event-loop'],
    },
    {
      id: 'starter-js-closure-practical',
      categoryId: 'technical-javascript',
      difficulty: 'Easy',
      questionText: 'What is a closure and where is it useful in application code?',
      modelAnswer:
        'A closure gives a function access to its lexical scope; it is useful for encapsulation, factories, and callback state.',
      tips: ['Define lexical scope.', 'Include one concrete use case.'],
      tags: ['javascript', 'closure'],
    },
    {
      id: 'starter-js-async-await-errors',
      categoryId: 'technical-javascript',
      difficulty: 'Medium',
      questionText: 'How do you handle errors in async/await flows?',
      modelAnswer:
        'Use try/catch at meaningful boundaries, preserve context in errors, and avoid swallowing failures silently.',
      tips: ['Mention centralized handling.', 'Include retry/timeout considerations.'],
      tags: ['javascript', 'async'],
    },
    {
      id: 'starter-js-immutability-benefits',
      categoryId: 'technical-javascript',
      difficulty: 'Easy',
      questionText: 'Why does immutability help in frontend state management?',
      modelAnswer:
        'Immutability simplifies change detection, supports predictable updates, and reduces side effects in UI rendering.',
      tips: ['Tie to reactivity or rendering.', 'Mention debugging advantages.'],
      tags: ['javascript', 'state-management'],
    },
    {
      id: 'starter-ts-unknown-vs-any',
      categoryId: 'technical-typescript',
      difficulty: 'Easy',
      questionText: 'What is the difference between unknown and any in TypeScript?',
      modelAnswer: 'any disables type safety, while unknown forces type narrowing before use.',
      tips: ['Mention safer boundaries with unknown.'],
      tags: ['typescript', 'types'],
    },
    {
      id: 'starter-ts-union-narrowing',
      categoryId: 'technical-typescript',
      difficulty: 'Medium',
      questionText: 'How do discriminated unions improve reliability in app logic?',
      modelAnswer:
        'They enforce exhaustive handling and make impossible states unrepresentable through shared discriminant fields.',
      tips: ['Mention exhaustiveness checks.', 'Include switch example verbally.'],
      tags: ['typescript', 'unions'],
    },
    {
      id: 'starter-ts-generics-api',
      categoryId: 'technical-typescript',
      difficulty: 'Medium',
      questionText: 'When should you design a function with generics?',
      modelAnswer:
        'Use generics when behavior is type-agnostic but relationships between input and output types must be preserved.',
      tips: ['Avoid over-generic APIs.', 'Discuss constraints.'],
      tags: ['typescript', 'generics'],
    },
    {
      id: 'starter-ts-runtime-vs-compile',
      categoryId: 'technical-typescript',
      difficulty: 'Hard',
      questionText: 'What problems can still occur at runtime despite strong TypeScript types?',
      modelAnswer:
        'External data, serialization boundaries, and incorrect assumptions can break runtime behavior, so validation is still needed.',
      tips: ['Mention schema validation.', 'Differentiate static vs runtime safety.'],
      tags: ['typescript', 'runtime'],
    },
    {
      id: 'starter-vue-composable-pattern',
      categoryId: 'technical-vue-3',
      difficulty: 'Medium',
      questionText: 'When should you extract logic into a Vue composable?',
      modelAnswer:
        'Extract logic when it is reused or complex enough to benefit from isolation and testing.',
      tips: ['Talk about reuse, readability, and testability.'],
      tags: ['vue', 'composition-api'],
    },
    {
      id: 'starter-vue-watch-vs-computed',
      categoryId: 'technical-vue-3',
      difficulty: 'Easy',
      questionText: 'How do you decide between computed and watch in Vue 3?',
      modelAnswer:
        'Use computed for derived state and watch for side effects or async reactions to reactive changes.',
      tips: ['Derived state vs side effects is the key distinction.'],
      tags: ['vue', 'reactivity'],
    },
    {
      id: 'starter-vue-component-contracts',
      categoryId: 'technical-vue-3',
      difficulty: 'Medium',
      questionText: 'What makes a component API easy to maintain over time?',
      modelAnswer:
        'Clear props/events, minimal surface area, predictable defaults, and explicit ownership of state boundaries.',
      tips: ['Mention one-way data flow.', 'Discuss avoiding prop drilling where possible.'],
      tags: ['vue', 'component-design'],
    },
    {
      id: 'starter-vue-performance',
      categoryId: 'technical-vue-3',
      difficulty: 'Hard',
      questionText: 'How would you diagnose and improve a slow Vue page?',
      modelAnswer:
        'Profile renders, identify expensive reactive dependencies, reduce unnecessary updates, and optimize data-fetch timing.',
      tips: ['Use tooling evidence.', 'Prioritize biggest bottlenecks first.'],
      tags: ['vue', 'performance'],
    },
    {
      id: 'starter-vitest-mocking-strategy',
      categoryId: 'technical-vitest',
      difficulty: 'Medium',
      questionText: 'How do you decide what to mock in a Vitest unit test?',
      modelAnswer:
        'Mock external dependencies and keep the unit under test real, focusing on behavior and stable assertions.',
      tips: ['Call out network, time, and storage dependencies.'],
      tags: ['vitest', 'testing'],
    },
    {
      id: 'starter-vitest-test-design',
      categoryId: 'technical-vitest',
      difficulty: 'Easy',
      questionText: 'What does a high-quality unit test look like to you?',
      modelAnswer:
        'It has clear intent, isolates behavior, uses deterministic setup, and asserts outcomes that matter to users or consumers.',
      tips: ['Keep one behavior per test when possible.', 'Name tests with business meaning.'],
      tags: ['vitest', 'quality'],
    },
    {
      id: 'starter-vitest-flaky-tests',
      categoryId: 'technical-vitest',
      difficulty: 'Hard',
      questionText: 'How do you debug flaky tests in CI?',
      modelAnswer:
        'Stabilize time and randomness, isolate shared state, gather reproducible logs, and remove non-deterministic dependencies.',
      tips: ['Treat flakiness as a product bug.', 'Avoid excessive retries as a fix.'],
      tags: ['vitest', 'ci'],
    },
    {
      id: 'starter-vitest-coverage-meaning',
      categoryId: 'technical-vitest',
      difficulty: 'Medium',
      questionText: 'How do you use coverage metrics responsibly?',
      modelAnswer:
        'Use coverage to find blind spots, not as a proxy for quality, and prioritize meaningful behavior-level assertions.',
      tips: ['Discuss risk-based testing.', 'Avoid gaming percentages.'],
      tags: ['vitest', 'coverage'],
    },
    {
      id: 'starter-github-pr-review-flow',
      categoryId: 'technical-github',
      difficulty: 'Easy',
      questionText: 'Describe a healthy pull request review workflow on GitHub.',
      modelAnswer:
        'Keep PRs small, summarize intent and risk, request focused review, respond to feedback quickly, and merge with clean history.',
      tips: ['Mention CI status and reviewer context.'],
      tags: ['github', 'collaboration'],
    },
    {
      id: 'starter-github-branch-strategy',
      categoryId: 'technical-github',
      difficulty: 'Medium',
      questionText: 'What branch strategy works well for fast-moving teams?',
      modelAnswer:
        'Use short-lived branches, frequent integration to main, protected branch rules, and automation for quality gates.',
      tips: ['Balance speed and stability.', 'Mention rollback strategy.'],
      tags: ['github', 'workflow'],
    },
    {
      id: 'starter-github-codeowners',
      categoryId: 'technical-github',
      difficulty: 'Easy',
      questionText: 'How do CODEOWNERS and review rules improve team velocity?',
      modelAnswer:
        'They route changes to the right reviewers early, improve accountability, and reduce late-cycle rework.',
      tips: ['Mention ownership clarity.', 'Tie to reduced review latency.'],
      tags: ['github', 'reviews'],
    },
    {
      id: 'starter-github-release-hygiene',
      categoryId: 'technical-github',
      difficulty: 'Medium',
      questionText: 'How do you maintain clean release hygiene in GitHub?',
      modelAnswer:
        'Use semantic versioning, changelogs from PR labels, release notes, and CI checks tied to deployment confidence.',
      tips: ['Mention traceability.', 'Include rollback communication.'],
      tags: ['github', 'release'],
    },
  ],
};
