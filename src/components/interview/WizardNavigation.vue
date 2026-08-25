<template>
  <section class="wizard-nav" role="region" aria-label="Interview navigation">
    <div class="wizard-nav__meta">
      <p class="wizard-nav__progress">Question {{ progress.current }} of {{ progress.total }}</p>
      <p class="wizard-nav__shortcut-hint" aria-live="polite">
        Shortcuts: Left previous, Right next, Enter finish, Escape close summary.
      </p>
      <q-linear-progress
        rounded
        stripe
        size="10px"
        :value="progress.total > 0 ? progress.current / progress.total : 0"
        color="primary"
        aria-label="Session progress"
      />
    </div>

    <div class="wizard-nav__actions">
      <q-btn
        outline
        color="primary"
        label="Previous"
        :disable="isBusy || !canGoPrevious"
        :loading="isBusy"
        aria-label="Go to previous question"
        @click="$emit('previous')"
      />
      <q-btn
        color="primary"
        label="Next"
        :disable="isBusy || !canGoNext"
        :loading="isBusy"
        aria-label="Go to next question"
        @click="$emit('next')"
      />
      <q-btn
        flat
        color="primary"
        label="Restart"
        :disable="isBusy || progress.total === 0"
        :loading="isBusy"
        aria-label="Restart session"
        @click="$emit('restart')"
      />
      <q-btn
        unelevated
        color="secondary"
        :label="isComplete ? 'Finished' : 'Finish now'"
        :disable="isBusy || isComplete || progress.total === 0"
        :loading="isBusy"
        aria-label="Finish session and open summary"
        @click="$emit('finish')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  canGoPrevious: boolean;
  canGoNext: boolean;
  isComplete: boolean;
  isBusy: boolean;
  progress: {
    total: number;
    current: number;
    percent: number;
  };
}>();

defineEmits<{
  previous: [];
  next: [];
  restart: [];
  finish: [];
}>();
</script>

<style scoped>
.wizard-nav {
  margin-top: 1rem;
  border: 1px solid var(--practice-border, #d5d9e2);
  border-radius: 16px;
  padding: 1rem;
  background: #fff;
}

.wizard-nav__meta {
  margin-bottom: 0.8rem;
}

.wizard-nav__progress {
  margin: 0 0 0.5rem;
  font-weight: 600;
  color: var(--practice-label, #3b4965);
}

.wizard-nav__shortcut-hint {
  margin: 0 0 0.5rem;
  color: var(--practice-text, #293349);
  font-size: 0.82rem;
}

.wizard-nav__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
