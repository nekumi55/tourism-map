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
  // KHKT heritage metadata fields
  heritage_type?: string; // Loại hình (e.g. Di tích lịch sử, Di tích khảo cổ, Di sản văn hóa phi vật thể, Danh lam thắng cảnh...)
  recognition_level?: 'Quốc gia đặc biệt' | 'Quốc gia' | 'Quốc tế – UNESCO' | 'Bổ sung' | string; // Cấp công nhận / Phân cấp
  decision_number?: string; // Số văn bản (e.g. Quyết định số 2082/QĐ-TTg)
  recognition_date?: string; // Ngày công nhận (e.g. 25/12/2017)
  listed_year?: string; // Năm ghi danh (e.g. 2008)
  issuing_authority?: string; // Thẩm quyền ban hành (e.g. Thủ tướng Chính phủ)
  management_unit?: string; // Đơn vị trực tiếp quản lý di tích
  region?: 'Đông Quảng Ngãi' | 'Tây Quảng Ngãi'; // Phân vùng nghiên cứu
  route_name?: string; // Tuyến di sản (e.g. Tuyến 1 – Di sản khảo cổ học)
  verification_source?: string; // Nguồn kiểm chứng
}

export interface FilterState {
  search: string;
  categoryId: string;
  districtId: string;
  priceRange: string;
  minRating: number;
  sortBy: 'featured' | 'rating-desc' | 'name-asc' | 'reviews-desc';
}
