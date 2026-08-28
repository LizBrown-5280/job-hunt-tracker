<template>
  <section class="form-section-spacing">
    <div class="text-subtitle2 q-mb-xs">{{ title }}</div>
    <q-input v-model="street" label="Street address" filled dense class="q-mb-sm" />
    <div class="row q-col-gutter-sm">
      <div class="col-12 col-md-6">
        <q-input v-model="city" label="City" filled dense class="q-mb-sm" />
      </div>
      <div class="col-12 col-md-3">
        <q-input v-model="state" label="State" filled dense class="q-mb-sm" />
      </div>
      <div class="col-12 col-md-3">
        <q-input v-model="zip" label="ZIP" filled dense class="q-mb-sm" />
      </div>
    </div>
    <q-input v-model="phone" label="Phone number" filled dense class="q-mb-sm" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type AddressContactModel = {
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
};

const props = withDefaults(
  defineProps<{
    modelValue: AddressContactModel;
    title?: string;
  }>(),
  {
    title: 'Company Headquarter Address and Phone',
  },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: AddressContactModel): void;
}>();

function updateField(key: keyof AddressContactModel, value: string | number | null) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: typeof value === 'string' ? value : String(value ?? ''),
  });
}

const street = computed({
  get: () => props.modelValue.street,
  set: (value) => updateField('street', value),
});

const city = computed({
  get: () => props.modelValue.city,
  set: (value) => updateField('city', value),
});

const state = computed({
  get: () => props.modelValue.state,
  set: (value) => updateField('state', value),
});

const zip = computed({
  get: () => props.modelValue.zip,
  set: (value) => updateField('zip', value),
});

const phone = computed({
  get: () => props.modelValue.phone,
  set: (value) => updateField('phone', value),
});
</script>
