<template>
  <section>
    <q-input v-model="name" :label="nameLabel" filled dense class="q-mb-sm" />
    <q-input v-model="website" label="Website" filled dense class="q-mb-sm" />
    <q-input
      v-model="companyLinkedinUrl"
      label="Company LinkedIn URL"
      filled
      dense
      class="q-mb-sm"
    />
    <q-select
      v-model="industry"
      :options="filteredIndustryOptions"
      :label="industryLabel"
      filled
      dense
      clearable
      use-input
      input-debounce="0"
      :multiple="industryMode === 'multiple'"
      :use-chips="industryMode === 'multiple'"
      @filter="filterIndustryOptions"
      class="q-mb-sm"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type IndustryValue = string | string[];

type OrganizationDetailsModel = {
  name: string;
  website: string;
  companyLinkedinUrl: string;
  industry: IndustryValue;
};

const props = withDefaults(
  defineProps<{
    modelValue: OrganizationDetailsModel;
    nameLabel?: string;
    industryLabel?: string;
    industryMode?: 'single' | 'multiple';
    industryOptions: string[];
  }>(),
  {
    nameLabel: 'Name',
    industryLabel: 'Industry',
    industryMode: 'single',
  },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: OrganizationDetailsModel): void;
}>();

const filteredIndustryOptions = ref([...props.industryOptions]);

function updateField<K extends keyof OrganizationDetailsModel>(
  key: K,
  value: OrganizationDetailsModel[K],
) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  });
}

const name = computed({
  get: () => props.modelValue.name,
  set: (value) => updateField('name', value),
});

const website = computed({
  get: () => props.modelValue.website,
  set: (value) => updateField('website', value),
});

const companyLinkedinUrl = computed({
  get: () => props.modelValue.companyLinkedinUrl,
  set: (value) => updateField('companyLinkedinUrl', value),
});

const industry = computed({
  get: () => props.modelValue.industry,
  set: (value) => updateField('industry', value),
});

function filterIndustryOptions(
  value: string,
  update: (callback: () => void) => void,
  abort: () => void,
) {
  if (!value) {
    update(() => {
      filteredIndustryOptions.value = [...props.industryOptions];
    });
    return;
  }

  const needle = value.trim().toLowerCase();
  if (!needle) {
    abort();
    return;
  }

  update(() => {
    filteredIndustryOptions.value = props.industryOptions.filter((option) =>
      option.toLowerCase().includes(needle),
    );
  });
}
</script>
