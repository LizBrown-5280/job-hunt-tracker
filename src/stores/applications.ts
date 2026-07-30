import { defineStore } from 'pinia';
import Dexie from 'dexie';
import type { ApplicationRecord, ApplicationStatus } from '@/types/applications';
import type { CompanyRecord, PositionRecord, RecruiterRecord } from '@/types/networking';

type DraftApplication = Pick<
  ApplicationRecord,
  | 'company'
  | 'companyId'
  | 'role'
  | 'positionId'
  | 'recruiterId'
  | 'recruiterName'
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
const COMPANIES_STORAGE_KEY = 'job-hunt-tracker-companies-v1';
const POSITIONS_STORAGE_KEY = 'job-hunt-tracker-positions-v1';
const RECRUITERS_STORAGE_KEY = 'job-hunt-tracker-recruiters-v1';

function loadStoredProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return { name: '' };
  }

  const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!stored) {
    return { name: '' };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<UserProfile>;
    const name = parsed.name?.trim();
    return name ? { name } : { name: '' };
  } catch {
    return { name: '' };
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

async function clearLocalTrackerData() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(PROFILE_STORAGE_KEY);
  window.localStorage.removeItem(BACKUP_META_STORAGE_KEY);
  window.localStorage.removeItem(COMPANIES_STORAGE_KEY);
  window.localStorage.removeItem(POSITIONS_STORAGE_KEY);
  window.localStorage.removeItem(RECRUITERS_STORAGE_KEY);

  await db.delete();
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
    recruiterId: typeof input.recruiterId === 'number' ? input.recruiterId : null,
    recruiterName: typeof input.recruiterName === 'string' ? input.recruiterName : '',
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
    this.version(5)
      .stores({
        applications:
          '++id, company, companyId, role, positionId, recruiterId, recruiterName, status, appliedDate, nextAction, followUpDate, priority, favoriteRating, previousFavoriteRating, favoriteUpdatedAt, createdAt, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('applications')
          .toCollection()
          .modify((record: Partial<ApplicationRecord>) => {
            record.recruiterId = typeof record.recruiterId === 'number' ? record.recruiterId : null;
            record.recruiterName =
              typeof record.recruiterName === 'string' ? record.recruiterName : '';
          });
      });
  }
}

const db = new ApplicationsDatabase();

function loadStoredArray<T>(key: string): T[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function getStoredCompanyById(companyId: number | null) {
  if (companyId == null) {
    return null;
  }

  return (
    loadStoredArray<CompanyRecord>(COMPANIES_STORAGE_KEY).find((item) => item.id === companyId) ??
    null
  );
}

function getStoredPositionById(positionId: number | null) {
  if (positionId == null) {
    return null;
  }

  return (
    loadStoredArray<PositionRecord>(POSITIONS_STORAGE_KEY).find((item) => item.id === positionId) ??
    null
  );
}

function getStoredRecruiterById(recruiterId: number | null) {
  if (recruiterId == null) {
    return null;
  }

  return (
    loadStoredArray<RecruiterRecord>(RECRUITERS_STORAGE_KEY).find(
      (item) => item.id === recruiterId,
    ) ?? null
  );
}

const createDraft = (): DraftApplication => ({
  company: '',
  companyId: null,
  role: '',
  positionId: null,
  recruiterId: null,
  recruiterName: '',
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

      const freshItems = await db.applications.orderBy('createdAt').reverse().toArray();
      this.items = freshItems;
    },

    resetDraft() {
      this.draft = createDraft();
      this.editingId = null;
    },

    updateProfile(name: string) {
      const trimmedName = name.trim();
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
        recruiterId: item.recruiterId ?? null,
        recruiterName: item.recruiterName ?? '',
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
      const linkedPosition = getStoredPositionById(this.draft.positionId ?? null);
      const linkedCompany = getStoredCompanyById(this.draft.companyId ?? null);
      const linkedRecruiter = getStoredRecruiterById(this.draft.recruiterId ?? null);
      const linkedCompanyFromPosition =
        linkedPosition?.companyId != null ? getStoredCompanyById(linkedPosition.companyId) : null;
      const linkedCompanyFromRecruiter =
        linkedRecruiter?.companyId != null ? getStoredCompanyById(linkedRecruiter.companyId) : null;
      const recruiterConflictsWithPosition =
        linkedPosition?.companyId != null &&
        linkedRecruiter?.companyId != null &&
        linkedPosition.companyId !== linkedRecruiter.companyId;

      const nextPositionId = linkedPosition?.id ?? this.draft.positionId ?? null;
      const nextRecruiterId = recruiterConflictsWithPosition
        ? null
        : (linkedRecruiter?.id ?? this.draft.recruiterId ?? null);
      const nextRecruiterName =
        linkedRecruiter?.fullName.trim() || this.draft.recruiterName?.trim() || '';
      const nextCompanyId =
        linkedPosition?.companyId != null
          ? linkedPosition.companyId
          : (linkedRecruiter?.companyId ?? linkedCompany?.id ?? this.draft.companyId ?? null);
      const nextRole = linkedPosition?.title.trim() || this.draft.role.trim();
      const nextCompanyName =
        linkedCompanyFromPosition?.name.trim() ||
        linkedCompanyFromRecruiter?.name.trim() ||
        linkedCompany?.name.trim() ||
        this.draft.company.trim();

      const payload = {
        ...this.draft,
        company: nextCompanyName,
        role: nextRole,
        companyId: nextCompanyId,
        positionId: nextPositionId,
        recruiterId: nextRecruiterId,
        recruiterName: nextRecruiterName,
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

    async reconcileLinkedEntities(
      validCompanyIds: number[],
      validPositionIds: number[],
      validRecruiterIds: number[],
    ) {
      const companyIds = new Set(validCompanyIds);
      const positionIds = new Set(validPositionIds);
      const recruiterIds = new Set(validRecruiterIds);
      const now = new Date().toISOString();
      let hasChanges = false;

      this.items = this.items.map((item) => {
        const currentCompanyId = item.companyId ?? null;
        const currentPositionId = item.positionId ?? null;
        const currentRecruiterId = item.recruiterId ?? null;
        const currentRecruiterName = item.recruiterName ?? '';
        const nextCompanyId: number | null =
          currentCompanyId != null && !companyIds.has(currentCompanyId) ? null : currentCompanyId;
        const nextPositionId: number | null =
          currentPositionId != null && !positionIds.has(currentPositionId)
            ? null
            : currentPositionId;
        const nextRecruiterId: number | null =
          currentRecruiterId != null && !recruiterIds.has(currentRecruiterId)
            ? null
            : currentRecruiterId;
        const nextRecruiterName = nextRecruiterId == null ? '' : currentRecruiterName;

        if (
          nextCompanyId === currentCompanyId &&
          nextPositionId === currentPositionId &&
          nextRecruiterId === currentRecruiterId &&
          nextRecruiterName === currentRecruiterName
        ) {
          return item;
        }

        hasChanges = true;
        return {
          ...item,
          companyId: nextCompanyId,
          positionId: nextPositionId,
          recruiterId: nextRecruiterId,
          recruiterName: nextRecruiterName,
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
            recruiterId: item.recruiterId ?? null,
            recruiterName: item.recruiterName ?? '',
            updatedAt: item.updatedAt,
          });
        }
      });
    },

    async reassignCompanyReferences(
      fromCompanyId: number,
      toCompanyId: number | null,
      toCompanyName?: string,
    ) {
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
          company:
            toCompanyId != null && typeof toCompanyName === 'string' && toCompanyName.trim()
              ? toCompanyName.trim()
              : item.company,
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
            company: item.company,
            updatedAt: item.updatedAt,
          });
        }
      });
    },

    async syncCompanyNameReferences(companyId: number, companyName: string) {
      const normalizedName = companyName.trim();
      if (!normalizedName) {
        return;
      }

      const now = new Date().toISOString();
      let changed = false;

      this.items = this.items.map((item) => {
        if (item.companyId !== companyId || item.company === normalizedName) {
          return item;
        }

        changed = true;
        return {
          ...item,
          company: normalizedName,
          updatedAt: now,
        };
      });

      if (!changed) {
        return;
      }

      await db.transaction('rw', db.applications, async () => {
        for (const item of this.items) {
          if (item.id == null || item.companyId !== companyId) {
            continue;
          }

          await db.applications.update(item.id, {
            company: item.company,
            updatedAt: item.updatedAt,
          });
        }
      });
    },

    async reassignPositionReferences(
      fromPositionId: number,
      toPositionId: number | null,
      toPositionTitle?: string,
    ) {
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
          role:
            toPositionId != null && typeof toPositionTitle === 'string' && toPositionTitle.trim()
              ? toPositionTitle.trim()
              : item.role,
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
            role: item.role,
            updatedAt: item.updatedAt,
          });
        }
      });
    },

    async syncPositionTitleReferences(positionId: number, positionTitle: string) {
      const normalizedTitle = positionTitle.trim();
      if (!normalizedTitle) {
        return;
      }

      const now = new Date().toISOString();
      let changed = false;

      this.items = this.items.map((item) => {
        if (item.positionId !== positionId || item.role === normalizedTitle) {
          return item;
        }

        changed = true;
        return {
          ...item,
          role: normalizedTitle,
          updatedAt: now,
        };
      });

      if (!changed) {
        return;
      }

      await db.transaction('rw', db.applications, async () => {
        for (const item of this.items) {
          if (item.id == null || item.positionId !== positionId) {
            continue;
          }

          await db.applications.update(item.id, {
            role: item.role,
            updatedAt: item.updatedAt,
          });
        }
      });
    },

    async syncRecruiterNameReferences(recruiterId: number, recruiterName: string) {
      const normalizedName = recruiterName.trim();
      if (!normalizedName) {
        return;
      }

      const now = new Date().toISOString();
      let changed = false;

      this.items = this.items.map((item) => {
        if (item.recruiterId !== recruiterId || item.recruiterName === normalizedName) {
          return item;
        }

        changed = true;
        return {
          ...item,
          recruiterName: normalizedName,
          updatedAt: now,
        };
      });

      if (!changed) {
        return;
      }

      await db.transaction('rw', db.applications, async () => {
        for (const item of this.items) {
          if (item.id == null || item.recruiterId !== recruiterId) {
            continue;
          }

          await db.applications.update(item.id, {
            recruiterName: item.recruiterName ?? '',
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
        this.profile = { name: record.profile.name.trim() };
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

    async clearLocalData() {
      await clearLocalTrackerData();
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    },
  },
});
