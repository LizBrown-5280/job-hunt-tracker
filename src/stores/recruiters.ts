import { defineStore } from 'pinia';
import type { RecruiterRecord } from '@/types/networking';

type RecruiterDraft = Omit<RecruiterRecord, 'id' | 'createdAt' | 'updatedAt'>;

const STORAGE_KEY = 'job-hunt-tracker-recruiters-v1';

function createDraft(): RecruiterDraft {
  return {
    fullName: '',
    companyId: null,
    email: '',
    linkedinUrl: '',
    relationship: 'New',
    notes: '',
  };
}

function loadRecruiters(): RecruiterRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as RecruiterRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function persistRecruiters(items: RecruiterRecord[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const useRecruitersStore = defineStore('recruiters', {
  state: () => ({
    items: [] as RecruiterRecord[],
    draft: createDraft(),
    editingId: null as number | null,
    searchQuery: '',
    filterRelationship: 'All',
  }),

  getters: {
    filteredItems: (state) => {
      const query = state.searchQuery.trim().toLowerCase();
      const sorted = [...state.items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

      return sorted.filter((recruiter) => {
        const relationshipMatch =
          state.filterRelationship === 'All'
            ? true
            : recruiter.relationship === state.filterRelationship;

        if (!relationshipMatch) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [recruiter.fullName, recruiter.email, recruiter.notes, recruiter.linkedinUrl]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      });
    },
  },

  actions: {
    init() {
      this.items = loadRecruiters();
    },

    resetDraft() {
      this.draft = createDraft();
      this.editingId = null;
    },

    startEdit(item: RecruiterRecord) {
      this.editingId = item.id;
      this.draft = {
        fullName: item.fullName,
        companyId: item.companyId,
        email: item.email,
        linkedinUrl: item.linkedinUrl,
        relationship: item.relationship,
        notes: item.notes,
      };
    },

    save() {
      const now = new Date().toISOString();
      const payload = {
        fullName: this.draft.fullName.trim(),
        companyId: this.draft.companyId,
        email: this.draft.email.trim(),
        linkedinUrl: this.draft.linkedinUrl.trim(),
        relationship: this.draft.relationship,
        notes: this.draft.notes.trim(),
      };

      if (!payload.fullName) {
        return;
      }

      if (this.editingId !== null) {
        this.items = this.items.map((item) =>
          item.id === this.editingId ? { ...item, ...payload, updatedAt: now } : item,
        );
        persistRecruiters(this.items);
        this.resetDraft();
        return;
      }

      const nextId = this.items.length ? Math.max(...this.items.map((item) => item.id)) + 1 : 1;
      this.items.unshift({
        id: nextId,
        ...payload,
        createdAt: now,
        updatedAt: now,
      });

      persistRecruiters(this.items);
      this.resetDraft();
    },

    remove(id: number) {
      this.items = this.items.filter((item) => item.id !== id);
      persistRecruiters(this.items);

      if (this.editingId === id) {
        this.resetDraft();
      }
    },
  },
});
