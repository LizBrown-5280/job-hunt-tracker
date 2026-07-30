export type ApplicationStatus =
  'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted';
export type ApplicationPriority = 'Low' | 'Medium' | 'High';

export interface ApplicationRecord {
  id?: number;
  company: string;
  companyId?: number | null;
  role: string;
  positionId?: number | null;
  recruiterId?: number | null;
  status: ApplicationStatus;
  appliedDate: string;
  nextAction: string;
  notes: string;
  priority?: ApplicationPriority;
  followUpDate?: string;
  favoriteRating?: number;
  previousFavoriteRating?: number;
  favoriteUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}
