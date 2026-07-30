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
            <q-banner v-if="!hasCompanies" dense rounded class="q-mb-sm warning-banner">
              No companies yet. Create one to attach this position.
              <template #action>
                <q-btn flat color="primary" label="Create company" @click="openCompaniesPage" />
              </template>
            </q-banner>
            <q-select
              v-model="store.draft.recruiterId"
              :options="recruiterOptions"
              option-label="label"
              option-value="value"
              label="Recruiting firm (optional)"
              filled
              dense
              emit-value
              map-options
              clearable
              class="q-mb-sm"
            />
            <q-banner v-if="!hasRecruiters" dense rounded class="q-mb-sm warning-banner">
              No recruiting firms yet. Create one to attach this position.
              <template #action>
                <q-btn
                  flat
                  color="primary"
                  label="Create recruiting firm"
                  @click="openRecruitersPage"
                />
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
            <q-select
              v-model="store.draft.workMode"
              :options="workModeOptions"
              label="Work arrangement"
              filled
              dense
              class="q-mb-sm"
            />
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
              maxlength="500"
              counter
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
            <div class="row items-center q-gutter-sm">
              <q-select
                v-model="store.archiveView"
                :options="archiveViewOptions"
                label="Record state"
                dense
                outlined
                style="min-width: 170px"
              />
              <q-select
                v-model="store.filterStatus"
                :options="filterOptions"
                label="Status filter"
                dense
                outlined
                style="min-width: 170px"
              />
            </div>
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
                      {{ item.workMode }}
                    </div>
                    <div v-if="getDisplayRecruiter(item)" class="text-caption text-grey-7">
                      Recruiting firm: {{ getDisplayRecruiter(item) }}
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

                <div v-if="getRecentLinkHistory(item).length" class="q-mt-sm">
                  <div class="text-caption text-grey-7">Link history</div>
                  <div
                    v-for="entry in getRecentLinkHistory(item)"
                    :key="`${entry.changedAt}-${entry.companyId ?? 'none'}-${entry.recruiterId ?? 'none'}-${entry.reason}`"
                    class="text-caption text-grey-7"
                  >
                    {{ formatLinkHistoryEntry(entry) }}
                  </div>
                </div>

                <div class="row items-center q-gutter-xs q-mt-sm">
                  <q-chip size="sm" outline color="indigo">
                    {{ applicationCountByPositionId[item.id] ?? 0 }} applications
                  </q-chip>
                </div>

                <div class="row q-gutter-xs q-mt-xs">
                  <q-btn
                    size="xs"
                    flat
                    color="indigo"
                    label="View applications"
                    @click="openApplicationsForPosition(item.title)"
                  />
                </div>

                <div class="row q-gutter-sm q-mt-sm">
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
                    @click="tryRemovePosition(item.id, item.title)"
                  />
                  <q-btn
                    v-if="item.archivedAt"
                    size="sm"
                    outline
                    color="positive"
                    label="Restore"
                    @click="store.restore(item.id)"
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
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useCompaniesStore } from '@/stores/companies';
import { usePositionsStore } from '@/stores/positions';
import { useRecruitersStore } from '@/stores/recruiters';
import { useApplicationsStore } from '@/stores/applications';
import {
  clearHandoffQuery,
  getHandoffResult,
  navigateToCreateWithHandoff,
  persistHandoffDraft,
  restoreHandoffDraft,
  returnFromHandoffWithId,
} from '@/composables/navigationHandoff';
import type {
  PositionLinkHistoryEntry,
  PositionStatus,
  PositionWorkMode,
} from '@/types/networking';

const store = usePositionsStore();
const companiesStore = useCompaniesStore();
const recruitersStore = useRecruitersStore();
const applicationsStore = useApplicationsStore();
const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const { filteredItems, editingId } = storeToRefs(store);
const statusOptions: PositionStatus[] = ['Open', 'Interviewing', 'On Hold', 'Closed'];
const filterOptions: Array<PositionStatus | 'All'> = ['All', ...statusOptions];
const archiveViewOptions: Array<'Active' | 'Archived' | 'All'> = ['Active', 'Archived', 'All'];
const workModeOptions: PositionWorkMode[] = ['Remote', 'On-site', 'Hybrid'];
const POSITIONS_DRAFT_KEY = 'job-hunt-tracker-handoff-positions-draft-v1';

const companyOptions = computed(() =>
  companiesStore.activeItems
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((company) => ({
      label: company.name,
      value: company.id,
    })),
);

const companyNameById = computed(() => {
  return companiesStore.activeItems.reduce<Record<number, string>>((acc, company) => {
    acc[company.id] = company.name;
    return acc;
  }, {});
});
const hasCompanies = computed(() => companyOptions.value.length > 0);

const recruiterOptions = computed(() => {
  const sorted = recruitersStore.activeItems
    .slice()
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return sorted.map((recruiter) => ({
    label:
      recruiter.companyId != null && companyNameById.value[recruiter.companyId]
        ? `${recruiter.fullName} (${companyNameById.value[recruiter.companyId]})`
        : recruiter.fullName,
    value: recruiter.id,
  }));
});
const recruiterNameById = computed(() => {
  return recruitersStore.activeItems.reduce<Record<number, string>>((acc, recruiter) => {
    acc[recruiter.id] = recruiter.fullName;
    return acc;
  }, {});
});
const hasRecruiters = computed(() => recruiterOptions.value.length > 0);

const applicationCountByPositionId = computed(() => {
  return applicationsStore.activeItems.reduce<Record<number, number>>((acc, item) => {
    if (item.positionId == null) {
      return acc;
    }

    acc[item.positionId] = (acc[item.positionId] ?? 0) + 1;
    return acc;
  }, {});
});

onMounted(async () => {
  store.init();
  companiesStore.init();
  recruitersStore.init();
  await applicationsStore.init();

  restoreHandoffState();

  const prefillQuery = getDeepLinkQuery();
  if (prefillQuery) {
    store.searchQuery = prefillQuery;
    clearDeepLinkQuery();
  }
});

async function submitPosition() {
  const currentEditingId = editingId.value;
  const existingIds = new Set(store.items.map((item) => item.id));
  const nextTitle = store.draft.title.trim();
  const previousTitle =
    currentEditingId != null
      ? (store.items.find((item) => item.id === currentEditingId)?.title.trim() ?? '')
      : '';

  store.save();
  const savedPositionId =
    currentEditingId ?? store.items.find((item) => !existingIds.has(item.id))?.id ?? null;

  if (currentEditingId != null && nextTitle && nextTitle !== previousTitle) {
    await applicationsStore.syncPositionTitleReferences(currentEditingId, nextTitle);
  }

  returnFromHandoff(savedPositionId);
}

function openCompaniesPage() {
  persistDraftForHandoff();
  navigateToCreateWithHandoff(router, route.path, '/companies', POSITIONS_DRAFT_KEY, 'companyId');
}

function openRecruitersPage() {
  persistDraftForHandoff();
  navigateToCreateWithHandoff(
    router,
    route.path,
    '/recruiters',
    POSITIONS_DRAFT_KEY,
    'recruiterId',
  );
}

function persistDraftForHandoff() {
  persistHandoffDraft(POSITIONS_DRAFT_KEY, store.draft);
}

function restoreHandoffState() {
  store.draft = restoreHandoffDraft(route, POSITIONS_DRAFT_KEY, store.draft);

  const handoffResult = getHandoffResult(route);
  if (handoffResult?.field === 'companyId') {
    store.draft.companyId = handoffResult.id;
  } else if (handoffResult?.field === 'recruiterId') {
    store.draft.recruiterId = handoffResult.id;
  }

  clearHandoffQuery(route, router);
}

function returnFromHandoff(positionId: number | null) {
  returnFromHandoffWithId(route, router, positionId);
}

async function tryRemovePosition(positionId: number, positionTitle: string) {
  await applicationsStore.init();

  const linkedApplications = applicationsStore.activeItems.filter(
    (item) => item.positionId === positionId,
  ).length;

  if (linkedApplications === 0) {
    store.remove(positionId);
    return;
  }

  const resolution = await askPositionDeleteResolution(positionTitle, linkedApplications);
  if (!resolution) {
    return;
  }

  if (resolution === 'clear') {
    await applicationsStore.reassignPositionReferences(positionId, null);
    store.remove(positionId);
    $q.notify({
      type: 'positive',
      message: `Position archived and ${linkedApplications} linked application${linkedApplications === 1 ? '' : 's'} updated.`,
    });
    return;
  }

  const targetPositionId = await askPositionReassignTarget(positionId);
  if (targetPositionId == null) {
    return;
  }

  await applicationsStore.reassignPositionReferences(
    positionId,
    targetPositionId,
    getPositionTitle(targetPositionId),
  );
  store.remove(positionId);
  $q.notify({
    type: 'positive',
    message: `Position archived and links reassigned to ${getPositionTitle(targetPositionId)}.`,
  });
}

function getPositionTitle(id: number) {
  return store.activeItems.find((item) => item.id === id)?.title ?? 'selected position';
}

function askPositionDeleteResolution(positionTitle: string, linkedApplications: number) {
  return new Promise<'reassign' | 'clear' | null>((resolve) => {
    $q.dialog({
      title: 'Linked records found',
      message: `${positionTitle} is linked to ${linkedApplications} application${linkedApplications === 1 ? '' : 's'}. Choose how to continue.`,
      options: {
        type: 'radio',
        model: 'reassign',
        items: [
          { label: 'Reassign linked applications, then archive position', value: 'reassign' },
          { label: 'Clear position links, then archive position', value: 'clear' },
        ],
      },
      ok: { label: 'Continue', color: 'primary' },
      cancel: { label: 'Cancel', flat: true },
      persistent: true,
    })
      .onOk((value) => resolve((value as 'reassign' | 'clear') ?? 'reassign'))
      .onCancel(() => resolve(null))
      .onDismiss(() => resolve(null));
  });
}

function askPositionReassignTarget(currentPositionId: number) {
  const candidates = store.activeItems
    .filter((item) => item.id !== currentPositionId)
    .sort((a, b) => a.title.localeCompare(b.title));

  if (candidates.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No other position available for reassignment. Choose clear links instead.',
    });
    return Promise.resolve<number | null>(null);
  }

  return new Promise<number | null>((resolve) => {
    $q.dialog({
      title: 'Reassign linked applications',
      message: 'Select a position to receive linked applications.',
      options: {
        type: 'radio',
        model: String(candidates[0]?.id ?? ''),
        items: candidates.map((item) => ({
          label: item.title,
          value: String(item.id),
        })),
      },
      ok: { label: 'Reassign and archive', color: 'primary' },
      cancel: { label: 'Cancel', flat: true },
      persistent: true,
    })
      .onOk((value) => {
        const parsed = Number(value);
        resolve(Number.isFinite(parsed) ? parsed : null);
      })
      .onCancel(() => resolve(null))
      .onDismiss(() => resolve(null));
  });
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

function getDisplayRecruiter(item: (typeof store.items)[number]) {
  if (item.recruiterId == null) {
    return '';
  }

  return recruiterNameById.value[item.recruiterId] ?? '';
}

function getRecentLinkHistory(item: (typeof store.items)[number]) {
  const history = Array.isArray(item.linkHistory) ? item.linkHistory : [];
  return history.slice(-3).reverse();
}

function formatLinkHistoryEntry(entry: PositionLinkHistoryEntry) {
  const companyLabel =
    entry.companyId != null
      ? (companyNameById.value[entry.companyId] ?? `Company #${entry.companyId}`)
      : 'No company';
  const recruiterLabel =
    entry.recruiterId != null
      ? (recruiterNameById.value[entry.recruiterId] ?? `Recruiting firm #${entry.recruiterId}`)
      : 'No recruiting firm';

  return `${formatLinkReason(entry.reason)} • ${companyLabel} • ${recruiterLabel} • ${formatHistoryDate(entry.changedAt)}`;
}

function formatLinkReason(reason: string) {
  switch (reason) {
    case 'initial':
      return 'Created';
    case 'company-reassigned':
      return 'Company reassigned';
    default:
      return 'Link updated';
  }
}

function formatHistoryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'unknown date';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function openApplicationsForPosition(title: string) {
  void router.push({ path: '/applications', query: { q: title } });
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

.warning-banner {
  border: 1px solid #fcd34d;
  background: #fffbeb;
}
</style>
