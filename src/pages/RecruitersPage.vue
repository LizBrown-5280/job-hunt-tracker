<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ editingId ? 'Edit recruiter' : 'Add recruiter' }}</div>
          <q-form @submit.prevent="submitRecruiter">
            <q-input
              v-model="store.draft.fullName"
              label="Full name"
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
            <q-input v-model="store.draft.email" label="Email" filled dense class="q-mb-sm" />
            <q-input
              v-model="store.draft.linkedinUrl"
              label="LinkedIn URL"
              filled
              dense
              class="q-mb-sm"
            />
            <q-select
              v-model="store.draft.relationship"
              :options="relationshipOptions"
              label="Relationship"
              filled
              dense
              class="q-mb-sm"
            />
            <q-input
              v-model="store.draft.notes"
              type="textarea"
              autogrow
              filled
              label="Notes"
              maxlength="500"
              counter
              class="q-mb-sm"
            />

            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                type="submit"
                :label="editingId ? 'Save changes' : 'Save recruiter'"
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
            <div class="text-h6">Recruiters</div>
            <q-select
              v-model="store.filterRelationship"
              :options="filterOptions"
              label="Relationship"
              dense
              outlined
              style="min-width: 170px"
            />
          </div>

          <q-input
            v-model="store.searchQuery"
            label="Search recruiters"
            filled
            dense
            clearable
            class="q-mb-md"
          />

          <div v-if="filteredItems.length === 0" class="text-grey-7">
            No recruiters match this view.
          </div>

          <div v-else class="column q-gutter-sm">
            <q-card v-for="item in filteredItems" :key="item.id" bordered>
              <q-card-section class="q-py-sm q-px-md">
                <div class="row items-start justify-between">
                  <div>
                    <div class="text-subtitle1">{{ item.fullName }}</div>
                    <div class="text-caption text-grey-7">
                      {{ companyNameById[item.companyId ?? -1] ?? 'Independent / not set' }}
                    </div>
                    <div v-if="item.email" class="text-caption">{{ item.email }}</div>
                    <div v-if="item.linkedinUrl" class="text-caption text-primary">
                      {{ item.linkedinUrl }}
                    </div>
                  </div>
                  <q-chip :color="relationshipColor(item.relationship)" text-color="white">
                    {{ item.relationship }}
                  </q-chip>
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
import { useRoute, useRouter } from 'vue-router';
import { useCompaniesStore } from '@/stores/companies';
import { useRecruitersStore } from '@/stores/recruiters';
import type { RecruiterRelationship } from '@/types/networking';

const store = useRecruitersStore();
const companiesStore = useCompaniesStore();
const route = useRoute();
const router = useRouter();
const { filteredItems, editingId } = storeToRefs(store);
const relationshipOptions: RecruiterRelationship[] = ['New', 'Active', 'Dormant'];
const filterOptions: Array<RecruiterRelationship | 'All'> = ['All', ...relationshipOptions];

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

  const prefillQuery = getDeepLinkQuery();
  if (prefillQuery) {
    store.searchQuery = prefillQuery;
    clearDeepLinkQuery();
  }
});

async function submitRecruiter() {
  await store.save();
}

function relationshipColor(relationship: RecruiterRelationship) {
  switch (relationship) {
    case 'New':
      return 'primary';
    case 'Active':
      return 'positive';
    default:
      return 'grey-7';
  }
}

function getDeepLinkQuery() {
  if (typeof route.query.q === 'string') {
    return route.query.q.trim();
  }

  if (Array.isArray(route.query.q)) {
    return route.query.q[0]?.trim() ?? '';
  }

  return '';
}

function clearDeepLinkQuery() {
  if (!('q' in route.query)) {
    return;
  }

  const nextQuery = { ...route.query };
  delete nextQuery.q;
  void router.replace({ path: route.path, query: nextQuery });
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
