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
  createdAt: string;
  updatedAt: string;
};

export type PositionStatus = 'Open' | 'Interviewing' | 'On Hold' | 'Closed';
export type PositionWorkMode = 'Remote' | 'On-site' | 'Hybrid';

export type PositionRecord = {
  id: number;
  title: string;
  companyId: number | null;
  status: PositionStatus;
  workMode: PositionWorkMode;
  compensation: string;
  link: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type RecruiterRelationship = 'New' | 'Active' | 'Dormant';

export type RecruiterRecord = {
  id: number;
  fullName: string;
  companyId: number | null;
  email: string;
  linkedinUrl: string;
  relationship: RecruiterRelationship;
  notes: string;
  createdAt: string;
  updatedAt: string;
};
