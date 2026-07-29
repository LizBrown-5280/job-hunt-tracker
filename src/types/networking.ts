export type CompanyRecord = {
  id: number;
  name: string;
  website: string;
  industry: string;
  location: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type PositionStatus = 'Open' | 'Interviewing' | 'On Hold' | 'Closed';

export type PositionRecord = {
  id: number;
  title: string;
  companyId: number | null;
  status: PositionStatus;
  location: string;
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
