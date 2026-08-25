import { defineStore } from 'pinia';
import { db } from '@/db/database';
import { SYSTEM_CATEGORY_IDS, systemInterviewQuestionPack } from '@/data/interviewQuestionPack';
import type {
  InterviewResponseReviewTag,
  InterviewPracticeSessionRecord,
  InterviewQuestion,
  InterviewQuestionCategory,
  InterviewQuestionPackInput,
  InterviewQuestionDifficulty,
  InterviewResponseRecord,
} from '@/types/interviewPractice';

type InterviewPackLoadResult = {
  categoriesAdded: number;
  questionsAdded: number;
};

type StartInterviewSessionOptions = {
  categoryId?: string | null;
  questionCount?: number;
};

type InterviewSessionProgress = {
  total: number;
  current: number;
  percent: number;
  isComplete: boolean;
};

type InterviewPracticeState = {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  selectedCategoryId: string | null;
  sessionQuestionIds: string[];
  currentStep: number;
  responsesByQuestionId: Record<string, string>;
  sessionId: string | null;
  sessionFinishedAt: string | null;
};

type InterviewSessionLoadResult = {
  restored: boolean;
  questionIds: string[];
};

type InterviewSessionSummary = {
  sessionId: string;
  totalQuestions: number;
  answeredQuestions: number;
  favoritedCount: number;
  needsWorkCount: number;
  averageRating: number | null;
  startedAt: string;
  finishedAt: string | null;
  reflectionNote: string;
};

const difficulties: InterviewQuestionDifficulty[] = ['Easy', 'Medium', 'Hard'];

function isDifficulty(value: unknown): value is InterviewQuestionDifficulty {
  return typeof value === 'string' && difficulties.some((difficulty) => difficulty === value);
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function now() {
  return new Date().toISOString();
}

function normalizeCategory(
  category: InterviewQuestionPackInput['categories'][number],
  timestamp: string,
): InterviewQuestionCategory {
  return {
    id: category.id ?? crypto.randomUUID(),
    name: category.name.trim(),
    parentCategoryId: category.parentCategoryId,
    source: category.source ?? 'imported',
    archivedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function normalizeQuestion(
  question: InterviewQuestionPackInput['questions'][number],
  timestamp: string,
): InterviewQuestion {
  return {
    id: question.id ?? crypto.randomUUID(),
    categoryId: question.categoryId,
    difficulty: question.difficulty,
    questionText: question.questionText.trim(),
    modelAnswer: question.modelAnswer?.trim() || null,
    tips: Array.isArray(question.tips)
      ? question.tips.filter(hasText).map((tip) => tip.trim())
      : [],
    tags: Array.isArray(question.tags)
      ? question.tags.filter(hasText).map((tag) => tag.trim())
      : [],
    source: question.source ?? 'imported',
    archivedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export const useInterviewPracticeStore = defineStore('interviewPractice', {
  state: (): InterviewPracticeState => ({
    initialized: false,
    loading: false,
    error: null,
    selectedCategoryId: null,
    sessionQuestionIds: [],
    currentStep: 0,
    responsesByQuestionId: {},
    sessionId: null,
    sessionFinishedAt: null,
  }),

  getters: {
    hasSession(state): boolean {
      return state.sessionQuestionIds.length > 0;
    },

    currentQuestionId(state): string | null {
      if (!state.sessionQuestionIds.length) {
        return null;
      }

      return state.sessionQuestionIds[state.currentStep] ?? null;
    },

    canGoPrevious(state): boolean {
      return state.currentStep > 0;
    },

    canGoNext(state): boolean {
      return state.currentStep + 1 < state.sessionQuestionIds.length;
    },

    sessionProgress(state): InterviewSessionProgress {
      const total = state.sessionQuestionIds.length;
      if (!total) {
        return { total: 0, current: 0, percent: 0, isComplete: false };
      }

      const current = Math.min(state.currentStep + 1, total);
      const percent = Math.round((current / total) * 100);

      return {
        total,
        current,
        percent,
        isComplete: state.sessionFinishedAt !== null,
      };
    },
  },

  actions: {
    async initialize() {
      if (this.initialized || this.loading) {
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const systemCategoryIds = Object.values(SYSTEM_CATEGORY_IDS);
        const existingSystemCategories =
          await db.interviewQuestionCategories.bulkGet(systemCategoryIds);

        if (existingSystemCategories.some((category) => !category)) {
          await db.transaction(
            'rw',
            db.interviewQuestionCategories,
            db.interviewQuestions,
            async () => {
              for (const category of systemInterviewQuestionPack.categories) {
                await db.interviewQuestionCategories.put(category);
              }

              for (const question of systemInterviewQuestionPack.questions) {
                await db.interviewQuestions.put(question);
              }
            },
          );
        }

        this.initialized = true;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Unable to initialize interview questions.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loadQuestionPack(pack: InterviewQuestionPackInput): Promise<InterviewPackLoadResult> {
      await this.initialize();

      if (
        !pack ||
        typeof pack !== 'object' ||
        !Array.isArray(pack.categories) ||
        !Array.isArray(pack.questions)
      ) {
        throw new Error('Interview question pack must include categories and questions arrays.');
      }

      if (pack.version !== 1) {
        throw new Error('Unsupported interview question pack version.');
      }

      const categories = pack.categories.map((category) => normalizeCategory(category, now()));
      const questions = pack.questions.map((question) => normalizeQuestion(question, now()));
      const categoryIdsInPack = categories.map((category) => category.id);
      const questionIdsInPack = questions.map((question) => question.id);
      const existingCategoryIds = new Set(
        await db.interviewQuestionCategories.toCollection().primaryKeys(),
      );
      const existingQuestionIds = new Set(await db.interviewQuestions.toCollection().primaryKeys());
      const categoryIds = new Set([
        ...existingCategoryIds,
        ...categories.map((category) => category.id),
      ]);

      if (categories.some((category) => !hasText(category.name))) {
        throw new Error('Every imported category needs a name.');
      }
      if (
        categories.some(
          (category) => category.parentCategoryId && !categoryIds.has(category.parentCategoryId),
        )
      ) {
        throw new Error('Every imported parent category must exist in the pack or database.');
      }
      if (
        questions.some(
          (question) =>
            !hasText(question.questionText) ||
            !categoryIds.has(question.categoryId) ||
            !isDifficulty(question.difficulty),
        )
      ) {
        throw new Error(
          'Every imported question needs text, a valid category, and a supported difficulty.',
        );
      }
      if (categories.some((category) => existingCategoryIds.has(category.id))) {
        throw new Error('An imported category ID already exists.');
      }
      if (questions.some((question) => existingQuestionIds.has(question.id))) {
        throw new Error('An imported question ID already exists.');
      }
      if (new Set(categoryIdsInPack).size !== categoryIdsInPack.length) {
        throw new Error('Imported category IDs must be unique.');
      }
      if (new Set(questionIdsInPack).size !== questionIdsInPack.length) {
        throw new Error('Imported question IDs must be unique.');
      }

      await db.transaction(
        'rw',
        db.interviewQuestionCategories,
        db.interviewQuestions,
        async () => {
          await db.interviewQuestionCategories.bulkAdd(categories);
          await db.interviewQuestions.bulkAdd(questions);
        },
      );

      return { categoriesAdded: categories.length, questionsAdded: questions.length };
    },

    async loadQuestionPackJson(json: string): Promise<InterviewPackLoadResult> {
      let parsed: unknown;

      try {
        parsed = JSON.parse(json);
      } catch {
        throw new Error('Interview question pack must contain valid JSON.');
      }

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Interview question pack must be a JSON object.');
      }

      return this.loadQuestionPack(parsed as InterviewQuestionPackInput);
    },

    async getCategories() {
      await this.initialize();
      const categories = await db.interviewQuestionCategories.toArray();
      return categories.filter((category) => !category.archivedAt);
    },

    async getQuestions(categoryId?: string) {
      await this.initialize();
      const questions = categoryId
        ? await db.interviewQuestions.where('categoryId').equals(categoryId).toArray()
        : await db.interviewQuestions.toArray();
      return questions.filter((question) => !question.archivedAt);
    },

    async getRandomQuestions(count: number, categoryId?: string) {
      const questions = await this.getQuestions(categoryId);
      return questions.sort(() => Math.random() - 0.5).slice(0, Math.max(0, count));
    },

    async startSession(options: StartInterviewSessionOptions = {}) {
      await this.initialize();

      const categoryId = options.categoryId ?? null;
      const questionCount = Math.max(0, options.questionCount ?? 0);
      const timestamp = now();
      const questions =
        questionCount > 0
          ? await this.getRandomQuestions(questionCount, categoryId ?? undefined)
          : await this.getQuestions(categoryId ?? undefined);
      const questionIds = questions.map((question) => question.id);

      const sessionId = crypto.randomUUID();
      const session: InterviewPracticeSessionRecord = {
        id: sessionId,
        categoryId,
        questionIds,
        currentStep: 0,
        reflectionNote: '',
        startedAt: timestamp,
        finishedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await db.interviewPracticeSessions.put(session);

      this.selectedCategoryId = categoryId;
      this.sessionQuestionIds = questionIds;
      this.currentStep = 0;
      this.responsesByQuestionId = {};
      this.sessionId = sessionId;
      this.sessionFinishedAt = null;

      return this.sessionQuestionIds;
    },

    async resumeLastSession(): Promise<InterviewSessionLoadResult> {
      await this.initialize();

      const lastSession = await db.interviewPracticeSessions.orderBy('updatedAt').reverse().first();

      if (!lastSession) {
        return { restored: false, questionIds: [] };
      }

      const responses = await db.interviewResponses
        .where('sessionId')
        .equals(lastSession.id)
        .toArray();
      const responsesByQuestionId = responses.reduce<Record<string, string>>((acc, response) => {
        acc[response.questionId] = response.responseText;
        return acc;
      }, {});

      this.sessionId = lastSession.id;
      this.selectedCategoryId = lastSession.categoryId;
      this.sessionQuestionIds = lastSession.questionIds;
      this.currentStep = Math.max(
        0,
        Math.min(lastSession.currentStep, Math.max(lastSession.questionIds.length - 1, 0)),
      );
      this.responsesByQuestionId = responsesByQuestionId;
      this.sessionFinishedAt = lastSession.finishedAt;

      return { restored: true, questionIds: lastSession.questionIds };
    },

    async persistSessionProgress() {
      if (!this.sessionId) {
        return;
      }

      const existing = await db.interviewPracticeSessions.get(this.sessionId);
      if (!existing) {
        return;
      }

      await db.interviewPracticeSessions.put({
        ...existing,
        currentStep: this.currentStep,
        finishedAt: this.sessionFinishedAt,
        updatedAt: now(),
      });
    },

    async goToPreviousQuestion() {
      if (!this.canGoPrevious) {
        return this.currentStep;
      }

      this.currentStep -= 1;
      await this.persistSessionProgress();
      return this.currentStep;
    },

    async goToNextQuestion() {
      if (!this.canGoNext) {
        return this.currentStep;
      }

      this.currentStep += 1;
      await this.persistSessionProgress();
      return this.currentStep;
    },

    async updateCurrentResponse(response: string) {
      const questionId = this.currentQuestionId;
      if (!questionId) {
        return;
      }

      this.responsesByQuestionId = {
        ...this.responsesByQuestionId,
        [questionId]: response,
      };

      if (!this.sessionId) {
        return;
      }

      const timestamp = now();
      const existing = await db.interviewResponses.get(`${this.sessionId}:${questionId}`);
      const record: InterviewResponseRecord = {
        id: `${this.sessionId}:${questionId}`,
        sessionId: this.sessionId,
        questionId,
        responseText: response,
        rating: existing?.rating ?? null,
        reviewTag: existing?.reviewTag ?? null,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      };

      await db.interviewResponses.put(record);
    },

    async restartSession() {
      this.currentStep = 0;
      this.responsesByQuestionId = {};
      this.sessionFinishedAt = null;
      await this.persistSessionProgress();

      if (this.sessionId) {
        await db.interviewResponses.where('sessionId').equals(this.sessionId).delete();
      }
    },

    async finishSession() {
      if (!this.hasSession || this.sessionFinishedAt) {
        return this.sessionFinishedAt;
      }

      this.sessionFinishedAt = now();
      await this.persistSessionProgress();
      return this.sessionFinishedAt;
    },

    async getResponsesForSession(sessionId: string) {
      return db.interviewResponses.where('sessionId').equals(sessionId).toArray();
    },

    async setResponseRating(sessionId: string, questionId: string, rating: number | null) {
      const responseId = `${sessionId}:${questionId}`;
      const existing = await db.interviewResponses.get(responseId);
      if (!existing) {
        return;
      }

      await db.interviewResponses.put({
        ...existing,
        rating,
        updatedAt: now(),
      });
    },

    async setResponseReviewTag(
      sessionId: string,
      questionId: string,
      reviewTag: InterviewResponseReviewTag,
    ) {
      const responseId = `${sessionId}:${questionId}`;
      const existing = await db.interviewResponses.get(responseId);
      if (!existing) {
        return;
      }

      await db.interviewResponses.put({
        ...existing,
        reviewTag,
        updatedAt: now(),
      });
    },

    async setSessionReflectionNote(sessionId: string, reflectionNote: string) {
      const existing = await db.interviewPracticeSessions.get(sessionId);
      if (!existing) {
        return;
      }

      await db.interviewPracticeSessions.put({
        ...existing,
        reflectionNote,
        updatedAt: now(),
      });
    },

    async getSessionSummary(sessionId: string): Promise<InterviewSessionSummary | null> {
      const session = await db.interviewPracticeSessions.get(sessionId);
      if (!session) {
        return null;
      }

      const responses = await this.getResponsesForSession(sessionId);
      const answeredQuestions = responses.filter((response) => response.responseText.trim()).length;
      const favoritedCount = responses.filter(
        (response) => response.reviewTag === 'favorite',
      ).length;
      const needsWorkCount = responses.filter(
        (response) => response.reviewTag === 'needs-work',
      ).length;
      const ratings = responses
        .map((response) => response.rating)
        .filter((rating): rating is number => typeof rating === 'number');

      return {
        sessionId,
        totalQuestions: session.questionIds.length,
        answeredQuestions,
        favoritedCount,
        needsWorkCount,
        averageRating: ratings.length
          ? Number(
              (ratings.reduce((total, rating) => total + rating, 0) / ratings.length).toFixed(2),
            )
          : null,
        startedAt: session.startedAt,
        finishedAt: session.finishedAt,
        reflectionNote: session.reflectionNote,
      };
    },
  },
});
