export type ApplicationStatus =
  'Not Started' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted';
export type ApplicationPriority = 'None' | 'Low' | 'Medium' | 'High';

export interface ApplicationJourneyEvent {
  id: string;
  status: ApplicationStatus;
  eventDate: string;
  note: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationRecord {
  id?: number;
  company: string;
  companyId?: number | null;
  role: string;
  positionId?: number | null;
  recruiterId?: number | null;
  recruiterName?: string;
  status: ApplicationStatus;
  appliedDate: string;
  nextAction: string;
  notes: string;
  priority?: ApplicationPriority;
  followUpDate?: string;
  journeyEvents: ApplicationJourneyEvent[];
  favoriteRating?: number;
  previousFavoriteRating?: number;
  favoriteUpdatedAt?: string;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
