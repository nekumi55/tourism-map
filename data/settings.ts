import { SiteSettings } from '@/types/settings';

/**
 * Toggle visibility of place star ratings and review counts across the website.
 * Set to `true` once verified user review data is available.
 */
export const SHOW_PLACE_RATINGS = false;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: 'Quảng Ngãi Atlas',
  siteSubtitle: 'Bản Đồ Di Sản, Văn Hóa & Danh Thắng Tỉnh Quảng Ngãi',
  heroBadge: '6 tuyến di sản · 61 địa điểm từ Đông sang Tây Quảng Ngãi',
  heroHeading: 'Di Sản, Văn Hóa & Danh Thắng Tỉnh Quảng Ngãi',
  heroSubheading:
    'Tra cứu 6 tuyến di sản và 61 địa điểm lịch sử, khảo cổ, kiến trúc, danh thắng, bản sắc cộng đồng và ẩm thực đặc trưng từ biển đảo Đông Quảng Ngãi đến đại ngàn Tây Quảng Ngãi.',
  heroBgImage:
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85',
  contactEmail: 'dulich@quangngai.gov.vn',
  contactPhone: '0255.3822.456',
  contactOffice: 'Cổng thông tin Di sản & Du lịch Tỉnh Quảng Ngãi',
  copyrightText: '© 2026 Bản Đồ Di Sản & Du Lịch Tỉnh Quảng Ngãi.',
  showBanner: false,
  bannerText: '',
  stats: {
    totalPlaces: '61 Địa điểm & Di sản',
    districtsCount: '6 Tuyến · 9 Khu vực',
    avgRating: '43 Di tích QG & QG Đặc biệt',
  },
};
