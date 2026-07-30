import { defineStore } from 'pinia';
import type {
  RecruiterContact,
  RecruiterLinkHistoryEntry,
  RecruiterRecord,
} from '@/types/networking';
import { useApplicationsStore } from '@/stores/applications';

type RecruiterContactDraft = RecruiterContact & { rowId: number };
type RecruiterDraft = Omit<
  RecruiterRecord,
  'id' | 'createdAt' | 'updatedAt' | 'contacts' | 'linkHistory'
> & {
  contacts: RecruiterContactDraft[];
};

type LegacyRecruiterRecord = Partial<RecruiterRecord> & {
  email?: unknown;
  linkedinUrl?: unknown;
};

const STORAGE_KEY = 'job-hunt-tracker-recruiters-v1';

function createDraft(): RecruiterDraft {
  return {
    fullName: '',
    companyId: null,
    website: '',
    industryFocus: [],
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    companyLinkedinUrl: '',
    contacts: [],
    relationship: 'New',
    notes: '',
  };
}

function normalizeIndustryFocus(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

function normalizeContact(value: unknown): RecruiterContact | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const item = value as Partial<RecruiterContact> & {
    fullName?: unknown;
  };

  const name =
    typeof item.name === 'string'
      ? item.name.trim()
      : typeof item.fullName === 'string'
        ? item.fullName.trim()
        : '';
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  const phone = typeof item.phone === 'string' ? item.phone.trim() : '';
  const email = typeof item.email === 'string' ? item.email.trim() : '';
  const linkedinUrl = typeof item.linkedinUrl === 'string' ? item.linkedinUrl.trim() : '';

  if (!name && !title && !phone && !email && !linkedinUrl) {
    return null;
  }

  return {
    name,
    title,
    phone,
    email,
    linkedinUrl,
  };
}

function normalizeContacts(value: unknown): RecruiterContact[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeContact(item))
    .filter((item): item is RecruiterContact => item !== null);
}

function toContactDraftRows(items: RecruiterContact[]): RecruiterContactDraft[] {
  let nextRowId = 1;

  return items.map((item) => ({
    ...item,
    rowId: nextRowId++,
  }));
}

function normalizeLinkHistory(
  value: unknown,
  fallbackCreatedAt: string,
  companyId: number | null,
): RecruiterLinkHistoryEntry[] {
  if (!Array.isArray(value)) {
    return [
      {
        changedAt: fallbackCreatedAt,
        companyId,
        reason: 'initial',
      },
    ];
  }

  const normalized = value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const entry = item as Partial<RecruiterLinkHistoryEntry>;
      return {
        changedAt: typeof entry.changedAt === 'string' ? entry.changedAt : fallbackCreatedAt,
        companyId: typeof entry.companyId === 'number' ? entry.companyId : null,
        reason: typeof entry.reason === 'string' && entry.reason ? entry.reason : 'updated',
      };
    })
    .filter((entry): entry is RecruiterLinkHistoryEntry => entry !== null);

  if (normalized.length > 0) {
    return normalized;
  }

  return [
    {
      changedAt: fallbackCreatedAt,
      companyId,
      reason: 'initial',
    },
  ];
}

function normalizeRecruiterRecord(item: LegacyRecruiterRecord, index: number): RecruiterRecord {
  const fallbackId = index + 1;
  const id = typeof item.id === 'number' && Number.isFinite(item.id) ? item.id : fallbackId;
  const fullName = typeof item.fullName === 'string' ? item.fullName.trim() : '';
  const now = new Date().toISOString();
  const website = typeof item.website === 'string' ? item.website.trim() : '';
  const industryFocus = normalizeIndustryFocus(item.industryFocus);
  const street = typeof item.street === 'string' ? item.street.trim() : '';
  const city = typeof item.city === 'string' ? item.city.trim() : '';
  const state = typeof item.state === 'string' ? item.state.trim() : '';
  const zip = typeof item.zip === 'string' ? item.zip.trim() : '';
  const phone = typeof item.phone === 'string' ? item.phone.trim() : '';
  const companyLinkedinUrl =
    typeof item.companyLinkedinUrl === 'string'
      ? item.companyLinkedinUrl.trim()
      : typeof item.linkedinUrl === 'string'
        ? item.linkedinUrl.trim()
        : '';
  const contacts = normalizeContacts(item.contacts);

  const legacyEmail = typeof item.email === 'string' ? item.email.trim() : '';
  const legacyLinkedinUrl = typeof item.linkedinUrl === 'string' ? item.linkedinUrl.trim() : '';
  const legacyContact = normalizeContact({
    name: fullName,
    email: legacyEmail,
    linkedinUrl: legacyLinkedinUrl,
  });
  const normalizedContacts = contacts.length ? contacts : legacyContact ? [legacyContact] : [];
  const companyId =
    typeof item.companyId === 'number' && Number.isFinite(item.companyId) ? item.companyId : null;
  const createdAt = typeof item.createdAt === 'string' && item.createdAt ? item.createdAt : now;

  return {
    id,
    fullName,
    companyId,
    website,
    industryFocus,
    street,
    city,
    state,
    zip,
    phone,
    companyLinkedinUrl,
    contacts: normalizedContacts,
    linkHistory: normalizeLinkHistory(item.linkHistory, createdAt, companyId),
    relationship:
      item.relationship === 'Active' || item.relationship === 'Dormant' ? item.relationship : 'New',
    notes: typeof item.notes === 'string' ? item.notes.trim() : '',
    archivedAt: typeof item.archivedAt === 'string' ? item.archivedAt : null,
    createdAt,
    updatedAt: typeof item.updatedAt === 'string' && item.updatedAt ? item.updatedAt : now,
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
    const parsed = JSON.parse(raw) as LegacyRecruiterRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item, index) => normalizeRecruiterRecord(item, index));
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

        return [
          recruiter.fullName,
          recruiter.website,
          recruiter.notes,
          recruiter.companyLinkedinUrl,
          recruiter.street,
          recruiter.city,
          recruiter.state,
          recruiter.zip,
          recruiter.phone,
          recruiter.industryFocus.join(' '),
          recruiter.contacts
            .map((contact) =>
              [contact.name, contact.title, contact.phone, contact.email, contact.linkedinUrl].join(
                ' ',
              ),
            )
            .join(' '),
        ]
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
        website: item.website,
        industryFocus: [...item.industryFocus],
        street: item.street,
        city: item.city,
        state: item.state,
        zip: item.zip,
        phone: item.phone,
        companyLinkedinUrl: item.companyLinkedinUrl,
        contacts: toContactDraftRows(item.contacts),
        relationship: item.relationship,
        notes: item.notes,
      };
    },

    async save() {
      const currentEditingId = this.editingId;
      const previousName =
        currentEditingId != null
          ? (this.items.find((item) => item.id === currentEditingId)?.fullName.trim() ?? '')
          : '';

      const contacts = this.draft.contacts
        .map((item) => ({
          name: item.name.trim(),
          title: item.title.trim(),
          phone: item.phone.trim(),
          email: item.email.trim(),
          linkedinUrl: item.linkedinUrl.trim(),
        }))
        .filter((item) => item.name || item.title || item.phone || item.email || item.linkedinUrl);

      const now = new Date().toISOString();
      const payload = {
        fullName: this.draft.fullName.trim(),
        companyId: this.draft.companyId,
        website: this.draft.website.trim(),
        industryFocus: this.draft.industryFocus.map((item) => item.trim()).filter(Boolean),
        street: this.draft.street.trim(),
        city: this.draft.city.trim(),
        state: this.draft.state.trim(),
        zip: this.draft.zip.trim(),
        phone: this.draft.phone.trim(),
        companyLinkedinUrl: this.draft.companyLinkedinUrl.trim(),
        contacts,
        relationship: this.draft.relationship,
        notes: this.draft.notes.trim(),
      };

      if (!payload.fullName) {
        return;
      }

      if (this.editingId !== null) {
        this.items = this.items.map((item) =>
          item.id === this.editingId
            ? {
                ...item,
                ...payload,
                linkHistory:
                  item.companyId !== payload.companyId
                    ? [
                        ...item.linkHistory,
                        {
                          changedAt: now,
                          companyId: payload.companyId,
                          reason: 'updated',
                        },
                      ]
                    : item.linkHistory,
                updatedAt: now,
              }
            : item,
        );
        persistRecruiters(this.items);
        this.resetDraft();

        if (currentEditingId != null && payload.fullName !== previousName) {
          await useApplicationsStore().syncRecruiterNameReferences(
            currentEditingId,
            payload.fullName,
          );
        }

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
            reason: 'initial',
          },
        ],
        archivedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      persistRecruiters(this.items);
      this.resetDraft();
    },

    addContactRow() {
      const nextRowId = this.draft.contacts.length
        ? Math.max(...this.draft.contacts.map((item) => item.rowId)) + 1
        : 1;

      this.draft.contacts.push({
        rowId: nextRowId,
        name: '',
        title: '',
        phone: '',
        email: '',
        linkedinUrl: '',
      });
    },

    removeContactRow(rowId: number) {
      this.draft.contacts = this.draft.contacts.filter((item) => item.rowId !== rowId);
    },

    remove(id: number) {
      const now = new Date().toISOString();
      this.items = this.items.map((item) =>
        item.id === id ? { ...item, archivedAt: now, updatedAt: now } : item,
      );
      persistRecruiters(this.items);

      if (this.editingId === id) {
        this.resetDraft();
      }
    },

    restore(id: number) {
      const now = new Date().toISOString();
      this.items = this.items.map((item) =>
        item.id === id ? { ...item, archivedAt: null, updatedAt: now } : item,
      );
      persistRecruiters(this.items);
    },

    reassignCompanyReferences(fromCompanyId: number, toCompanyId: number | null) {
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
              reason: 'company-reassigned',
            },
          ],
          updatedAt: now,
        };
      });

      if (changed) {
        persistRecruiters(this.items);
      }
    },
  },
});
