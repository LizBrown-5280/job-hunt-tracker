<template>
  <section class="form-section-spacing">
    <div class="text-subtitle2 q-mb-xs">{{ title }}</div>
    <q-input
      v-model="notes"
      type="textarea"
      autogrow
      filled
      :placeholder="placeholder"
      :maxlength="maxlength"
      :counter="counter"
      class="q-mb-sm"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    title?: string;
    placeholder?: string;
    maxlength?: number;
    counter?: boolean;
  }>(),
  {
    title: 'Notes',
    placeholder: 'Add notes',
    maxlength: 500,
    counter: true,
  },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

const notes = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>
