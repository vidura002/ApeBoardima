export type ListingType = 'room' | 'boarding' | 'annex' | 'hostel' | 'apartment' | 'shared';
export type GenderPolicy = 'male' | 'female' | 'mixed' | 'any';
export type OccupancyType = 'single' | 'double' | 'triple';
export type UserRole = 'tenant' | 'landlord' | 'admin';

export interface Listing {
  id: string;
  title: string;
  type: ListingType;
  price: number;
  priceUnit: 'monthly' | 'weekly';
  area: string;
  address: string;
  latitude?: number;
  longitude?: number;
  googleMapUrl?: string;
  distanceFromSLIIT?: number;
  nearbyLandmarks: string[];
  images: string[];
  description: string;
  amenities: string[];
  furnished: boolean;
  gender: GenderPolicy;
  occupancy: OccupancyType;
  bathrooms: number;
  availableFrom: string;
  contactName: string;
  contactPhone: string;
  contactWhatsApp?: string;
  verified: boolean;
  featured: boolean;
  approved: boolean;
  createdAt: string;
  landlordId: string;
  views: number;
  saves: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  verified: boolean;
  createdAt: string;
  savedListings?: string[];
}

export interface Area {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  listingsCount: number;
  image: string;
}

export interface SearchFilters {
  query: string;
  area: string;
  type: ListingType | '';
  minPrice: number | '';
  maxPrice: number | '';
  gender: GenderPolicy | '';
  furnished: boolean | '';
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

export interface Inquiry {
  id: string;
  listingId: string;
  tenantId: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
}
