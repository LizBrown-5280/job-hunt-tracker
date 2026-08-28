import { defineStore } from 'pinia';
import { db } from '@/db/database';
import type { PositionRecord } from '@/types/networking';

type PositionDraft = Omit<PositionRecord, 'id' | 'createdAt' | 'updatedAt' | 'linkHistory'>;

function createDraft(): PositionDraft {
  return {
    title: '',
    companyId: null,
    recruiterId: null,
    status: 'Open',
    workMode: 'On-site',
    compensation: '',
    link: '',
    notes: '',
  };
}

async function loadPositions(): Promise<PositionRecord[]> {
  return db.positions.toArray();
}

async function persistPositions(items: PositionRecord[]) {
  await db.transaction('rw', db.positions, async () => {
    await db.positions.clear();
    await db.positions.bulkPut(items);
  });
}

export const usePositionsStore = defineStore('positions', {
  state: () => ({
    items: [] as PositionRecord[],
    draft: createDraft(),
    editingId: null as number | null,
    searchQuery: '',
    filterStatus: 'All',
    archiveView: 'Active',
  }),

  getters: {
    activeItems: (state) => state.items.filter((item) => !item.archivedAt),

    filteredItems: (state) => {
      const query = state.searchQuery.trim().toLowerCase();
      const sorted = state.items
        .filter((item) => {
          if (state.archiveView === 'Active') {
            return !item.archivedAt;
          }

          if (state.archiveView === 'Archived') {
            return Boolean(item.archivedAt);
          }

          return true;
        })
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

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
    async init() {
      this.items = await loadPositions();
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
        recruiterId: item.recruiterId,
        status: item.status,
        workMode: item.workMode,
        compensation: item.compensation,
        link: item.link,
        notes: item.notes,
      };
    },

    async save() {
      const now = new Date().toISOString();
      const payload = {
        title: this.draft.title.trim(),
        companyId: this.draft.companyId,
        recruiterId: this.draft.recruiterId,
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
          item.id === this.editingId
            ? {
                ...item,
                ...payload,
                linkHistory:
                  item.companyId !== payload.companyId || item.recruiterId !== payload.recruiterId
                    ? [
                        ...item.linkHistory,
                        {
                          changedAt: now,
                          companyId: payload.companyId,
                          recruiterId: payload.recruiterId,
                          reason: 'updated',
                        },
                      ]
                    : item.linkHistory,
                updatedAt: now,
              }
            : item,
        );
        await persistPositions(this.items);
        this.resetDraft();
        return;
      }

      const nextId = this.items.length ? Math.max(...this.items.map((item) => item.id)) + 1 : 1;
      this.items.unshift({
        id: nextId,
        ...payload,
        linkHistory: [
          {
            changedAt: now,
            companyId: payload.companyId,
            recruiterId: payload.recruiterId,
            reason: 'initial',
          },
        ],
        archivedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await persistPositions(this.items);
      this.resetDraft();
    },

    async remove(id: number) {
      const now = new Date().toISOString();
      this.items = this.items.map((item) =>
        item.id === id ? { ...item, archivedAt: now, updatedAt: now } : item,
      );
      await persistPositions(this.items);

      if (this.editingId === id) {
        this.resetDraft();
      }
    },

    async restore(id: number) {
      const now = new Date().toISOString();
      this.items = this.items.map((item) =>
        item.id === id ? { ...item, archivedAt: null, updatedAt: now } : item,
      );
      await persistPositions(this.items);
    },

    async reassignCompanyReferences(fromCompanyId: number, toCompanyId: number | null) {
      const now = new Date().toISOString();
      let changed = false;

      this.items = this.items.map((item) => {
        if (item.archivedAt || item.companyId !== fromCompanyId) {
          return item;
        }

        changed = true;
        return {
          ...item,
          companyId: toCompanyId,
          linkHistory: [
            ...item.linkHistory,
            {
              changedAt: now,
              companyId: toCompanyId,
              recruiterId: item.recruiterId,
              reason: 'company-reassigned',
            },
          ],
          updatedAt: now,
        };
      });

      if (changed) {
        await persistPositions(this.items);
      }
    },
  },
});
