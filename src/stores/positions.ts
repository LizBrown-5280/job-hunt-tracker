import { defineStore } from 'pinia';
import type { PositionRecord } from '@/types/networking';

type PositionDraft = Omit<PositionRecord, 'id' | 'createdAt' | 'updatedAt'>;
type LegacyPositionRecord = Partial<PositionRecord> & {
  location?: string;
};

const STORAGE_KEY = 'job-hunt-tracker-positions-v1';

function isPositionRecord(value: unknown): value is PositionRecord {
  return value !== null && typeof value === 'object' && 'street' in value && 'city' in value;
}

function normalizePositionRecord(item: LegacyPositionRecord): PositionRecord {
  return {
    id: typeof item.id === 'number' ? item.id : 0,
    title: typeof item.title === 'string' ? item.title : '',
    companyId: typeof item.companyId === 'number' ? item.companyId : null,
    status:
      item.status === 'Interviewing' || item.status === 'On Hold' || item.status === 'Closed'
        ? item.status
        : 'Open',
    workMode:
      item.workMode === 'Remote' || item.workMode === 'On-site' || item.workMode === 'Hybrid'
        ? item.workMode
        : 'On-site',
    compensation: typeof item.compensation === 'string' ? item.compensation : '',
    link: typeof item.link === 'string' ? item.link : '',
    notes: typeof item.notes === 'string' ? item.notes : '',
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
  };
}

function createDraft(): PositionDraft {
  return {
    title: '',
    companyId: null,
    status: 'Open',
    workMode: 'On-site',
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
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) =>
      isPositionRecord(item)
        ? normalizePositionRecord(item)
        : normalizePositionRecord(item as Record<string, unknown>),
    );
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
          position.workMode,
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
        workMode: item.workMode,
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
        workMode: this.draft.workMode,
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
