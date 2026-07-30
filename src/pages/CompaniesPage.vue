<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ editingId ? 'Edit company' : 'Add company' }}</div>
          <q-form @submit.prevent="submitCompany">
            <section>
              <q-input
                v-model="store.draft.name"
                label="Company name"
                filled
                dense
                class="q-mb-sm"
              />
              <q-input v-model="store.draft.website" label="Website" filled dense class="q-mb-sm" />
              <q-select
                v-model="store.draft.industry"
                :options="filteredIndustryOptions"
                label="Industry"
                filled
                dense
                clearable
                use-input
                input-debounce="0"
                @filter="filterIndustryOptions"
                class="q-mb-sm"
              />
            </section>

            <AddressContactSection v-model="addressDraft" />

            <section class="form-section-spacing">
              <div class="row items-center q-mb-xs">
                <div class="text-subtitle2">Important Leadership Names</div>
                <q-space />
                <q-btn
                  color="primary"
                  outline
                  denses
                  icon="add"
                  label="Add Name"
                  @click="store.addImportantNameRow()"
                />
              </div>
              <div class="column q-gutter-sm q-mb-sm">
                <q-card v-for="nameRow in store.draft.importantNames" :key="nameRow.rowId">
                  <q-card-section class="q-pa-sm">
                    <div class="row q-col-gutter-sm">
                      <div class="col-12 col-md-4">
                        <q-input v-model="nameRow.name" label="Name" filled dense class="q-mb-sm" />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="nameRow.title"
                          label="Title"
                          placeholder="e.g. VP of Engineering"
                          filled
                          dense
                          class="q-mb-sm"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-select
                          v-model="nameRow.category"
                          :options="importantNameCategoryOptions"
                          label="Category"
                          placeholder="Select a category"
                          filled
                          dense
                          clearable
                          class="q-mb-sm"
                        />
                      </div>
                    </div>
                    <q-input
                      v-model="nameRow.notesConfidence"
                      type="textarea"
                      autogrow
                      filled
                      label="Notes / Confidence"
                      placeholder="Add notes or confidence"
                      maxlength="100"
                      counter
                      class="q-mb-sm"
                    />
                    <div class="row justify-end">
                      <q-btn
                        flat
                        dense
                        color="negative"
                        label="Delete row"
                        @click="store.removeImportantNameRow(nameRow.rowId)"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </section>

            <NotesSection
              v-model="store.draft.notes"
              title="Notes"
              placeholder="Add notes about the company"
            />

            <section class="form-section-spacing">
              <div class="text-subtitle2 q-mb-xs">Relationship</div>
              <div class="row items-center q-mb-xs">
                <div class="text-subtitle2">Recruiting Firms</div>
                <q-space />
                <q-btn
                  color="primary"
                  outline
                  dense
                  icon="add"
                  label="Add Recruiter"
                  @click="addRecruiterRelationshipRow"
                />
              </div>
              <div class="column q-gutter-sm q-mb-sm">
                <div
                  v-for="relationshipRow in recruiterRelationshipRows"
                  :key="relationshipRow.rowId"
                  class="q-pa-sm bg-grey-1 rounded-borders"
                >
                  <div class="row q-col-gutter-sm items-center">
                    <div class="col">
                      <q-select
                        v-model="relationshipRow.recruiterId"
                        :options="recruiterOptions"
                        option-label="label"
                        option-value="value"
                        label="Recruiting firm (optional)"
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
                        icon="person_add"
                        label="Create New"
                        @click="openRecruiterCreateFromForm"
                      />
                    </div>
                    <div class="col-auto">
                      <q-btn
                        flat
                        dense
                        color="negative"
                        icon="delete"
                        aria-label="Remove recruiter row"
                        @click="removeRecruiterRelationshipRow(relationshipRow.rowId)"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <q-banner
                v-if="selectedRecruiterReassignWarning.length"
                dense
                rounded
                class="q-mb-sm warning-banner"
              >
                <div
                  v-for="warning in selectedRecruiterReassignWarning"
                  :key="warning"
                  class="q-mb-xs"
                >
                  {{ warning }}
                </div>
              </q-banner>
              <q-banner v-if="!hasRecruiters" dense rounded class="q-mb-sm warning-banner">
                No recruiting firms yet. Create one to link it to this company.
                <template #action>
                  <q-btn
                    flat
                    color="primary"
                    label="Create recruiter"
                    @click="openRecruiterCreateFromForm"
                  />
                </template>
              </q-banner>
            </section>

            <section class="form-section-spacing">
              <div class="text-subtitle2 q-mb-xs">Additional Information</div>
              <q-select
                v-model="store.draft.size"
                :options="companySizeOptions"
                label="Company size"
                placeholder="Select a size"
                filled
                dense
                clearable
                class="q-mb-sm"
              />
              <q-select
                v-model="store.draft.fundingStage"
                :options="fundingStageOptions"
                label="Funding stage"
                placeholder="Select one"
                filled
                dense
                clearable
                class="q-mb-sm"
              />
              <q-select
                v-model="store.draft.status"
                :options="companyStatusOptions"
                label="Status"
                placeholder="Select one"
                filled
                dense
                clearable
                class="q-mb-sm"
              />
            </section>
            <div class="row justify-end q-gutter-sm" style="margin-top: 20px">
              <q-btn
                color="primary"
                type="submit"
                :label="editingId ? 'Save changes' : 'Save company'"
              />
              <q-btn
                v-if="editingId"
                clearable
                flat
                color="grey-7"
                label="Cancel"
                @click="cancelEditCompany"
              />
            </div>
          </q-form>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Companies</div>
            <div class="row items-center q-gutter-sm">
              <q-select
                v-model="store.archiveView"
                :options="archiveViewOptions"
                label="Record state"
                dense
                outlined
                style="min-width: 170px"
              />
              <q-btn
                v-if="store.searchQuery"
                flat
                dense
                color="grey-7"
                label="Clear search"
                @click="store.searchQuery = ''"
              />
            </div>
          </div>

          <q-input
            v-model="store.searchQuery"
            label="Search companies"
            filled
            dense
            clearable
            class="q-mb-md"
          />

          <div v-if="filteredItems.length === 0" class="text-grey-7">
            No companies yet. Add one to connect positions and recruiters.
          </div>

          <div v-else class="column q-gutter-sm">
            <q-card v-for="item in filteredItems" :key="item.id" bordered>
              <q-card-section class="q-py-sm q-px-md">
                <div class="row items-start justify-between">
                  <div>
                    <div class="text-subtitle1">{{ item.name }}</div>
                    <div class="text-caption text-grey-7">
                      {{ item.industry || 'No industry set' }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ formatAdditionalInformation(item) }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ formatCompanyAddress(item) }}
                    </div>
                    <div v-if="item.phone" class="text-caption text-grey-7">
                      {{ item.phone }}
                    </div>
                    <div v-if="item.companyLinkedinUrl" class="text-caption text-primary q-mt-xs">
                      {{ item.companyLinkedinUrl }}
                    </div>
                    <div v-if="item.importantNames.length" class="text-caption text-grey-7 q-mt-xs">
                      {{ formatImportantNames(item) }}
                    </div>
                    <div v-if="item.website" class="text-caption q-mt-xs">
                      {{ item.website }}
                    </div>
                  </div>
                  <div class="text-caption text-grey-6">
                    Updated {{ formatDate(item.updatedAt) }}
                  </div>
                </div>

                <div v-if="item.notes" class="text-caption text-grey-7 q-mt-sm notes-block">
                  {{ item.notes }}
                </div>

                <div v-if="getRecentRecruiterTieHistory(item.id).length" class="q-mt-sm">
                  <div class="text-caption text-grey-7">Recent recruiter ties</div>
                  <div
                    v-for="entry in getRecentRecruiterTieHistory(item.id)"
                    :key="`${entry.changedAt}-${entry.recruiterName}-${entry.reason}`"
                    class="text-caption text-grey-7"
                  >
                    {{ formatRecruiterTieHistoryEntry(entry) }}
                  </div>
                </div>

                <div v-if="getRecentPositionTieHistory(item.id).length" class="q-mt-xs">
                  <div class="text-caption text-grey-7">Recent position ties</div>
                  <div
                    v-for="entry in getRecentPositionTieHistory(item.id)"
                    :key="`${entry.changedAt}-${entry.positionTitle}-${entry.reason}`"
                    class="text-caption text-grey-7"
                  >
                    {{ formatPositionTieHistoryEntry(entry) }}
                  </div>
                </div>

                <div class="row items-center q-gutter-xs q-mt-sm">
                  <q-chip size="sm" outline color="primary">
                    {{ positionCountByCompanyId[item.id] ?? 0 }} positions
                  </q-chip>
                  <q-chip size="sm" outline color="secondary">
                    {{ recruiterCountByCompanyId[item.id] ?? 0 }} recruiters
                  </q-chip>
                  <q-chip size="sm" outline color="indigo">
                    {{ applicationCountByCompanyId[item.id] ?? 0 }} applications
                  </q-chip>
                </div>

                <div class="row q-gutter-xs q-mt-xs">
                  <q-btn
                    size="xs"
                    flat
                    color="primary"
                    label="View positions"
                    @click="openPositionsForCompany(item.name)"
                  />
                  <q-btn
                    size="xs"
                    flat
                    color="secondary"
                    label="View recruiters"
                    @click="openRecruitersForCompany(item.name)"
                  />
                  <q-btn
                    size="xs"
                    flat
                    color="teal"
                    label="Add recruiter"
                    @click="openRecruiterCreateForCompany(item.id)"
                  />
                  <q-btn
                    size="xs"
                    flat
                    color="indigo"
                    label="View applications"
                    @click="openApplicationsForCompany(item.name)"
                  />
                </div>

                <div class="row q-gutter-sm q-mt-sm">
                  <q-btn
                    v-if="!item.archivedAt"
                    size="sm"
                    outline
                    color="primary"
                    label="Edit"
                    @click="startEditCompany(item)"
                  />
                  <q-btn
                    v-if="!item.archivedAt"
                    size="sm"
                    outline
                    color="negative"
                    label="Archive"
                    @click="tryRemoveCompany(item.id, item.name)"
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
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useCompaniesStore } from '@/stores/companies';
import { usePositionsStore } from '@/stores/positions';
import { useRecruitersStore } from '@/stores/recruiters';
import { useApplicationsStore } from '@/stores/applications';
import { returnFromHandoffWithId } from '@/composables/navigationHandoff';
import AddressContactSection from '@/components/forms/AddressContactSection.vue';
import NotesSection from '@/components/forms/NotesSection.vue';

const store = useCompaniesStore();
const positionsStore = usePositionsStore();
const recruitersStore = useRecruitersStore();
const applicationsStore = useApplicationsStore();
const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const { filteredItems, editingId } = storeToRefs(store);

const industryOptions = [
  'Agriculture & Natural Resources',
  'Construction',
  'Manufacturing',
  'Transportation & Logistics',
  'Wholesale & Retail Trade',
  'Hospitality & Food Services',
  'Healthcare',
  'Technology (IT / Software / Telecom)',
  'Finance & Insurance',
  'Real Estate',
  'Professional Services (Legal, Consulting, Accounting)',
  'Government & Public Sector',
  'Education & Training',
  'Nonprofit & Social Services',
  'Energy & Utilities (Power/Water)',
  'Engineering, Architecture & Design',
  'Arts, Media & Entertainment',
  'Other',
];

const filteredIndustryOptions = ref([...industryOptions]);
const importantNameCategoryOptions = [
  'Founder',
  'CEO',
  'C-level',
  'People/HR',
  'Hiring/Dept lead',
  'Other',
];
const companySizeOptions = ['1–50', '51–200', '201–1000', '1000+'];
const fundingStageOptions = [
  'Bootstrapped',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C+',
  'Public',
  'Unknown',
];
const companyStatusOptions = ['Active', 'Acquired', 'IPO', 'Closed', 'Unknown'];
const archiveViewOptions: Array<'Active' | 'Archived' | 'All'> = ['Active', 'Archived', 'All'];
const recruiterRelationshipRows = ref<Array<{ rowId: number; recruiterId: number | null }>>([]);

const recruiterOptions = computed(() =>
  recruitersStore.activeItems
    .slice()
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
    .map((recruiter) => ({
      label: recruiter.fullName,
      value: recruiter.id,
    })),
);

const hasRecruiters = computed(() => recruiterOptions.value.length > 0);

const selectedRecruiterReassignWarning = computed(() => {
  const messages: string[] = [];
  const currentCompanyId = editingId.value;

  recruiterRelationshipRows.value.forEach((row) => {
    if (row.recruiterId == null) {
      return;
    }

    const recruiter = recruitersStore.activeItems.find((item) => item.id === row.recruiterId);
    if (!recruiter) {
      return;
    }

    const linkedCompanyIds = recruiter.companyIds?.length
      ? recruiter.companyIds
      : recruiter.companyId != null
        ? [recruiter.companyId]
        : [];

    const conflictingCompanyId = linkedCompanyIds.find(
      (companyId) => companyId !== currentCompanyId,
    );
    if (conflictingCompanyId == null) {
      return;
    }

    const currentCompanyName =
      store.items.find((item) => item.id === conflictingCompanyId)?.name ?? 'another company';
    messages.push(
      `${recruiter.fullName} is already linked to ${currentCompanyName}. Saving will add this company as another relationship.`,
    );
  });

  return Array.from(new Set(messages));
});

const positionCountByCompanyId = computed(() => {
  return positionsStore.activeItems.reduce<Record<number, number>>((acc, item) => {
    if (item.companyId == null) {
      return acc;
    }

    acc[item.companyId] = (acc[item.companyId] ?? 0) + 1;
    return acc;
  }, {});
});

const recruiterCountByCompanyId = computed(() => {
  return recruitersStore.activeItems.reduce<Record<number, number>>((acc, item) => {
    const companyIds = item.companyIds?.length
      ? item.companyIds
      : item.companyId != null
        ? [item.companyId]
        : [];
    if (!companyIds.length) {
      return acc;
    }

    companyIds.forEach((companyId) => {
      acc[companyId] = (acc[companyId] ?? 0) + 1;
    });
    return acc;
  }, {});
});

const applicationCountByCompanyId = computed(() => {
  return applicationsStore.activeItems.reduce<Record<number, number>>((acc, item) => {
    if (item.companyId == null) {
      return acc;
    }

    acc[item.companyId] = (acc[item.companyId] ?? 0) + 1;
    return acc;
  }, {});
});

const addressDraft = computed({
  get: () => ({
    street: store.draft.street,
    city: store.draft.city,
    state: store.draft.state,
    zip: store.draft.zip,
    phone: store.draft.phone,
    companyLinkedinUrl: store.draft.companyLinkedinUrl,
  }),
  set: (value) => {
    store.draft.street = value.street;
    store.draft.city = value.city;
    store.draft.state = value.state;
    store.draft.zip = value.zip;
    store.draft.phone = value.phone;
    store.draft.companyLinkedinUrl = value.companyLinkedinUrl;
  },
});

function filterIndustryOptions(val: string, update: (fn: () => void) => void, abort: () => void) {
  if (!val) {
    update(() => {
      filteredIndustryOptions.value = [...industryOptions];
    });
    return;
  }

  const needle = val.trim().toLowerCase();
  if (!needle) {
    abort();
    return;
  }

  update(() => {
    filteredIndustryOptions.value = industryOptions.filter((option) =>
      option.toLowerCase().includes(needle),
    );
  });
}

function formatCompanyAddress(item: (typeof store.items)[number]) {
  const parts = [item.street, item.city, item.state, item.zip].filter((value) => value.trim());

  return parts.length ? parts.join(', ') : 'No company address set';
}

function formatAdditionalInformation(item: (typeof store.items)[number]) {
  const size = item.size || 'Not set';
  const fundingStage = item.fundingStage || 'Not set';
  const status = item.status || 'Not set';

  return [`Size: ${size}`, `Funding: ${fundingStage}`, `Status: ${status}`].join(' · ');
}

function formatImportantNames(item: (typeof store.items)[number]) {
  return item.importantNames
    .slice(0, 3)
    .map((person) => `${person.name}${person.category ? ` (${person.category})` : ''}`)
    .join(' · ');
}

type RecruiterTieHistoryEntry = {
  changedAt: string;
  recruiterName: string;
  reason: string;
};

function getRecentRecruiterTieHistory(companyId: number) {
  const ties: RecruiterTieHistoryEntry[] = [];

  recruitersStore.items.forEach((recruiter) => {
    const history = Array.isArray(recruiter.linkHistory) ? recruiter.linkHistory : [];
    history.forEach((entry) => {
      if (entry.companyId !== companyId) {
        return;
      }

      ties.push({
        changedAt: entry.changedAt,
        recruiterName: recruiter.fullName,
        reason: entry.reason,
      });
    });
  });

  return ties.sort((a, b) => b.changedAt.localeCompare(a.changedAt)).slice(0, 3);
}

type PositionTieHistoryEntry = {
  changedAt: string;
  positionTitle: string;
  recruiterId: number | null;
  reason: string;
};

function getRecentPositionTieHistory(companyId: number) {
  const ties: PositionTieHistoryEntry[] = [];

  positionsStore.items.forEach((position) => {
    const history = Array.isArray(position.linkHistory) ? position.linkHistory : [];
    history.forEach((entry) => {
      if (entry.companyId !== companyId) {
        return;
      }

      ties.push({
        changedAt: entry.changedAt,
        positionTitle: position.title,
        recruiterId: entry.recruiterId,
        reason: entry.reason,
      });
    });
  });

  return ties.sort((a, b) => b.changedAt.localeCompare(a.changedAt)).slice(0, 3);
}

function formatRecruiterTieHistoryEntry(entry: RecruiterTieHistoryEntry) {
  return `${entry.recruiterName} • ${formatLinkReason(entry.reason)} • ${formatHistoryDate(entry.changedAt)}`;
}

function formatPositionTieHistoryEntry(entry: PositionTieHistoryEntry) {
  const recruiterName =
    entry.recruiterId != null
      ? (recruitersStore.items.find((item) => item.id === entry.recruiterId)?.fullName ??
        `Recruiting firm #${entry.recruiterId}`)
      : 'No recruiting firm';

  return `${entry.positionTitle} • ${recruiterName} • ${formatLinkReason(entry.reason)} • ${formatHistoryDate(entry.changedAt)}`;
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

onMounted(async () => {
  store.init();
  positionsStore.init();
  recruitersStore.init();
  await applicationsStore.init();
});

async function submitCompany() {
  const currentEditingId = editingId.value;
  const existingIds = new Set(store.items.map((item) => item.id));
  const recruiterIdsToLink = getSelectedRecruiterIds();
  const nextName = store.draft.name.trim();
  const previousName =
    currentEditingId != null
      ? (store.items.find((item) => item.id === currentEditingId)?.name.trim() ?? '')
      : '';

  store.save();
  const savedCompanyId =
    currentEditingId ?? store.items.find((item) => !existingIds.has(item.id))?.id ?? null;

  if (savedCompanyId != null) {
    recruiterIdsToLink.forEach((recruiterId) => {
      recruitersStore.addCompanyReference(recruiterId, savedCompanyId, 'updated');
    });
  }

  recruiterRelationshipRows.value = [];

  if (currentEditingId != null && nextName && nextName !== previousName) {
    await applicationsStore.syncCompanyNameReferences(currentEditingId, nextName);
  }

  returnFromHandoff(savedCompanyId);
}

function startEditCompany(item: (typeof store.items)[number]) {
  store.startEdit(item);

  const linkedRecruiterIds = recruitersStore.activeItems
    .filter((recruiter) => {
      const companyIds = recruiter.companyIds?.length
        ? recruiter.companyIds
        : recruiter.companyId != null
          ? [recruiter.companyId]
          : [];
      return companyIds.includes(item.id);
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((recruiter) => recruiter.id);

  recruiterRelationshipRows.value = linkedRecruiterIds.map((recruiterId, index) => ({
    rowId: index + 1,
    recruiterId,
  }));
}

function cancelEditCompany() {
  store.resetDraft();
  recruiterRelationshipRows.value = [];
}

function openRecruiterCreateFromForm() {
  const companyId = editingId.value;
  if (companyId != null) {
    openRecruiterCreateForCompany(companyId);
    return;
  }

  void router.push({ path: '/recruiters' });
}

function addRecruiterRelationshipRow() {
  recruiterRelationshipRows.value.push(createRecruiterRelationshipRow());
}

function removeRecruiterRelationshipRow(rowId: number) {
  recruiterRelationshipRows.value = recruiterRelationshipRows.value.filter(
    (row) => row.rowId !== rowId,
  );
}

function createRecruiterRelationshipRow(recruiterId: number | null = null) {
  const nextRowId = recruiterRelationshipRows.value.length
    ? Math.max(...recruiterRelationshipRows.value.map((row) => row.rowId)) + 1
    : 1;

  return { rowId: nextRowId, recruiterId };
}

function getSelectedRecruiterIds() {
  return Array.from(
    new Set(
      recruiterRelationshipRows.value
        .map((row) => row.recruiterId)
        .filter((id): id is number => typeof id === 'number' && Number.isFinite(id)),
    ),
  );
}

function returnFromHandoff(companyId: number | null) {
  returnFromHandoffWithId(route, router, companyId);
}

async function tryRemoveCompany(companyId: number, companyName: string) {
  positionsStore.init();
  recruitersStore.init();
  await applicationsStore.init();

  const linkedPositions = positionsStore.items.filter(
    (item) => !item.archivedAt && item.companyId === companyId,
  ).length;
  const linkedRecruiters = recruitersStore.items.filter(
    (item) =>
      !item.archivedAt &&
      (item.companyIds?.length
        ? item.companyIds
        : item.companyId != null
          ? [item.companyId]
          : []
      ).includes(companyId),
  ).length;
  const linkedApplications = applicationsStore.activeItems.filter(
    (item) => item.companyId === companyId,
  ).length;
  const linkedTotal = linkedPositions + linkedRecruiters + linkedApplications;

  if (linkedTotal === 0) {
    store.remove(companyId);
    return;
  }

  const parts: string[] = [];
  if (linkedPositions > 0) {
    parts.push(`${linkedPositions} position${linkedPositions === 1 ? '' : 's'}`);
  }
  if (linkedRecruiters > 0) {
    parts.push(`${linkedRecruiters} recruiter${linkedRecruiters === 1 ? '' : 's'}`);
  }
  if (linkedApplications > 0) {
    parts.push(`${linkedApplications} application${linkedApplications === 1 ? '' : 's'}`);
  }

  const resolution = await askCompanyDeleteResolution(companyName, parts.join(', '));
  if (!resolution) {
    return;
  }

  if (resolution === 'clear') {
    positionsStore.reassignCompanyReferences(companyId, null);
    recruitersStore.reassignCompanyReferences(companyId, null);
    await applicationsStore.reassignCompanyReferences(companyId, null);
    store.remove(companyId);
    $q.notify({
      type: 'positive',
      message: `Company archived and ${linkedTotal} linked record${linkedTotal === 1 ? '' : 's'} updated.`,
    });
    return;
  }

  const targetCompanyId = await askCompanyReassignTarget(companyId);
  if (targetCompanyId == null) {
    return;
  }

  positionsStore.reassignCompanyReferences(companyId, targetCompanyId);
  recruitersStore.reassignCompanyReferences(companyId, targetCompanyId);
  await applicationsStore.reassignCompanyReferences(
    companyId,
    targetCompanyId,
    getCompanyName(targetCompanyId),
  );
  store.remove(companyId);
  $q.notify({
    type: 'positive',
    message: `Company archived and links reassigned to ${getCompanyName(targetCompanyId)}.`,
  });
}

function getCompanyName(id: number) {
  return store.items.find((item) => item.id === id)?.name ?? 'selected company';
}

function askCompanyDeleteResolution(companyName: string, linkedSummary: string) {
  return new Promise<'reassign' | 'clear' | null>((resolve) => {
    $q.dialog({
      title: 'Linked records found',
      message: `${companyName} is linked to ${linkedSummary}. Choose how to continue.`,
      options: {
        type: 'radio',
        model: 'reassign',
        items: [
          { label: 'Reassign links, then archive company', value: 'reassign' },
          { label: 'Clear company links, then archive company', value: 'clear' },
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

function askCompanyReassignTarget(currentCompanyId: number) {
  const candidates = store.activeItems
    .filter((item) => item.id !== currentCompanyId)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (candidates.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No other company available for reassignment. Choose clear links instead.',
    });
    return Promise.resolve<number | null>(null);
  }

  return new Promise<number | null>((resolve) => {
    $q.dialog({
      title: 'Reassign linked records',
      message: 'Select a company to receive linked records.',
      options: {
        type: 'radio',
        model: String(candidates[0]?.id ?? ''),
        items: candidates.map((item) => ({
          label: item.name,
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

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'recently';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function openPositionsForCompany(name: string) {
  void router.push({ path: '/positions', query: { q: name } });
}

function openRecruitersForCompany(name: string) {
  void router.push({ path: '/recruiters', query: { q: name } });
}

function openRecruiterCreateForCompany(companyId: number) {
  void router.push({ path: '/recruiters', query: { companyId: String(companyId) } });
}

function openApplicationsForCompany(name: string) {
  void router.push({ path: '/applications', query: { q: name } });
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
