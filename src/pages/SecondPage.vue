<template>
  <q-page class="q-pa-md insights-page">
    <div class="row items-center justify-between q-mb-lg insights-header">
      <div>
        <div class="text-h5 insights-title">Insights</div>
        <div class="text-subtitle2 text-grey-7">A clear pulse check on your search pipeline.</div>
      </div>
      <q-btn flat color="primary" icon="refresh" label="Refresh" @click="refreshData" />
    </div>

    <div class="text-overline section-kicker q-mb-xs">Pipeline metrics</div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered class="q-pa-md insight-card kpi-card">
          <div class="text-caption text-grey-7">Active pipeline</div>
          <div class="text-h5">{{ activeCount }}</div>
          <div class="text-caption text-grey-6">Not rejected or closed</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered class="q-pa-md insight-card kpi-card">
          <div class="text-caption text-grey-7">Offers pending</div>
          <div class="text-h5">{{ offerCount }}</div>
          <div class="text-caption text-grey-6">Review decisions in progress</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered class="q-pa-md insight-card kpi-card">
          <div class="text-caption text-grey-7">Follow-ups due</div>
          <div class="text-h5">{{ followUpDueCount }}</div>
          <div class="text-caption text-grey-6">Due today or overdue</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered class="q-pa-md insight-card kpi-card">
          <div class="text-caption text-grey-7">Avg favorite score</div>
          <div class="text-h5">{{ averageFavoriteScore }}</div>
          <div class="text-caption text-grey-6">Across all applications</div>
        </q-card>
      </div>
    </div>

    <q-card bordered class="q-pa-md q-mb-md top-picks-card">
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-h6">Top picks</div>
        <div class="text-caption text-grey-7">Your highest-rated opportunities</div>
      </div>
      <div v-if="topPicks.length === 0" class="text-grey-7">
        No top picks yet. Add heart ratings to surface priority roles.
      </div>
      <div v-else class="row q-col-gutter-sm">
        <div
          v-for="item in topPicks"
          :key="item.id ?? item.createdAt"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card bordered flat class="q-pa-sm top-pick-item interactive-pick">
            <div class="row items-start justify-between q-mb-xs">
              <div>
                <div class="text-subtitle2">{{ item.role }}</div>
                <div class="text-caption text-grey-7">{{ item.company }}</div>
              </div>
              <q-chip dense color="primary" text-color="white">
                {{ item.status }}
              </q-chip>
            </div>
            <div class="row items-center q-gutter-xs q-mb-sm">
              <q-icon
                v-for="heart in 5"
                :key="heart"
                :name="heart <= (item.favoriteRating ?? 0) ? 'favorite' : 'favorite_border'"
                :color="heart <= (item.favoriteRating ?? 0) ? 'negative' : 'grey-5'"
                size="16px"
              />
              <q-badge
                v-if="getFavoriteTrend(item)"
                dense
                :color="getFavoriteTrend(item)?.color"
                text-color="white"
                class="q-ml-xs"
              >
                <q-icon :name="getFavoriteTrend(item)?.icon" size="12px" class="q-mr-xs" />
                {{ getFavoriteTrend(item)?.label }}
              </q-badge>
            </div>
            <q-btn
              flat
              dense
              color="primary"
              class="open-pick-btn"
              label="Open"
              icon="open_in_new"
              @click="openApplication(item)"
            />
          </q-card>
        </div>
      </div>
    </q-card>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-7">
        <q-card bordered class="q-pa-md section-card">
          <div class="text-h6 q-mb-md">Favorite rating distribution</div>
          <div class="text-caption text-grey-7 q-mb-md">
            {{ ratedCount }} rated of {{ items.length }} total applications
          </div>

          <div
            v-for="row in ratingRows"
            :key="row.rating"
            class="row items-center q-mb-sm distribution-row"
          >
            <div class="col-3 col-sm-2 text-weight-medium">{{ row.rating }} hearts</div>
            <div class="col">
              <q-linear-progress
                rounded
                size="14px"
                color="deep-orange"
                track-color="grey-3"
                :value="row.ratio"
              />
            </div>
            <div class="col-auto text-right text-weight-medium stat-label">{{ row.percent }}%</div>
          </div>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card bordered class="q-pa-md q-mb-md section-card">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-h6">Needs decision this week</div>
            <q-badge color="deep-orange" text-color="white">{{ decisionsThisWeek.length }}</q-badge>
          </div>
          <div class="text-caption text-grey-7 q-mb-sm">
            Offers and upcoming follow-ups that need action this week.
          </div>
          <div v-if="decisionsThisWeek.length === 0" class="text-grey-7">
            No urgent decisions right now.
          </div>
          <q-list v-else separator class="decision-list">
            <q-item
              v-for="item in decisionsThisWeek"
              :key="item.id ?? item.createdAt"
              class="decision-row"
            >
              <q-item-section>
                <q-item-label>{{ item.role }} at {{ item.company }}</q-item-label>
                <q-item-label caption>{{ getDecisionReason(item) }}</q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-badge
                  class="decision-badge"
                  :color="
                    item.status === 'Offer'
                      ? 'positive'
                      : getFollowUpBadgeColor(item.followUpDate ?? '')
                  "
                  text-color="white"
                >
                  {{ item.status === 'Offer' ? 'Offer' : formatDate(item.followUpDate ?? '') }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <q-card bordered class="q-pa-md section-card">
          <div class="text-h6 q-mb-md">Upcoming follow-ups</div>
          <div v-if="upcomingFollowUps.length === 0" class="text-grey-7">
            No upcoming follow-ups. Add dates to keep outreach on track.
          </div>
          <q-list v-else separator>
            <q-item
              v-for="item in upcomingFollowUps"
              :key="item.id ?? item.createdAt"
              class="decision-row"
            >
              <q-item-section>
                <q-item-label>{{ item.role }} at {{ item.company }}</q-item-label>
                <q-item-label caption>{{ item.nextAction || 'No next action set' }}</q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-badge
                  class="decision-badge"
                  :color="getFollowUpBadgeColor(item.followUpDate ?? '')"
                  text-color="white"
                >
                  {{ formatDate(item.followUpDate ?? '') }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useApplicationsStore } from '@/stores/applications';
import type { ApplicationRecord } from '@/types/applications';

const store = useApplicationsStore();
const router = useRouter();
const { items } = storeToRefs(store);

const activeCount = computed(
  () =>
    items.value.filter((item) => item.status !== 'Rejected' && item.status !== 'Ghosted').length,
);

const offerCount = computed(() => items.value.filter((item) => item.status === 'Offer').length);

const followUpDueCount = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return items.value.filter((item) => {
    if (!item.followUpDate) {
      return false;
    }

    const followUpDate = new Date(item.followUpDate);
    if (Number.isNaN(followUpDate.getTime())) {
      return false;
    }

    followUpDate.setHours(0, 0, 0, 0);
    return followUpDate.getTime() <= today.getTime();
  }).length;
});

const ratedCount = computed(
  () => items.value.filter((item) => (item.favoriteRating ?? 0) > 0).length,
);

const averageFavoriteScore = computed(() => {
  if (items.value.length === 0) {
    return '0.0';
  }

  const total = items.value.reduce((sum, item) => sum + (item.favoriteRating ?? 0), 0);
  return (total / items.value.length).toFixed(1);
});

const topPicks = computed(() => {
  return items.value
    .filter((item) => item.status !== 'Rejected' && item.status !== 'Ghosted')
    .slice()
    .sort((a, b) => {
      const ratingDiff = (b.favoriteRating ?? 0) - (a.favoriteRating ?? 0);
      if (ratingDiff !== 0) {
        return ratingDiff;
      }

      const left = a.updatedAt ?? a.createdAt ?? '';
      const right = b.updatedAt ?? b.createdAt ?? '';
      return right.localeCompare(left);
    })
    .slice(0, 3);
});

const ratingRows = computed(() => {
  const total = items.value.length || 1;

  return [5, 4, 3, 2, 1, 0].map((rating) => {
    const count = items.value.filter((item) => (item.favoriteRating ?? 0) === rating).length;
    const ratio = count / total;
    const percent = Math.round(ratio * 100);

    return {
      rating,
      count,
      ratio,
      percent,
    };
  });
});

const upcomingFollowUps = computed(() => {
  return items.value
    .filter((item) => Boolean(item.followUpDate))
    .slice()
    .sort((a, b) => (a.followUpDate ?? '').localeCompare(b.followUpDate ?? ''))
    .slice(0, 6);
});

const decisionsThisWeek = computed(() => {
  return items.value
    .filter((item) => {
      if (item.status === 'Rejected' || item.status === 'Ghosted') {
        return false;
      }

      if (item.status === 'Offer') {
        return true;
      }

      return isFollowUpWithinDays(item.followUpDate, 7);
    })
    .slice()
    .sort((a, b) => {
      if (a.status === 'Offer' && b.status !== 'Offer') {
        return -1;
      }

      if (a.status !== 'Offer' && b.status === 'Offer') {
        return 1;
      }

      const left = a.followUpDate ?? '';
      const right = b.followUpDate ?? '';
      return left.localeCompare(right);
    })
    .slice(0, 6);
});

onMounted(() => {
  void store.init();
});

function refreshData() {
  void store.init();
}

function openApplication(item: ApplicationRecord) {
  store.startEdit(item);
  void router.push('/applications');
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'No date';
  }

  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getFollowUpBadgeColor(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'grey';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() < today.getTime()) {
    return 'negative';
  }

  if (date.getTime() === today.getTime()) {
    return 'warning';
  }

  return 'primary';
}

function isFollowUpWithinDays(value: string | undefined, windowDays: number) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffMs = date.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return diffDays <= windowDays;
}

function getDecisionReason(item: { status: string; followUpDate?: string; nextAction: string }) {
  if (item.status === 'Offer') {
    return item.nextAction || 'Review details and make a decision on this offer.';
  }

  return item.nextAction || 'This follow-up needs a decision this week.';
}

function getFavoriteTrend(item: ApplicationRecord) {
  const current = item.favoriteRating ?? 0;
  const previous = item.previousFavoriteRating;

  if (previous == null || previous === current) {
    return null;
  }

  if (!item.favoriteUpdatedAt) {
    return null;
  }

  const updatedAt = new Date(item.favoriteUpdatedAt);
  if (Number.isNaN(updatedAt.getTime())) {
    return null;
  }

  const now = new Date();
  const diffDays = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays > 7) {
    return null;
  }

  if (current > previous) {
    return {
      icon: 'north_east',
      label: `+${current - previous}`,
      color: 'positive',
    };
  }

  return {
    icon: 'south_east',
    label: `-${previous - current}`,
    color: 'negative',
  };
}
</script>

<style scoped>
.insight-card {
  min-height: 132px;
}

.stat-label {
  min-width: 46px;
}

.insights-page {
  max-width: 1260px;
  margin: 0 auto;
}

.insights-title {
  letter-spacing: -0.02em;
}

.section-kicker {
  color: #5c6bc0;
  letter-spacing: 0.08em;
}

.kpi-card {
  border-color: #dde6ff;
  background: #ffffff;
}

.section-card {
  border-color: #dfe7f8;
}

.distribution-row {
  min-height: 28px;
}

.top-picks-card {
  border-color: #dbe6ff;
  background: linear-gradient(180deg, #fcfdff 0%, #f7faff 100%);
}

.top-pick-item {
  border-color: #d9e2ff;
  background: #ffffff;
}

.interactive-pick {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.interactive-pick:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(26, 47, 92, 0.12);
  border-color: #9db5ff;
}

.open-pick-btn {
  padding-left: 0;
}

.decision-list {
  margin-top: 2px;
}

.decision-row {
  border-radius: 8px;
}

.decision-badge {
  min-width: 78px;
  justify-content: center;
}

@media (max-width: 599px) {
  .insights-header {
    align-items: flex-start;
    gap: 8px;
  }

  .insights-header .q-btn {
    align-self: flex-start;
  }

  .decision-badge {
    min-width: 72px;
    font-size: 11px;
  }
}
</style>
