export type InterviewContentSource = 'system' | 'user' | 'imported';
export type InterviewQuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

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
