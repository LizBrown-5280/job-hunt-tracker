<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card class="q-pa-md">
          <div class="text-h6 q-mb-md">
            {{ editingId ? 'Edit recruiting firm' : 'Add recruiting firm' }}
          </div>
          <q-form @submit.prevent="submitRecruiter">
            <section>
              <q-input
                v-model="store.draft.fullName"
                label="Recruiting firm name"
                filled
                dense
                class="q-mb-sm"
              />
              <q-input v-model="store.draft.website" label="Website" filled dense class="q-mb-sm" />
              <q-select
                v-model="store.draft.industryFocus"
                :options="filteredIndustryOptions"
                label="Industry focus"
                filled
                dense
                clearable
                use-input
                input-debounce="0"
                multiple
                use-chips
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
              <q-input
                v-model="store.draft.companyLinkedinUrl"
                label="Company LinkedIn URL"
                filled
                dense
                class="q-mb-sm"
              />
            </section>

            <section class="form-section-spacing">
              <div class="row items-center q-mb-xs">
                <div class="text-subtitle2">Recruiting Firm Contacts</div>
                <q-space />
                <q-btn
                  color="primary"
                  outline
                  dense
                  icon="add"
                  label="Add Name"
                  @click="store.addContactRow()"
                />
              </div>
              <div class="column q-gutter-sm q-mb-sm">
                <div
                  v-for="contact in store.draft.contacts"
                  :key="contact.rowId"
                  class="q-pa-sm bg-grey-1 rounded-borders"
                >
                  <div class="row q-col-gutter-sm">
                    <div class="col-12 col-md-6">
                      <q-input v-model="contact.name" label="Name" filled dense class="q-mb-sm" />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input v-model="contact.title" label="Title" filled dense class="q-mb-sm" />
                    </div>
                  </div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="contact.phone"
                        label="Phone number"
                        filled
                        dense
                        class="q-mb-sm"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input v-model="contact.email" label="Email" filled dense class="q-mb-sm" />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="contact.linkedinUrl"
                        label="LinkedIn URL"
                        filled
                        dense
                        class="q-mb-sm"
                      />
                    </div>
                  </div>
                  <div class="row justify-end">
                    <q-btn
                      flat
                      dense
                      color="negative"
                      label="Delete row"
                      @click="store.removeContactRow(contact.rowId)"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section class="form-section-spacing">
              <div class="text-subtitle2 q-mb-xs">Notes</div>
              <q-input
                v-model="store.draft.notes"
                type="textarea"
                autogrow
                filled
                placeholder="Add notes about the recruiting firm"
                maxlength="500"
                counter
                class="q-mb-sm"
              />
            </section>

            <section class="form-section-spacing">
              <div class="text-subtitle2 q-mb-xs">Relationship</div>
              <q-select
                v-model="store.draft.relationship"
                :options="relationshipOptions"
                label="Relationship"
                filled
                dense
                class="q-mb-sm"
              />
              <q-select
                v-model="store.draft.companyId"
                :options="companyOptions"
                option-label="label"
                option-value="value"
                label="Hiring for company (optional)"
                filled
                dense
                emit-value
                map-options
                clearable
                class="q-mb-sm"
              />
              <q-banner v-if="!hasCompanies" dense rounded class="q-mb-sm warning-banner">
                No companies yet. Create one to link this recruiting firm to a hiring company.
                <template #action>
                  <q-btn flat color="primary" label="Create company" @click="openCompaniesPage" />
                </template>
              </q-banner>
            </section>

            <div class="row justify-end q-gutter-sm" style="margin-top: 20px">
              <q-btn
                color="primary"
                type="submit"
                :label="editingId ? 'Save changes' : 'Save recruiting firm'"
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
            <div class="text-h6">Recruiting Firms</div>
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
                v-model="store.filterRelationship"
                :options="filterOptions"
                label="Relationship"
                dense
                outlined
                style="min-width: 170px"
              />
            </div>
          </div>

          <q-input
            v-model="store.searchQuery"
            label="Search recruiting firms"
            filled
            dense
            clearable
            class="q-mb-md"
          />

          <div v-if="filteredItems.length === 0" class="text-grey-7">
            No recruiting firms match this view.
          </div>

          <div v-else class="column q-gutter-sm">
            <q-card v-for="item in filteredItems" :key="item.id" bordered>
              <q-card-section class="q-py-sm q-px-md">
                <div class="row items-start justify-between">
                  <div>
                    <div class="text-subtitle1">{{ item.fullName }}</div>
                    <div v-if="item.companyId != null" class="text-caption text-grey-7">
                      Hiring for: {{ companyNameById[item.companyId] ?? 'Unknown company' }}
                    </div>
                    <div v-if="formatPrimaryContact(item)" class="text-caption text-grey-7">
                      Main contact: {{ formatPrimaryContact(item) }}
                    </div>
                    <div v-if="displayPhone(item)" class="text-caption text-grey-7">
                      {{ displayPhone(item) }}
                    </div>
                  </div>
                  <q-chip :color="relationshipColor(item.relationship)" text-color="white">
                    {{ item.relationship }}
                  </q-chip>
                </div>

                <div v-if="item.notes" class="text-caption text-grey-7 q-mt-sm notes-block">
                  {{ item.notes }}
                </div>

                <div class="text-caption text-grey-7 q-mt-sm">
                  Current positions tied: {{ getCurrentPositionCount(item.id) }}
                </div>

                <div v-if="getRecentCompanyLinkHistory(item).length" class="q-mt-xs">
                  <div class="text-caption text-grey-7">Company link history</div>
                  <div
                    v-for="entry in getRecentCompanyLinkHistory(item)"
                    :key="`${entry.changedAt}-${entry.companyId ?? 'none'}-${entry.reason}`"
                    class="text-caption text-grey-7"
                  >
                    {{ formatCompanyLinkHistoryEntry(entry) }}
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
                    @click="store.remove(item.id)"
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
import { useRoute, useRouter } from 'vue-router';
import { useCompaniesStore } from '@/stores/companies';
import { usePositionsStore } from '@/stores/positions';
import { useRecruitersStore } from '@/stores/recruiters';
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
  RecruiterLinkHistoryEntry,
  RecruiterRelationship,
} from '@/types/networking';

const store = useRecruitersStore();
const companiesStore = useCompaniesStore();
const positionsStore = usePositionsStore();
const route = useRoute();
const router = useRouter();
const { filteredItems, editingId } = storeToRefs(store);
const relationshipOptions: RecruiterRelationship[] = ['New', 'Active', 'Dormant'];
const filterOptions: Array<RecruiterRelationship | 'All'> = ['All', ...relationshipOptions];
const archiveViewOptions: Array<'Active' | 'Archived' | 'All'> = ['Active', 'Archived', 'All'];
const RECRUITERS_DRAFT_KEY = 'job-hunt-tracker-handoff-recruiters-draft-v1';
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

onMounted(() => {
  store.init();
  companiesStore.init();
  positionsStore.init();

  restoreHandoffState();

  const prefillQuery = getDeepLinkQuery();
  if (prefillQuery) {
    store.searchQuery = prefillQuery;
    clearDeepLinkQuery();
  }
});

async function submitRecruiter() {
  const currentEditingId = editingId.value;
  const existingIds = new Set(store.items.map((item) => item.id));
  await store.save();

  const savedRecruitingFirmId =
    currentEditingId ?? store.items.find((item) => !existingIds.has(item.id))?.id ?? null;
  returnFromHandoff(savedRecruitingFirmId);
}

function openCompaniesPage() {
  persistDraftForHandoff();
  navigateToCreateWithHandoff(router, route.path, '/companies', RECRUITERS_DRAFT_KEY, 'companyId');
}

function persistDraftForHandoff() {
  persistHandoffDraft(RECRUITERS_DRAFT_KEY, store.draft);
}

function restoreHandoffState() {
  store.draft = restoreHandoffDraft(
    route,
    RECRUITERS_DRAFT_KEY,
    store.draft,
    (parsed, fallback) => ({
      ...fallback,
      ...parsed,
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts : fallback.contacts,
    }),
  );

  const handoffResult = getHandoffResult(route);
  if (handoffResult?.field === 'companyId') {
    store.draft.companyId = handoffResult.id;
  }

  clearHandoffQuery(route, router);
}

function returnFromHandoff(recruitingFirmId: number | null) {
  returnFromHandoffWithId(route, router, recruitingFirmId);
}

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

function getPrimaryContact(item: (typeof store.items)[number]) {
  const contacts = Array.isArray(item.contacts) ? item.contacts : [];
  return contacts[0] ?? null;
}

function formatPrimaryContact(item: (typeof store.items)[number]) {
  const contact = getPrimaryContact(item);
  if (!contact) {
    return '';
  }

  return contact.title ? `${contact.name} (${contact.title})` : contact.name;
}

function displayPhone(item: (typeof store.items)[number]) {
  return item.phone || getPrimaryContact(item)?.phone || '';
}

function getCurrentPositionCount(recruiterId: number) {
  return positionsStore.activeItems.filter((item) => item.recruiterId === recruiterId).length;
}

function getRecentCompanyLinkHistory(item: (typeof store.items)[number]) {
  const history = Array.isArray(item.linkHistory) ? item.linkHistory : [];
  return history.slice(-3).reverse();
}

function formatCompanyLinkHistoryEntry(entry: RecruiterLinkHistoryEntry) {
  const companyLabel =
    entry.companyId != null
      ? (companyNameById.value[entry.companyId] ?? `Company #${entry.companyId}`)
      : 'No company';

  return `${formatLinkReason(entry.reason)} • ${companyLabel} • ${formatHistoryDate(entry.changedAt)}`;
}

type PositionTieHistoryEntry = {
  changedAt: string;
  positionTitle: string;
  companyId: number | null;
  reason: string;
};

function getRecentPositionTieHistory(recruiterId: number) {
  const ties: PositionTieHistoryEntry[] = [];

  positionsStore.items.forEach((position) => {
    const history = Array.isArray(position.linkHistory) ? position.linkHistory : [];
    history.forEach((entry: PositionLinkHistoryEntry) => {
      if (entry.recruiterId !== recruiterId) {
        return;
      }

      ties.push({
        changedAt: entry.changedAt,
        positionTitle: position.title,
        companyId: entry.companyId,
        reason: entry.reason,
      });
    });
  });

  return ties.sort((a, b) => b.changedAt.localeCompare(a.changedAt)).slice(0, 3);
}

function formatPositionTieHistoryEntry(entry: PositionTieHistoryEntry) {
  const companyLabel =
    entry.companyId != null
      ? (companyNameById.value[entry.companyId] ?? `Company #${entry.companyId}`)
      : 'No company';

  return `${entry.positionTitle} • ${companyLabel} • ${formatLinkReason(entry.reason)} • ${formatHistoryDate(entry.changedAt)}`;
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

.warning-banner {
  border: 1px solid #fcd34d;
  background: #fffbeb;
}
</style>
