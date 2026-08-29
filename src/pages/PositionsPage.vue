<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ editingId ? 'Edit position' : 'Add position' }}</div>
          <q-form @submit.prevent="submitPosition">
            <section>
              <div class="text-subtitle2 q-mb-xs">Position Details</div>
              <q-input
                v-model="store.draft.title"
                label="Position title"
                filled
                dense
                class="q-mb-sm"
              />
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
                No companies yet. Create one to attach this position.
                <template #action>
                  <q-btn flat color="primary" label="Create company" @click="openCompaniesPage" />
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
                v-model="sourceChoice"
                :options="sourceSelectOptions"
                label="Source"
                filled
                dense
                clearable
                class="q-mb-sm"
              />
              <q-input
                v-if="sourceChoice === 'Other'"
                v-model="sourceOtherText"
                label="Other source"
                placeholder="Enter source name"
                filled
                dense
                class="q-mb-sm"
              />
            </section>

            <section class="form-section-spacing">
              <div class="text-subtitle2 q-mb-xs">Status</div>
              <q-select
                v-model="store.draft.status"
                :options="statusOptions"
                label="Status"
                filled
                dense
                class="q-mb-sm"
              />
            </section>

            <section class="form-section-spacing">
              <div class="text-subtitle2 q-mb-xs">Application</div>
              <q-input
                v-model="store.draft.link"
                label="Posting link"
                filled
                dense
                class="q-mb-sm"
              />
              <q-input
                v-model="store.draft.postingClosesAt"
                label="Posting closes"
                type="date"
                filled
                dense
                class="q-mb-sm"
              />
              <q-input
                v-model="store.draft.jobDescription"
                type="textarea"
                autogrow
                filled
                label="Job description"
                placeholder="Paste the posting's responsibilities/qualifications here"
                maxlength="5000"
                counter
                class="q-mb-sm"
              />
            </section>

            <section class="form-section-spacing">
              <div class="text-subtitle2 q-mb-xs">Employment Arrangement</div>
              <div class="text-caption text-grey-7 q-mb-xs">Employment type</div>
              <q-option-group
                v-model="store.draft.employmentType"
                :options="employmentTypeOptions"
                type="radio"
                inline
                dense
                class="q-mb-sm"
              />
              <div class="text-caption text-grey-7 q-mb-xs">Entry type</div>
              <q-option-group
                v-model="store.draft.entryType"
                :options="entryTypeOptions"
                type="radio"
                inline
                dense
                class="q-mb-sm"
              />
              <div class="text-caption text-grey-7 q-mb-xs">Work from</div>
              <q-option-group
                v-model="store.draft.workMode"
                :options="workModeOptions"
                type="radio"
                inline
                dense
                class="q-mb-sm"
              />
              <q-input
                v-model="store.draft.location"
                label="Location"
                placeholder="e.g. Denver, CO"
                filled
                dense
                class="q-mb-sm"
              />
            </section>

            <section class="form-section-spacing">
              <div class="text-subtitle2 q-mb-xs">Salary, Benefits & Perks</div>
              <div class="row q-col-gutter-sm q-mb-sm">
                <div class="col-6">
                  <q-input
                    v-model="store.draft.compensationMin"
                    label="Compensation min"
                    placeholder="e.g. $145,000"
                    filled
                    dense
                    @blur="
                      store.draft.compensationMin = formatCurrencyInput(store.draft.compensationMin)
                    "
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="store.draft.compensationMax"
                    label="Compensation max"
                    placeholder="e.g. $150,000"
                    filled
                    dense
                    @blur="
                      store.draft.compensationMax = formatCurrencyInput(store.draft.compensationMax)
                    "
                  />
                </div>
              </div>
              <div class="row items-center q-mb-xs">
                <div class="text-caption text-grey-7">Benefits</div>
                <q-space />
                <div class="text-caption text-grey-7">{{ benefitsSelectedCount }}</div>
              </div>
              <q-option-group
                v-model="store.draft.benefits"
                :options="benefitOptions"
                type="checkbox"
                inline
                dense
                class="q-mb-sm benefits-option-group"
              />
            </section>

            <section class="form-section-spacing">
              <div class="text-subtitle2 q-mb-xs">Skills Required</div>
              <div class="text-caption text-grey-7 q-mb-xs">Experience level</div>
              <q-option-group
                v-model="store.draft.experienceLevel"
                :options="experienceLevelOptions"
                type="radio"
                inline
                dense
                class="q-mb-sm"
              />
            </section>

            <section class="form-section-spacing">
              <div class="text-subtitle2 q-mb-xs">Additional Information</div>
              <q-input
                v-model="store.draft.notes"
                type="textarea"
                autogrow
                filled
                label="Notes (your thoughts on this position)"
                maxlength="500"
                counter
                class="q-mb-sm"
              />
            </section>

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
                    <div v-if="item.compensationMin || item.compensationMax" class="text-caption">
                      {{ formatCompensationRange(item) }}
                    </div>
                  </div>
                  <div class="column items-end q-gutter-xs">
                    <q-chip :color="statusColor(item.status)" text-color="white">{{
                      item.status
                    }}</q-chip>
                    <q-chip
                      v-if="getClosingChip(item)"
                      dense
                      :color="getClosingChip(item)?.color"
                      text-color="white"
                    >
                      {{ getClosingChip(item)?.label }}
                    </q-chip>
                  </div>
                </div>

                <div v-if="item.link" class="text-caption q-mt-xs text-primary">
                  {{ item.link }}
                </div>
                <div v-if="item.postingClosesAt || item.source" class="text-caption text-grey-7">
                  <span v-if="item.postingClosesAt">Closes {{ item.postingClosesAt }}</span>
                  <span v-if="item.postingClosesAt && item.source"> &middot; </span>
                  <span v-if="item.source">Source: {{ item.source }}</span>
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
                <div class="row items-center heart-rating-row q-mt-xs">
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
              </q-card-section>
            </q-card>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
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
  PositionBenefit,
  PositionEmploymentType,
  PositionEntryType,
  PositionLinkHistoryEntry,
  PositionRecord,
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
const workModeOptions: Array<{ label: string; value: PositionWorkMode }> = [
  { label: 'Remote', value: 'Remote' },
  { label: 'Hybrid', value: 'Hybrid' },
  { label: 'On-site', value: 'On-site' },
];
const employmentTypeOptions: Array<{ label: string; value: PositionEmploymentType }> = [
  { label: 'Full Time', value: 'Full Time' },
  { label: 'Contract-to-Hire', value: 'Contract-to-Hire' },
  { label: 'Contract', value: 'Contract' },
];
const entryTypeOptions: Array<{ label: string; value: PositionEntryType }> = [
  { label: 'Direct Hire', value: 'Direct Hire' },
  { label: 'Recruiter', value: 'Recruiter' },
];
const benefitOptions: Array<{ label: string; value: PositionBenefit }> = [
  { label: '401(k)', value: '401(k)' },
  { label: 'Medical', value: 'Medical' },
  { label: 'Vision', value: 'Vision' },
  { label: 'Dental', value: 'Dental' },
  { label: 'Life Insurance', value: 'Life Insurance' },
  { label: 'Disability Insurance', value: 'Disability Insurance' },
  { label: 'HSA/FSA', value: 'HSA/FSA' },
  { label: 'PTO', value: 'PTO' },
  { label: 'Unlimited PTO', value: 'Unlimited PTO' },
  { label: 'Parental Leave', value: 'Parental Leave' },
  { label: 'Bonuses', value: 'Bonuses' },
  { label: 'Signing Bonus', value: 'Signing Bonus' },
  { label: 'Stock Options', value: 'Stock Options' },
  { label: 'Relocation Assistance', value: 'Relocation Assistance' },
  { label: 'Remote Stipend', value: 'Remote Stipend' },
  { label: 'Tuition Reimbursement', value: 'Tuition Reimbursement' },
  { label: 'Wellness Program', value: 'Wellness Program' },
  { label: 'Other', value: 'Other' },
];
const benefitsSelectedCount = computed(
  () => `${store.draft.benefits.length}/${benefitOptions.length}`,
);
const experienceLevelYears = ['1', '2', '3', '5'];
const experienceLevelOptions = computed(() =>
  experienceLevelYears.map((years) => ({ label: `${years}+ years`, value: years })),
);
const knownSourceOptions = [
  'Indeed',
  'LinkedIn Jobs',
  'Glassdoor',
  'ZipRecruiter',
  'Monster',
  'CareerBuilder',
  'SimplyHired',
  'Snagajob (hourly jobs)',
  'Dice (tech)',
  'The Ladders (higher salaries)',
  'Hired (tech recruiting platform)',
  'FlexJobs (remote + flexible)',
  'Remote.co',
  'We Work Remotely',
  'Working Nomads',
  'Remotive',
  'Jobspresso (remote/tech aggregate)',
];
const sourceSelectOptions = [...knownSourceOptions, 'Other'];
const sourceChoice = ref('');
const sourceOtherText = ref('');
const POSITIONS_DRAFT_KEY = 'job-hunt-tracker-handoff-positions-draft-v1';

watch(
  () => store.draft,
  () => {
    const current = store.draft.source;

    if (!current) {
      sourceChoice.value = '';
      sourceOtherText.value = '';
    } else if (knownSourceOptions.includes(current)) {
      sourceChoice.value = current;
      sourceOtherText.value = '';
    } else {
      sourceChoice.value = 'Other';
      sourceOtherText.value = current;
    }
  },
  { immediate: true },
);

watch([sourceChoice, sourceOtherText], ([choice, otherText]) => {
  store.draft.source = choice === 'Other' ? otherText.trim() : (choice ?? '');
});

watch(
  () => store.draft.employmentType,
  (employmentType) => {
    if (employmentType === 'Contract-to-Hire' || employmentType === 'Contract') {
      store.draft.entryType = 'Recruiter';
    }
  },
);

function formatCompensationRange(item: PositionRecord) {
  if (item.compensationMin && item.compensationMax) {
    return `${item.compensationMin} - ${item.compensationMax}`;
  }

  return item.compensationMin || item.compensationMax;
}

function getClosingChip(item: PositionRecord) {
  if (!item.postingClosesAt) {
    return null;
  }

  const closesAt = new Date(`${item.postingClosesAt}T00:00:00`);
  if (Number.isNaN(closesAt.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((closesAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Closed ${Math.abs(diffDays)}d ago`, color: 'grey-6' };
  }

  if (diffDays === 0) {
    return { label: 'Closes today', color: 'negative' };
  }

  if (diffDays <= 3) {
    return { label: `Closes in ${diffDays}d`, color: 'negative' };
  }

  if (diffDays <= 7) {
    return { label: `Closes in ${diffDays}d`, color: 'warning' };
  }

  return { label: `Closes in ${diffDays}d`, color: 'positive' };
}

function formatCurrencyInput(value: string) {
  const numeric = value.replace(/[^0-9]/g, '');

  if (!numeric) {
    return '';
  }

  return `$${Number(numeric).toLocaleString('en-US')}`;
}

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
  const sorted = recruitersStore.activeItems.slice().sort((a, b) => a.name.localeCompare(b.name));

  return sorted.map((recruiter) => ({
    label:
      recruiter.companyId != null && companyNameById.value[recruiter.companyId]
        ? `${recruiter.name} (${companyNameById.value[recruiter.companyId]})`
        : recruiter.name,
    value: recruiter.id,
  }));
});
const recruiterNameById = computed(() => {
  return recruitersStore.activeItems.reduce<Record<number, string>>((acc, recruiter) => {
    acc[recruiter.id] = recruiter.name;
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
  await store.init();
  await companiesStore.init();
  await recruitersStore.init();
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

  await store.save();
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
    await store.remove(positionId);
    return;
  }

  const resolution = await askPositionDeleteResolution(positionTitle, linkedApplications);
  if (!resolution) {
    return;
  }

  if (resolution === 'clear') {
    await applicationsStore.reassignPositionReferences(positionId, null);
    await store.remove(positionId);
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
  await store.remove(positionId);
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

.heart-rating-row {
  gap: 2px;
}

.heart-rating-btn {
  min-width: 18px;
  min-height: 18px;
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

.benefits-option-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  column-gap: 8px;
  row-gap: 4px;
}

.benefits-option-group :deep(.q-radio),
.benefits-option-group :deep(.q-checkbox) {
  white-space: nowrap;
  min-width: 0;
}

.benefits-option-group :deep(.q-radio__label),
.benefits-option-group :deep(.q-checkbox__label) {
  white-space: nowrap;
}
</style>
