<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card class="q-pa-md">
          <div class="text-h6 q-mb-md">
            {{ editingId ? 'Edit Journey' : 'Add Journey' }}
          </div>
          <q-form @submit="submitApplication">
            <section>
              <div class="text-subtitle2 q-mb-xs">Journey Links</div>
              <div class="row q-col-gutter-sm items-center q-mb-sm">
                <div class="col">
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
                    @update:model-value="onCompanyLinkChange"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    class="linked-add-btn"
                    outline
                    color="primary"
                    size="sm"
                    stack
                    icon="business"
                    label="Add New Company"
                    @click="openCompaniesPage"
                  />
                </div>
              </div>
              <q-banner v-if="!hasCompanies" dense rounded class="q-mb-sm warning-banner">
                No companies yet. Create one first for reliable linking.
                <template #action>
                  <q-btn flat color="primary" label="Open companies" @click="openCompaniesPage" />
                </template>
              </q-banner>

              <div class="row q-col-gutter-sm items-center q-mb-sm">
                <div class="col">
                  <q-select
                    v-model="store.draft.positionId"
                    :options="positionOptions"
                    option-label="label"
                    option-value="value"
                    label="Position"
                    filled
                    dense
                    emit-value
                    map-options
                    clearable
                    @update:model-value="onPositionLinkChange"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    class="linked-add-btn"
                    outline
                    color="primary"
                    size="sm"
                    stack
                    icon="work"
                    label="Add New Position"
                    @click="openPositionsPage"
                  />
                </div>
              </div>
              <q-banner v-if="!hasPositions" dense rounded class="q-mb-sm warning-banner">
                No positions yet. Add one to connect applications to specific roles.
                <template #action>
                  <q-btn flat color="primary" label="Open positions" @click="openPositionsPage" />
                </template>
              </q-banner>

              <div class="row q-col-gutter-sm items-center q-mb-sm">
                <div class="col">
                  <q-select
                    v-model="store.draft.recruiterId"
                    :options="recruiterOptions"
                    option-label="label"
                    option-value="value"
                    label="Recruiter (optional)"
                    filled
                    dense
                    emit-value
                    map-options
                    clearable
                    @update:model-value="onRecruiterLinkChange"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    class="linked-add-btn"
                    outline
                    color="primary"
                    size="sm"
                    stack
                    icon="person_add"
                    label="Add New Recruiter"
                    @click="openRecruitersPage"
                  />
                </div>
              </div>
              <q-banner v-if="!hasRecruiters" dense rounded class="q-mb-sm warning-banner">
                No recruiters match this company yet. Add one to keep outreach connected.
                <template #action>
                  <q-btn flat color="primary" label="Open recruiters" @click="openRecruitersPage" />
                </template>
              </q-banner>
            </section>

            <section class="form-section-spacing">
              <div class="text-subtitle2 q-mb-xs">Journey Status</div>
              <div class="row q-col-gutter-sm items-start">
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="journeyDraftStatus"
                    :options="statusOptions"
                    label="Journey status"
                    filled
                    dense
                    class="q-mb-sm"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="journeyDraftDate"
                    label="Status date"
                    type="date"
                    filled
                    dense
                    class="q-mb-sm"
                  />
                </div>
                <div class="col-12 col-md-auto" style="margin-left: auto">
                  <q-btn
                    class="linked-add-btn journey-add-btn"
                    outline
                    color="primary"
                    size="sm"
                    stack
                    icon="add"
                    label="Add Journey Status"
                    @click="addJourneyEvent"
                  />
                </div>
              </div>
              <q-input
                v-model="journeyDraftNote"
                label="Status note (optional)"
                type="textarea"
                autogrow
                filled
                dense
                maxlength="300"
                counter
                class="q-mb-sm"
              />

              <div v-if="activeJourneyEvents.length" class="journey-timeline-wrapper q-mt-sm">
                <div class="journey-today-summary">Today: {{ todayIsoDate }}</div>
                <div class="journey-band-bar">
                  <div
                    class="journey-band-segment journey-band-segment-past"
                    :style="{ width: `${todayMarkerPercent}%` }"
                  />
                  <div
                    class="journey-band-segment journey-band-segment-future"
                    :style="{ width: `${100 - todayMarkerPercent}%` }"
                  />
                  <span
                    class="journey-band-title journey-band-title-past"
                    :style="{ right: `${100 - todayMarkerPercent}%` }"
                  >
                    Past
                  </span>
                  <span
                    class="journey-band-title journey-band-title-today"
                    :style="{ left: `${todayMarkerPercent}%` }"
                  >
                    Today
                  </span>
                  <span
                    class="journey-band-title journey-band-title-future"
                    :style="{ left: `${todayMarkerPercent}%` }"
                  >
                    Future
                  </span>
                </div>
                <div class="journey-line" />
                <div class="journey-past-region" :style="{ width: `${todayMarkerPercent}%` }" />
                <div class="journey-today-marker" :style="{ left: `${todayMarkerPercent}%` }">
                  <div class="journey-today-label">Today</div>
                  <span class="journey-today-line" />
                </div>
                <div class="journey-events-row">
                  <button
                    v-for="event in activeJourneyEvents"
                    :key="event.id"
                    type="button"
                    class="journey-event-point"
                    :class="{ 'journey-event-point-active': selectedJourneyEventId === event.id }"
                    :style="{ '--journey-color': getStatusHexColor(event.status) }"
                    @click="openJourneyEventDialog(event.id)"
                  >
                    <div class="journey-event-title">{{ event.status }}</div>
                    <div class="journey-event-date">{{ event.eventDate }}</div>
                    <span class="journey-dot" />
                    <q-tooltip class="journey-tooltip">
                      <div class="text-weight-medium">
                        {{ event.status }} · {{ event.eventDate }}
                      </div>
                      <div class="text-caption">{{ event.note || 'No note added.' }}</div>
                    </q-tooltip>
                  </button>
                </div>
              </div>
              <q-banner v-else dense rounded class="q-mt-sm warning-banner">
                No journey events yet. Add your first milestone to start tracking progress.
              </q-banner>
            </section>

            <section class="form-section-spacing">
              <div class="text-subtitle2 q-mb-xs">Next Action</div>
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
              <div class="text-caption text-grey-7 q-mb-sm form-hint">
                Tip: add a next action and follow-up date to keep momentum.
              </div>
            </section>

            <section class="form-section-spacing">
              <NotesSection
                v-model="store.draft.notes"
                title="Notes"
                placeholder="Add notes about this application"
              />
            </section>

            <div class="row justify-end q-gutter-sm">
              <q-btn
                v-if="editingId"
                flat
                color="grey-7"
                label="Cancel"
                @click="resetApplicationDraft"
              />
              <q-btn
                v-else-if="hasDraftContent"
                flat
                color="grey-7"
                label="Clear form"
                @click="resetApplicationDraft"
              />
              <q-btn
                color="primary"
                type="submit"
                :label="editingId ? 'Save changes' : 'Save Journey'"
              />
            </div>
          </q-form>
        </q-card>
      </div>

      <q-dialog v-model="journeyDialogOpen">
        <q-card class="journey-dialog-card" :style="journeyDialogBorderStyle">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Journey Event</div>
            <q-space />
            <q-btn flat round dense icon="close" v-close-popup />
          </q-card-section>
          <q-card-section v-if="selectedJourneyEvent">
            <div class="text-subtitle1">{{ selectedJourneyEvent.status }}</div>
            <div class="text-caption text-grey-7">{{ selectedJourneyEvent.eventDate }}</div>
            <q-input
              v-model="selectedJourneyEventNoteDraft"
              label="Event note"
              type="textarea"
              autogrow
              filled
              dense
              maxlength="300"
              counter
              class="q-mt-sm"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              color="negative"
              label="Delete Event"
              :disable="!selectedJourneyEvent"
              @click="archiveSelectedJourneyEvent"
            />
            <q-btn
              color="primary"
              label="Update Note"
              :disable="!selectedJourneyEvent"
              @click="updateSelectedJourneyEventNote"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <div class="col-12 col-md-7">
        <q-card class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Journeys</div>
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
              <q-select
                v-model="store.search.archiveView"
                :options="archiveViewOptions"
                label="Record state"
                dense
                outlined
                style="min-width: 170px"
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
            label="Search journeys"
            filled
            dense
            clearable
            class="q-mb-md"
          />

          <div class="row q-col-gutter-sm q-mb-md items-stretch">
            <div class="col-12 col-sm-6 col-md-3">
              <q-card bordered class="q-pa-sm full-height">
                <div class="text-caption text-grey-7">Total</div>
                <div class="text-h6">{{ activeItems.length }}</div>
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
                  {{ activeItems.filter((item) => item.status === 'Interview').length }}
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
                  {{
                    activeItems.filter((item) => item.nextAction && item.status !== 'Ghosted')
                      .length
                  }}
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
                  {{ activeItems.filter((item) => item.status === 'Ghosted').length }}
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
                    <div class="text-subtitle1">
                      {{ getDisplayRole(item) }} at {{ getDisplayCompany(item) }}
                    </div>
                    <div v-if="item.appliedDate" class="text-caption text-grey-7">
                      Applied {{ item.appliedDate }}
                    </div>
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
                    v-if="item.priority && item.priority !== 'None'"
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
                  <q-chip v-if="item.recruiterId != null" size="sm" outline color="teal">
                    Recruiter:
                    {{
                      recruiterNameById[item.recruiterId] ??
                      item.recruiterName ??
                      'Unknown recruiter'
                    }}
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
                      v-if="!item.archivedAt"
                      size="sm"
                      outline
                      color="primary"
                      label="Edit"
                      @click="store.startEdit(item)"
                    />
                    <q-btn
                      v-if="!item.archivedAt"
                      size="sm"
                      outline
                      color="negative"
                      label="Archive"
                      @click="store.remove(item.id ?? 0)"
                    />
                    <q-btn
                      v-if="item.archivedAt"
                      size="sm"
                      outline
                      color="positive"
                      label="Restore"
                      @click="store.restore(item.id ?? 0)"
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useApplicationsStore } from '@/stores/applications';
import { useCompaniesStore } from '@/stores/companies';
import { usePositionsStore } from '@/stores/positions';
import { useRecruitersStore } from '@/stores/recruiters';
import {
  clearHandoffQuery,
  getHandoffResult,
  navigateToCreateWithHandoff,
  persistHandoffDraft,
  restoreHandoffDraft,
} from '@/composables/navigationHandoff';
import NotesSection from '@/components/forms/NotesSection.vue';
import type { ApplicationRecord, ApplicationStatus } from '@/types/applications';

const store = useApplicationsStore();
const companiesStore = useCompaniesStore();
const positionsStore = usePositionsStore();
const recruitersStore = useRecruitersStore();
const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const { activeItems, filteredItems, editingId } = storeToRefs(store);
const statusOptions = [
  'Not Started',
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
  'Ghosted',
] as const;
const priorityOptions = ['None', 'Low', 'Medium', 'High'] as const;
const filterOptions = ['All', 'Favorites', ...statusOptions] as const;
const archiveViewOptions = ['Active', 'Archived', 'All'] as const;
const APPLICATIONS_DRAFT_KEY = 'job-hunt-tracker-handoff-applications-draft-v1';
const journeyDraftStatus = ref<ApplicationStatus>('Not Started');
const journeyDraftDate = ref('');
const journeyDraftNote = ref('');
const journeyDialogOpen = ref(false);
const selectedJourneyEventId = ref<string | null>(null);
const selectedJourneyEventNoteDraft = ref('');
const nowTick = ref(Date.now());
let todayTimer: ReturnType<typeof setInterval> | null = null;
const selectedFilterLabel = computed(() => {
  if (store.search.filter !== 'Favorites') {
    return store.search.filter;
  }

  return store.search.favoritesOrder === 'desc'
    ? 'Favorites (high to low)'
    : 'Favorites (low to high)';
});
const hasActiveFilters = computed(
  () =>
    Boolean(store.search.query.trim()) ||
    store.search.filter !== 'All' ||
    store.search.archiveView !== 'Active',
);
const hasDraftContent = computed(
  () =>
    Boolean(store.draft.company.trim()) ||
    Boolean(store.draft.nextAction.trim()) ||
    Boolean(store.draft.notes.trim()) ||
    store.draft.companyId != null ||
    store.draft.positionId != null ||
    store.draft.recruiterId != null ||
    activeJourneyEvents.value.length > 0,
);

const activeJourneyEvents = computed(() =>
  (store.draft.journeyEvents ?? [])
    .filter((event) => !event.archivedAt)
    .sort((a, b) => {
      const dateCmp = a.eventDate.localeCompare(b.eventDate);
      if (dateCmp !== 0) {
        return dateCmp;
      }

      return a.createdAt.localeCompare(b.createdAt);
    }),
);

const todayIsoDate = computed(() => {
  return new Date(nowTick.value).toISOString().slice(0, 10);
});

const todayMarkerPercent = computed(() => {
  return 50;
});

const selectedJourneyEvent = computed(
  () =>
    activeJourneyEvents.value.find((event) => event.id === selectedJourneyEventId.value) ?? null,
);

const journeyDialogBorderStyle = computed(() => ({
  borderTop: `4px solid ${getStatusHexColor(selectedJourneyEvent.value?.status ?? 'Not Started')}`,
}));

const companyOptions = computed(() =>
  companiesStore.activeItems
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((company) => ({
      label: company.name,
      value: company.id,
    })),
);
const hasCompanies = computed(() => companyOptions.value.length > 0);

const companyNameById = computed(() =>
  companiesStore.activeItems.reduce<Record<number, string>>((acc, company) => {
    acc[company.id] = company.name;
    return acc;
  }, {}),
);

const positionOptions = computed(() => {
  const sorted = positionsStore.activeItems.slice().sort((a, b) => a.title.localeCompare(b.title));

  return sorted.map((position) => ({
    label:
      position.companyId != null && companyNameById.value[position.companyId]
        ? `${position.title} (${companyNameById.value[position.companyId]})`
        : position.title,
    value: position.id,
  }));
});
const hasPositions = computed(() => positionOptions.value.length > 0);

const recruiterOptions = computed(() => {
  const base = recruitersStore.activeItems.slice().sort((a, b) => a.name.localeCompare(b.name));
  const selectedCompanyId = store.draft.companyId;

  const filtered =
    selectedCompanyId != null
      ? base.filter((item) => {
          const linkedCompanyIds = item.companyIds?.length
            ? item.companyIds
            : item.companyId != null
              ? [item.companyId]
              : [];
          return linkedCompanyIds.includes(selectedCompanyId);
        })
      : base;

  return filtered.map((recruiter) => ({
    label:
      recruiter.companyId != null && companyNameById.value[recruiter.companyId]
        ? `${recruiter.name} (${companyNameById.value[recruiter.companyId]})`
        : recruiter.name,
    value: recruiter.id,
  }));
});
const hasRecruiters = computed(() => recruiterOptions.value.length > 0);

const positionTitleById = computed(() =>
  positionsStore.activeItems.reduce<Record<number, string>>((acc, position) => {
    acc[position.id] = position.title;
    return acc;
  }, {}),
);

const recruiterNameById = computed(() =>
  recruitersStore.activeItems.reduce<Record<number, string>>((acc, recruiter) => {
    acc[recruiter.id] = recruiter.name;
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
    await companiesStore.init();
    await positionsStore.init();
    await recruitersStore.init();
    await store.reconcileLinkedEntities(
      companiesStore.activeItems.map((company) => company.id),
      positionsStore.activeItems.map((position) => position.id),
      recruitersStore.activeItems.map((recruiter) => recruiter.id),
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

  restoreHandoffState();
  syncJourneyComposerFromDraft();

  const deepLinkQuery = getDeepLinkQuery();
  if (deepLinkQuery) {
    store.search.query = deepLinkQuery;
    clearDeepLinkQuery();
  }

  todayTimer = setInterval(() => {
    nowTick.value = Date.now();
  }, 60_000);

  window.addEventListener('focus', onWindowFocus);
  document.addEventListener('visibilitychange', onVisibilityChange);
});

watch(
  () => editingId.value,
  () => {
    syncJourneyComposerFromDraft();
  },
);

onUnmounted(() => {
  if (todayTimer) {
    clearInterval(todayTimer);
    todayTimer = null;
  }

  window.removeEventListener('focus', onWindowFocus);
  document.removeEventListener('visibilitychange', onVisibilityChange);
});

async function submitApplication() {
  if (store.draft.companyId == null) {
    $q.notify({ type: 'warning', message: 'Select a company before saving.' });
    return;
  }

  if (store.draft.positionId == null) {
    $q.notify({ type: 'warning', message: 'Select a position before saving.' });
    return;
  }

  validateDraftLinks();
  await store.save();
  syncJourneyComposerFromDraft();
}

function resetApplicationDraft() {
  store.resetDraft();
  syncJourneyComposerFromDraft();
}

function syncJourneyComposerFromDraft() {
  journeyDraftStatus.value = store.draft.status;
  journeyDraftDate.value = store.draft.appliedDate || todayIsoDate.value;
  journeyDraftNote.value = '';
  selectedJourneyEventId.value = null;
  selectedJourneyEventNoteDraft.value = '';
  journeyDialogOpen.value = false;
}

function addJourneyEvent() {
  if (!journeyDraftDate.value) {
    $q.notify({ type: 'warning', message: 'Pick a status date before adding a journey event.' });
    return;
  }

  const addedEvent = store.addJourneyEventToDraft(
    journeyDraftStatus.value,
    journeyDraftDate.value,
    journeyDraftNote.value,
  );

  if (!addedEvent) {
    $q.notify({ type: 'negative', message: 'Could not add journey event. Check the status date.' });
    return;
  }

  journeyDraftStatus.value = store.draft.status;
  journeyDraftDate.value = store.draft.appliedDate || todayIsoDate.value;
  journeyDraftNote.value = '';
}

function openJourneyEventDialog(eventId: string) {
  const target = activeJourneyEvents.value.find((event) => event.id === eventId);
  if (!target) {
    return;
  }

  selectedJourneyEventId.value = target.id;
  selectedJourneyEventNoteDraft.value = target.note;
  journeyDialogOpen.value = true;
}

function updateSelectedJourneyEventNote() {
  if (!selectedJourneyEvent.value) {
    return;
  }

  store.updateDraftJourneyEventNote(
    selectedJourneyEvent.value.id,
    selectedJourneyEventNoteDraft.value,
  );
  journeyDialogOpen.value = false;
}

function archiveSelectedJourneyEvent() {
  if (!selectedJourneyEvent.value) {
    return;
  }

  const eventId = selectedJourneyEvent.value.id;
  const eventStatus = selectedJourneyEvent.value.status;
  store.archiveDraftJourneyEvent(eventId);
  journeyDialogOpen.value = false;
  selectedJourneyEventId.value = null;

  $q.notify({
    type: 'warning',
    message: `${eventStatus} event removed from Journey.`,
    actions: [
      {
        label: 'Undo',
        color: 'white',
        handler: () => {
          store.restoreDraftJourneyEvent(eventId);
        },
      },
    ],
  });
}

function clearFilters() {
  store.resetFilters();
}

function onFilterChange(value: string) {
  store.setFilter(value as (typeof filterOptions)[number]);
}

function onCompanyLinkChange(value: number | null) {
  if (value == null) {
    store.draft.company = '';
    return;
  }

  const company = companiesStore.activeItems.find((item) => item.id === value);
  if (!company) {
    return;
  }

  store.draft.company = company.name;
}

function onPositionLinkChange(value: number | null) {
  if (value == null) {
    return;
  }

  const position = positionsStore.activeItems.find((item) => item.id === value);
  if (!position) {
    return;
  }

  if (position.companyId != null) {
    store.draft.companyId = position.companyId;
    const company = companiesStore.activeItems.find((item) => item.id === position.companyId);
    if (company) {
      store.draft.company = company.name;
    }
  }
}

function onRecruiterLinkChange(value: number | null) {
  if (value == null) {
    return;
  }

  const recruiter = recruitersStore.activeItems.find((item) => item.id === value);
  if (!recruiter) {
    return;
  }

  if (recruiter.companyId != null) {
    store.draft.companyId = recruiter.companyId;
    const company = companiesStore.activeItems.find((item) => item.id === recruiter.companyId);
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

  if (store.draft.recruiterId != null && !recruiterNameById.value[store.draft.recruiterId]) {
    store.draft.recruiterId = null;
    $q.notify({ type: 'warning', message: 'Linked recruiter was removed. Link cleared.' });
  }
}

function openCompaniesPage() {
  persistDraftForHandoff();
  navigateToCreateWithHandoff(
    router,
    route.path,
    '/companies',
    APPLICATIONS_DRAFT_KEY,
    'companyId',
  );
}

function openPositionsPage() {
  persistDraftForHandoff();
  navigateToCreateWithHandoff(
    router,
    route.path,
    '/positions',
    APPLICATIONS_DRAFT_KEY,
    'positionId',
  );
}

function openRecruitersPage() {
  persistDraftForHandoff();
  navigateToCreateWithHandoff(
    router,
    route.path,
    '/recruiters',
    APPLICATIONS_DRAFT_KEY,
    'recruiterId',
  );
}

function persistDraftForHandoff() {
  persistHandoffDraft(APPLICATIONS_DRAFT_KEY, store.draft);
}

function restoreHandoffState() {
  store.draft = restoreHandoffDraft(route, APPLICATIONS_DRAFT_KEY, store.draft);
  if (!Array.isArray(store.draft.journeyEvents)) {
    store.draft.journeyEvents = [];
  }

  const handoffResult = getHandoffResult(route);
  if (handoffResult?.field === 'companyId') {
    store.draft.companyId = handoffResult.id;
    onCompanyLinkChange(handoffResult.id);
  } else if (handoffResult?.field === 'positionId') {
    store.draft.positionId = handoffResult.id;
    onPositionLinkChange(handoffResult.id);
  } else if (handoffResult?.field === 'recruiterId') {
    store.draft.recruiterId = handoffResult.id;
    onRecruiterLinkChange(handoffResult.id);
  }

  clearHandoffQuery(route, router);
}

function getDisplayCompany(item: ApplicationRecord) {
  if (item.companyId != null) {
    return companyNameById.value[item.companyId] ?? item.company;
  }

  return item.company;
}

function getDisplayRole(item: ApplicationRecord) {
  if (item.positionId != null) {
    return positionTitleById.value[item.positionId] ?? item.role;
  }

  return item.role || 'Unlinked position';
}

function getStatusHexColor(status: ApplicationStatus) {
  switch (status) {
    case 'Not Started':
      return '#6b7280';
    case 'Applied':
      return '#f59e0b';
    case 'Interview':
      return '#1e88e5';
    case 'Offer':
      return '#43a047';
    case 'Rejected':
      return '#b91c1c';
    case 'Ghosted':
      return '#c62828';
    default:
      return '#64748b';
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
    case 'None':
      return 'grey-6';
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
    case 'Not Started':
      return 'grey-7';
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

.linked-add-btn {
  width: 160px;
  justify-content: center;
}

.linked-add-btn :deep(.q-btn__content) {
  font-size: 0.74rem;
  gap: 2px;
}

.linked-add-btn :deep(.q-icon) {
  font-size: 1rem;
}

.journey-add-btn {
  width: 160px;
}

.journey-timeline-wrapper {
  position: relative;
  padding: 46px 6px 0;
}

.journey-line {
  position: absolute;
  top: 102px;
  left: 22px;
  right: 22px;
  border-top: 3px solid #e5e7eb;
  border-radius: 999px;
}

.journey-past-region {
  position: absolute;
  top: 102px;
  left: 22px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #bfdbfe 0%, #60a5fa 100%);
  max-width: calc(100% - 44px);
}

.journey-band-bar {
  position: absolute;
  top: 18px;
  left: 22px;
  right: 22px;
  height: 12px;
  display: flex;
  border-radius: 999px;
  overflow: hidden;
  background: #eef2ff;
}

.journey-band-segment {
  height: 100%;
}

.journey-band-segment-past {
  background: linear-gradient(90deg, #93c5fd 0%, #60a5fa 100%);
}

.journey-band-segment-future {
  background: linear-gradient(90deg, #e5e7eb 0%, #cbd5e1 100%);
}

.journey-band-title {
  position: absolute;
  top: -16px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #475569;
}

.journey-band-title-past {
  transform: translateX(-6px);
}

.journey-band-title-today {
  transform: translateX(-50%);
  color: #2563eb;
}

.journey-band-title-future {
  transform: translateX(8px);
}

.journey-today-summary {
  position: absolute;
  top: 0;
  right: 8px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #1f2937;
}

.journey-today-marker {
  position: absolute;
  top: 54px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.journey-today-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #2563eb;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.journey-today-line {
  width: 0;
  height: 54px;
  border-left: 2px dashed #60a5fa;
  margin-top: 2px;
}

.journey-events-row {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.journey-event-point {
  background: transparent;
  border: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 96px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.journey-event-point:hover {
  transform: translateY(-2px);
}

.journey-event-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

.journey-event-date {
  font-size: 0.72rem;
  color: #6b7280;
}

.journey-dot {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 3px solid var(--journey-color);
  background: #fff;
  margin-top: 64px;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--journey-color) 18%, transparent);
}

.journey-event-point-active .journey-dot {
  transform: scale(1.08);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--journey-color) 28%, transparent);
}

.journey-dialog-card {
  width: 100%;
  max-width: 560px;
}

.journey-tooltip {
  max-width: 250px;
}

.journey-add-btn {
  white-space: nowrap;
}

.journey-add-btn :deep(.q-btn__content) {
  flex-wrap: nowrap;
  gap: 2px;
}
</style>
