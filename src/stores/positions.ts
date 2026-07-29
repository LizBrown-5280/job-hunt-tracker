import { defineStore } from 'pinia';
import type { PositionRecord } from '@/types/networking';

type PositionDraft = Omit<PositionRecord, 'id' | 'createdAt' | 'updatedAt'>;

const STORAGE_KEY = 'job-hunt-tracker-positions-v1';

function createDraft(): PositionDraft {
  return {
    title: '',
    companyId: null,
    status: 'Open',
    location: '',
    compensation: '',
    link: '',
    notes: '',
  };
}

function loadPositions(): PositionRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as PositionRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function persistPositions(items: PositionRecord[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const usePositionsStore = defineStore('positions', {
  state: () => ({
    items: [] as PositionRecord[],
    draft: createDraft(),
    editingId: null as number | null,
    searchQuery: '',
    filterStatus: 'All',
  }),

  getters: {
    filteredItems: (state) => {
      const query = state.searchQuery.trim().toLowerCase();
      const sorted = [...state.items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

      return sorted.filter((position) => {
        const statusMatch =
          state.filterStatus === 'All' ? true : position.status === state.filterStatus;

        if (!statusMatch) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [
          position.title,
          position.location,
          position.compensation,
          position.notes,
          position.link,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      });
    },
  },

  actions: {
    init() {
      this.items = loadPositions();
    },

    resetDraft() {
      this.draft = createDraft();
      this.editingId = null;
    },

    startEdit(item: PositionRecord) {
      this.editingId = item.id;
      this.draft = {
        title: item.title,
        companyId: item.companyId,
        status: item.status,
        location: item.location,
        compensation: item.compensation,
        link: item.link,
        notes: item.notes,
      };
    },

    save() {
      const now = new Date().toISOString();
      const payload = {
        title: this.draft.title.trim(),
        companyId: this.draft.companyId,
        status: this.draft.status,
        location: this.draft.location.trim(),
        compensation: this.draft.compensation.trim(),
        link: this.draft.link.trim(),
        notes: this.draft.notes.trim(),
      };

      if (!payload.title) {
        return;
      }

      if (this.editingId !== null) {
        this.items = this.items.map((item) =>
          item.id === this.editingId ? { ...item, ...payload, updatedAt: now } : item,
        );
        persistPositions(this.items);
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

      persistPositions(this.items);
      this.resetDraft();
    },

    remove(id: number) {
      this.items = this.items.filter((item) => item.id !== id);
      persistPositions(this.items);

      if (this.editingId === id) {
        this.resetDraft();
      }
    },

    reassignCompanyReferences(fromCompanyId: number, toCompanyId: number | null) {
      const now = new Date().toISOString();
      let changed = false;

      this.items = this.items.map((item) => {
        if (item.companyId !== fromCompanyId) {
          return item;
        }

        changed = true;
        return {
          ...item,
          companyId: toCompanyId,
          updatedAt: now,
        };
      });

      if (changed) {
        persistPositions(this.items);
      }
    },
  },
});
