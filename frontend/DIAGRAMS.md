# 📊 System-Architektur Diagramme

## System-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLEXIBOOKER FRONTEND                         │
│                   (Multi-Tenant System)                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐        ┌──────────────────────────┐
│   BACKEND / DATABASE     │        │   FRONTEND APPLICATION   │
│                          │        │                          │
│  Tenant Config JSON      │   ────→│  LandingPage.tsx         │
│  {                       │        │  ├─ fetchTenant()       │
│    brand: {...}          │        │  ├─ applyTheme()        │
│    contact: {...}        │        │  └─ LayoutRenderer      │
│    layout: {...}         │        │     ├─ HeroSection      │
│  }                       │        │     ├─ MenuSection      │
│                          │        │     ├─ StepsSection     │
│  Menu Items              │        │     └─ GallerySection   │
│  {                       │        │                          │
│    categories: [...]     │        │  CSS Variables          │
│    items: [...]          │   ────→│  ├─ --primary-color    │
│  }                       │        │  ├─ --secondary-color  │
│                          │        │  └─ Custom Themes      │
└──────────────────────────┘        └──────────────────────────┘
```

## Komponenten-Hierarchie

```
LandingPage (Main Component)
│
├─ State Management
│  ├─ tenantConfig: TenantConfig
│  ├─ menu: MenuResponse
│  ├─ selectedItem: MenuItem | null
│  └─ state: ViewState
│
├─ Effects
│  └─ useEffect → fetchTenant() + fetchMenu()
│
└─ Rendering
   └─ LayoutRenderer (based on layout config)
      ├─ HeroSection
      │  ├─ badge
      │  ├─ title (with #highlight)
      │  ├─ description
      │  ├─ stats
      │  └─ backgroundImage
      │
      ├─ MenuSection
      │  ├─ title
      │  └─ MenuCard[] (from API)
      │     ├─ image
      │     ├─ name
      │     ├─ price
      │     ├─ description
      │     └─ tags
      │
      ├─ StepsSection
      │  └─ Step[] (from config)
      │     ├─ title
      │     ├─ subtitle
      │     └─ detail
      │
      └─ GallerySection
         └─ Image[] (from config)
            └─ img
```

## Datenfluss-Diagramm

```
START: User besucht Frontend mit ?tenant=xyz
       │
       ↓
┌─────────────────────────┐
│ resolveTenant()         │
│ → slug = "xyz"          │
└─────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────┐
│ fetchTenant(slug)                       │
│ GET /api/v1/public/tenant?slug=xyz      │
└─────────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────────────────┐
│ TenantResponse                                          │
│ {                                                       │
│   slug: "tacos-mohammedia"                              │
│   name: "Makin Hir Tacos"                               │
│   currency: "MAD"                                       │
│   configJson: "{\"brand\": {...}, \"layout\": {...}}"  │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
       │
       ├─ Parse configJson → TenantConfig
       │
       ↓
┌─────────────────────────────────────────────────────────┐
│ TenantConfig (Typed Object)                             │
│ {                                                       │
│   brand: { primaryColor, secondaryColor, logoUrl },    │
│   contact: { phone, whatsapp, email },                 │
│   layout: {                                             │
│     showSampleShowcase: true,                           │
│     hero: { enabled, badge, title, ... },              │
│     menuSection: { enabled, title, ... },              │
│     steps: { enabled, steps: [] },                     │
│     gallery: { enabled, images: [] }                   │
│   }                                                     │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
       │
       ├─ applyTenantTheme(config)
       │  └─ Set CSS Variables:
       │     --primary-color: #FF6B35
       │     --secondary-color: #004E89
       │     ...
       │
       ├─ fetchMenu(slug)
       │  GET /api/v1/public/menu?tenant=xyz
       │
       └─ setState({ status: "ready" })
           │
           ↓
     ┌─────────────────────────────────────┐
     │ Render: <LayoutRenderer>            │
     │         layout={layout}             │
     │         menuItems={displayItems}    │
     └─────────────────────────────────────┘
           │
           ├─ showSampleShowcase? NO → return null
           │
           ├─ hero.enabled? YES → <HeroSection>
           │
           ├─ menuSection.enabled? YES → <MenuSection>
           │
           ├─ steps.enabled? YES → <StepsSection>
           │
           └─ gallery.enabled? YES → <GallerySection>
                                │
                                ↓
                        ┌────────────────────┐
                        │ Rendered HTML/CSS  │
                        │ in Browser (DOM)   │
                        └────────────────────┘
```

## Konfigurationsfluss

```
┌──────────────────────────────────────────────────────────────┐
│            TENANT CONFIGURATION LIFECYCLE                    │
└──────────────────────────────────────────────────────────────┘

CREATION:
┌─────────────────────┐
│ node create-tenant  │
│ --slug=xyz          │
│ --restaurant-type   │
└─────────────────────┘
        │
        ↓
┌──────────────────────────────────────────┐
│ Generates: tenant-configs/xyz.json       │
│ {                                        │
│   brand: { primaryColor, ... },          │
│   contact: { phone, ... },               │
│   layout: {                              │
│     hero: {...},                         │
│     menuSection: {...},                  │
│     steps: {...},                        │
│     gallery: {...}                       │
│   }                                      │
│ }                                        │
└──────────────────────────────────────────┘
        │
        ↓
  CUSTOMIZATION:
  ┌─ Edit JSON Manually
  │  ├─ Change Farben
  │  ├─ Update Texte
  │  ├─ Replace Bilder
  │  └─ Modify Steps
  │
  └─ Or use Admin-UI (future)

        │
        ↓
  DEPLOYMENT:
  ┌─────────────────────────────────────┐
  │ Upload JSON to Backend              │
  │                                     │
  │ Option A: File System               │
  │ $ cp xyz.json /backend/configs/     │
  │                                     │
  │ Option B: Database                  │
  │ INSERT INTO tenants (configJson)    │
  │                                     │
  │ Option C: Admin API                 │
  │ POST /api/v1/admin/tenants/xyz/cfg │
  └─────────────────────────────────────┘
        │
        ↓
  PRODUCTION:
  ┌─────────────────────────────────────┐
  │ User visits:                        │
  │ http://app.com/?tenant=xyz          │
  │                                     │
  │ Frontend fetches config from API    │
  │ Renders UI based on config          │
  └─────────────────────────────────────┘
        │
        ↓
  UPDATES:
  ┌─────────────────────────────────────┐
  │ Edit JSON (no frontend deploy!)     │
  │ Update color, text, images, etc.    │
  │                                     │
  │ Frontend reloads config on refresh  │
  │ Changes appear immediately          │
  └─────────────────────────────────────┘
```

## File Structure

```
frontend/
│
├─ src/
│  ├─ modules/
│  │  └─ tenant/
│  │     ├─ tenant.types.ts           ← Typen (Updated)
│  │     ├─ tenant.service.ts         ← API Calls
│  │     ├─ layoutRenderer.tsx        ← NEU: Renderer
│  │     ├─ defaultConfig.ts          ← NEU: Template
│  │     ├─ applyTheme.ts             ← CSS Variablen
│  │     └─ MIGRATION_GUIDE.ts        ← NEU: Anleitung
│  │
│  ├─ pages/
│  │  └─ LandingPage.tsx              ← Updated
│  │
│  └─ ...rest
│
├─ scripts/
│  └─ create-tenant.js                ← NEU: CLI Tool
│
├─ tenant-configs/                    ← NEU: Config Repo
│  ├─ README.md
│  ├─ tacos-mohammedia.json
│  ├─ pizzeria-roma.json
│  └─ burger-master.json
│
├─ ARCHITECTURE.md                    ← NEU: Design
├─ QUICK_START.md                     ← NEU: Setup
├─ CONFIG_REFERENCE.md                ← NEU: Docs
├─ REFACTORING_SUMMARY.md             ← NEU: Overview
└─ ...rest

backend/
│
├─ configs/                           ← Store JSON here
│  ├─ tacos-mohammedia.json
│  ├─ pizzeria-roma.json
│  └─ ...
│
├─ routes/
│  └─ /api/v1/public/tenant           ← Returns TenantResponse
│
└─ ...rest
```

## Type System

```
TenantResponse
├─ slug: string
├─ name: string
├─ currency: string
├─ timezone: string
└─ configJson: string (JSON-encoded)
    │
    └─→ TenantConfig
        ├─ brand?: BrandConfig
        │  ├─ primaryColor?: string
        │  ├─ secondaryColor?: string
        │  ├─ accentColor?: string
        │  └─ logoUrl?: string
        │
        ├─ contact?: ContactConfig
        │  ├─ phone?: string
        │  ├─ whatsapp?: string
        │  └─ email?: string
        │
        └─ layout?: LayoutConfig
           ├─ showSampleShowcase: boolean
           ├─ hero?: HeroConfig
           │  ├─ enabled: boolean
           │  ├─ badge?: string
           │  ├─ title?: string
           │  ├─ description?: string
           │  ├─ cta1/cta2?: { label: string }
           │  ├─ stats?: Array<{label, value}>
           │  └─ backgroundImage?: string
           │
           ├─ menuSection?: MenuSectionConfig
           │  ├─ enabled: boolean
           │  ├─ badge?: string
           │  ├─ title?: string
           │  └─ description?: string
           │
           ├─ steps?: StepsConfig
           │  ├─ enabled: boolean
           │  ├─ badge?: string
           │  ├─ title?: string
           │  └─ steps?: Array<{title, subtitle, detail}>
           │
           └─ gallery?: GalleryConfig
              ├─ enabled: boolean
              ├─ badge?: string
              ├─ title?: string
              └─ images?: string[]
```

---

Diese Diagramme visualisieren die gesamte Architektur des neuen Systems!
