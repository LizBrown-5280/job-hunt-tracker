export type CompanySizeRange = '' | '1–50' | '51–200' | '201–1000' | '1000+';
export type FundingStage =
  | 'Bootstrapped'
  | 'Pre-seed'
  | 'Seed'
  | 'Series A'
  | 'Series B'
  | 'Series C+'
  | 'Public'
  | 'Unknown';
export type CompanyFundingStage = '' | FundingStage;
export type CompanyStatus = '' | 'Active' | 'Acquired' | 'IPO' | 'Closed' | 'Unknown';
export type ImportantNameCategory =
  '' | 'Founder' | 'CEO' | 'C-level' | 'People/HR' | 'Hiring/Dept lead' | 'Other';

export type CompanyImportantName = {
  name: string;
  title: string;
  category: ImportantNameCategory;
  notesConfidence: string;
};

export type CompanyRecord = {
  id: number;
  name: string;
  website: string;
  companyLinkedinUrl: string;
  industry: string;
  size: CompanySizeRange;
  fundingStage: CompanyFundingStage;
  status: CompanyStatus;
  importantNames: CompanyImportantName[];
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  notes: string;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PositionStatus = 'Open' | 'Interviewing' | 'On Hold' | 'Closed';
export type PositionWorkMode = 'Remote' | 'On-site' | 'Hybrid';

export type PositionLinkHistoryEntry = {
  changedAt: string;
  companyId: number | null;
  recruiterId: number | null;
  reason: string;
};

export type PositionRecord = {
  id: number;
  title: string;
  companyId: number | null;
  recruiterId: number | null;
  linkHistory: PositionLinkHistoryEntry[];
  status: PositionStatus;
  workMode: PositionWorkMode;
  compensation: string;
  link: string;
  notes: string;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RecruiterRelationship = 'New' | 'Active' | 'Dormant';

export type RecruiterContact = {
  name: string;
  title: string;
  phone: string;
  email: string;
  linkedinUrl: string;
};

export type RecruiterLinkHistoryEntry = {
  changedAt: string;
  companyId: number | null;
  reason: string;
};

export type RecruiterRecord = {
  id: number;
  name: string;
  companyId: number | null;
  companyIds: number[];
  website: string;
  industryFocus: string[];
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  companyLinkedinUrl: string;
  contacts: RecruiterContact[];
  linkHistory: RecruiterLinkHistoryEntry[];
  relationship: RecruiterRelationship;
  notes: string;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
