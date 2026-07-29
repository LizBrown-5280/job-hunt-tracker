<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ editingId ? 'Edit position' : 'Add position' }}</div>
          <q-form @submit.prevent="submitPosition">
            <q-input
              v-model="store.draft.title"
              label="Position title"
              filled
              dense
              class="q-mb-sm"
            />
            <q-select
              v-model="store.draft.companyId"
              :options="companyOptions"
              option-label="label"
              option-value="value"
              label="Company"
              filled
              dense
              emit-value
              map-options
              clearable
              class="q-mb-sm"
            />
            <q-select
              v-model="store.draft.status"
              :options="statusOptions"
              label="Status"
              filled
              dense
              class="q-mb-sm"
            />
            <q-input v-model="store.draft.location" label="Location" filled dense class="q-mb-sm" />
            <q-input
              v-model="store.draft.compensation"
              label="Compensation"
              filled
              dense
              class="q-mb-sm"
            />
            <q-input v-model="store.draft.link" label="Posting link" filled dense class="q-mb-sm" />
            <q-input
              v-model="store.draft.notes"
              type="textarea"
              autogrow
              filled
              label="Notes"
              class="q-mb-sm"
            />

            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                type="submit"
                :label="editingId ? 'Save changes' : 'Save position'"
              />
              <q-btn
                v-if="editingId"
                flat
                color="grey-7"
                label="Cancel"
                @click="store.resetDraft()"
              />
            </div>
          </q-form>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Positions</div>
            <q-select
              v-model="store.filterStatus"
              :options="filterOptions"
              label="Status filter"
              dense
              outlined
              style="min-width: 170px"
            />
          </div>

          <q-input
            v-model="store.searchQuery"
            label="Search positions"
            filled
            dense
            clearable
            class="q-mb-md"
          />

          <div v-if="filteredItems.length === 0" class="text-grey-7">
            No positions match this view.
          </div>

          <div v-else class="column q-gutter-sm">
            <q-card v-for="item in filteredItems" :key="item.id" bordered>
              <q-card-section class="q-py-sm q-px-md">
                <div class="row items-start justify-between">
                  <div>
                    <div class="text-subtitle1">{{ item.title }}</div>
                    <div class="text-caption text-grey-7">
                      {{ companyNameById[item.companyId ?? -1] ?? 'No company assigned' }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ item.location || 'No location set' }}
                    </div>
                    <div v-if="item.compensation" class="text-caption">{{ item.compensation }}</div>
                  </div>
                  <q-chip :color="statusColor(item.status)" text-color="white">{{
                    item.status
                  }}</q-chip>
                </div>

                <div v-if="item.link" class="text-caption q-mt-xs text-primary">
                  {{ item.link }}
                </div>
                <div v-if="item.notes" class="text-caption text-grey-7 q-mt-sm notes-block">
                  {{ item.notes }}
                </div>

                <div class="row q-gutter-sm q-mt-sm">
                  <q-btn
                    size="sm"
                    outline
                    color="primary"
                    label="Edit"
                    @click="store.startEdit(item)"
                  />
                  <q-btn
                    size="sm"
                    outline
                    color="negative"
                    label="Delete"
                    @click="store.remove(item.id)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCompaniesStore } from '@/stores/companies';
import { usePositionsStore } from '@/stores/positions';
import type { PositionStatus } from '@/types/networking';

const store = usePositionsStore();
const companiesStore = useCompaniesStore();
const { filteredItems, editingId } = storeToRefs(store);
const statusOptions: PositionStatus[] = ['Open', 'Interviewing', 'On Hold', 'Closed'];
const filterOptions: Array<PositionStatus | 'All'> = ['All', ...statusOptions];

const companyOptions = computed(() =>
  companiesStore.items
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((company) => ({
      label: company.name,
      value: company.id,
    })),
);

const companyNameById = computed(() => {
  return companiesStore.items.reduce<Record<number, string>>((acc, company) => {
    acc[company.id] = company.name;
    return acc;
  }, {});
});

onMounted(() => {
  store.init();
  companiesStore.init();
});

function submitPosition() {
  store.save();
}

function statusColor(status: PositionStatus) {
  switch (status) {
    case 'Open':
      return 'primary';
    case 'Interviewing':
      return 'info';
    case 'On Hold':
      return 'warning';
    default:
      return 'grey-7';
  }
}
</script>

<style scoped>
.notes-block {
  border-left: 3px solid #c7d2fe;
  padding: 8px 10px;
  background: #f8faff;
  border-radius: 6px;
}
</style>
