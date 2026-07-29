<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ editingId ? 'Edit company' : 'Add company' }}</div>
          <q-form @submit.prevent="submitCompany">
            <q-input v-model="store.draft.name" label="Company name" filled dense class="q-mb-sm" />
            <q-input v-model="store.draft.website" label="Website" filled dense class="q-mb-sm" />
            <q-input v-model="store.draft.industry" label="Industry" filled dense class="q-mb-sm" />
            <q-input v-model="store.draft.location" label="Location" filled dense class="q-mb-sm" />
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
                :label="editingId ? 'Save changes' : 'Save company'"
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
                      {{ item.location || 'No location set' }}
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
                    @click="store.remove(item.id)"
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
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCompaniesStore } from '@/stores/companies';

const store = useCompaniesStore();
const { filteredItems, editingId } = storeToRefs(store);

onMounted(() => {
  store.init();
});

function submitCompany() {
  store.save();
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
</script>

<style scoped>
.notes-block {
  border-left: 3px solid #c7d2fe;
  padding: 8px 10px;
  background: #f8faff;
  border-radius: 6px;
}
</style>
