<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card class="q-pa-md">
          <div class="text-h6 q-mb-md">
            {{ editingId ? 'Edit application' : 'Add application' }}
          </div>
          <q-form @submit="submitApplication">
            <q-input
              v-model="store.draft.company"
              label="Company"
              filled
              dense
              class="q-mb-sm"
              required
            />
            <q-select
              v-model="store.draft.companyId"
              :options="companyOptions"
              option-label="label"
              option-value="value"
              label="Linked company"
              filled
              dense
              emit-value
              map-options
              clearable
              class="q-mb-sm"
              @update:model-value="onCompanyLinkChange"
            />
            <q-banner v-if="!hasCompanies" dense rounded class="q-mb-sm warning-banner">
              No companies yet. Create one first for reliable linking.
              <template #action>
                <q-btn flat color="primary" label="Open companies" @click="openCompaniesPage" />
              </template>
            </q-banner>
            <q-input
              v-model="store.draft.role"
              label="Role"
              filled
              dense
              class="q-mb-sm"
              required
            />
            <q-select
              v-model="store.draft.positionId"
              :options="positionOptions"
              option-label="label"
              option-value="value"
              label="Linked position"
              filled
              dense
              emit-value
              map-options
              clearable
              class="q-mb-sm"
              @update:model-value="onPositionLinkChange"
            />
            <q-banner v-if="!hasPositions" dense rounded class="q-mb-sm warning-banner">
              No positions yet. Add one to connect applications to specific roles.
              <template #action>
                <q-btn flat color="primary" label="Open positions" @click="openPositionsPage" />
              </template>
            </q-banner>
            <q-select
              v-model="store.draft.status"
              :options="statusOptions"
              label="Status"
              filled
              dense
              class="q-mb-sm"
            />
            <q-input
              v-model="store.draft.appliedDate"
              label="Applied date"
              type="date"
              filled
              dense
              class="q-mb-sm"
            />
            <q-input
              v-model="store.draft.nextAction"
              label="Next action"
              filled
              dense
              class="q-mb-sm"
            />
            <q-select
              v-model="store.draft.priority"
              :options="priorityOptions"
              label="Priority"
              filled
              dense
              class="q-mb-sm"
            />
            <q-input
              v-model="store.draft.followUpDate"
              label="Follow-up date"
              type="date"
              filled
              dense
              class="q-mb-sm"
            />
            <q-input
              v-model="store.draft.notes"
              label="Notes"
              type="textarea"
              filled
              autogrow
              class="q-mb-sm"
            />
            <div class="text-caption text-grey-7 q-mb-sm form-hint">
              Tip: add a next action and follow-up date to keep momentum.
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                type="submit"
                :label="editingId ? 'Save changes' : 'Save application'"
              />
              <q-btn
                v-if="editingId"
                flat
                color="grey-7"
                label="Cancel"
                @click="store.resetDraft()"
              />
              <q-btn
                v-else-if="hasDraftContent"
                flat
                color="grey-7"
                label="Clear form"
                @click="store.resetDraft()"
              />
            </div>
          </q-form>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Applications</div>
            <div class="row items-center q-gutter-sm">
              <q-btn
                v-if="hasActiveFilters"
                flat
                dense
                color="grey-7"
                label="Reset view"
                @click="clearFilters"
              />
              <q-select
                :model-value="store.search.filter"
                :options="filterOptions"
                label="Filter"
                dense
                outlined
                :display-value="selectedFilterLabel"
                style="min-width: 180px"
                @update:model-value="onFilterChange"
              />
              <q-btn
                v-if="store.search.filter === 'Favorites'"
                flat
                dense
                round
                color="primary"
                icon="swap_vert"
                @click="store.toggleFavoritesOrder()"
              >
                <q-tooltip>Toggle favorites order</q-tooltip>
              </q-btn>
            </div>
          </div>

          <q-input
            v-model="store.search.query"
            label="Search applications"
            filled
            dense
            clearable
            class="q-mb-md"
          />

          <div class="row q-col-gutter-sm q-mb-md items-stretch">
            <div class="col-12 col-sm-6 col-md-3">
              <q-card bordered class="q-pa-sm full-height">
                <div class="text-caption text-grey-7">Total</div>
                <div class="text-h6">{{ items.length }}</div>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card
                bordered
                class="q-pa-sm full-height"
                style="border-color: #1e88e5; border-width: 2px"
              >
                <div class="text-caption" style="color: #1e88e5">Interviewing</div>
                <div class="text-h6" style="color: #1e88e5">
                  {{ items.filter((item) => item.status === 'Interview').length }}
                </div>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card
                bordered
                class="q-pa-sm full-height"
                style="border-color: #f59e0b; border-width: 2px"
              >
                <div
                  class="text-caption"
                  style="color: #f59e0b; line-height: 1.2; min-height: 2.4em"
                >
                  Needs follow-up
                </div>
                <div class="text-h6" style="color: #f59e0b">
                  {{ items.filter((item) => item.nextAction && item.status !== 'Ghosted').length }}
                </div>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card
                bordered
                class="q-pa-sm full-height"
                style="border-color: #c62828; border-width: 2px"
              >
                <div class="text-caption" style="color: #c62828">Closed</div>
                <div class="text-h6" style="color: #c62828">
                  {{ items.filter((item) => item.status === 'Ghosted').length }}
                </div>
              </q-card>
            </div>
          </div>

          <div v-if="filteredItems.length === 0" class="text-grey-7">
            No applications match this view. Reset filters or add a new application.
          </div>
          <div v-else class="column q-gutter-sm">
            <q-card
              v-for="item in filteredItems"
              :key="item.id ?? item.createdAt"
              bordered
              :class="{ 'priority-card': isPriorityItem(item) }"
            >
              <q-card-section class="q-py-sm q-px-md">
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-subtitle1">{{ item.role }} at {{ item.company }}</div>
                    <div class="text-caption text-grey-7">Applied {{ item.appliedDate }}</div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      Updated {{ formatTimestamp(item.updatedAt || item.createdAt) }}
                    </div>
                  </div>
                  <q-chip :color="getStatusColor(item.status)" text-color="white">
                    {{ item.status }}
                  </q-chip>
                </div>
                <div class="row items-center q-gutter-sm q-mt-sm">
                  <q-chip
                    v-if="item.priority"
                    size="sm"
                    :color="getPriorityColor(item.priority)"
                    text-color="white"
                  >
                    {{ item.priority }} priority
                  </q-chip>
                  <q-chip v-if="item.followUpDate" size="sm" outline color="primary">
                    Follow-up {{ item.followUpDate }}
                  </q-chip>
                  <q-chip v-if="item.companyId != null" size="sm" outline color="indigo">
                    Company: {{ companyNameById[item.companyId] ?? 'Unknown company' }}
                  </q-chip>
                  <q-chip v-if="item.positionId != null" size="sm" outline color="deep-orange">
                    Position: {{ positionTitleById[item.positionId] ?? 'Unknown position' }}
                  </q-chip>
                </div>
                <div v-if="item.nextAction" class="text-body2 q-mt-sm">
                  Next: {{ item.nextAction }}
                </div>
                <div
                  v-if="item.companyId != null || item.positionId != null"
                  class="row q-gutter-xs q-mt-xs"
                >
                  <q-btn
                    v-if="item.companyId != null"
                    size="xs"
                    flat
                    color="indigo"
                    label="Open companies"
                    @click="openCompaniesPage"
                  />
                  <q-btn
                    v-if="item.positionId != null"
                    size="xs"
                    flat
                    color="deep-orange"
                    label="Open positions"
                    @click="openPositionsPage"
                  />
                </div>
                <div v-if="item.notes" class="note-block q-mt-sm">
                  <div class="text-caption text-grey-6">Notes</div>
                  <div class="text-caption text-grey-7">“{{ item.notes }}”</div>
                </div>
                <div class="row items-center justify-between q-mt-sm">
                  <div class="row q-gutter-sm">
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
                      @click="store.remove(item.id ?? 0)"
                    />
                  </div>
                  <div class="row items-center heart-rating-row">
                    <q-btn
                      v-for="heart in 5"
                      :key="heart"
                      flat
                      round
                      size="xs"
                      padding="2px"
                      class="heart-rating-btn"
                      :color="heart <= (item.favoriteRating ?? 0) ? 'negative' : 'grey-5'"
                      :icon="heart <= (item.favoriteRating ?? 0) ? 'favorite' : 'favorite_border'"
                      @click.stop="store.toggleFavorite(item, heart)"
                    />
                  </div>
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
import { computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useApplicationsStore } from '@/stores/applications';
import { useCompaniesStore } from '@/stores/companies';
import { usePositionsStore } from '@/stores/positions';

const store = useApplicationsStore();
const companiesStore = useCompaniesStore();
const positionsStore = usePositionsStore();
const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const { items, filteredItems, editingId } = storeToRefs(store);
const statusOptions = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'] as const;
const priorityOptions = ['Low', 'Medium', 'High'] as const;
const filterOptions = ['All', 'Favorites', ...statusOptions] as const;
const selectedFilterLabel = computed(() => {
  if (store.search.filter !== 'Favorites') {
    return store.search.filter;
  }

  return store.search.favoritesOrder === 'desc'
    ? 'Favorites (high to low)'
    : 'Favorites (low to high)';
});
const hasActiveFilters = computed(
  () => Boolean(store.search.query.trim()) || store.search.filter !== 'All',
);
const hasDraftContent = computed(
  () =>
    Boolean(store.draft.company.trim()) ||
    Boolean(store.draft.role.trim()) ||
    Boolean(store.draft.nextAction.trim()) ||
    Boolean(store.draft.notes.trim()) ||
    store.draft.companyId != null ||
    store.draft.positionId != null,
);

const companyOptions = computed(() =>
  companiesStore.items
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((company) => ({
      label: company.name,
      value: company.id,
    })),
);
const hasCompanies = computed(() => companyOptions.value.length > 0);

const companyNameById = computed(() =>
  companiesStore.items.reduce<Record<number, string>>((acc, company) => {
    acc[company.id] = company.name;
    return acc;
  }, {}),
);

const positionOptions = computed(() => {
  const sorted = positionsStore.items.slice().sort((a, b) => a.title.localeCompare(b.title));

  return sorted.map((position) => ({
    label:
      position.companyId != null && companyNameById.value[position.companyId]
        ? `${position.title} (${companyNameById.value[position.companyId]})`
        : position.title,
    value: position.id,
  }));
});
const hasPositions = computed(() => positionOptions.value.length > 0);

const positionTitleById = computed(() =>
  positionsStore.items.reduce<Record<number, string>>((acc, position) => {
    acc[position.id] = position.title;
    return acc;
  }, {}),
);

let isReconcilingLinks = false;

async function reconcileLinkedEntities() {
  if (isReconcilingLinks) {
    return;
  }

  isReconcilingLinks = true;

  try {
    companiesStore.init();
    positionsStore.init();
    await store.reconcileLinkedEntities(
      companiesStore.items.map((company) => company.id),
      positionsStore.items.map((position) => position.id),
    );
  } finally {
    isReconcilingLinks = false;
  }
}

function onWindowFocus() {
  void reconcileLinkedEntities();
}

function onVisibilityChange() {
  if (document.visibilityState !== 'visible') {
    return;
  }

  void reconcileLinkedEntities();
}

onMounted(async () => {
  store.resetFilters();
  await store.init();
  await reconcileLinkedEntities();

  const deepLinkQuery = getDeepLinkQuery();
  if (deepLinkQuery) {
    store.search.query = deepLinkQuery;
  }

  window.addEventListener('focus', onWindowFocus);
  document.addEventListener('visibilitychange', onVisibilityChange);
});

onUnmounted(() => {
  window.removeEventListener('focus', onWindowFocus);
  document.removeEventListener('visibilitychange', onVisibilityChange);
});

async function submitApplication() {
  validateDraftLinks();
  await store.save();
}

function clearFilters() {
  store.resetFilters();
}

function onFilterChange(value: string) {
  store.setFilter(value as (typeof filterOptions)[number]);
}

function onCompanyLinkChange(value: number | null) {
  if (value == null) {
    return;
  }

  const company = companiesStore.items.find((item) => item.id === value);
  if (!company) {
    return;
  }

  store.draft.company = company.name;
}

function onPositionLinkChange(value: number | null) {
  if (value == null) {
    return;
  }

  const position = positionsStore.items.find((item) => item.id === value);
  if (!position) {
    return;
  }

  store.draft.role = position.title;

  if (position.companyId != null) {
    store.draft.companyId = position.companyId;
    const company = companiesStore.items.find((item) => item.id === position.companyId);
    if (company) {
      store.draft.company = company.name;
    }
  }
}

function validateDraftLinks() {
  if (store.draft.companyId != null && !companyNameById.value[store.draft.companyId]) {
    store.draft.companyId = null;
    $q.notify({ type: 'warning', message: 'Linked company was removed. Link cleared.' });
  }

  if (store.draft.positionId != null && !positionTitleById.value[store.draft.positionId]) {
    store.draft.positionId = null;
    $q.notify({ type: 'warning', message: 'Linked position was removed. Link cleared.' });
  }
}

function openCompaniesPage() {
  void router.push('/companies');
}

function openPositionsPage() {
  void router.push('/positions');
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

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'recently';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function isPriorityItem(item: { priority?: string; followUpDate?: string }) {
  const priorityRank = item.priority === 'High' ? 2 : item.priority === 'Medium' ? 1 : 0;
  const followUpRank = item.followUpDate ? 1 : 0;
  return priorityRank + followUpRank > 1;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'High':
      return 'negative';
    case 'Medium':
      return 'warning';
    default:
      return 'positive';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Offer':
      return 'positive';
    case 'Ghosted':
      return 'negative';
    case 'Interview':
      return 'info';
    case 'Applied':
      return 'warning';
    default:
      return 'primary';
  }
}
</script>

<style scoped>
.note-block {
  border-left: 3px solid #c7d2fe;
  padding: 8px 10px;
  background: #f8faff;
  border-radius: 6px;
}

.form-hint {
  padding: 8px 10px;
  border-radius: 6px;
  background: #f8faff;
  border-left: 3px solid #60a5fa;
}

.priority-card {
  border-color: #f59e0b;
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.2);
}

.heart-rating-row {
  gap: 2px;
}

.heart-rating-btn {
  min-width: 18px;
  min-height: 18px;
}

.warning-banner {
  border: 1px solid #fcd34d;
  background: #fffbeb;
}
</style>
