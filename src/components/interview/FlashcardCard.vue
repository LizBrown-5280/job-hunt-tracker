<template>
  <section class="flashcard-card" role="region" aria-labelledby="flashcard-question">
    <header class="flashcard-card__header">
      <div class="flashcard-card__badge">{{ categoryName }} · {{ difficulty }}</div>
      <h2 id="flashcard-question" class="flashcard-card__question">{{ questionText }}</h2>
    </header>

    <label class="flashcard-card__label" for="response-input">Your Response</label>
    <q-input
      id="response-input"
      :model-value="response"
      type="textarea"
      autogrow
      outlined
      class="flashcard-card__textarea"
      placeholder="Type your response here..."
      counter
      :maxlength="maxResponseLength"
      :error="response.length > maxResponseLength"
      :error-message="`Response cannot exceed ${maxResponseLength} characters.`"
      aria-describedby="response-length-note"
      @update:model-value="onResponseUpdate"
    />
    <p id="response-length-note" class="flashcard-card__length-note" aria-live="polite">
      {{ remainingCharacters }} characters remaining.
    </p>

    <div class="flashcard-card__actions">
      <q-btn
        unelevated
        color="primary"
        :label="isRevealed ? 'Hide model answer' : 'Reveal model answer'"
        :aria-expanded="isRevealed"
        aria-controls="model-answer-region"
        @click="$emit('toggle-reveal')"
      />
    </div>

    <div
      v-if="isRevealed"
      id="model-answer-region"
      class="flashcard-card__comparison"
      role="region"
      aria-label="Response comparison"
    >
      <article class="comparison-panel">
        <h3>Your Response</h3>
        <p>{{ response || 'No response yet.' }}</p>
      </article>
      <article class="comparison-panel comparison-panel--model">
        <h3>Model Answer</h3>
        <p>{{ modelAnswer || 'No model answer available for this question yet.' }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  questionText: string;
  categoryName: string;
  difficulty: string;
  response: string;
  modelAnswer: string | null;
  isRevealed: boolean;
  maxResponseLength: number;
}>();

const emit = defineEmits<{
  'update:response': [value: string];
  'toggle-reveal': [];
}>();

function onResponseUpdate(value: string | number | null) {
  emit('update:response', typeof value === 'string' ? value : '');
}

const remainingCharacters = computed(() =>
  Math.max(0, props.maxResponseLength - props.response.length),
);
</script>

<style scoped>
.flashcard-card {
  background: var(--practice-surface, #fff);
  border: 1px solid var(--practice-border, #d5d9e2);
  border-radius: 20px;
  box-shadow: 0 14px 30px rgb(7 16 38 / 8%);
  padding: 1.25rem;
}

.flashcard-card__header {
  margin-bottom: 1rem;
}

.flashcard-card__badge {
  color: var(--practice-accent, #155eef);
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.flashcard-card__question {
  margin: 0.35rem 0 0;
  color: var(--practice-heading, #0f172a);
  font-size: 1.3rem;
  line-height: 1.35;
}

.flashcard-card__label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--practice-label, #3b4965);
  font-weight: 600;
}

.flashcard-card__actions {
  margin-top: 1rem;
}

.flashcard-card__length-note {
  margin: 0.35rem 0 0;
  color: var(--practice-text, #293349);
  font-size: 0.8rem;
}

.flashcard-card__comparison {
  margin-top: 1.2rem;
  display: grid;
  gap: 0.8rem;
}

.comparison-panel {
  border: 1px solid var(--practice-border, #d5d9e2);
  border-radius: 14px;
  padding: 0.9rem;
  background: #fff;
}

.comparison-panel h3 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  color: var(--practice-heading, #0f172a);
}

.comparison-panel p {
  margin: 0;
  color: var(--practice-text, #293349);
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

.comparison-panel--model {
  background: var(--practice-model-bg, #eef4ff);
}

@media (min-width: 860px) {
  .flashcard-card__comparison {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
