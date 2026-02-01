/**
 * Tenant Info aus dem Backend
 */
export type TenantInfo = {
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  configJson: string; // JSON String – Frontend muss JSON.parse() aufrufen
};

/**
 * Unified Response vom Backend: GET /api/v1/public/site
 * Enthält Tenant-Info + sofort einsatzbereite Kategorien & Items
 */
export type SiteResponse = {
  tenant: TenantInfo;
  categories: Array<{
    id: string;
    name: string;
    sortOrder: number;
    items: Array<{
      id: string;
      name: string;
      description?: string | null;
      price: number;
      imageUrl?: string | null;
      isAvailable: boolean;
    }>;
  }>;
};

/**
 * Admin Provision Request: POST /api/v1/admin/sites
 * Nutze diesen Typ um neue Tenants zu erstellen/aktualisieren
 */
export type SiteProvisionRequest = {
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  config: TenantConfig; // Beliebiges Layout-/Branding-JSON (wird als String in DB gespeichert)
  categories: Array<{
    name: string;
    sortOrder: number;
    items: Array<{
      name: string;
      description?: string;
      price: number;
      imageUrl?: string;
      isAvailable?: boolean;
    }>;
  }>;
};

// Hero/Banner Section
export type HeroConfig = {
  enabled: boolean;
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  cta1?: { label: string; action?: string };
  cta2?: { label: string; action?: string };
  stats?: Array<{ label: string; value: string }>;
  backgroundImage?: string;
};

// Menu Cards Section
export type MenuSectionConfig = {
  enabled: boolean;
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
};

// Steps Section (customize flow)
export type StepsConfig = {
  enabled: boolean;
  badge?: string;
  title?: string;
  steps?: Array<{ title: string; subtitle: string; detail: string }>;
};

// Gallery Section
export type GalleryConfig = {
  enabled: boolean;
  badge?: string;
  title?: string;
  images?: string[];
};

// Layout/Design
export type LayoutConfig = {
  showSampleShowcase: boolean; // Show oder hide the full showcase
  hero?: HeroConfig;
  menuSection?: MenuSectionConfig;
  steps?: StepsConfig;
  gallery?: GalleryConfig;
};

export type BrandConfig = {
  logoUrl?: string | null;
  accentColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  // Typography
  fontFamily?: string; // e.g., "Inter", "Poppins", "Roboto"
  fontUrl?: string; // Google Fonts URL or custom font URL
  headingFontFamily?: string; // separate font for headings
};

export type ContactConfig = {
  phone?: string;
  whatsapp?: string;
  email?: string;
};

export type TenantConfig = {
  brand?: BrandConfig;
  contact?: ContactConfig;
  layout?: LayoutConfig;
};
