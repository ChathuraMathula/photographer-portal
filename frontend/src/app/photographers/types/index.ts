export interface PhotographerUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  studioId?: string;
  isDeactivated?: boolean;
}

export interface PhotographerProfileItem {
  id: string;
  userId: string;
  bookingSlug: string;
  role?: string;
  bio?: string;
  specializations: string[] | string;
  portfolioUrl?: string;
  profileImageUrl?: string;
  baseLocation?: string;
  city?: string;
  district?: string;
  isAvailableForBooking: boolean;
  allowedEventTypes?: string[] | string;
  rating: number;
  ratingCount: number;
  user: PhotographerUser;
  studioName?: string;
  studioLogoUrl?: string;
  studioSlug?: string;
  createdAt?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
