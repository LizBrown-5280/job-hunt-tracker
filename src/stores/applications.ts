import { defineStore } from 'pinia';
import Dexie from 'dexie';
import type { ApplicationRecord, ApplicationStatus } from '@/types/applications';

type DraftApplication = Pick<
  ApplicationRecord,
  | 'company'
  | 'companyId'
  | 'role'
  | 'positionId'
  | 'status'
  | 'appliedDate'
  | 'nextAction'
  | 'notes'
  | 'priority'
  | 'followUpDate'
  | 'favoriteRating'
>;

type ApplicationFilter = ApplicationStatus | 'All' | 'Favorites';

type ApplicationSearch = {
  query: string;
  filter: ApplicationFilter;
  favoritesOrder: 'desc' | 'asc';
};

type UserProfile = {
  name: string;
};

type BackupMeta = {
  lastExportAt: string | null;
  lastImportAt: string | null;
};

type BackupPayload = {
  version: 1;
  exportedAt: string;
  profile: UserProfile;
  applications: ApplicationRecord[];
};

type HealthCheckResult = {
  ok: boolean;
  checkedAt: string;
  steps: string[];
  error?: string;
};

const PROFILE_STORAGE_KEY = 'job-hunt-tracker-profile';
const BACKUP_META_STORAGE_KEY = 'job-hunt-tracker-backup-meta';

function loadStoredProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return { name: 'Alex' };
  }

  const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!stored) {
    return { name: 'Alex' };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<UserProfile>;
    const name = parsed.name?.trim();
    return name ? { name } : { name: 'Alex' };
  } catch {
    return { name: 'Alex' };
  }
}

function persistProfile(profile: UserProfile) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }
}

function loadStoredBackupMeta(): BackupMeta {
  if (typeof window === 'undefined') {
    return { lastExportAt: null, lastImportAt: null };
  }

  const stored = window.localStorage.getItem(BACKUP_META_STORAGE_KEY);
  if (!stored) {
    return { lastExportAt: null, lastImportAt: null };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<BackupMeta>;
    const lastExportAt = typeof parsed.lastExportAt === 'string' ? parsed.lastExportAt : null;
    const lastImportAt = typeof parsed.lastImportAt === 'string' ? parsed.lastImportAt : null;
    return { lastExportAt, lastImportAt };
  } catch {
    return { lastExportAt: null, lastImportAt: null };
  }
}

function persistBackupMeta(backupMeta: BackupMeta) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(BACKUP_META_STORAGE_KEY, JSON.stringify(backupMeta));
  }
}

function toDateString(value: unknown, fallback: string) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return value;
}

function toStatus(value: unknown): ApplicationStatus {
  const allowed: ApplicationStatus[] = [
    'Wishlist',
    'Applied',
    'Interview',
    'Offer',
    'Rejected',
    'Ghosted',
  ];

  if (typeof value === 'string' && allowed.includes(value as ApplicationStatus)) {
    return value as ApplicationStatus;
  }

  return 'Applied';
}

function normalizeApplication(input: Partial<ApplicationRecord>): ApplicationRecord {
  const now = new Date().toISOString();
  const createdAt = toDateString(input.createdAt, now);

  const normalized: ApplicationRecord = {
    company: typeof input.company === 'string' ? input.company : '',
    companyId: typeof input.companyId === 'number' ? input.companyId : null,
    role: typeof input.role === 'string' ? input.role : '',
    positionId: typeof input.positionId === 'number' ? input.positionId : null,
    status: toStatus(input.status),
    appliedDate:
      typeof input.appliedDate === 'string' && input.appliedDate
        ? input.appliedDate
        : now.slice(0, 10),
    nextAction: typeof input.nextAction === 'string' ? input.nextAction : '',
    notes: typeof input.notes === 'string' ? input.notes : '',
    followUpDate: typeof input.followUpDate === 'string' ? input.followUpDate : '',
    favoriteRating: typeof input.favoriteRating === 'number' ? input.favoriteRating : 0,
    createdAt,
    updatedAt: toDateString(input.updatedAt, createdAt),
  };

  if (typeof input.id === 'number') {
    normalized.id = input.id;
  }

  if (input.priority) {
    normalized.priority = input.priority;
  }

  if (typeof input.previousFavoriteRating === 'number') {
    normalized.previousFavoriteRating = input.previousFavoriteRating;
  }

  if (typeof input.favoriteUpdatedAt === 'string') {
    normalized.favoriteUpdatedAt = input.favoriteUpdatedAt;
  }

  return normalized;
}

class ApplicationsDatabase extends Dexie {
  applications!: Dexie.Table<ApplicationRecord, number>;

  constructor() {
    super('job-hunt-tracker');
    this.version(2).stores({
      applications:
        '++id, company, role, status, appliedDate, nextAction, followUpDate, priority, createdAt, updatedAt',
    });
    this.version(3)
      .stores({
        applications:
          '++id, company, role, status, appliedDate, nextAction, followUpDate, priority, favoriteRating, previousFavoriteRating, favoriteUpdatedAt, createdAt, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('applications')
          .toCollection()
          .modify((record: Partial<ApplicationRecord>) => {
            const now = new Date().toISOString();
            const createdAt = toDateString(record.createdAt, now);

            record.status = toStatus(record.status);
            record.appliedDate =
              typeof record.appliedDate === 'string' && record.appliedDate
                ? record.appliedDate
                : createdAt.slice(0, 10);
            record.company = typeof record.company === 'string' ? record.company : '';
            record.role = typeof record.role === 'string' ? record.role : '';
            record.nextAction = typeof record.nextAction === 'string' ? record.nextAction : '';
            record.notes = typeof record.notes === 'string' ? record.notes : '';
            record.followUpDate =
              typeof record.followUpDate === 'string' ? record.followUpDate : '';
            record.favoriteRating =
              typeof record.favoriteRating === 'number' ? record.favoriteRating : 0;
            record.createdAt = createdAt;
            record.updatedAt = toDateString(record.updatedAt, createdAt);
          });
      });
    this.version(4)
      .stores({
        applications:
          '++id, company, companyId, role, positionId, status, appliedDate, nextAction, followUpDate, priority, favoriteRating, previousFavoriteRating, favoriteUpdatedAt, createdAt, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('applications')
          .toCollection()
          .modify((record: Partial<ApplicationRecord>) => {
            record.companyId = typeof record.companyId === 'number' ? record.companyId : null;
            record.positionId = typeof record.positionId === 'number' ? record.positionId : null;
          });
      });
  }
}

const db = new ApplicationsDatabase();

const seedDemoApplications = async () => {
  const demoItems: Omit<ApplicationRecord, 'id'>[] = [
    {
      company: 'Northwind Labs',
      role: 'Frontend Developer',
      status: 'Interview',
      appliedDate: '2026-07-20',
      nextAction: 'Follow up with recruiter',
      notes: 'Great team fit and strong product story.',
      priority: 'High',
      followUpDate: '2026-07-30',
      favoriteRating: 4,
      createdAt: '2026-07-20T10:00:00.000Z',
      updatedAt: '2026-07-21T09:30:00.000Z',
    },
    {
      company: 'Blue Harbor',
      role: 'Product Designer',
      status: 'Applied',
      appliedDate: '2026-07-23',
      nextAction: 'Prepare portfolio review',
      notes: 'Applied through the careers page.',
      priority: 'Medium',
      followUpDate: '2026-07-28',
      favoriteRating: 2,
      createdAt: '2026-07-23T12:15:00.000Z',
      updatedAt: '2026-07-23T12:15:00.000Z',
    },
    {
      company: 'Riverstone AI',
      role: 'Full Stack Engineer',
      status: 'Wishlist',
      appliedDate: '2026-07-25',
      nextAction: 'Research team stack',
      notes: 'Interesting role but not ready to apply yet.',
      priority: 'Low',
      followUpDate: '',
      favoriteRating: 3,
      createdAt: '2026-07-25T15:45:00.000Z',
      updatedAt: '2026-07-25T15:45:00.000Z',
    },
    {
      company: 'Cedar & Co',
      role: 'QA Engineer',
      status: 'Offer',
      appliedDate: '2026-07-10',
      nextAction: 'Review compensation package',
      notes: 'Positive response from hiring manager.',
      priority: 'High',
      followUpDate: '2026-07-31',
      favoriteRating: 5,
      createdAt: '2026-07-10T08:20:00.000Z',
      updatedAt: '2026-07-12T16:00:00.000Z',
    },
    {
      company: 'Pine & Pear',
      role: 'Operations Analyst',
      status: 'Ghosted',
      appliedDate: '2026-06-18',
      nextAction: 'Archive and move on',
      notes: 'No response after the second follow-up.',
      createdAt: '2026-06-18T09:00:00.000Z',
      updatedAt: '2026-06-25T14:30:00.000Z',
    },
  ];

  const existing = await db.applications.toArray();
  const hasSeedData = existing.some((item) =>
    demoItems.some((seed) => seed.company === item.company && seed.role === item.role),
  );

  if (!hasSeedData) {
    await db.applications.bulkAdd(demoItems);
  }
};

const createDraft = (): DraftApplication => ({
  company: '',
  companyId: null,
  role: '',
  positionId: null,
  status: 'Applied',
  appliedDate: new Date().toISOString().slice(0, 10),
  nextAction: '',
  notes: '',
  priority: 'Medium',
  followUpDate: '',
  favoriteRating: 0,
});

export const useApplicationsStore = defineStore('applications', {
  state: (): {
    items: ApplicationRecord[];
    draft: DraftApplication;
    editingId: number | null;
    search: ApplicationSearch;
    profile: UserProfile;
    backupMeta: BackupMeta;
  } => ({
    items: [],
    draft: createDraft(),
    editingId: null,
    search: {
      query: '',
      filter: 'All',
      favoritesOrder: 'desc',
    },
    profile: loadStoredProfile(),
    backupMeta: loadStoredBackupMeta(),
  }),

  getters: {
    filteredItems: (state) => {
      const items = [...state.items].sort((a, b) => {
        const left = a.updatedAt ?? a.createdAt ?? '';
        const right = b.updatedAt ?? b.createdAt ?? '';
        return right.localeCompare(left);
      });

      const normalizedQuery = state.search.query.trim().toLowerCase();

      const matchesQuery = (item: ApplicationRecord) => {
        if (!normalizedQuery) {
          return true;
        }

        return [item.company, item.role, item.nextAction, item.notes]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      };

      if (state.search.filter === 'All') {
        return items.filter(matchesQuery);
      }

      if (state.search.filter === 'Favorites') {
        return items.filter(matchesQuery).sort((a, b) => {
          const ratingDiff =
            state.search.favoritesOrder === 'desc'
              ? (b.favoriteRating ?? 0) - (a.favoriteRating ?? 0)
              : (a.favoriteRating ?? 0) - (b.favoriteRating ?? 0);
          if (ratingDiff !== 0) {
            return ratingDiff;
          }

          const left = a.updatedAt ?? a.createdAt ?? '';
          const right = b.updatedAt ?? b.createdAt ?? '';
          return right.localeCompare(left);
        });
      }

      return items.filter((item) => item.status === state.search.filter && matchesQuery(item));
    },
  },

  actions: {
    async init() {
      this.profile = loadStoredProfile();

      const existing = await db.applications.toArray();

      if (existing.length === 0) {
        await seedDemoApplications();
      }

      const freshItems = await db.applications.orderBy('createdAt').reverse().toArray();
      this.items = freshItems;
    },

    resetDraft() {
      this.draft = createDraft();
      this.editingId = null;
    },

    updateProfile(name: string) {
      const trimmedName = name.trim() || 'Alex';
      this.profile = { name: trimmedName };
      persistProfile(this.profile);
    },

    resetFilters() {
      this.search.query = '';
      this.search.filter = 'All';
      this.search.favoritesOrder = 'desc';
    },

    setFilter(filter: ApplicationFilter) {
      if (filter === 'Favorites' && this.search.filter === 'Favorites') {
        this.search.favoritesOrder = this.search.favoritesOrder === 'desc' ? 'asc' : 'desc';
        return;
      }

      this.search.filter = filter;
    },

    toggleFavoritesOrder() {
      this.search.favoritesOrder = this.search.favoritesOrder === 'desc' ? 'asc' : 'desc';
    },

    startEdit(item: ApplicationRecord) {
      this.editingId = item.id ?? null;
      this.draft = {
        company: item.company,
        companyId: item.companyId ?? null,
        role: item.role,
        positionId: item.positionId ?? null,
        status: item.status,
        appliedDate: item.appliedDate,
        nextAction: item.nextAction,
        notes: item.notes,
        priority: item.priority ?? 'Medium',
        followUpDate: item.followUpDate ?? '',
        favoriteRating: item.favoriteRating ?? 0,
      };
    },

    async save() {
      const now = new Date().toISOString();
      const payload = {
        ...this.draft,
        companyId: this.draft.companyId ?? null,
        positionId: this.draft.positionId ?? null,
        status: this.draft.status,
        priority: this.draft.priority ?? 'Medium',
        followUpDate: this.draft.followUpDate ?? '',
        favoriteRating: this.draft.favoriteRating ?? 0,
        updatedAt: now,
      };

      if (this.editingId != null) {
        await db.applications.update(this.editingId, payload);
        this.items = this.items.map((item) =>
          item.id === this.editingId ? { ...item, ...payload, updatedAt: now } : item,
        );
        this.resetDraft();
        return;
      }

      const id = await db.applications.add({ ...payload, createdAt: now });
      this.items.unshift({ ...payload, createdAt: now, id });
      this.resetDraft();
    },

    async remove(id: number) {
      await db.applications.delete(id);
      this.items = this.items.filter((item) => item.id !== id);

      if (this.editingId === id) {
        this.resetDraft();
      }
    },

    async updateStatus(id: number, status: ApplicationStatus) {
      await db.applications.update(id, { status, updatedAt: new Date().toISOString() });
      this.items = this.items.map((item) =>
        item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item,
      );
    },

    async toggleFavorite(item: ApplicationRecord, rating: number) {
      const nextRating = item.favoriteRating === rating ? 0 : rating;
      const now = new Date().toISOString();
      const payload = {
        favoriteRating: nextRating,
        previousFavoriteRating: item.favoriteRating ?? 0,
        favoriteUpdatedAt: now,
        updatedAt: now,
      };

      if (item.id != null) {
        await db.applications.update(item.id, payload);
        this.items = this.items.map((entry) =>
          entry.id === item.id ? { ...entry, ...payload } : entry,
        );
      }
    },

    async resetDemoData() {
      await db.applications.clear();
      await seedDemoApplications();
      this.items = await db.applications.orderBy('createdAt').reverse().toArray();
    },

    async resetDemoDataKeepProfile() {
      const currentProfile = this.profile;
      await db.applications.clear();
      await seedDemoApplications();
      this.items = await db.applications.orderBy('createdAt').reverse().toArray();
      this.profile = currentProfile;
      persistProfile(this.profile);
    },

    async reconcileLinkedEntities(validCompanyIds: number[], validPositionIds: number[]) {
      const companyIds = new Set(validCompanyIds);
      const positionIds = new Set(validPositionIds);
      const now = new Date().toISOString();
      let hasChanges = false;

      this.items = this.items.map((item) => {
        const currentCompanyId = item.companyId ?? null;
        const currentPositionId = item.positionId ?? null;
        const nextCompanyId: number | null =
          currentCompanyId != null && !companyIds.has(currentCompanyId) ? null : currentCompanyId;
        const nextPositionId: number | null =
          currentPositionId != null && !positionIds.has(currentPositionId)
            ? null
            : currentPositionId;

        if (nextCompanyId === currentCompanyId && nextPositionId === currentPositionId) {
          return item;
        }

        hasChanges = true;
        return {
          ...item,
          companyId: nextCompanyId,
          positionId: nextPositionId,
          updatedAt: now,
        };
      });

      if (!hasChanges) {
        return;
      }

      await db.transaction('rw', db.applications, async () => {
        for (const item of this.items) {
          if (item.id == null) {
            continue;
          }

          await db.applications.update(item.id, {
            companyId: item.companyId ?? null,
            positionId: item.positionId ?? null,
            updatedAt: item.updatedAt,
          });
        }
      });
    },

    async reassignCompanyReferences(fromCompanyId: number, toCompanyId: number | null) {
      const now = new Date().toISOString();
      let changed = false;

      this.items = this.items.map((item) => {
        const currentCompanyId = item.companyId ?? null;
        if (currentCompanyId !== fromCompanyId) {
          return item;
        }

        changed = true;
        return {
          ...item,
          companyId: toCompanyId,
          updatedAt: now,
        };
      });

      if (!changed) {
        return;
      }

      await db.transaction('rw', db.applications, async () => {
        for (const item of this.items) {
          if (item.id == null) {
            continue;
          }

          await db.applications.update(item.id, {
            companyId: item.companyId ?? null,
            updatedAt: item.updatedAt,
          });
        }
      });
    },

    async reassignPositionReferences(fromPositionId: number, toPositionId: number | null) {
      const now = new Date().toISOString();
      let changed = false;

      this.items = this.items.map((item) => {
        const currentPositionId = item.positionId ?? null;
        if (currentPositionId !== fromPositionId) {
          return item;
        }

        changed = true;
        return {
          ...item,
          positionId: toPositionId,
          updatedAt: now,
        };
      });

      if (!changed) {
        return;
      }

      await db.transaction('rw', db.applications, async () => {
        for (const item of this.items) {
          if (item.id == null) {
            continue;
          }

          await db.applications.update(item.id, {
            positionId: item.positionId ?? null,
            updatedAt: item.updatedAt,
          });
        }
      });
    },

    async exportBackup() {
      const applications = await db.applications.toArray();
      const exportedAt = new Date().toISOString();
      const payload: BackupPayload = {
        version: 1,
        exportedAt,
        profile: this.profile,
        applications,
      };

      this.backupMeta.lastExportAt = exportedAt;
      persistBackupMeta(this.backupMeta);

      return JSON.stringify(payload, null, 2);
    },

    async importBackup(raw: string) {
      let parsed: unknown;

      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error('Invalid JSON backup file.');
      }

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Backup file format is not supported.');
      }

      const record = parsed as Partial<BackupPayload>;
      if (!Array.isArray(record.applications)) {
        throw new Error('Backup is missing applications data.');
      }

      const normalized = record.applications.map((item) =>
        normalizeApplication(item as Partial<ApplicationRecord>),
      );

      await db.transaction('rw', db.applications, async () => {
        await db.applications.clear();
        await db.applications.bulkAdd(normalized);
      });

      if (record.profile && typeof record.profile.name === 'string') {
        this.profile = { name: record.profile.name.trim() || 'Alex' };
        persistProfile(this.profile);
      }

      this.items = await db.applications.orderBy('createdAt').reverse().toArray();
      this.resetDraft();

      this.backupMeta.lastImportAt = new Date().toISOString();
      persistBackupMeta(this.backupMeta);
    },

    async runCoreFlowHealthCheck() {
      const checkedAt = new Date().toISOString();
      const steps: string[] = [];

      const snapshot = await this.exportBackup();

      const rollback = async () => {
        try {
          await this.importBackup(snapshot);
        } catch {
          // Ignore rollback errors here; health check will still report failure below.
        }
      };

      try {
        steps.push('backup-export');

        const unique = Date.now();
        this.draft = {
          company: `HealthCheck Co ${unique}`,
          companyId: null,
          role: 'Health Check Role',
          positionId: null,
          status: 'Applied',
          appliedDate: new Date().toISOString().slice(0, 10),
          nextAction: 'Verify create flow',
          notes: 'Automated store health check record.',
          priority: 'Medium',
          followUpDate: '',
          favoriteRating: 0,
        };
        await this.save();
        steps.push('create-save');

        const created = this.items.find((item) => item.company === `HealthCheck Co ${unique}`);
        if (!created?.id) {
          throw new Error('Create flow failed.');
        }

        this.startEdit(created);
        this.draft.nextAction = 'Verify edit flow';
        await this.save();
        steps.push('edit-save');

        const edited = this.items.find((item) => item.id === created.id);
        if (!edited || edited.nextAction !== 'Verify edit flow') {
          throw new Error('Edit flow failed.');
        }

        await this.toggleFavorite(edited, 4);
        steps.push('favorite-toggle');

        const favorited = this.items.find((item) => item.id === created.id);
        if ((favorited?.favoriteRating ?? 0) !== 4) {
          throw new Error('Favorite toggle flow failed.');
        }

        await this.remove(created.id);
        steps.push('delete-flow');

        if (this.items.some((item) => item.id === created.id)) {
          throw new Error('Delete flow failed.');
        }

        await this.importBackup(snapshot);
        steps.push('backup-import-restore');

        return {
          ok: true,
          checkedAt,
          steps,
        } satisfies HealthCheckResult;
      } catch (error) {
        await rollback();

        return {
          ok: false,
          checkedAt,
          steps,
          error: error instanceof Error ? error.message : 'Unknown health check failure.',
        } satisfies HealthCheckResult;
      }
    },
  },
});
