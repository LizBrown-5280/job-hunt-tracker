<template>
  <section
    class="reflection-summary"
    role="region"
    aria-label="Session summary and response review"
  >
    <header class="reflection-summary__header">
      <p class="reflection-summary__kicker">Session Summary</p>
      <h2>Review your practice</h2>
      <p>Capture what went well, tag weak spots, and plan your next pass.</p>
    </header>

    <div v-if="summary" class="reflection-summary__stats">
      <article class="summary-stat">
        <h3>Answered</h3>
        <p>{{ summary.answeredQuestions }} / {{ summary.totalQuestions }}</p>
      </article>
      <article class="summary-stat">
        <h3>Average rating</h3>
        <p>{{ summary.averageRating ?? 'Not rated yet' }}</p>
      </article>
      <article class="summary-stat">
        <h3>Favorites</h3>
        <p>{{ summary.favoritedCount }}</p>
      </article>
      <article class="summary-stat">
        <h3>Needs work</h3>
        <p>{{ summary.needsWorkCount }}</p>
      </article>
    </div>

    <q-input
      :model-value="reflectionNote"
      type="textarea"
      outlined
      autogrow
      label="Reflection notes"
      placeholder="Focus on specific follow-up goals for your next practice round."
      aria-label="Reflection notes"
      @update:model-value="
        $emit('update:reflection-note', typeof $event === 'string' ? $event : '')
      "
    />

    <div class="reflection-summary__actions">
      <q-btn outline color="primary" label="Back to session" @click="$emit('resume')" />
      <q-btn flat color="secondary" label="Export summary" @click="$emit('export-summary')" />
    </div>

    <section class="reflection-summary__responses">
      <article
        v-for="item in reviewItems"
        :key="item.questionId"
        class="response-review-card"
        :aria-label="`Review response for ${item.questionText}`"
      >
        <header class="response-review-card__header">
          <h3>{{ item.questionText }}</h3>
          <p>{{ item.categoryName }} · {{ item.difficulty }}</p>
        </header>

        <p class="response-review-card__response">
          {{ item.responseText || 'No response captured.' }}
        </p>

        <div class="response-review-card__controls">
          <q-select
            :model-value="item.rating"
            :options="ratingOptions"
            emit-value
            map-options
            dense
            outlined
            label="Rating"
            aria-label="Rate your answer"
            @update:model-value="(value) => $emit('set-rating', item.questionId, toRating(value))"
          />
          <q-select
            :model-value="item.reviewTag"
            :options="tagOptions"
            emit-value
            map-options
            dense
            outlined
            label="Tag"
            aria-label="Tag this response"
            @update:model-value="(value) => $emit('set-tag', item.questionId, toTag(value))"
          />
        </div>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import type {
  InterviewQuestionDifficulty,
  InterviewResponseReviewTag,
} from '@/types/interviewPractice';

defineProps<{
  summary: {
    answeredQuestions: number;
    totalQuestions: number;
    favoritedCount: number;
    needsWorkCount: number;
    averageRating: number | null;
  } | null;
  reflectionNote: string;
  reviewItems: Array<{
    questionId: string;
    questionText: string;
    categoryName: string;
    difficulty: InterviewQuestionDifficulty;
    responseText: string;
    rating: number | null;
    reviewTag: InterviewResponseReviewTag;
  }>;
}>();

defineEmits<{
  resume: [];
  'export-summary': [];
  'update:reflection-note': [value: string];
  'set-rating': [questionId: string, rating: number | null];
  'set-tag': [questionId: string, tag: InterviewResponseReviewTag];
}>();

const ratingOptions = [
  { label: 'Not rated', value: null },
  { label: '1 - Needs major improvement', value: 1 },
  { label: '2 - Improving', value: 2 },
  { label: '3 - Solid', value: 3 },
  { label: '4 - Strong', value: 4 },
  { label: '5 - Excellent', value: 5 },
];

const tagOptions = [
  { label: 'No tag', value: null },
  { label: 'Favorite', value: 'favorite' },
  { label: 'Needs work', value: 'needs-work' },
];

function toRating(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function toTag(value: unknown): InterviewResponseReviewTag {
  return value === 'favorite' || value === 'needs-work' ? value : null;
}
</script>

<style scoped>
.reflection-summary {
  margin-top: 1rem;
  border: 1px solid var(--practice-border, #d5d9e2);
  border-radius: 18px;
  padding: 1rem;
  background: #fff;
}

.reflection-summary__header h2 {
  margin: 0;
  color: var(--practice-heading, #0f172a);
}

.reflection-summary__kicker {
  margin: 0;
  color: var(--practice-accent, #155eef);
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
}

.reflection-summary__header p {
  margin: 0.4rem 0 0.8rem;
  color: var(--practice-text, #293349);
}

.reflection-summary__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.6rem;
  margin-bottom: 0.9rem;
}

.summary-stat {
  border: 1px solid var(--practice-border, #d5d9e2);
  border-radius: 12px;
  padding: 0.75rem;
  background: #f8fbff;
}

.summary-stat h3 {
  margin: 0;
  font-size: 0.82rem;
  color: #40506e;
}

.summary-stat p {
  margin: 0.35rem 0 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--practice-heading, #0f172a);
}

.reflection-summary__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.8rem;
}

.reflection-summary__responses {
  margin-top: 1rem;
  display: grid;
  gap: 0.75rem;
}

.response-review-card {
  border: 1px solid var(--practice-border, #d5d9e2);
  border-radius: 12px;
  padding: 0.8rem;
}

.response-review-card__header h3 {
  margin: 0;
  color: var(--practice-heading, #0f172a);
  font-size: 1rem;
}

.response-review-card__header p {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #4b5c7d;
}

.response-review-card__response {
  margin: 0.6rem 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--practice-text, #293349);
}

.response-review-card__controls {
  display: grid;
  gap: 0.55rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}
</style>
