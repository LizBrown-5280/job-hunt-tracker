import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { db } from '@/db/database';
import { fullstackJsTsRolePack } from '@/data/interviewRolePackFullstack';
import { frontendVueTypeScriptRolePack } from '@/data/interviewRolePackFrontend';
import { frontendMidRolePack } from '@/data/interviewRolePackFrontendMid';
import { frontendStaffRolePack } from '@/data/interviewRolePackFrontendStaff';
import { interviewStarterPack } from '@/data/interviewStarterPack';
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

  it('handles zero-question sessions and keeps navigation bounded', async () => {
    const store = useInterviewPracticeStore();

    await store.startSession({ categoryId: SYSTEM_CATEGORY_IDS.technical });

    expect(store.hasSession).toBe(false);
    expect(store.currentQuestionId).toBeNull();
    expect(store.sessionProgress).toMatchObject({ total: 0, current: 0, percent: 0 });

    await store.goToPreviousQuestion();
    await store.goToNextQuestion();

    expect(store.currentStep).toBe(0);
  });

  it('supports a single-question category session with restart flow', async () => {
    const store = useInterviewPracticeStore();

    await store.startSession({ categoryId: SYSTEM_CATEGORY_IDS.general, questionCount: 1 });

    expect(store.sessionQuestionIds).toHaveLength(1);
    expect(store.sessionProgress).toMatchObject({ total: 1, current: 1, percent: 100 });
    expect(store.canGoPrevious).toBe(false);
    expect(store.canGoNext).toBe(false);

    await store.updateCurrentResponse('Practice answer');
    expect(store.responsesByQuestionId[store.currentQuestionId as string]).toBe('Practice answer');

    await store.restartSession();

    expect(store.currentStep).toBe(0);
    expect(store.responsesByQuestionId).toEqual({});
    expect(store.sessionFinishedAt).toBeNull();
  });

  it('supports mixed-category sessions and finishing early without response loss', async () => {
    const store = useInterviewPracticeStore();

    await store.startSession({ questionCount: 3 });

    expect(store.sessionQuestionIds).toHaveLength(3);
    expect(store.canGoNext).toBe(true);

    const firstQuestionId = store.currentQuestionId as string;
    await store.updateCurrentResponse('First draft response');

    await store.goToNextQuestion();
    await store.finishSession();

    expect(store.sessionFinishedAt).toBeTruthy();
    expect(store.responsesByQuestionId[firstQuestionId]).toBe('First draft response');
    expect(store.sessionProgress.isComplete).toBe(true);
  });

  it('persists responses by session and restores on resume', async () => {
    const store = useInterviewPracticeStore();

    await store.startSession({ questionCount: 2 });
    const sessionId = store.sessionId as string;
    const firstQuestionId = store.currentQuestionId as string;

    await store.updateCurrentResponse('Saved answer for first question');

    await store.goToNextQuestion();
    const secondQuestionId = store.currentQuestionId as string;
    await store.updateCurrentResponse('Saved answer for second question');

    const responses = await store.getResponsesForSession(sessionId);
    expect(responses).toHaveLength(2);
    expect(responses.find((item) => item.questionId === firstQuestionId)?.responseText).toBe(
      'Saved answer for first question',
    );
    expect(responses.find((item) => item.questionId === secondQuestionId)?.responseText).toBe(
      'Saved answer for second question',
    );

    const resumedStore = useInterviewPracticeStore();
    const result = await resumedStore.resumeLastSession();

    expect(result.restored).toBe(true);
    expect(resumedStore.sessionId).toBe(sessionId);
    expect(resumedStore.responsesByQuestionId[firstQuestionId]).toBe(
      'Saved answer for first question',
    );
    expect(resumedStore.responsesByQuestionId[secondQuestionId]).toBe(
      'Saved answer for second question',
    );
  });

  it('loads a multi-question starter pack and practices imported categories', async () => {
    const store = useInterviewPracticeStore();

    const result = await store.loadQuestionPack(interviewStarterPack);

    expect(result).toEqual({
      categoriesAdded: interviewStarterPack.categories.length,
      questionsAdded: interviewStarterPack.questions.length,
    });

    const vueQuestions = await store.getQuestions('technical-vue-3');
    expect(vueQuestions.length).toBeGreaterThan(0);

    const sessionIds = await store.startSession({ categoryId: 'technical-vue-3' });
    expect(sessionIds.length).toBeGreaterThan(0);
    expect(store.currentQuestionId).toBe(vueQuestions[0]?.id ?? null);
  });

  it('stores reflection notes and computes summary metrics from rated responses', async () => {
    const store = useInterviewPracticeStore();

    await store.startSession({ questionCount: 2 });
    const sessionId = store.sessionId as string;
    const firstQuestionId = store.currentQuestionId as string;

    await store.updateCurrentResponse('First complete answer');
    await store.setResponseRating(sessionId, firstQuestionId, 4);
    await store.setResponseReviewTag(sessionId, firstQuestionId, 'favorite');

    await store.goToNextQuestion();
    const secondQuestionId = store.currentQuestionId as string;
    await store.updateCurrentResponse('Second answer with gaps');
    await store.setResponseRating(sessionId, secondQuestionId, 2);
    await store.setResponseReviewTag(sessionId, secondQuestionId, 'needs-work');

    await store.setSessionReflectionNote(sessionId, 'Focus on concise examples.');
    await store.finishSession();

    const summary = await store.getSessionSummary(sessionId);
    expect(summary).not.toBeNull();
    expect(summary).toMatchObject({
      totalQuestions: 2,
      answeredQuestions: 2,
      favoritedCount: 1,
      needsWorkCount: 1,
      averageRating: 3,
      reflectionNote: 'Focus on concise examples.',
    });
  });

  it('loads targeted frontend role pack and practices from role-specific categories', async () => {
    const store = useInterviewPracticeStore();

    const result = await store.loadQuestionPack(frontendVueTypeScriptRolePack);

    expect(result).toEqual({
      categoriesAdded: frontendVueTypeScriptRolePack.categories.length,
      questionsAdded: frontendVueTypeScriptRolePack.questions.length,
    });

    const architectureQuestions = await store.getQuestions('role-frontend-architecture');
    expect(architectureQuestions.length).toBeGreaterThan(0);

    const sessionIds = await store.startSession({ categoryId: 'role-frontend-architecture' });
    expect(sessionIds.length).toBeGreaterThan(0);
  });

  it('loads mid-level frontend role pack and starts sessions in pack categories', async () => {
    const store = useInterviewPracticeStore();

    const result = await store.loadQuestionPack(frontendMidRolePack);
    expect(result).toEqual({
      categoriesAdded: frontendMidRolePack.categories.length,
      questionsAdded: frontendMidRolePack.questions.length,
    });

    const sessionIds = await store.startSession({ categoryId: 'mid-frontend-core-vue' });
    expect(sessionIds.length).toBeGreaterThan(0);
  });

  it('loads staff/frontend and fullstack packs without ID collisions', async () => {
    const store = useInterviewPracticeStore();

    const staffResult = await store.loadQuestionPack(frontendStaffRolePack);
    const fullstackResult = await store.loadQuestionPack(fullstackJsTsRolePack);

    expect(staffResult).toEqual({
      categoriesAdded: frontendStaffRolePack.categories.length,
      questionsAdded: frontendStaffRolePack.questions.length,
    });
    expect(fullstackResult).toEqual({
      categoriesAdded: fullstackJsTsRolePack.categories.length,
      questionsAdded: fullstackJsTsRolePack.questions.length,
    });

    const fullstackSessionIds = await store.startSession({ categoryId: 'fullstack-system-design' });
    expect(fullstackSessionIds.length).toBeGreaterThan(0);
  });
});
