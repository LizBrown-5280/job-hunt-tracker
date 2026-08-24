import Dexie, { type Table } from 'dexie';
import type {
  ApplicationJourneyEvent,
  ApplicationRecord,
  ApplicationStatus,
} from '@/types/applications';
import type { InterviewQuestion, InterviewQuestionCategory } from '@/types/interviewPractice';

function toDateString(value: unknown, fallback: string) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return value;
}

function toStatus(value: unknown): ApplicationStatus {
  const allowed: ApplicationStatus[] = [
    'Not Started',
    'Applied',
    'Interview',
    'Offer',
    'Rejected',
    'Ghosted',
  ];

  if (typeof value === 'string' && allowed.includes(value as ApplicationStatus)) {
    return value as ApplicationStatus;
  }

  return 'Not Started';
}

function toIsoDate(value: unknown, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return trimmed.slice(0, 10);
}

function normalizeJourneyEvents(
  input: unknown,
  fallbackStatus: ApplicationStatus,
  fallbackDate: string,
  fallbackCreatedAt: string,
): ApplicationJourneyEvent[] {
  if (Array.isArray(input)) {
    const normalized = input
      .map((raw) => {
        if (!raw || typeof raw !== 'object') {
          return null;
        }

        const event = raw as Partial<ApplicationJourneyEvent>;
        const createdAt = toDateString(event.createdAt, fallbackCreatedAt);
        const updatedAt = toDateString(event.updatedAt, createdAt);
        const eventDate = toIsoDate(event.eventDate, '');
        if (!eventDate) {
          return null;
        }

        return {
          id:
            typeof event.id === 'string' && event.id
              ? event.id
              : `journey-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          status: toStatus(event.status),
          eventDate,
          note: typeof event.note === 'string' ? event.note : '',
          archivedAt: typeof event.archivedAt === 'string' ? event.archivedAt : null,
          createdAt,
          updatedAt,
        } satisfies ApplicationJourneyEvent;
      })
      .filter((event): event is ApplicationJourneyEvent => event !== null)
      .sort((a, b) => {
        const dateCmp = a.eventDate.localeCompare(b.eventDate);
        return dateCmp !== 0 ? dateCmp : a.createdAt.localeCompare(b.createdAt);
      });

    if (normalized.length) {
      return normalized;
    }
  }

  const normalizedFallbackDate = toIsoDate(fallbackDate, '');
  if (!normalizedFallbackDate) {
    return [];
  }

  return [
    {
      id: `journey-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      status: fallbackStatus,
      eventDate: normalizedFallbackDate,
      note: '',
      archivedAt: null,
      createdAt: fallbackCreatedAt,
      updatedAt: fallbackCreatedAt,
    },
  ];
}

export class JobHuntDatabase extends Dexie {
  applications!: Table<ApplicationRecord, number>;
  interviewQuestionCategories!: Table<InterviewQuestionCategory, string>;
  interviewQuestions!: Table<InterviewQuestion, string>;

  constructor() {
    super('job-hunt-tracker');
    this.version(2).stores({
      applications:
        '++id, company, role, status, appliedDate, nextAction, followUpDate, priority, createdAt, updatedAt',
    });
    this.version(3)
      .stores({
        applications:
          '++id, company, role, status, appliedDate, nextAction, followUpDate, priority, favoriteRating, previousFavoriteRating, favoriteUpdatedAt, createdAt, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('applications')
          .toCollection()
          .modify((record: Partial<ApplicationRecord>) => {
            const now = new Date().toISOString();
            const createdAt = toDateString(record.createdAt, now);

            record.status = toStatus(record.status);
            record.appliedDate =
              typeof record.appliedDate === 'string' && record.appliedDate
                ? record.appliedDate
                : createdAt.slice(0, 10);
            record.company = typeof record.company === 'string' ? record.company : '';
            record.role = typeof record.role === 'string' ? record.role : '';
            record.nextAction = typeof record.nextAction === 'string' ? record.nextAction : '';
            record.notes = typeof record.notes === 'string' ? record.notes : '';
            record.followUpDate =
              typeof record.followUpDate === 'string' ? record.followUpDate : '';
            record.favoriteRating =
              typeof record.favoriteRating === 'number' ? record.favoriteRating : 0;
            record.createdAt = createdAt;
            record.updatedAt = toDateString(record.updatedAt, createdAt);
          });
      });
    this.version(4)
      .stores({
        applications:
          '++id, company, companyId, role, positionId, status, appliedDate, nextAction, followUpDate, priority, favoriteRating, previousFavoriteRating, favoriteUpdatedAt, createdAt, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('applications')
          .toCollection()
          .modify((record: Partial<ApplicationRecord>) => {
            record.companyId = typeof record.companyId === 'number' ? record.companyId : null;
            record.positionId = typeof record.positionId === 'number' ? record.positionId : null;
          });
      });
    this.version(5)
      .stores({
        applications:
          '++id, company, companyId, role, positionId, recruiterId, recruiterName, status, appliedDate, nextAction, followUpDate, priority, favoriteRating, previousFavoriteRating, favoriteUpdatedAt, createdAt, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('applications')
          .toCollection()
          .modify((record: Partial<ApplicationRecord>) => {
            record.recruiterId = typeof record.recruiterId === 'number' ? record.recruiterId : null;
            record.recruiterName =
              typeof record.recruiterName === 'string' ? record.recruiterName : '';
          });
      });
    this.version(6)
      .stores({
        applications:
          '++id, company, companyId, role, positionId, recruiterId, recruiterName, status, appliedDate, nextAction, followUpDate, priority, favoriteRating, previousFavoriteRating, favoriteUpdatedAt, archivedAt, createdAt, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('applications')
          .toCollection()
          .modify((record: Partial<ApplicationRecord>) => {
            record.archivedAt = typeof record.archivedAt === 'string' ? record.archivedAt : null;
          });
      });
    this.version(7)
      .stores({
        applications:
          '++id, company, companyId, role, positionId, recruiterId, recruiterName, status, appliedDate, nextAction, followUpDate, priority, favoriteRating, previousFavoriteRating, favoriteUpdatedAt, archivedAt, createdAt, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('applications')
          .toCollection()
          .modify((record: Partial<ApplicationRecord>) => {
            const createdAt = toDateString(record.createdAt, new Date().toISOString());
            const fallbackStatus = toStatus(record.status);
            const fallbackAppliedDate = toIsoDate(record.appliedDate, '');
            record.journeyEvents = normalizeJourneyEvents(
              record.journeyEvents,
              fallbackStatus,
              fallbackAppliedDate,
              createdAt,
            );
          });
      });
    this.version(8).stores({
      applications:
        '++id, company, companyId, role, positionId, recruiterId, recruiterName, status, appliedDate, nextAction, followUpDate, priority, favoriteRating, previousFavoriteRating, favoriteUpdatedAt, archivedAt, createdAt, updatedAt',
      interviewQuestionCategories: 'id, parentCategoryId, source, archivedAt, createdAt',
      interviewQuestions: 'id, categoryId, difficulty, source, archivedAt, createdAt, updatedAt',
    });
  }
}

export const db = new JobHuntDatabase();
