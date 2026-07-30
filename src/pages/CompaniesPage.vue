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

            <section class="form-section-spacing">
              <div class="text-subtitle2 q-mb-xs">Company Headquarter Address and Phone</div>
              <q-input
                v-model="store.draft.street"
                label="Street address"
                filled
                dense
                class="q-mb-sm"
              />
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-6">
                  <q-input v-model="store.draft.city" label="City" filled dense class="q-mb-sm" />
                </div>
                <div class="col-12 col-md-3">
                  <q-input v-model="store.draft.state" label="State" filled dense class="q-mb-sm" />
                </div>
                <div class="col-12 col-md-3">
                  <q-input v-model="store.draft.zip" label="ZIP" filled dense class="q-mb-sm" />
                </div>
              </div>
              <q-input
                v-model="store.draft.phone"
                label="Phone number"
                filled
                dense
                class="q-mb-sm"
              />
            </section>

            <section class="form-section-spacing">
              <div class="text-subtitle2 q-mb-xs">Notes</div>
              <q-input
                v-model="store.draft.notes"
                type="textarea"
                autogrow
                filled
                placeholder="Add notes about the company"
                maxlength="500"
                counter
                class="q-mb-sm"
              />
            </section>

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
                <q-card v-for="nameRow in store.draft.importantNames" :key="nameRow.rowId" bordered>
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
                @click="store.resetDraft()"
              />
            </div>
          </q-form>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Companies</div>
            <q-btn
              v-if="store.searchQuery"
              flat
              dense
              color="grey-7"
              label="Clear search"
              @click="store.searchQuery = ''"
            />
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
                    color="indigo"
                    label="View applications"
                    @click="openApplicationsForCompany(item.name)"
                  />
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
                    @click="tryRemoveCompany(item.id, item.name)"
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
import { useRouter } from 'vue-router';
import { useCompaniesStore } from '@/stores/companies';
import { usePositionsStore } from '@/stores/positions';
import { useRecruitersStore } from '@/stores/recruiters';
import { useApplicationsStore } from '@/stores/applications';

const store = useCompaniesStore();
const positionsStore = usePositionsStore();
const recruitersStore = useRecruitersStore();
const applicationsStore = useApplicationsStore();
const $q = useQuasar();
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

const positionCountByCompanyId = computed(() => {
  return positionsStore.items.reduce<Record<number, number>>((acc, item) => {
    if (item.companyId == null) {
      return acc;
    }

    acc[item.companyId] = (acc[item.companyId] ?? 0) + 1;
    return acc;
  }, {});
});

const recruiterCountByCompanyId = computed(() => {
  return recruitersStore.items.reduce<Record<number, number>>((acc, item) => {
    if (item.companyId == null) {
      return acc;
    }

    acc[item.companyId] = (acc[item.companyId] ?? 0) + 1;
    return acc;
  }, {});
});

const applicationCountByCompanyId = computed(() => {
  return applicationsStore.items.reduce<Record<number, number>>((acc, item) => {
    if (item.companyId == null) {
      return acc;
    }

    acc[item.companyId] = (acc[item.companyId] ?? 0) + 1;
    return acc;
  }, {});
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

onMounted(async () => {
  store.init();
  positionsStore.init();
  recruitersStore.init();
  await applicationsStore.init();
});

async function submitCompany() {
  const currentEditingId = editingId.value;
  const nextName = store.draft.name.trim();
  const previousName =
    currentEditingId != null
      ? (store.items.find((item) => item.id === currentEditingId)?.name.trim() ?? '')
      : '';

  store.save();

  if (currentEditingId != null && nextName && nextName !== previousName) {
    await applicationsStore.syncCompanyNameReferences(currentEditingId, nextName);
  }
}

async function tryRemoveCompany(companyId: number, companyName: string) {
  positionsStore.init();
  recruitersStore.init();
  await applicationsStore.init();

  const linkedPositions = positionsStore.items.filter(
    (item) => item.companyId === companyId,
  ).length;
  const linkedRecruiters = recruitersStore.items.filter(
    (item) => item.companyId === companyId,
  ).length;
  const linkedApplications = applicationsStore.items.filter(
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
      message: `Company deleted and ${linkedTotal} linked record${linkedTotal === 1 ? '' : 's'} updated.`,
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
    message: `Company deleted and links reassigned to ${getCompanyName(targetCompanyId)}.`,
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
          { label: 'Reassign links, then delete company', value: 'reassign' },
          { label: 'Clear company links, then delete company', value: 'clear' },
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
  const candidates = store.items
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
      ok: { label: 'Reassign and delete', color: 'primary' },
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
