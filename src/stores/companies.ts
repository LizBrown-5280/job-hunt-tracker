import { defineStore } from 'pinia';
import type { CompanyRecord } from '@/types/networking';

type CompanyDraft = Omit<CompanyRecord, 'id' | 'createdAt' | 'updatedAt'>;

const STORAGE_KEY = 'job-hunt-tracker-companies-v1';

function createDraft(): CompanyDraft {
  return {
    name: '',
    website: '',
    industry: '',
    location: '',
    notes: '',
  };
}

function loadCompanies(): CompanyRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as CompanyRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function persistCompanies(items: CompanyRecord[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const useCompaniesStore = defineStore('companies', {
  state: () => ({
    items: [] as CompanyRecord[],
    draft: createDraft(),
    editingId: null as number | null,
    searchQuery: '',
  }),

  getters: {
    filteredItems: (state) => {
      const query = state.searchQuery.trim().toLowerCase();
      const sorted = [...state.items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

      if (!query) {
        return sorted;
      }

      return sorted.filter((company) =>
        [company.name, company.industry, company.location, company.notes, company.website]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query)),
      );
    },
  },

  actions: {
    init() {
      this.items = loadCompanies();
    },

    resetDraft() {
      this.draft = createDraft();
      this.editingId = null;
    },

    startEdit(item: CompanyRecord) {
      this.editingId = item.id;
      this.draft = {
        name: item.name,
        website: item.website,
        industry: item.industry,
        location: item.location,
        notes: item.notes,
      };
    },

    save() {
      const now = new Date().toISOString();
      const payload = {
        name: this.draft.name.trim(),
        website: this.draft.website.trim(),
        industry: this.draft.industry.trim(),
        location: this.draft.location.trim(),
        notes: this.draft.notes.trim(),
      };

      if (!payload.name) {
        return;
      }

      if (this.editingId !== null) {
        this.items = this.items.map((item) =>
          item.id === this.editingId ? { ...item, ...payload, updatedAt: now } : item,
        );
        persistCompanies(this.items);
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

      persistCompanies(this.items);
      this.resetDraft();
    },

    remove(id: number) {
      this.items = this.items.filter((item) => item.id !== id);
      persistCompanies(this.items);

      if (this.editingId === id) {
        this.resetDraft();
      }
    },
  },
});
