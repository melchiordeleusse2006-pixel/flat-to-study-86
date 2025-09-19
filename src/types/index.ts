export type UserRole = 'STUDENT' | 'AGENCY' | 'PRIVATE' | 'ADMIN';

export type ListingType = 'room' | 'studio' | 'apartment';

export type ListingStatus = 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'ARCHIVED';

export type VisitRequestStatus = 'NEW' | 'AGENCY_REPLIED' | 'SCHEDULED' | 'CLOSED';

export interface User {
  id: string;
  role: UserRole;
  email: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  university?: University;
  phone: string;
  isVerified: boolean;
}

export interface Agency {
  id: string;
  ownerUserId: string;
  name: string;
  website?: string;
  phone: string;
  logoUrl?: string;
  billingEmail?: string;
  createdAt: string;
}

export interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface Listing {
  id: string;
  agency: Agency;
  title: string;
  type: ListingType;
  description: string;
  addressLine: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  rentMonthlyEUR: number;
  depositEUR: number;
  agencyFee?: string;
  billsIncluded: boolean;
  furnished: boolean;
  bedrooms: number;
  bathrooms: number;
  floor?: string;
  sizeSqm?: number;
  amenities: string[];
  availabilityDate: string;
  images: string[];
  videoUrl?: string;
  createdAt: string;
  publishedAt?: string;
  status: ListingStatus;
  expiresAt?: string;
  distance?: number; // Distance to selected university in km
  booking_enabled?: boolean;
  instant_booking?: boolean;
  minimum_stay_days?: number;
  maximum_stay_days?: number;
  advance_booking_days?: number;
}

export interface Favorite {
  id: string;
  studentId: string;
  listingId: string;
  createdAt: string;
}

export interface VisitRequest {
  id: string;
  listing: Listing;
  student: StudentProfile;
  message: string;
  status: VisitRequestStatus;
  createdAt: string;
}

export interface SearchFilters {
  priceMin?: number;
  priceMax?: number;
  type?: ListingType[];
  bedrooms?: number;
  availabilityDate?: string;
  furnished?: boolean;
  amenities?: string[];
  city?: string;
  universityId?: string;
  radiusKm?: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface ListingAnalytics {
  listingId: string;
  views: number;
  uniqueViews: number;
  favorites: number;
  visitRequests: number;
  daysLive: number;
}