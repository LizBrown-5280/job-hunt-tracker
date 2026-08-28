import Dexie, { type Table } from 'dexie';
import type { ApplicationRecord } from '@/types/applications';
import type {
  InterviewPracticeSessionRecord,
  InterviewQuestion,
  InterviewQuestionCategory,
  InterviewResponseRecord,
} from '@/types/interviewPractice';
import type { CompanyRecord, PositionRecord, RecruiterRecord } from '@/types/networking';

export class JobHuntDatabase extends Dexie {
  applications!: Table<ApplicationRecord, number>;
  companies!: Table<CompanyRecord, number>;
  interviewQuestionCategories!: Table<InterviewQuestionCategory, string>;
  interviewQuestions!: Table<InterviewQuestion, string>;
  interviewPracticeSessions!: Table<InterviewPracticeSessionRecord, string>;
  interviewResponses!: Table<InterviewResponseRecord, string>;
  positions!: Table<PositionRecord, number>;
  recruiters!: Table<RecruiterRecord, number>;

  constructor() {
    super('job-hunt-tracker-dev');
    this.version(1).stores({
      applications:
        '++id, company, companyId, role, positionId, recruiterId, recruiterName, status, appliedDate, nextAction, followUpDate, priority, favoriteRating, previousFavoriteRating, favoriteUpdatedAt, archivedAt, createdAt, updatedAt',
      companies: '++id, name, industry, status, archivedAt, createdAt, updatedAt',
      positions: '++id, title, companyId, recruiterId, status, archivedAt, createdAt, updatedAt',
      recruiters: '++id, name, companyId, relationship, archivedAt, createdAt, updatedAt',
      interviewQuestionCategories: 'id, parentCategoryId, source, archivedAt, createdAt',
      interviewQuestions: 'id, categoryId, difficulty, source, archivedAt, createdAt, updatedAt',
      interviewPracticeSessions: 'id, categoryId, startedAt, finishedAt, createdAt, updatedAt',
      interviewResponses: 'id, sessionId, questionId, updatedAt, [sessionId+questionId]',
    });
  }
}

export const db = new JobHuntDatabase();
