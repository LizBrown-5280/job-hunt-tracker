import { defineStore } from 'pinia';
import { db } from '@/db/database';
import type { CompanyRecord, CompanyImportantName } from '@/types/networking';

type ImportantNameDraft = CompanyImportantName & { rowId: number };
type CompanyDraft = Omit<CompanyRecord, 'id' | 'createdAt' | 'updatedAt' | 'importantNames'> & {
  importantNames: ImportantNameDraft[];
};
function createImportantNameRow(rowId: number): ImportantNameDraft {
  return {
    rowId,
    name: '',
    title: '',
    category: '',
    notesConfidence: '',
  };
}

function toImportantNameDraftRows(items: CompanyImportantName[]): ImportantNameDraft[] {
  let nextRowId = 1;

  return items.map((item) => ({
    ...item,
    rowId: nextRowId++,
  }));
}

function createDraft(): CompanyDraft {
  return {
    name: '',
    website: '',
    companyLinkedinUrl: '',
    industry: '',
    size: '',
    fundingStage: '',
    status: '',
    importantNames: [],
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    notes: '',
  };
}

async function loadCompanies(): Promise<CompanyRecord[]> {
  return db.companies.toArray();
}

async function persistCompanies(items: CompanyRecord[]) {
  await db.transaction('rw', db.companies, async () => {
    await db.companies.clear();
    await db.companies.bulkPut(items);
  });
}

export const useCompaniesStore = defineStore('companies', {
  state: () => ({
    items: [] as CompanyRecord[],
    draft: createDraft(),
    editingId: null as number | null,
    searchQuery: '',
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

      if (!query) {
        return sorted;
      }

      return sorted.filter((company) =>
        [
          company.name,
          company.industry,
          company.size,
          company.fundingStage,
          company.status,
          company.importantNames
            .map((item) => [item.name, item.title, item.category, item.notesConfidence].join(' '))
            .join(' '),
          company.street,
          company.city,
          company.state,
          company.zip,
          company.phone,
          company.notes,
          company.website,
          company.companyLinkedinUrl,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query)),
      );
    },
  },

  actions: {
    async init() {
      this.items = await loadCompanies();
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
        companyLinkedinUrl: item.companyLinkedinUrl,
        industry: item.industry,
        size: item.size,
        fundingStage: item.fundingStage,
        status: item.status,
        importantNames: toImportantNameDraftRows(item.importantNames),
        street: item.street,
        city: item.city,
        state: item.state,
        zip: item.zip,
        phone: item.phone,
        notes: item.notes,
      };
    },

    async save() {
      const now = new Date().toISOString();
      const payload = {
        name: this.draft.name.trim(),
        website: this.draft.website.trim(),
        companyLinkedinUrl: this.draft.companyLinkedinUrl.trim(),
        industry: this.draft.industry.trim(),
        size: this.draft.size,
        fundingStage: this.draft.fundingStage,
        status: this.draft.status,
        importantNames: this.draft.importantNames
          .map((item) => ({
            name: item.name.trim(),
            title: item.title.trim(),
            category: item.category,
            notesConfidence: item.notesConfidence.trim().slice(0, 100),
          }))
          .filter((item) => item.name),
        street: this.draft.street.trim(),
        city: this.draft.city.trim(),
        state: this.draft.state.trim(),
        zip: this.draft.zip.trim(),
        phone: this.draft.phone.trim(),
        notes: this.draft.notes.trim(),
      };

      if (!payload.name) {
        return;
      }

      if (this.editingId !== null) {
        this.items = this.items.map((item) =>
          item.id === this.editingId ? { ...item, ...payload, updatedAt: now } : item,
        );
        await persistCompanies(this.items);
        this.resetDraft();
        return;
      }

      const nextId = this.items.length ? Math.max(...this.items.map((item) => item.id)) + 1 : 1;
      this.items.unshift({
        id: nextId,
        ...payload,
        archivedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await persistCompanies(this.items);
      this.resetDraft();
    },

    async remove(id: number) {
      const now = new Date().toISOString();
      this.items = this.items.map((item) =>
        item.id === id ? { ...item, archivedAt: now, updatedAt: now } : item,
      );
      await persistCompanies(this.items);

      if (this.editingId === id) {
        this.resetDraft();
      }
    },

    async restore(id: number) {
      const now = new Date().toISOString();
      this.items = this.items.map((item) =>
        item.id === id ? { ...item, archivedAt: null, updatedAt: now } : item,
      );
      await persistCompanies(this.items);
    },

    addImportantNameRow() {
      const nextRowId = this.draft.importantNames.length
        ? Math.max(...this.draft.importantNames.map((item) => item.rowId)) + 1
        : 1;

      this.draft.importantNames.push(createImportantNameRow(nextRowId));
    },

    removeImportantNameRow(rowId: number) {
      this.draft.importantNames = this.draft.importantNames.filter((item) => item.rowId !== rowId);
    },
  },
});
