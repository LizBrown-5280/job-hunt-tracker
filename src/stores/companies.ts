import { defineStore } from 'pinia';
import type {
  CompanyRecord,
  CompanyImportantName,
  CompanyFundingStage,
  CompanySizeRange,
  CompanyStatus,
  ImportantNameCategory,
  FundingStage,
} from '@/types/networking';

type ImportantNameDraft = CompanyImportantName & { rowId: number };
type CompanyDraft = Omit<CompanyRecord, 'id' | 'createdAt' | 'updatedAt' | 'importantNames'> & {
  importantNames: ImportantNameDraft[];
};
type LegacyCompanyRecord = Partial<CompanyRecord> & {
  location?: string;
};

const STORAGE_KEY = 'job-hunt-tracker-companies-v1';

const companySizeOptions: CompanySizeRange[] = ['1–50', '51–200', '201–1000', '1000+'];
const fundingStageOptions: FundingStage[] = [
  'Bootstrapped',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C+',
  'Public',
  'Unknown',
];
const companyStatusOptions: CompanyStatus[] = ['Active', 'Acquired', 'IPO', 'Closed', 'Unknown'];
const importantNameCategoryOptions: ImportantNameCategory[] = [
  'Founder',
  'CEO',
  'C-level',
  'People/HR',
  'Hiring/Dept lead',
  'Other',
];

function createImportantNameRow(rowId: number): ImportantNameDraft {
  return {
    rowId,
    name: '',
    title: '',
    category: '',
    notesConfidence: '',
  };
}

function toCompanySize(value: unknown): CompanySizeRange {
  return value === '' || companySizeOptions.includes(value as CompanySizeRange)
    ? (value as CompanySizeRange)
    : '';
}

function toFundingStage(value: unknown): CompanyFundingStage {
  return value === '' || fundingStageOptions.includes(value as FundingStage)
    ? (value as CompanyFundingStage)
    : '';
}

function toCompanyStatus(value: unknown): CompanyStatus {
  return value === '' || companyStatusOptions.includes(value as CompanyStatus)
    ? (value as CompanyStatus)
    : '';
}

function toImportantNameCategory(value: unknown): ImportantNameCategory {
  return value === '' || importantNameCategoryOptions.includes(value as ImportantNameCategory)
    ? (value as ImportantNameCategory)
    : '';
}

function normalizeImportantName(
  item: Partial<CompanyImportantName> | Record<string, unknown>,
): CompanyImportantName | null {
  const name = typeof item.name === 'string' ? item.name.trim() : '';
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  const category = toImportantNameCategory(item.category);
  const notesConfidence =
    typeof item.notesConfidence === 'string' ? item.notesConfidence.trim().slice(0, 100) : '';

  if (!name && !title && !category && !notesConfidence) {
    return null;
  }

  return {
    name,
    title,
    category,
    notesConfidence,
  };
}

function normalizeImportantNameRows(items: unknown): ImportantNameDraft[] {
  if (!Array.isArray(items)) {
    return [];
  }

  let nextRowId = 1;
  return items
    .map((item) => normalizeImportantName(item as Partial<CompanyImportantName>))
    .filter((item): item is CompanyImportantName => item !== null)
    .map((item) => ({ ...item, rowId: nextRowId++ }));
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

function normalizeCompanyRecord(item: LegacyCompanyRecord): CompanyRecord {
  const legacyLocation = typeof item.location === 'string' ? item.location.trim() : '';

  return {
    id: typeof item.id === 'number' ? item.id : 0,
    name: typeof item.name === 'string' ? item.name : '',
    website: typeof item.website === 'string' ? item.website : '',
    companyLinkedinUrl:
      typeof item.companyLinkedinUrl === 'string' ? item.companyLinkedinUrl.trim() : '',
    industry: typeof item.industry === 'string' ? item.industry : '',
    size: toCompanySize(item.size),
    fundingStage: toFundingStage(item.fundingStage),
    status: toCompanyStatus(item.status),
    importantNames: normalizeImportantNameRows(item.importantNames),
    street:
      typeof item.street === 'string' && item.street.trim() ? item.street.trim() : legacyLocation,
    city: typeof item.city === 'string' ? item.city.trim() : '',
    state: typeof item.state === 'string' ? item.state.trim() : '',
    zip: typeof item.zip === 'string' ? item.zip.trim() : '',
    phone: typeof item.phone === 'string' ? item.phone.trim() : '',
    notes: typeof item.notes === 'string' ? item.notes : '',
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
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
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => normalizeCompanyRecord(item as LegacyCompanyRecord));
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

    save() {
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
