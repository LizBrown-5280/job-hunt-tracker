<template>
  <section class="practice-wizard">
    <header class="practice-wizard__hero">
      <p class="practice-wizard__kicker">Interview Practice</p>
      <h1>One question at a time.</h1>
      <p>
        Pick a category, start a session, and compare your response with the model answer when
        ready.
      </p>
    </header>

    <div class="practice-wizard__controls" role="region" aria-label="Session setup">
      <q-select
        v-model="selectedCategoryModel"
        :options="categoryOptions"
        emit-value
        map-options
        label="Category"
        outlined
        :disable="isBusy"
        aria-label="Select practice category"
      />
      <q-input
        v-model.number="questionCount"
        type="number"
        min="0"
        max="200"
        label="Question count (0 = all)"
        outlined
        :disable="isBusy"
        aria-label="Set question count"
      />
      <q-btn
        color="primary"
        unelevated
        label="Start session"
        :loading="isBusy"
        :disable="isBusy"
        aria-label="Start practice session"
        @click="startSession"
      />
    </div>

    <section class="practice-wizard__import">
      <h2>Load question pack</h2>
      <p>
        Paste a JSON pack or import a file. You can also load the built-in starter pack for
        JavaScript, TypeScript, Vue 3, Vitest, and GitHub. A targeted frontend role pack is also
        available.
      </p>
      <q-input
        v-model="importJson"
        type="textarea"
        autogrow
        outlined
        label="Interview question pack JSON"
        placeholder='{"version":1,"categories":[],"questions":[]}'
        :disable="isBusy"
        aria-label="Paste interview question JSON pack"
      />
      <q-select
        v-model="selectedRolePackKey"
        :options="rolePackOptions"
        emit-value
        map-options
        outlined
        label="Targeted role pack"
        :disable="isBusy"
        aria-label="Select targeted role interview pack"
      />
      <div class="practice-wizard__import-actions">
        <q-btn
          color="primary"
          unelevated
          label="Import pasted JSON"
          :loading="isBusy"
          :disable="isBusy"
          aria-label="Import pasted interview questions"
          @click="importPastedJson"
        />
        <q-btn
          outline
          color="primary"
          label="Import JSON file"
          :loading="isBusy"
          :disable="isBusy"
          aria-label="Import interview questions from JSON file"
          @click="openImportFile"
        />
        <q-btn
          flat
          color="secondary"
          label="Load starter pack"
          :loading="isBusy"
          :disable="isBusy"
          aria-label="Load built-in starter question pack"
          @click="loadStarterPack"
        />
        <q-btn
          flat
          color="secondary"
          label="Load selected role pack"
          :loading="isBusy"
          :disable="isBusy"
          aria-label="Load selected targeted role question pack"
          @click="loadSelectedRolePack"
        />
        <q-btn
          flat
          color="secondary"
          label="Download starter JSON"
          :disable="isBusy"
          aria-label="Download starter question pack as JSON"
          @click="downloadStarterPack"
        />
        <q-btn
          flat
          color="secondary"
          label="Download selected role JSON"
          :disable="isBusy"
          aria-label="Download selected targeted role question pack as JSON"
          @click="downloadSelectedRolePack"
        />
      </div>
      <input
        ref="importFileInput"
        type="file"
        accept="application/json,.json"
        class="practice-wizard__hidden-input"
        @change="onImportFileSelected"
      />
    </section>

    <q-banner
      v-if="statusMessage"
      rounded
      class="practice-wizard__status"
      :class="
        statusTone === 'negative' ? 'practice-wizard__status--error' : 'practice-wizard__status--ok'
      "
      role="status"
      aria-live="polite"
    >
      {{ statusMessage }}
    </q-banner>

    <ReflectionSummary
      v-if="showSummary"
      :summary="summary"
      :reflection-note="reflectionNote"
      :review-items="summaryItems"
      @resume="resumeSession"
      @export-summary="exportSummary"
      @update:reflection-note="updateReflectionNote"
      @set-rating="setRating"
      @set-tag="setTag"
    />

    <div v-if="currentQuestion && !showSummary" class="practice-wizard__body">
      <FlashcardCard
        :question-text="currentQuestion.questionText"
        :category-name="currentCategoryName"
        :difficulty="currentQuestion.difficulty"
        :response="currentResponse"
        :model-answer="currentQuestion.modelAnswer"
        :is-revealed="isCurrentAnswerRevealed"
        :max-response-length="maxResponseLength"
        @update:response="updateResponse"
        @toggle-reveal="toggleReveal"
      />

      <WizardNavigation
        :can-go-previous="store.canGoPrevious"
        :can-go-next="store.canGoNext"
        :is-complete="store.sessionProgress.isComplete"
        :is-busy="isBusy"
        :progress="store.sessionProgress"
        @previous="goPrevious"
        @next="goNext"
        @restart="restart"
        @finish="finish"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import FlashcardCard from '@/components/interview/FlashcardCard.vue';
import ReflectionSummary from '@/components/interview/ReflectionSummary.vue';
import WizardNavigation from '@/components/interview/WizardNavigation.vue';
import { fullstackJsTsRolePack } from '@/data/interviewRolePackFullstack';
import { frontendVueTypeScriptRolePack } from '@/data/interviewRolePackFrontend';
import { frontendMidRolePack } from '@/data/interviewRolePackFrontendMid';
import { frontendStaffRolePack } from '@/data/interviewRolePackFrontendStaff';
import { interviewStarterPack } from '@/data/interviewStarterPack';
import { useInterviewPracticeStore } from '@/stores/interviewPractice';
import type {
  InterviewQuestion,
  InterviewQuestionCategory,
  InterviewQuestionDifficulty,
  InterviewResponseReviewTag,
} from '@/types/interviewPractice';

const store = useInterviewPracticeStore();
const categories = ref<InterviewQuestionCategory[]>([]);
const questionsById = ref<Record<string, InterviewQuestion>>({});
const revealedQuestionIds = ref(new Set<string>());
const selectedCategoryModel = ref<string | null>(null);
const questionCount = ref<number>(0);
const statusMessage = ref('');
const statusTone = ref<'positive' | 'negative'>('positive');
const importJson = ref('');
const importFileInput = ref<HTMLInputElement | null>(null);
const isBusy = ref(false);
const showSummary = ref(false);
const reflectionNote = ref('');
const selectedRolePackKey = ref<
  'senior-frontend' | 'mid-frontend' | 'staff-frontend' | 'fullstack-js-ts'
>('senior-frontend');
const summary = ref<{
  answeredQuestions: number;
  totalQuestions: number;
  favoritedCount: number;
  needsWorkCount: number;
  averageRating: number | null;
} | null>(null);
const responseMetaByQuestionId = ref<
  Record<string, { rating: number | null; reviewTag: InterviewResponseReviewTag }>
>({});
const maxResponseLength = 2500;

const rolePackCatalog = {
  'senior-frontend': {
    label: 'Senior Frontend (Vue + TypeScript)',
    fileName: 'interview-role-pack-senior-frontend.json',
    pack: frontendVueTypeScriptRolePack,
  },
  'mid-frontend': {
    label: 'Mid-level Frontend',
    fileName: 'interview-role-pack-mid-frontend.json',
    pack: frontendMidRolePack,
  },
  'staff-frontend': {
    label: 'Staff/Principal Frontend',
    fileName: 'interview-role-pack-staff-frontend.json',
    pack: frontendStaffRolePack,
  },
  'fullstack-js-ts': {
    label: 'Full-stack JavaScript/TypeScript',
    fileName: 'interview-role-pack-fullstack-js-ts.json',
    pack: fullstackJsTsRolePack,
  },
} as const;

const rolePackOptions = Object.entries(rolePackCatalog).map(([value, details]) => ({
  label: details.label,
  value,
}));

const categoryOptions = computed(() => [
  { label: 'Mixed categories', value: null },
  ...categories.value.map((category) => ({ label: category.name, value: category.id })),
]);

const currentQuestion = computed(() => {
  const id = store.currentQuestionId;
  return id ? (questionsById.value[id] ?? null) : null;
});

const currentResponse = computed(() => {
  const id = store.currentQuestionId;
  return id ? (store.responsesByQuestionId[id] ?? '') : '';
});

const isCurrentAnswerRevealed = computed(() => {
  const id = store.currentQuestionId;
  return id ? revealedQuestionIds.value.has(id) : false;
});

const currentCategoryName = computed(() => {
  if (!currentQuestion.value) {
    return 'Uncategorized';
  }

  const category = categories.value.find((item) => item.id === currentQuestion.value?.categoryId);
  return category?.name ?? 'Uncategorized';
});

const summaryItems = computed<
  Array<{
    questionId: string;
    questionText: string;
    categoryName: string;
    difficulty: InterviewQuestionDifficulty;
    responseText: string;
    rating: number | null;
    reviewTag: InterviewResponseReviewTag;
  }>
>(() => {
  return store.sessionQuestionIds
    .map((questionId) => {
      const question = questionsById.value[questionId];
      if (!question) {
        return null;
      }

      const categoryName =
        categories.value.find((item) => item.id === question.categoryId)?.name ?? 'Uncategorized';
      const responseMeta = responseMetaByQuestionId.value[questionId] ?? {
        rating: null,
        reviewTag: null,
      };

      return {
        questionId,
        questionText: question.questionText,
        categoryName,
        difficulty: question.difficulty,
        responseText: store.responsesByQuestionId[questionId] ?? '',
        rating: responseMeta.rating,
        reviewTag: responseMeta.reviewTag,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
});

onMounted(async () => {
  window.addEventListener('keydown', onShortcutKeydown);
  await withBusy(async () => {
    await store.initialize();
    categories.value = await store.getCategories();

    const resumed = await store.resumeLastSession();
    if (resumed.restored && resumed.questionIds.length) {
      await hydrateQuestionsByIds(resumed.questionIds);
      statusTone.value = 'positive';
      statusMessage.value = 'Resumed your most recent practice session.';
      if (store.sessionProgress.isComplete) {
        await loadSummaryState();
        showSummary.value = true;
      }
      return;
    }

    await startSession();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onShortcutKeydown);
});

async function startSession() {
  await withBusy(async () => {
    statusMessage.value = '';
    revealedQuestionIds.value = new Set<string>();
    showSummary.value = false;

    const normalizedCount = Math.max(0, Math.min(200, Number(questionCount.value) || 0));
    questionCount.value = normalizedCount;

    const ids = await store.startSession({
      categoryId: selectedCategoryModel.value,
      questionCount: normalizedCount,
    });

    if (!ids.length) {
      questionsById.value = {};
      statusTone.value = 'negative';
      statusMessage.value = 'No questions found for this selection yet.';
      return;
    }

    await hydrateQuestionsByIds(ids);

    statusTone.value = 'positive';
    statusMessage.value = '';
  });
}

async function refreshCategories() {
  categories.value = await store.getCategories();
}

function openImportFile() {
  importFileInput.value?.click();
}

async function onImportFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    await importJsonPack(text);
  } finally {
    input.value = '';
  }
}

async function importPastedJson() {
  if (!importJson.value.trim()) {
    statusTone.value = 'negative';
    statusMessage.value = 'Paste a JSON pack before importing.';
    return;
  }

  await importJsonPack(importJson.value);
}

async function loadStarterPack() {
  await importJsonPack(JSON.stringify(interviewStarterPack));
}

async function loadSelectedRolePack() {
  const selectedPack = rolePackCatalog[selectedRolePackKey.value].pack;
  await importJsonPack(JSON.stringify(selectedPack));
}

function downloadStarterPack() {
  const blob = new Blob([JSON.stringify(interviewStarterPack, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'interview-starter-pack.json';
  link.click();
  URL.revokeObjectURL(url);
}

function downloadSelectedRolePack() {
  const selected = rolePackCatalog[selectedRolePackKey.value];
  const blob = new Blob([JSON.stringify(selected.pack, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = selected.fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function importJsonPack(json: string) {
  await withBusy(async () => {
    statusMessage.value = '';

    try {
      const result = await store.loadQuestionPackJson(json);
      await refreshCategories();
      statusTone.value = 'positive';
      statusMessage.value = `Imported ${result.categoriesAdded} categories and ${result.questionsAdded} questions.`;
    } catch (error) {
      statusTone.value = 'negative';
      statusMessage.value =
        error instanceof Error ? `Import failed: ${error.message}` : 'Import failed.';
    }
  });
}

async function hydrateQuestionsByIds(ids: string[]) {
  const selectedSet = new Set(ids);
  const allQuestions = await store.getQuestions();
  questionsById.value = Object.fromEntries(
    allQuestions
      .filter((question) => selectedSet.has(question.id))
      .map((question) => [question.id, question]),
  );
}

async function loadSummaryState() {
  if (!store.sessionId) {
    summary.value = null;
    reflectionNote.value = '';
    responseMetaByQuestionId.value = {};
    return;
  }

  const sessionSummary = await store.getSessionSummary(store.sessionId);
  if (!sessionSummary) {
    summary.value = null;
    reflectionNote.value = '';
    responseMetaByQuestionId.value = {};
    return;
  }

  summary.value = {
    answeredQuestions: sessionSummary.answeredQuestions,
    totalQuestions: sessionSummary.totalQuestions,
    favoritedCount: sessionSummary.favoritedCount,
    needsWorkCount: sessionSummary.needsWorkCount,
    averageRating: sessionSummary.averageRating,
  };
  reflectionNote.value = sessionSummary.reflectionNote;

  const responses = await store.getResponsesForSession(store.sessionId);
  responseMetaByQuestionId.value = responses.reduce<
    Record<string, { rating: number | null; reviewTag: InterviewResponseReviewTag }>
  >((acc, response) => {
    acc[response.questionId] = {
      rating: response.rating,
      reviewTag: response.reviewTag,
    };
    return acc;
  }, {});
}

async function updateResponse(value: string) {
  const nextValue = value.length > maxResponseLength ? value.slice(0, maxResponseLength) : value;
  await store.updateCurrentResponse(nextValue);
}

function toggleReveal() {
  const id = store.currentQuestionId;
  if (!id) {
    return;
  }

  const next = new Set(revealedQuestionIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  revealedQuestionIds.value = next;
}

async function goPrevious() {
  await store.goToPreviousQuestion();
}

async function goNext() {
  await store.goToNextQuestion();
}

async function restart() {
  await store.restartSession();
  revealedQuestionIds.value = new Set<string>();
}

async function finish() {
  await store.finishSession();
  await loadSummaryState();
  showSummary.value = true;
}

function resumeSession() {
  showSummary.value = false;
}

async function updateReflectionNote(value: string) {
  reflectionNote.value = value;
  if (!store.sessionId) {
    return;
  }

  await store.setSessionReflectionNote(store.sessionId, value);
  await loadSummaryState();
}

async function setRating(questionId: string, rating: number | null) {
  if (!store.sessionId) {
    return;
  }

  await store.setResponseRating(store.sessionId, questionId, rating);
  await loadSummaryState();
}

async function setTag(questionId: string, tag: InterviewResponseReviewTag) {
  if (!store.sessionId) {
    return;
  }

  await store.setResponseReviewTag(store.sessionId, questionId, tag);
  await loadSummaryState();
}

function exportSummary() {
  if (!summary.value) {
    return;
  }

  const lines = [
    'Interview Practice Summary',
    '',
    `Answered: ${summary.value.answeredQuestions}/${summary.value.totalQuestions}`,
    `Average rating: ${summary.value.averageRating ?? 'Not rated yet'}`,
    `Favorites: ${summary.value.favoritedCount}`,
    `Needs work: ${summary.value.needsWorkCount}`,
    '',
    'Reflection note:',
    reflectionNote.value || '(none)',
    '',
    'Responses:',
    ...summaryItems.value.map(
      (item, index) =>
        `${index + 1}. ${item.questionText}\n   Rating: ${item.rating ?? 'N/A'}\n   Tag: ${item.reviewTag ?? 'none'}\n   Response: ${item.responseText || '(empty)'}`,
    ),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'interview-practice-summary.txt';
  link.click();
  URL.revokeObjectURL(url);
}

async function withBusy(run: () => Promise<void>) {
  if (isBusy.value) {
    return;
  }

  isBusy.value = true;
  try {
    await run();
  } finally {
    isBusy.value = false;
  }
}

function onShortcutKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  if (
    target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.getAttribute('role') === 'combobox')
  ) {
    return;
  }

  if (event.key === 'Escape' && showSummary.value) {
    event.preventDefault();
    resumeSession();
    return;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    void goPrevious();
    return;
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    void goNext();
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    void finish();
  }
}
</script>

<style scoped>
.practice-wizard {
  --practice-accent: #155eef;
  --practice-surface: #ffffff;
  --practice-border: #d5d9e2;
  --practice-heading: #0f172a;
  --practice-label: #3b4965;
  --practice-text: #293349;
  --practice-model-bg: #eef4ff;

  max-width: 1040px;
  margin: 0 auto;
  padding: 1rem;
}

.practice-wizard__hero {
  padding: 1.2rem;
  border-radius: 18px;
  background:
    radial-gradient(circle at 10% 10%, rgb(21 94 239 / 14%), transparent 38%),
    linear-gradient(135deg, #f5f9ff 0%, #fff9ef 100%);
  border: 1px solid #e5e9f2;
}

.practice-wizard__kicker {
  margin: 0 0 0.2rem;
  color: var(--practice-accent);
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.practice-wizard__hero h1 {
  margin: 0;
  color: var(--practice-heading);
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.practice-wizard__hero p {
  margin: 0.55rem 0 0;
  color: var(--practice-text);
}

.practice-wizard__controls {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.8rem;
  align-items: end;
}

.practice-wizard__status {
  margin-top: 0.9rem;
}

.practice-wizard__status--ok {
  background: #edf7ee;
  color: #1b4332;
}

.practice-wizard__status--error {
  background: #fdecec;
  color: #8f1d1d;
}

.practice-wizard__import {
  margin-top: 1rem;
  border: 1px solid var(--practice-border, #d5d9e2);
  border-radius: 16px;
  padding: 1rem;
  background: #fff;
}

.practice-wizard__import h2 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--practice-heading, #0f172a);
}

.practice-wizard__import p {
  margin: 0.4rem 0 0.8rem;
  color: var(--practice-text, #293349);
}

.practice-wizard__import-actions {
  margin-top: 0.7rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.practice-wizard__hidden-input {
  display: none;
}

.practice-wizard__body {
  margin-top: 1rem;
}
</style>
