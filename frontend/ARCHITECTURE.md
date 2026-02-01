# Frontend Architecture - JSON-basierte Konfiguration

## 🎯 Überblick

Das Frontend ist nun vollständig JSON-konfigurierbar. Neue Kunden (Restaurants) benötigen nur noch eine **einzige JSON-Konfigurationsdatei** im Backend. Alle UI-Elemente werden dynamisch nach dieser Konfiguration gerendert.

## 📁 Architektur

```
src/modules/tenant/
├── tenant.types.ts          ← Typen für Layout-Config
├── tenant.service.ts        ← Lädt Tenant-Daten vom Backend
├── layoutRenderer.tsx       ← Generischer UI-Renderer
├── defaultConfig.ts         ← Template für neue Kunden
├── applyTheme.ts           ← CSS-Variable setzen
└── ...
```

## 🔧 Konfigurationsstruktur

```typescript
TenantConfig = {
  brand: {
    primaryColor: "#FF6B35",
    secondaryColor: "#004E89",
    logoUrl: "https://..."
  },
  contact: {
    phone: "+212...",
    whatsapp: "+212...",
    email: "..."
  },
  layout: {
    showSampleShowcase: true,    // Gesamte Showcase anzeigen
    hero: { enabled, badge, title, description, cta1, cta2, stats, backgroundImage },
    menuSection: { enabled, badge, title, description },
    steps: { enabled, badge, title, steps[] },
    gallery: { enabled, badge, title, images[] }
  }
}
```

## 📊 Datenfluss

```
Backend (JSON in DB/JSON-Datei)
    ↓
Frontend: fetchTenant(slug)
    ↓
TenantConfig-Objekt
    ↓
LayoutRenderer Component
    ↓
Statische Sections:    + Dynamische Menu-Items:
- Hero                 - Aus Backend geladen
- MenuSection         - Echte DB-Daten
- Steps
- Gallery
    ↓
Gerenderte UI
```

## 🚀 Workflow für neue Kunden

### 1️⃣ Backend vorbereiten

Speichere folgende JSON in der Datenbank für einen neuen Tenant:

```json
{
  "brand": {
    "primaryColor": "#FF6B35",
    "secondaryColor": "#004E89",
    "logoUrl": "https://example.com/logo.png"
  },
  "contact": {
    "phone": "+212 6 XX XX XX XX",
    "whatsapp": "+212 6 XX XX XX XX"
  },
  "layout": {
    "showSampleShowcase": true,
    "hero": {
      "enabled": true,
      "badge": "Restaurant Name | Stadt",
      "title": "Le #1 [Spezialität] in [Region]",
      "description": "Komponiere dein Gericht...",
      "cta1": { "label": "Jetzt bestellen" },
      "cta2": { "label": "Vollständige Karte ansehen" },
      "stats": [
        { "label": "Sauces", "value": "15+" }
      ],
      "backgroundImage": "https://..."
    },
    "menuSection": {
      "enabled": true,
      "badge": "Carte signature",
      "title": "Die beliebtesten Gerichte"
    },
    "steps": {
      "enabled": true,
      "badge": "Ritual",
      "title": "Dein Gericht in 5 Schritten",
      "steps": [
        { "title": "Schritt 1", "subtitle": "...", "detail": "..." }
      ]
    },
    "gallery": {
      "enabled": true,
      "badge": "Ambiance",
      "images": ["https://...", "https://..."]
    }
  }
}
```

### 2️⃣ Frontend Template Klonen

Das Frontend wird automatisch alle Kunden unterstützen. **Kein Code-Change nötig!**

### 3️⃣ Anpassungen vornehmen

Alle UI-Änderungen erfolgen durch Änderung der JSON:

```diff
- "title": "Le #1 [Spezialität]"
+ "title": "Le #1 Pizza Handmade"

- "images": ["https://old.jpg"]
+ "images": ["https://new1.jpg", "https://new2.jpg"]
```

## 🎨 Customization-Beispiele

### Nur Hero anzeigen (z.B. für Info-Pages)
```json
{
  "layout": {
    "showSampleShowcase": true,
    "hero": { "enabled": true, ... },
    "menuSection": { "enabled": false },
    "steps": { "enabled": false },
    "gallery": { "enabled": false }
  }
}
```

### Komplett verstecken (nur echte Menu)
```json
{
  "layout": {
    "showSampleShowcase": false
  }
}
```

### Farben pro Kunde
```json
{
  "brand": {
    "primaryColor": "#FF6B35",      // Orange für Tacos-Restaurant
    "primaryColor": "#8B0000"       // Rot für Pizza-Restaurant
  }
}
```

## 📱 Backend JSON-Speicher

Option 1: **Separate JSON-Datei pro Tenant**
```
/configs/
  ├── tacos-mohammedia.json
  ├── pizza-casablanca.json
  └── burger-marrakech.json
```

Option 2: **Datenbank (configJson-Feld)**
```sql
UPDATE tenant SET configJson = '{...}' WHERE slug = 'tacos-mohammedia';
```

## 🔄 Erweiterungen (Zukünftig)

```typescript
// Noch nicht implementiert, aber geplant:
type LayoutConfig = {
  showSampleShowcase: boolean;
  hero?: HeroConfig;
  menuSection?: MenuSectionConfig;
  steps?: StepsConfig;
  gallery?: GalleryConfig;
  testimonials?: TestimonialConfig;  // Neu
  faq?: FAQConfig;                   // Neu
  pricing?: PricingConfig;           // Neu
}
```

## 🛠 Komponenten-Details

### LayoutRenderer
Orchestriert alle Sections basierend auf `layout`-Config.

### HeroSection
- Badge
- Title (mit `#` Highlighting)
- Description
- CTAs (Buttons)
- Stats
- Background Image

### MenuSection
- Rendert echte Menu-Items vom Backend
- Zeigt Items in Grid-Layout
- Tags und Preise

### StepsSection
- Prozess-Schritte (5er in Beispiel)
- Anpassbar pro Kunde

### GallerySection
- Dynamische Bilder-Galerie
- Responsive Layout

## 🎓 Best Practices

1. **Immer Layout-Config nutzen** - Nicht mehr SampleShowcase hardcoden
2. **Backend JSON validieren** - Typen für TypeScript
3. **Fallbacks setzen** - Leere Sections wenn kein Config
4. **Images optimieren** - Mit `?auto=format&fit=crop&w=1200`
5. **Responsive testen** - Mobile-first Design

---

**Für Support oder Fragen:** Siehe `defaultConfig.ts` Beispiele
