import { SYSTEM_CATEGORY_IDS } from '@/data/interviewQuestionPack';
import type { InterviewQuestionPackInput } from '@/types/interviewPractice';

export const frontendStaffRolePack: InterviewQuestionPackInput = {
  version: 1,
  categories: [
    {
      id: 'staff-frontend-architecture-strategy',
      name: 'Staff Frontend Architecture Strategy',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
    {
      id: 'staff-frontend-org-leadership',
      name: 'Staff Frontend Org Leadership',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
    {
      id: 'staff-frontend-quality-and-ops',
      name: 'Staff Frontend Quality and Ops',
      parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
    },
  ],
  questions: [
    {
      id: 'staff-general-scope-shaping',
      categoryId: SYSTEM_CATEGORY_IDS.general,
      difficulty: 'Medium',
      questionText: 'How do you shape problem scope before committing engineering investment?',
      modelAnswer:
        'Clarify user outcomes, evaluate business constraints, and frame options with tradeoffs so teams commit with intent.',
      tips: ['Discuss decision framing.', 'Balance speed and strategy.'],
      tags: ['general', 'strategy'],
    },
    {
      id: 'staff-behavioral-influence-without-authority',
      categoryId: SYSTEM_CATEGORY_IDS.behavioral,
      difficulty: 'Hard',
      questionText: 'Describe a time you influenced cross-team direction without direct authority.',
      modelAnswer:
        'Explain stakeholder alignment, data-backed proposals, iterative buy-in, and measurable organizational impact.',
      tips: ['Show influence mechanics.', 'Quantify impact.'],
      tags: ['behavioral', 'leadership'],
    },
    {
      id: 'staff-situational-roadmap-collision',
      categoryId: SYSTEM_CATEGORY_IDS.situational,
      difficulty: 'Hard',
      questionText:
        'Two strategic initiatives compete for the same frontend platform team. How do you decide?',
      modelAnswer:
        'Use objective prioritization criteria, expected value, risk, and sequence options while preserving trust through transparency.',
      tips: ['Name decision framework.', 'Address stakeholder communication.'],
      tags: ['situational', 'prioritization'],
    },
    {
      id: 'staff-arch-modular-boundaries',
      categoryId: 'staff-frontend-architecture-strategy',
      difficulty: 'Hard',
      questionText: 'How do you evolve a large frontend into clear module boundaries over time?',
      modelAnswer:
        'Create domain-aligned seams, enforce API contracts, and migrate incrementally with guardrails and observability.',
      tips: ['Discuss migration stages.', 'Minimize delivery disruption.'],
      tags: ['architecture', 'modularity'],
    },
    {
      id: 'staff-arch-technical-vision',
      categoryId: 'staff-frontend-architecture-strategy',
      difficulty: 'Medium',
      questionText: 'What makes a frontend technical vision actionable for multiple teams?',
      modelAnswer:
        'It combines principles, decision records, measurable milestones, and explicit ownership rather than aspirational statements.',
      tips: ['Mention governance model.', 'Tie vision to delivery metrics.'],
      tags: ['architecture', 'technical-vision'],
    },
    {
      id: 'staff-arch-build-vs-buy',
      categoryId: 'staff-frontend-architecture-strategy',
      difficulty: 'Hard',
      questionText:
        'How do you decide between building an internal frontend platform capability versus buying tooling?',
      modelAnswer:
        'Evaluate strategic differentiation, total cost of ownership, integration risk, and long-term maintainability before deciding.',
      tips: ['Use lifecycle cost framing.', 'Avoid tool bias.'],
      tags: ['architecture', 'platform'],
    },
    {
      id: 'staff-leadership-team-growth',
      categoryId: 'staff-frontend-org-leadership',
      difficulty: 'Medium',
      questionText: 'How do you raise frontend engineering standards across teams?',
      modelAnswer:
        'Set clear standards, create reusable examples, coach through reviews, and reinforce behavior via lightweight processes.',
      tips: ['Mention enablement over policing.', 'Use measurable quality indicators.'],
      tags: ['leadership', 'standards'],
    },
    {
      id: 'staff-leadership-conflicting-principals',
      categoryId: 'staff-frontend-org-leadership',
      difficulty: 'Hard',
      questionText: 'How do you handle conflicting architecture opinions among senior engineers?',
      modelAnswer:
        'Establish evaluation criteria, run bounded experiments, and decide with documented tradeoffs and clear ownership.',
      tips: ['Protect collaboration culture.', 'Avoid indefinite debates.'],
      tags: ['leadership', 'decision-making'],
    },
    {
      id: 'staff-leadership-mentoring',
      categoryId: 'staff-frontend-org-leadership',
      difficulty: 'Easy',
      questionText: 'How do you mentor mid-level frontend engineers toward senior scope?',
      modelAnswer:
        'Assign scoped leadership opportunities, coach decision quality, and provide feedback loops tied to impact and influence.',
      tips: ['Use stretch assignments.', 'Set clear growth markers.'],
      tags: ['leadership', 'mentoring'],
    },
    {
      id: 'staff-quality-prod-readiness',
      categoryId: 'staff-frontend-quality-and-ops',
      difficulty: 'Medium',
      questionText: 'What does frontend production readiness mean for critical releases?',
      modelAnswer:
        'It includes quality gates, observability, rollback readiness, and explicit ownership for post-release monitoring.',
      tips: ['Mention incident playbooks.', 'Define release criteria clearly.'],
      tags: ['quality', 'operations'],
    },
    {
      id: 'staff-quality-front-observability',
      categoryId: 'staff-frontend-quality-and-ops',
      difficulty: 'Hard',
      questionText:
        'How do you design frontend observability to accelerate debugging and business insights?',
      modelAnswer:
        'Instrument user flows with meaningful events, correlate technical and product signals, and standardize dashboards and alerting.',
      tips: ['Balance signal and noise.', 'Include privacy considerations.'],
      tags: ['quality', 'observability'],
    },
    {
      id: 'staff-quality-error-budget',
      categoryId: 'staff-frontend-quality-and-ops',
      difficulty: 'Hard',
      questionText: 'How would you use an error budget concept for frontend reliability?',
      modelAnswer:
        'Define reliability objectives, track burn rate, and use budget consumption to guide release pace and stabilization investment.',
      tips: ['Link reliability to planning.', 'Use clear policy thresholds.'],
      tags: ['quality', 'reliability'],
    },
  ],
};
