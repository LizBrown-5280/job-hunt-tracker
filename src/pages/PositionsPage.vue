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
                    @click="tryRemovePosition(item.id, item.title)"
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
import { useApplicationsStore } from '@/stores/applications';
import type { PositionStatus } from '@/types/networking';

const store = usePositionsStore();
const companiesStore = useCompaniesStore();
const applicationsStore = useApplicationsStore();
const $q = useQuasar();
const route = useRoute();
const router = useRouter();
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

const applicationCountByPositionId = computed(() => {
  return applicationsStore.items.reduce<Record<number, number>>((acc, item) => {
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
  await applicationsStore.init();

  const prefillQuery = getDeepLinkQuery();
  if (prefillQuery) {
    store.searchQuery = prefillQuery;
    clearDeepLinkQuery();
  }
});

async function submitPosition() {
  const currentEditingId = editingId.value;
  const nextTitle = store.draft.title.trim();
  const previousTitle =
    currentEditingId != null
      ? (store.items.find((item) => item.id === currentEditingId)?.title.trim() ?? '')
      : '';

  store.save();

  if (currentEditingId != null && nextTitle && nextTitle !== previousTitle) {
    await applicationsStore.syncPositionTitleReferences(currentEditingId, nextTitle);
  }
}

async function tryRemovePosition(positionId: number, positionTitle: string) {
  await applicationsStore.init();

  const linkedApplications = applicationsStore.items.filter(
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
      message: `Position deleted and ${linkedApplications} linked application${linkedApplications === 1 ? '' : 's'} updated.`,
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
    message: `Position deleted and links reassigned to ${getPositionTitle(targetPositionId)}.`,
  });
}

function getPositionTitle(id: number) {
  return store.items.find((item) => item.id === id)?.title ?? 'selected position';
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
          { label: 'Reassign linked applications, then delete position', value: 'reassign' },
          { label: 'Clear position links, then delete position', value: 'clear' },
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
  const candidates = store.items
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
</style>
