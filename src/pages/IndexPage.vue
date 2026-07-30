<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-7">
        <q-card class="q-pa-md">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-h5">{{ welcomeHeading }}</div>
            <div class="text-subtitle2 text-grey-7">{{ todayLabel }}</div>
          </div>
          <div class="text-subtitle2 text-grey-7">
            Move applications across your pipeline to keep progress current.
          </div>
          <q-btn
            class="q-mt-md"
            color="primary"
            @click="goToApplications"
            label="Manage applications"
          />
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="q-pa-md">
          <div class="text-h6 q-mb-sm">Applications in flight</div>
          <div class="text-body1">{{ activeApplicationsCount }} active applications</div>
          <div class="text-caption text-grey-7 q-mt-xs">
            {{ followUpDueSoonCount }} follow-up{{ followUpDueSoonCount === 1 ? '' : 's' }} due soon
          </div>
          <div class="text-caption text-grey-7">
            {{ pendingOfferCount }} offer{{ pendingOfferCount === 1 ? '' : 's' }} to review
          </div>
          <q-separator class="q-my-sm" />
          <div class="text-caption text-grey-7">Today’s focus</div>
          <q-card
            v-if="focusApplication"
            flat
            bordered
            class="q-mt-sm q-pa-sm focus-card interactive-card"
            clickable
            @click="openApplication(focusApplication)"
          >
            <div class="text-subtitle2">
              {{ getDisplayRole(focusApplication) }} at {{ getDisplayCompany(focusApplication) }}
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">
              {{ focusApplication.nextAction || 'No next action yet' }}
            </div>
          </q-card>
          <div v-else class="text-caption text-grey-7 q-mt-sm">
            Add a next action to your first application to build momentum.
          </div>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-sm">
      <div v-for="column in columns" :key="column.status" class="col-12 col-sm-6 col-md-3">
        <q-card
          class="q-pa-xs board-column"
          :class="{
            'bg-grey-2': activeDropStatus === column.status,
            'board-column-active': activeDropStatus === column.status,
          }"
          :style="getColumnStyle(column.status)"
          :data-status="column.status"
        >
          <div class="row items-center justify-between q-mb-xs">
            <div class="text-subtitle1">{{ column.title }}</div>
            <q-badge rounded color="grey-4" text-color="grey-8" style="padding: 4px 10px">
              {{ groupedItems[column.status].length }}
            </q-badge>
          </div>
          <div
            class="column q-gutter-xs board-dropzone"
            @dragenter.prevent="onDragEnter(column.status)"
            @dragover.prevent="onDragOver(column.status)"
            @dragleave="onDragLeave(column.status)"
            @drop="onDrop($event, column.status)"
          >
            <q-card
              v-for="item in groupedItems[column.status]"
              :key="item.id ?? item.createdAt"
              class="q-pa-sm compact-card interactive-card"
              :class="{ 'card-hover-active': isCardHovered(item.id ?? item.createdAt) }"
              @mouseenter="setHoveredCard(item.id ?? item.createdAt)"
              @mouseleave="clearHoveredCard()"
              draggable="true"
              @click="openApplication(item)"
              @dragstart="onDragStart($event, item)"
              @dragend="clearDrag"
            >
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-subtitle2">{{ getDisplayRole(item) }}</div>
                <div class="row items-center">
                  <q-chip
                    v-if="item.status === 'Offer'"
                    size="sm"
                    color="positive"
                    text-color="white"
                    dense
                  >
                    Offer
                  </q-chip>
                  <q-chip
                    v-else-if="item.status === 'Ghosted'"
                    size="sm"
                    color="negative"
                    text-color="white"
                    dense
                  >
                    Closed
                  </q-chip>
                </div>
              </div>
              <div class="row items-start justify-between q-gutter-sm">
                <div class="col">
                  <div class="text-caption text-grey-7">{{ getDisplayCompany(item) }}</div>
                  <div class="text-caption q-mt-xs">
                    Next: {{ item.nextAction || 'No next action yet' }}
                  </div>
                  <div
                    v-if="item.followUpDate && getFollowUpStatus(item.followUpDate)"
                    class="q-mt-sm"
                  >
                    <q-chip
                      size="sm"
                      :color="getFollowUpStatus(item.followUpDate)?.color"
                      text-color="white"
                      dense
                    >
                      {{ getFollowUpStatus(item.followUpDate)?.label }}
                    </q-chip>
                  </div>
                </div>
                <div class="col-auto text-right">
                  <div class="text-caption text-grey-5">
                    <div class="text-weight-medium">Updated</div>
                    <div class="text-grey-8">
                      {{ formatTimestamp(item.updatedAt || item.createdAt) }}
                    </div>
                  </div>
                  <div v-if="item.followUpDate" class="q-mt-sm text-caption text-grey-5">
                    <div class="text-weight-medium">Follow-up</div>
                    <div class="text-grey-8">{{ formatShortDate(item.followUpDate) }}</div>
                  </div>
                </div>
              </div>
              <div class="row items-center justify-end q-mt-sm heart-rating-row">
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
                  @click.stop="toggleFavorite(item, heart)"
                />
              </div>
            </q-card>
            <div
              v-if="groupedItems[column.status].length === 0"
              class="text-caption text-grey-7 q-pa-sm board-empty-state"
            >
              No applications in this stage yet.
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useApplicationsStore } from '@/stores/applications';
import { useCompaniesStore } from '@/stores/companies';
import { usePositionsStore } from '@/stores/positions';
import type { ApplicationRecord, ApplicationStatus } from '@/types/applications';

const store = useApplicationsStore();
const companiesStore = useCompaniesStore();
const positionsStore = usePositionsStore();
const router = useRouter();
const { items, profile } = storeToRefs(store);
const draggedItem = ref<ApplicationRecord | null>(null);
const activeDropStatus = ref<ApplicationStatus | null>(null);
const hoveredCardId = ref<string | null>(null);
const todayLabel = new Intl.DateTimeFormat('en', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
}).format(new Date());
const welcomeHeading = computed(() => {
  const name = profile.value.name.trim();
  return name ? `Welcome back, ${name}` : 'Welcome back';
});

const columns = [
  { title: 'Wishlist', status: 'Wishlist' as const },
  { title: 'Applied', status: 'Applied' as const },
  { title: 'Interview', status: 'Interview' as const },
  { title: 'Offer / Closed', status: 'Offer' as const },
] satisfies ReadonlyArray<{ title: string; status: ApplicationStatus }>;
const companyNameById = computed(() =>
  companiesStore.items.reduce<Record<number, string>>((acc, company) => {
    acc[company.id] = company.name;
    return acc;
  }, {}),
);
const positionTitleById = computed(() =>
  positionsStore.items.reduce<Record<number, string>>((acc, position) => {
    acc[position.id] = position.title;
    return acc;
  }, {}),
);
const groupedItems = computed<Record<ApplicationStatus, ApplicationRecord[]>>(() => {
  const groups: Record<ApplicationStatus, ApplicationRecord[]> = {
    Wishlist: [],
    Applied: [],
    Interview: [],
    Offer: [],
    Rejected: [],
    Ghosted: [],
  };

  items.value.forEach((item) => {
    if (item.status === 'Rejected') {
      return;
    }

    const bucket = item.status === 'Ghosted' ? groups.Offer : groups[item.status];
    bucket.push(item);
  });

  return groups;
});

const activeApplicationsCount = computed(() => {
  return items.value.filter((item) => item.status !== 'Rejected' && item.status !== 'Ghosted')
    .length;
});

const followUpDueSoonCount = computed(() => {
  return items.value.filter((item) => {
    if (!item.followUpDate || item.status === 'Rejected' || item.status === 'Ghosted') {
      return false;
    }

    return getFollowUpStatus(item.followUpDate) !== null;
  }).length;
});

const pendingOfferCount = computed(() => {
  return items.value.filter((item) => item.status === 'Offer').length;
});

const focusApplication = computed(() => {
  const activeItems = items.value.filter(
    (item) => item.status !== 'Rejected' && item.status !== 'Ghosted',
  );

  return activeItems.sort((a, b) => {
    const left = a.updatedAt ?? a.createdAt ?? '';
    const right = b.updatedAt ?? b.createdAt ?? '';
    return right.localeCompare(left);
  })[0];
});

onMounted(() => {
  companiesStore.init();
  positionsStore.init();
  void store.init();
});

function onDragStart(event: DragEvent, item: ApplicationRecord) {
  draggedItem.value = item;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', getDisplayRole(item));
  }
}

function onDragEnter(status: ApplicationStatus) {
  activeDropStatus.value = status;
}

function onDragOver(status: ApplicationStatus) {
  activeDropStatus.value = status;
}

function onDragLeave(status: ApplicationStatus) {
  if (activeDropStatus.value === status) {
    activeDropStatus.value = null;
  }
}

function clearDrag() {
  draggedItem.value = null;
  activeDropStatus.value = null;
}

function setHoveredCard(id: string | number) {
  hoveredCardId.value = String(id);
}

function clearHoveredCard() {
  hoveredCardId.value = null;
}

function isCardHovered(id: string | number) {
  return hoveredCardId.value === String(id);
}

function toggleFavorite(item: ApplicationRecord, rating: number) {
  void store.toggleFavorite(item, rating);
}

function openApplication(item: ApplicationRecord) {
  store.startEdit(item);
  void router.push('/applications');
}

function goToApplications() {
  store.resetFilters();
  void router.push('/applications');
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

  return item.role;
}

function formatTimestamp(value: string) {
  return formatShortDate(value);
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'recently';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getFollowUpStatus(value: string) {
  if (!value) {
    return null;
  }

  const followUpDate = new Date(value);
  if (Number.isNaN(followUpDate.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  followUpDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((followUpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: 'Overdue', color: 'negative' };
  }

  if (diffDays <= 2) {
    return { label: 'Due soon', color: 'warning' };
  }

  return null;
}

function getColumnStyle(status: ApplicationStatus) {
  switch (status) {
    case 'Interview':
      return {
        border: '2px solid #1e88e5',
      };
    case 'Offer':
      return {
        border: '2px solid #43a047',
      };
    case 'Ghosted':
      return {
        border: '2px solid #c62828',
      };
    case 'Applied':
      return {
        border: '2px solid #f59e0b',
      };
    default:
      return {
        border: '2px solid #9e9e9e',
      };
  }
}

async function onDrop(event: DragEvent, status: ApplicationStatus) {
  event.preventDefault();

  if (!draggedItem.value) {
    return;
  }

  const itemId = draggedItem.value.id;
  if (itemId == null) {
    clearDrag();
    return;
  }

  if (draggedItem.value.status !== status) {
    await store.updateStatus(itemId, status);
  }

  const updatedItem = { ...draggedItem.value, status };
  openApplication(updatedItem);
  clearDrag();
}
</script>

<style scoped>
.interactive-card {
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.interactive-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
  border-color: #1e88e5;
}

.recent-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 999px;
  background: #eef6ff;
}

.heart-rating-row {
  gap: 2px;
}

.heart-rating-btn {
  min-width: 18px;
  min-height: 18px;
}
</style>
