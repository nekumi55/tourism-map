export interface SiteStats {
  totalPlaces: string;
  districtsCount: string;
  avgRating: string;
  techStatus: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteSubtitle: string;
  heroBadge: string;
  heroHeading: string;
  heroSubheading: string;
  heroBgImage: string;
  contactEmail: string;
  contactPhone: string;
  contactOffice: string;
  copyrightText: string;
  showBanner: boolean;
  bannerText: string;
  stats: SiteStats;
}
