import { defineStore } from 'pinia';
import { db } from '@/db/database';
import type { RecruiterContact, RecruiterRecord } from '@/types/networking';
import { useApplicationsStore } from '@/stores/applications';

type RecruiterContactDraft = RecruiterContact & { rowId: number };
type RecruiterDraft = Omit<
  RecruiterRecord,
  'id' | 'createdAt' | 'updatedAt' | 'contacts' | 'linkHistory'
> & {
  contacts: RecruiterContactDraft[];
};

function createDraft(): RecruiterDraft {
  return {
    name: '',
    companyId: null,
    companyIds: [],
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

function areNumberArraysEqual(a: number[], b: number[]) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((value, index) => value === b[index]);
}

function toContactDraftRows(items: RecruiterContact[]): RecruiterContactDraft[] {
  let nextRowId = 1;

  return items.map((item) => ({
    ...item,
    rowId: nextRowId++,
  }));
}

async function loadRecruiters(): Promise<RecruiterRecord[]> {
  return db.recruiters.toArray();
}

async function persistRecruiters(items: RecruiterRecord[]) {
  await db.transaction('rw', db.recruiters, async () => {
    await db.recruiters.clear();
    await db.recruiters.bulkPut(items);
  });
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
          recruiter.name,
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
    async init() {
      this.items = await loadRecruiters();
    },

    resetDraft() {
      this.draft = createDraft();
      this.editingId = null;
    },

    startEdit(item: RecruiterRecord) {
      this.editingId = item.id;
      this.draft = {
        name: item.name,
        companyId: item.companyId,
        companyIds: item.companyIds?.length
          ? [...item.companyIds]
          : item.companyId != null
            ? [item.companyId]
            : [],
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
          ? (this.items.find((item) => item.id === currentEditingId)?.name.trim() ?? '')
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
      const normalizedCompanyIds = Array.from(
        new Set(
          this.draft.companyIds.filter(
            (item): item is number => typeof item === 'number' && Number.isFinite(item),
          ),
        ),
      );
      const primaryCompanyId = normalizedCompanyIds[0] ?? null;
      const payload = {
        name: this.draft.name.trim(),
        companyId: primaryCompanyId,
        companyIds: normalizedCompanyIds,
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

      if (!payload.name) {
        return;
      }

      if (this.editingId !== null) {
        this.items = this.items.map((item) =>
          item.id === this.editingId
            ? {
                ...item,
                ...payload,
                linkHistory:
                  item.companyId !== payload.companyId ||
                  !areNumberArraysEqual(item.companyIds ?? [], payload.companyIds)
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
        await persistRecruiters(this.items);
        this.resetDraft();

        if (currentEditingId != null && payload.name !== previousName) {
          await useApplicationsStore().syncRecruiterNameReferences(currentEditingId, payload.name);
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

      await persistRecruiters(this.items);
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

    async remove(id: number) {
      const now = new Date().toISOString();
      this.items = this.items.map((item) =>
        item.id === id ? { ...item, archivedAt: now, updatedAt: now } : item,
      );
      await persistRecruiters(this.items);

      if (this.editingId === id) {
        this.resetDraft();
      }
    },

    async restore(id: number) {
      const now = new Date().toISOString();
      this.items = this.items.map((item) =>
        item.id === id ? { ...item, archivedAt: null, updatedAt: now } : item,
      );
      await persistRecruiters(this.items);
    },

    async reassignCompanyReferences(fromCompanyId: number, toCompanyId: number | null) {
      const now = new Date().toISOString();
      let changed = false;

      this.items = this.items.map((item) => {
        if (item.archivedAt) {
          return item;
        }

        const currentCompanyIds = item.companyIds?.length
          ? item.companyIds
          : item.companyId != null
            ? [item.companyId]
            : [];
        if (!currentCompanyIds.includes(fromCompanyId)) {
          return item;
        }

        const nextCompanyIds = Array.from(
          new Set(
            currentCompanyIds
              .map((value) => (value === fromCompanyId ? toCompanyId : value))
              .filter((value): value is number => value != null),
          ),
        );
        const nextPrimaryCompanyId = nextCompanyIds[0] ?? null;

        changed = true;
        return {
          ...item,
          companyId: nextPrimaryCompanyId,
          companyIds: nextCompanyIds,
          linkHistory: [
            ...item.linkHistory,
            {
              changedAt: now,
              companyId: nextPrimaryCompanyId,
              reason: 'company-reassigned',
            },
          ],
          updatedAt: now,
        };
      });

      if (changed) {
        await persistRecruiters(this.items);
      }
    },

    async setCompanyReference(recruiterId: number, companyId: number | null, reason = 'updated') {
      const now = new Date().toISOString();
      let changed = false;

      this.items = this.items.map((item) => {
        if (item.archivedAt || item.id !== recruiterId) {
          return item;
        }

        const nextCompanyIds = companyId != null ? [companyId] : [];
        const nextPrimaryCompanyId = nextCompanyIds[0] ?? null;
        if (
          item.companyId === nextPrimaryCompanyId &&
          areNumberArraysEqual(item.companyIds ?? [], nextCompanyIds)
        ) {
          return item;
        }

        changed = true;
        return {
          ...item,
          companyId: nextPrimaryCompanyId,
          companyIds: nextCompanyIds,
          linkHistory: [
            ...item.linkHistory,
            {
              changedAt: now,
              companyId: nextPrimaryCompanyId,
              reason,
            },
          ],
          updatedAt: now,
        };
      });

      if (changed) {
        await persistRecruiters(this.items);

        if (this.editingId === recruiterId) {
          this.draft.companyId = companyId;
          this.draft.companyIds = companyId != null ? [companyId] : [];
        }
      }
    },

    async addCompanyReference(recruiterId: number, companyId: number, reason = 'updated') {
      const now = new Date().toISOString();
      let changed = false;

      this.items = this.items.map((item) => {
        if (item.archivedAt || item.id !== recruiterId) {
          return item;
        }

        const currentCompanyIds = item.companyIds?.length
          ? item.companyIds
          : item.companyId != null
            ? [item.companyId]
            : [];
        if (currentCompanyIds.includes(companyId)) {
          return item;
        }

        const nextCompanyIds = [...currentCompanyIds, companyId];
        const nextPrimaryCompanyId = nextCompanyIds[0] ?? null;

        changed = true;
        return {
          ...item,
          companyId: nextPrimaryCompanyId,
          companyIds: nextCompanyIds,
          linkHistory: [
            ...item.linkHistory,
            {
              changedAt: now,
              companyId,
              reason,
            },
          ],
          updatedAt: now,
        };
      });

      if (changed) {
        await persistRecruiters(this.items);

        if (this.editingId === recruiterId && !this.draft.companyIds.includes(companyId)) {
          this.draft.companyIds = [...this.draft.companyIds, companyId];
          this.draft.companyId = this.draft.companyIds[0] ?? null;
        }
      }
    },
  },
});
