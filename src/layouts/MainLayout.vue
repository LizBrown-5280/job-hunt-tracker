<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>Job Hunt Tracker</q-toolbar-title>
        <q-btn flat dense round icon="settings" aria-label="Settings" @click="openSettings" />
        <q-btn
          v-if="showDevToolsButton"
          flat
          dense
          color="white"
          label="Dev tools"
          @click="openDevTools"
        />
        <q-chip color="white" text-color="primary">Local-first</q-chip>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list padding>
        <q-item clickable to="/" exact class="nav-item">
          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>
        <q-item clickable to="/applications" class="nav-item">
          <q-item-section avatar><q-icon name="work" /></q-item-section>
          <q-item-section>Applications</q-item-section>
        </q-item>
        <q-item clickable to="/insights" class="nav-item">
          <q-item-section avatar><q-icon name="insights" /></q-item-section>
          <q-item-section>Insights</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog v-model="showSettings">
      <q-card style="min-width: 320px">
        <q-card-section>
          <div class="text-h6">Profile & settings</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="profileNameInput" label="Your name" filled dense />
          <q-separator class="q-my-md" />
          <div class="text-body2 q-mb-sm">Backup or restore your local tracker data.</div>
          <div class="row q-gutter-sm q-mb-sm">
            <q-btn color="primary" label="Export backup" icon="download" @click="exportBackup" />
            <q-btn
              color="secondary"
              outline
              label="Import backup"
              icon="upload"
              @click="promptImportBackup"
            />
          </div>
          <div class="text-caption text-grey-7 q-mb-xs">
            Last export: {{ formatBackupTimestamp(store.backupMeta.lastExportAt) }}
          </div>
          <div class="text-caption text-grey-7 q-mb-sm">
            Last import: {{ formatBackupTimestamp(store.backupMeta.lastImportAt) }}
          </div>
          <q-banner
            v-if="backupStatus"
            dense
            rounded
            class="q-mb-sm"
            :class="backupStatus.type === 'positive' ? 'status-positive' : 'status-negative'"
          >
            {{ backupStatus.message }}
          </q-banner>
          <input
            ref="backupInput"
            type="file"
            accept=".json,application/json"
            class="hidden-input"
            @change="onBackupSelected"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showSettings = false" />
          <q-btn color="primary" label="Save" @click="saveProfile" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDevTools">
      <q-card style="min-width: 320px">
        <q-card-section>
          <div class="text-h6">Developer tools</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body2 q-mb-sm">Run maintenance and reliability checks.</div>
          <div class="row q-gutter-sm q-mb-sm">
            <q-btn color="primary" label="Reset demo data" @click="resetDemoData" />
            <q-btn
              color="secondary"
              outline
              label="Reset demo (keep profile)"
              @click="resetDemoDataKeepProfile"
            />
          </div>
          <q-btn
            color="accent"
            icon="fact_check"
            label="Run core flow health check"
            :loading="isRunningHealthCheck"
            @click="runHealthCheck"
          />
          <q-banner
            v-if="devStatus"
            dense
            rounded
            class="q-mt-sm"
            :class="devStatus.type === 'positive' ? 'status-positive' : 'status-negative'"
          >
            {{ devStatus.message }}
          </q-banner>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useApplicationsStore } from '@/stores/applications';

const route = useRoute();
const $q = useQuasar();
const store = useApplicationsStore();
const leftDrawerOpen = ref(false);
const showDevTools = ref(false);
const showSettings = ref(false);
const profileNameInput = ref('');
const backupInput = ref<HTMLInputElement | null>(null);
const backupStatus = ref<{ type: 'positive' | 'negative'; message: string } | null>(null);
const devStatus = ref<{ type: 'positive' | 'negative'; message: string } | null>(null);
const isRunningHealthCheck = ref(false);
const showDevToolsButton = computed(() => route.query.preview === 'dev');

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function openSettings() {
  profileNameInput.value = store.profile.name;
  backupStatus.value = null;
  showSettings.value = true;
}

function openDevTools() {
  devStatus.value = null;
  showDevTools.value = true;
}

function saveProfile() {
  store.updateProfile(profileNameInput.value);
  showSettings.value = false;
}

async function resetDemoData() {
  await store.resetDemoData();
  devStatus.value = {
    type: 'positive',
    message: 'Demo data reset complete.',
  };
}

async function resetDemoDataKeepProfile() {
  await store.resetDemoDataKeepProfile();
  devStatus.value = {
    type: 'positive',
    message: 'Demo data reset complete and profile preserved.',
  };
}

async function runHealthCheck() {
  isRunningHealthCheck.value = true;
  devStatus.value = null;

  const result = await store.runCoreFlowHealthCheck();
  isRunningHealthCheck.value = false;

  if (result.ok) {
    devStatus.value = {
      type: 'positive',
      message: `Health check passed (${result.steps.length} steps).`,
    };
    notifyUser('positive', 'Core flow health check passed.');
    return;
  }

  devStatus.value = {
    type: 'negative',
    message: `Health check failed: ${result.error ?? 'Unknown error.'}`,
  };
  notifyUser('negative', 'Core flow health check failed.');
}

async function exportBackup() {
  const content = await store.exportBackup();
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `job-hunt-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);

  notifyUser('positive', 'Backup exported.');
  backupStatus.value = {
    type: 'positive',
    message: `Backup exported at ${formatBackupTimestamp(store.backupMeta.lastExportAt)}.`,
  };
}

function promptImportBackup() {
  backupInput.value?.click();
}

async function onBackupSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  try {
    const content = await file.text();
    await store.importBackup(content);
    notifyUser('positive', 'Backup imported successfully.');
    backupStatus.value = {
      type: 'positive',
      message: `Backup imported at ${formatBackupTimestamp(store.backupMeta.lastImportAt)}.`,
    };
    showSettings.value = false;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to import backup.';
    notifyUser('negative', message);
    backupStatus.value = {
      type: 'negative',
      message: `Import failed: ${message}`,
    };
  } finally {
    input.value = '';
  }
}

function notifyUser(type: 'positive' | 'negative', message: string) {
  $q.notify({ type, message });
}

function formatBackupTimestamp(value: string | null) {
  if (!value) {
    return 'Never';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
</script>

<style scoped>
.nav-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.nav-item:hover {
  background-color: #f5f7fa;
}

.hidden-input {
  display: none;
}

.status-positive {
  background: #ecfdf3;
  color: #166534;
  border: 1px solid #86efac;
}

.status-negative {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}
</style>
