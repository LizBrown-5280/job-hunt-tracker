import type { InterviewQuestionPack } from '@/types/interviewPractice';

export const SYSTEM_CATEGORY_IDS = {
  general: 'system-general',
  behavioral: 'system-behavioral',
  situational: 'system-situational',
  technical: 'system-technical',
} as const;

const seedTimestamp = '2026-08-24T00:00:00.000Z';

export const systemInterviewQuestionPack: InterviewQuestionPack = {
  version: 1,
  categories: [
    {
      id: SYSTEM_CATEGORY_IDS.general,
      name: 'General',
      parentCategoryId: null,
      source: 'system',
      archivedAt: null,
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
    {
      id: SYSTEM_CATEGORY_IDS.behavioral,
      name: 'Behavioral',
      parentCategoryId: null,
      source: 'system',
      archivedAt: null,
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
    {
      id: SYSTEM_CATEGORY_IDS.situational,
      name: 'Situational',
      parentCategoryId: null,
      source: 'system',
      archivedAt: null,
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
    {
      id: SYSTEM_CATEGORY_IDS.technical,
      name: 'Technical',
      parentCategoryId: null,
      source: 'system',
      archivedAt: null,
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
  ],
  questions: [
    {
      id: 'system-general-tell-me-about-yourself',
      categoryId: SYSTEM_CATEGORY_IDS.general,
      difficulty: 'Easy',
      questionText: 'Tell me about yourself.',
      modelAnswer:
        'Give a concise, role-relevant summary of your current focus, relevant experience, and the kind of work you want to do next.',
      tips: ['Keep it focused on your professional story.', 'Connect your experience to the role.'],
      tags: ['introduction', 'story'],
      source: 'system',
      archivedAt: null,
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
    {
      id: 'system-behavioral-strength',
      categoryId: SYSTEM_CATEGORY_IDS.behavioral,
      difficulty: 'Easy',
      questionText: 'What is one of your strengths?',
      modelAnswer:
        'Choose a strength that matters for the role, then support it with a specific example and result.',
      tips: ['Use a real example.', 'Avoid listing strengths without evidence.'],
      tags: ['strengths', 'self-awareness'],
      source: 'system',
      archivedAt: null,
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
    {
      id: 'system-situational-priorities',
      categoryId: SYSTEM_CATEGORY_IDS.situational,
      difficulty: 'Medium',
      questionText: 'How would you prioritize several urgent tasks at once?',
      modelAnswer:
        'Clarify impact, deadlines, dependencies, and expectations, then communicate a prioritized plan and revisit it as new information appears.',
      tips: ['Explain your decision criteria.', 'Mention communication and reassessment.'],
      tags: ['prioritization', 'planning'],
      source: 'system',
      archivedAt: null,
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
  ],
};
