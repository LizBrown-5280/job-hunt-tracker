import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { db } from '@/db/database';
import { SYSTEM_CATEGORY_IDS } from '@/data/interviewQuestionPack';
import { useInterviewPracticeStore } from '@/stores/interviewPractice';

describe('interview practice question bank', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    await db.delete();
    await db.open();
  });

  it('seeds all generic categories and starter questions', async () => {
    const store = useInterviewPracticeStore();

    await store.initialize();

    const categories = await store.getCategories();
    const questions = await store.getQuestions();

    expect(categories.map((category) => category.id)).toEqual(
      expect.arrayContaining(Object.values(SYSTEM_CATEGORY_IDS)),
    );
    expect(questions).toHaveLength(3);
    expect(
      questions.find((question) => question.questionText === 'Tell me about yourself.'),
    ).toMatchObject({ categoryId: SYSTEM_CATEGORY_IDS.general, source: 'system' });
  });

  it('loads nested categories and questions as one bulk pack', async () => {
    const store = useInterviewPracticeStore();

    const result = await store.loadQuestionPack({
      version: 1,
      categories: [
        {
          id: 'technical-vue-3',
          name: 'Vue 3',
          parentCategoryId: SYSTEM_CATEGORY_IDS.technical,
        },
      ],
      questions: [
        {
          id: 'vue-composition-api',
          categoryId: 'technical-vue-3',
          difficulty: 'Medium',
          questionText: 'What is the Composition API in Vue 3?',
          modelAnswer: 'It organizes component logic into composables.',
          tips: ['Mention composables.'],
          tags: ['vue', 'composition-api'],
        },
      ],
    });

    expect(result).toEqual({ categoriesAdded: 1, questionsAdded: 1 });
    expect(await store.getQuestions('technical-vue-3')).toHaveLength(1);
  });

  it('filters and selects random questions without exceeding the requested count', async () => {
    const store = useInterviewPracticeStore();

    await store.initialize();

    const behavioralQuestions = await store.getQuestions(SYSTEM_CATEGORY_IDS.behavioral);
    const randomQuestions = await store.getRandomQuestions(20);

    expect(behavioralQuestions).toHaveLength(1);
    expect(randomQuestions).toHaveLength(3);
  });

  it('rejects invalid packs without writing partial data', async () => {
    const store = useInterviewPracticeStore();

    await expect(
      store.loadQuestionPackJson(
        JSON.stringify({
          version: 1,
          categories: [
            { id: 'technical-invalid', name: 'Invalid', parentCategoryId: 'missing-parent' },
          ],
          questions: [],
        }),
      ),
    ).rejects.toThrow('Every imported parent category must exist');

    expect(await db.interviewQuestionCategories.get('technical-invalid')).toBeUndefined();
  });
});
