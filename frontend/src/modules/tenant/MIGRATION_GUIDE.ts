/**
 * MIGRATIONSLEITFADEN: SampleShowcase → LayoutRenderer
 * 
 * Alte Struktur (Hard-coded):
 * ✗ SampleShowcase() mit Hard-coded Daten
 * ✗ Keine Anpassung pro Kunde
 * ✗ Frontend-Änderungen = Code-Änderungen
 * 
 * Neue Struktur (JSON-basiert):
 * ✓ LayoutRenderer() mit JSON-Config
 * ✓ Vollständig anpassbar pro Kunde
 * ✓ Frontend-Änderungen = JSON-Änderungen
 */

// ============================================================================
// VOR: Hard-coded Layout (nicht mehr verwendet)
// ============================================================================

/*
function SampleShowcase() {
  return (
    <section className="sample-shell">
      <div className="sample-hero">
        <div className="sample-hero__content">
          <span className="sample-badge">Makin Hir Tacos | Mohammedia</span>
          <h1>Le <span>#1</span> French Tacos au Maroc</h1>
          <p>Compose ton tacos...</p>
        </div>
      </div>
    </section>
  );
}
*/

// ============================================================================
// NACHHER: JSON-basiertes Layout (aktuell verwendet)
// ============================================================================

/*
Tenant-JSON im Backend:
{
  "layout": {
    "showSampleShowcase": true,
    "hero": {
      "enabled": true,
      "badge": "Makin Hir Tacos | Mohammedia",
      "title": "Le #1 French Tacos au Maroc",
      "description": "Compose ton tacos...",
      ...
    },
    "menuSection": { "enabled": true, ... },
    "steps": { "enabled": true, ... },
    "gallery": { "enabled": true, ... }
  }
}

Frontend nutzt:
<LayoutRenderer 
  layout={tenantConfig.layout} 
  menuItems={displayItems}
/>
*/

// ============================================================================
// IMPLEMENTIERUNG PRO RESTAURANT-TYP
// ============================================================================

export const tacos_config = {
  brand: {
    primaryColor: "#FF6B35",
    secondaryColor: "#004E89"
  },
  layout: {
    showSampleShowcase: true,
    hero: {
      enabled: true,
      badge: "Restaurant Tacos",
      title: "Le #1 French Tacos",
      cta1: { label: "Jetzt bestellen" },
      stats: [
        { label: "Sauces", value: "15+" }
      ]
    },
    menuSection: { enabled: true },
    steps: {
      enabled: true,
      steps: [
        { title: "Schritt 1", subtitle: "Größe", detail: "L, XL, XXL" }
        // ...
      ]
    },
    gallery: { enabled: true }
  }
};

export const pizza_config = {
  brand: {
    primaryColor: "#C1272D",  // Rot
    secondaryColor: "#FAD201" // Gelb
  },
  layout: {
    showSampleShowcase: true,
    hero: {
      enabled: true,
      badge: "Pizzeria Premium",
      title: "Die besten Pizzen der Stadt",
      cta1: { label: "Bestelle deine Pizza" }
    },
    menuSection: { enabled: true },
    steps: {
      enabled: true,
      steps: [
        { title: "Schritt 1", subtitle: "Größe", detail: "25, 30, 35cm" }
        // ...
      ]
    },
    gallery: { enabled: true }
  }
};

export const burger_config = {
  brand: {
    primaryColor: "#E8A023", // Gold
    secondaryColor: "#2D2D2D" // Dunkelgrau
  },
  layout: {
    showSampleShowcase: true,
    hero: {
      enabled: true,
      badge: "Burger Paradise",
      title: "Handmade Burgers seit 2020",
      description: "Frische, lokale Zutaten"
    },
    menuSection: { enabled: true },
    steps: { enabled: false }, // Keine Schritte für Burger
    gallery: { enabled: true }
  }
};

// ============================================================================
// BACKEND JSON-STRUKTUR (BEISPIELE)
// ============================================================================

/*
// In der Datenbank: tenan.json-Datei oder configJson-Feld

{
  "slug": "tacos-mohammedia",
  "name": "Makin Hir Tacos",
  "currency": "MAD",
  "configJson": "{ ... tacos_config ... }" // Dies wird mit TenantConfig geparst
}

Backend:
POST /api/v1/admin/tenants/tacos-mohammedia/config
{
  "brand": { "primaryColor": "#FF6B35", ... },
  "layout": { "hero": { "enabled": true, ... }, ... }
}

Frontend:
GET /api/v1/public/tenant?slug=tacos-mohammedia
Response:
{
  "slug": "tacos-mohammedia",
  "configJson": "{ ... }"  // Wird geparsed zu TenantConfig
}
*/

// ============================================================================
// WORKFLOW: NEUE TENANT ERSTELLEN
// ============================================================================

/*
1. Backend-Admin erstellt neuen Tenant:
   DB-Entry + JSON-Konfiguration
   
2. Frontend lädt automatisch:
   fetchTenant(slug) → TenantConfig
   
3. LayoutRenderer rendet basierend auf Config:
   <LayoutRenderer layout={tenantConfig.layout} />
   
4. Änderungen vornehmen:
   Admin ändert JSON → Frontend aktualisiert automatisch
   
Keine weiteren Deployments nötig!
*/

// ============================================================================
// ZUKÜNFTIGE ERWEITERUNGEN
// ============================================================================

/*
export interface LayoutConfig {
  showSampleShowcase: boolean;
  hero?: HeroConfig;
  menuSection?: MenuSectionConfig;
  steps?: StepsConfig;
  gallery?: GalleryConfig;
  
  // Neu in v2:
  testimonials?: TestimonialConfig;
  faq?: FAQConfig;
  promotions?: PromotionConfig;
  subscription?: SubscriptionConfig;
  loyaltyProgram?: LoyaltyConfig;
}

Jede neue Section ist einfach eine neue Komponente + JSON-Config!
*/

export default {
  tacos_config,
  pizza_config,
  burger_config
};
