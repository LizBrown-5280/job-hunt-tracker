<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center login-page">
        <q-card class="q-pa-md login-card">
          <div class="text-h6 q-mb-md text-center">Job Hunt Tracker</div>

          <div v-if="authStore.status === 'unauthorized'" class="q-mb-md">
            <q-banner dense rounded class="status-negative q-mb-sm">
              Signed in as {{ authStore.user?.email }}, but this account isn't approved yet.
            </q-banner>
            <q-btn flat color="primary" label="Sign out" @click="authStore.signOutUser()" />
          </div>

          <template v-else>
            <q-btn
              color="primary"
              icon="login"
              label="Sign in with Google"
              class="full-width q-mb-md"
              :loading="submitting"
              @click="onGoogleSignIn"
            />

            <q-separator class="q-mb-md" />

            <q-form @submit.prevent="onEmailSignIn">
              <q-input
                v-model="email"
                type="email"
                label="Email"
                filled
                dense
                class="q-mb-sm"
                autocomplete="username"
              />
              <q-input
                v-model="password"
                type="password"
                label="Password"
                filled
                dense
                class="q-mb-sm"
                autocomplete="current-password"
              />
              <q-btn
                type="submit"
                color="secondary"
                label="Sign in"
                class="full-width"
                :loading="submitting"
              />
            </q-form>

            <q-banner v-if="authStore.errorMessage" dense rounded class="status-negative q-mt-md">
              {{ authStore.errorMessage }}
            </q-banner>
          </template>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const submitting = ref(false);

watch(
  () => authStore.status,
  (status) => {
    if (status === 'authorized') {
      void router.push('/');
    }
  },
);

async function onGoogleSignIn() {
  submitting.value = true;
  try {
    await authStore.signInWithGoogle();
  } finally {
    submitting.value = false;
  }
}

async function onEmailSignIn() {
  submitting.value = true;
  try {
    await authStore.signInWithEmail(email.value.trim(), password.value);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 360px;
}

.status-negative {
  border: 1px solid #fca5a5;
  background: #fef2f2;
}
</style>
