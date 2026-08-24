import { defineStore } from 'pinia';
import { db } from '@/db/database';
import { SYSTEM_CATEGORY_IDS, systemInterviewQuestionPack } from '@/data/interviewQuestionPack';
import type {
  InterviewQuestion,
  InterviewQuestionCategory,
  InterviewQuestionPackInput,
  InterviewQuestionDifficulty,
} from '@/types/interviewPractice';

type InterviewPackLoadResult = {
  categoriesAdded: number;
  questionsAdded: number;
};

const difficulties: InterviewQuestionDifficulty[] = ['Easy', 'Medium', 'Hard'];

function isDifficulty(value: unknown): value is InterviewQuestionDifficulty {
  return typeof value === 'string' && difficulties.includes(value as InterviewQuestionDifficulty);
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
  state: () => ({
    initialized: false,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async initialize() {
      if (this.initialized || this.loading) {
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const existingSystemCategory = await db.interviewQuestionCategories
          .where('id')
          .equals(SYSTEM_CATEGORY_IDS.general)
          .first();

        if (!existingSystemCategory) {
          await db.transaction(
            'rw',
            db.interviewQuestionCategories,
            db.interviewQuestions,
            async () => {
              await db.interviewQuestionCategories.bulkAdd(systemInterviewQuestionPack.categories);
              await db.interviewQuestions.bulkAdd(systemInterviewQuestionPack.questions);
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
  },
});
