export type InterviewContentSource = 'system' | 'user' | 'imported';
export type InterviewQuestionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type InterviewResponseReviewTag = 'favorite' | 'needs-work' | null;

export interface InterviewQuestionCategory {
  id: string;
  name: string;
  parentCategoryId: string | null;
  source: InterviewContentSource;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  id: string;
  categoryId: string;
  difficulty: InterviewQuestionDifficulty;
  questionText: string;
  modelAnswer: string | null;
  tips: string[];
  tags: string[];
  source: InterviewContentSource;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestionPack {
  version: 1;
  categories: InterviewQuestionCategory[];
  questions: InterviewQuestion[];
}

export interface InterviewPracticeSessionRecord {
  id: string;
  categoryId: string | null;
  questionIds: string[];
  currentStep: number;
  reflectionNote: string;
  startedAt: string;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewResponseRecord {
  id: string;
  sessionId: string;
  questionId: string;
  responseText: string;
  rating: number | null;
  reviewTag: InterviewResponseReviewTag;
  createdAt: string;
  updatedAt: string;
}

export type InterviewQuestionInput = Omit<
  InterviewQuestion,
  'id' | 'source' | 'archivedAt' | 'createdAt' | 'updatedAt'
> & {
  id?: string;
  source?: InterviewContentSource;
};

export type InterviewQuestionCategoryInput = Omit<
  InterviewQuestionCategory,
  'id' | 'source' | 'archivedAt' | 'createdAt' | 'updatedAt'
> & {
  id?: string;
  source?: InterviewContentSource;
};

export interface InterviewQuestionPackInput {
  version: 1;
  categories: InterviewQuestionCategoryInput[];
  questions: InterviewQuestionInput[];
}
