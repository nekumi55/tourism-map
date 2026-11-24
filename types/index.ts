/**
 * Data structures prepared for Supabase migration
 * Matches relational database schema (places, categories, districts)
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Theme color class
  count?: number;
}

export interface District {
  id: string;
  name: string;
  slug: string;
  description: string;
  center_lat: number;
  center_lng: number;
}

export interface PlaceReview {
  id: string;
  author_name: string;
  author_avatar?: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Place {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  district_id: string;
  description: string;
  content: string;
  highlights: string[];
  tips?: string[];
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  price_range: 'free' | 'budget' | 'moderate' | 'luxury';
  price_label: string;
  opening_hours: string;
  phone?: string;
  website?: string;
  tags: string[];
  amenities: string[];
  cover_image: string;
  gallery: string[];
  is_featured: boolean;
  is_open_now?: boolean;
  created_at: string;
  updated_at: string;
  // Metadata indicating mock data
  is_mock_data: boolean;
}

export interface FilterState {
  search: string;
  categoryId: string;
  districtId: string;
  priceRange: string;
  minRating: number;
  sortBy: 'featured' | 'rating-desc' | 'name-asc' | 'reviews-desc';
}
