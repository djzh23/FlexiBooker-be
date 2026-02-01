# 🚀 MULTI-RESTAURANT SYSTEM - Kompletter Guide

**Wie dein System funktioniert und wie man einfach neue Restaurants hinzufügt**

---

## 🎯 System Überblick (Vereinfacht)

```
Frontend (React)
    ↓ fetchSite(slug)
    ↓ GET /api/v1/public/site?slug=blublu-pizza
Backend (Node.js / .NET)
    ↓ Sucht in Datenbank
    ↓ Findet Tenant + Menu Categories + Items
    ↓ Sendet SiteResponse zurück
Frontend
    ↓ Parst configJson
    ↓ Wendet Farben an
    ↓ Rendert Menu
Browser
    ↓ Zeigt personalisierte Seite
```

---

## 📁 Dateien-Struktur (Was macht was?)

```
Frontend/
├── src/
│   ├── pages/
│   │   └── LandingPage.tsx ............... HAUPTSEITE (lädt Daten, rendert)
│   │
│   ├── shared/
│   │   ├── api/
│   │   │   └── apiClient.ts ............. API-Kommunikation (Fehlerbehandlung)
│   │   └── config/
│   │       └── env.ts ................... Konstanten (Tenant-Namen, Keys)
│   │
│   └── modules/
│       ├── site/
│       │   ├── site.service.ts ........... fetchSite() + parseConfigJson()
│       │   └── admin.service.ts ......... POST /admin/sites (für neue Restaurants)
│       │
│       └── tenant/
│           ├── tenant.types.ts .......... Alle Type-Definitionen
│           ├── layoutRenderer.tsx ....... Rendert Sections (Hero, Menu, Steps, Gallery)
│           ├── applyTheme.ts ........... Setzt CSS-Variablen
│           └── defaultConfig.ts ........ Demo-Konfiguration (fallback)

Backend/ (dein Backend)
├── Database
│   ├── tenants ......................... Alle Restaurants
│   │   ├── slug ........................ "tacos-mohammedia", "blublu-pizza"
│   │   ├── name ........................ "Tacos Mohammedia", "Blublu Pizza"
│   │   ├── configJson .................. Theme-Farben, Hero-Text, etc.
│   │   └── ...
│   │
│   ├── menu_categories ................. Kategorien (z.B. "Tacos", "Drinks")
│   │   ├── tenantId .................... Welcher Restaurant?
│   │   ├── name ........................ "Tacos", "Drinks"
│   │   └── sortOrder ................... Reihenfolge (1, 2, 3)
│   │
│   └── menu_items ....................... Items (z.B. "Margherita")
│       ├── categoryId .................. Zu welcher Kategorie?
│       ├── name ........................ "Margherita"
│       ├── price ....................... 9.50
│       ├── imageUrl .................... Pizza-Bild
│       └── isAvailable ................. true/false

API Endpoints:
├── GET /api/v1/public/site?slug=blublu-pizza
│   └── Gibt: { tenant, categories: [{name, items}] }
│
└── POST /api/v1/admin/sites (mit X-Admin-Key Header)
    └── Erstellt/Updated neuen Restaurant
```

---

## 🍕 Praktisches Beispiel: Tacos vs. Blublu

### Tacos Mohammedia (Bestehend)
```
URL: http://localhost:5174/?tenant=tacos-mohammedia

Database:
  Tenant: {
    slug: "tacos-mohammedia",
    name: "Tacos Mohammedia",
    currency: "MAD",
    configJson: {
      brand: {
        primaryColor: "#FF6B35",      ← ORANGE
        accentColor: "#FF4500"
      }
    }
  }
  
  Categories:
    1. "Tacos" (sortOrder: 1)
       - Tacos Cordon Bleu ... 55 MAD
       - Tacos Chevre Miel ... 55 MAD
    
    2. "Drinks" (sortOrder: 2)
       - Coca Cola .......... 15 MAD
    
    3. "Desserts" (sortOrder: 3)
       - Dunkelshokolade .... 25 MAD
```

### Blublu Pizza (Neu)
```
URL: http://localhost:5174/?tenant=blublu-pizza

Database:
  Tenant: {
    slug: "blublu-pizza",
    name: "Blublu Pizza",
    currency: "EUR",
    configJson: {
      brand: {
        primaryColor: "#0066FF",      ← BLAU
        accentColor: "#FF0000"
      }
    }
  }
  
  Categories:
    1. "Klassische Pizzas" (sortOrder: 1)
       - Margherita ........ 9.50 EUR
       - Pepperoni ........ 11.50 EUR
    
    2. "Spezial Pizzas" (sortOrder: 2)
       - Vegetariana ...... 11.00 EUR
    
    3. "Getränke" (sortOrder: 3)
       - Coca Cola ........ 2.50 EUR
```

**Seht ihr den Unterschied?**
- Verschiedene `slug` → verschiedene URL-Parameter
- Verschiedene `primaryColor` → verschiedene Farben
- Verschiedene `currency` → EUR vs. MAD
- Verschiedene Items & Kategorien

---

## 🔄 Ablauf: Wie Frontend & Backend kommunizieren

### Step-by-Step

```
1️⃣  User öffnet Browser
    URL: http://localhost:5174/?tenant=blublu-pizza
    
2️⃣  LandingPage.tsx lädt
    - resolveTenant() → liest "blublu-pizza" aus URL
    - useEffect startet
    
3️⃣  fetchSite("blublu-pizza") aufgerufen
    - Site Service macht GET /api/v1/public/site
    - Header: X-Tenant: blublu-pizza (oder ?slug=blublu-pizza)
    
4️⃣  Backend antwortet
    GET /api/v1/public/site?slug=blublu-pizza
    ↓
    SQL Query:
      SELECT * FROM tenants WHERE slug = 'blublu-pizza'
      SELECT * FROM menu_categories WHERE tenantId = 123 ORDER BY sortOrder
      SELECT * FROM menu_items WHERE categoryId IN (...) ORDER BY name
    ↓
    Response: SiteResponse {
      tenant: { slug, name, currency, configJson: "..." },
      categories: [
        { id, name, items: [ {name, price, imageUrl, ...} ] },
        ...
      ]
    }
    
5️⃣  Frontend empfängt Response
    setSiteData(site)
    config = parseConfigJson(site.tenant.configJson)
    setTenantConfig(config)
    
6️⃣  Theme wird angewendet
    applyTenantTheme(config)
    → document.documentElement.style.setProperty("--brand-primary", "#0066FF")
    → document.documentElement.style.setProperty("--brand-accent", "#FF0000")
    
7️⃣  LayoutRenderer rendert
    <LayoutRenderer
      layout={config.layout}
      categories={site.categories}
      tenant={site.tenant}
    />
    ↓
    <HeroSection {...} />
    <MenuSection categories={site.categories} />
    <StepsSection {...} />
    <GallerySection {...} />
    
8️⃣  Browser zeigt personalisierte Seite
    - Blaublaue Farben (Blublu)
    - Pizza-Items
    - EUR Preise
```

---

## ✅ Wo man ÄNDERUNGEN für jeden Restaurant macht

### 1️⃣ **Farben & Design** (Was sieht man?)
**Datei:** `backend/database` → `tenants.configJson`

```json
{
  "brand": {
    "primaryColor": "#0066FF",      ← ÄNDERE DAS für neuen Restaurant
    "secondaryColor": "#FFAA00",
    "accentColor": "#FF0000"
  },
  "contact": {
    "phone": "+49 30 999 2000",      ← ÄNDERE DAS
    "email": "hello@blublu-pizza.de"
  },
  "layout": {
    "hero": {
      "title": "Die besten Pizzas in Berlin",  ← ÄNDERE DAS
      "description": "...",                    ← ÄNDERE DAS
      "backgroundImage": "https://..."        ← ÄNDERE DAS
    }
  }
}
```

**Frontend:** Automatisch! `applyTenantTheme()` liest diese Werte.

---

### 2️⃣ **Menu Items** (Was man essen kann?)
**Datei:** `backend/database` → `menu_categories` + `menu_items`

```sql
-- Blublu-Pizza: Klassische Pizzas
INSERT INTO menu_categories (tenantId, name, sortOrder)
VALUES (2, 'Klassische Pizzas', 1)

-- Items zu dieser Kategorie
INSERT INTO menu_items (categoryId, name, price, imageUrl, isAvailable)
VALUES (
  5,  -- category id für "Klassische Pizzas" von Blublu
  'Margherita',
  9.50,
  'https://...',
  true
)
```

**Frontend:** Automatisch! `fetchSite()` lädt Kategorien + Items, `LayoutRenderer` zeigt sie.

---

### 3️⃣ **Informationen** (Name, Timezone, Currency)
**Datei:** `backend/database` → `tenants` Tabelle

```sql
INSERT INTO tenants (slug, name, timezone, currency, configJson)
VALUES (
  'blublu-pizza',              ← Slug (eindeutig!)
  'Blublu Pizza',              ← Name
  'Europe/Berlin',             ← Timezone
  'EUR',                        ← Currency
  '{...configJson string...}'  ← Theme + Layout-Config
)
```

**Frontend:** `site.tenant.currency` → zeigt "EUR" neben Preisen

---

## 🆕 Neuen Restaurant hinzufügen: 3 Optionen

### Option 1: Admin API (Empfohlen)

```bash
curl -X POST "http://localhost:5081/api/v1/admin/sites" \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
  "slug": "new-pizza-place",
  "name": "New Pizza Place",
  "timezone": "Europe/London",
  "currency": "GBP",
  "config": {
    "brand": {
      "primaryColor": "#FF0000",
      "secondaryColor": "#00FF00",
      "accentColor": "#0000FF"
    },
    "contact": {
      "phone": "+44 20 ...",
      "email": "info@newpizza.uk"
    },
    "layout": {
      "hero": {
        "title": "Welcome to New Pizza Place",
        "description": "Best pizza in London"
      }
    }
  },
  "categories": [
    {
      "name": "Pizzas",
      "sortOrder": 1,
      "items": [
        {
          "name": "Margherita",
          "price": 10.00,
          "description": "Classic pizza",
          "isAvailable": true
        }
      ]
    }
  ]
}'
```

**Frontend:** Sofort verfügbar unter `http://localhost:5174/?tenant=new-pizza-place`

---

### Option 2: SQL Script

```sql
-- 1. Neuer Tenant
INSERT INTO tenants (slug, name, timezone, currency, configJson)
VALUES (
  'new-pizza-place',
  'New Pizza Place',
  'Europe/London',
  'GBP',
  '{"brand":{"primaryColor":"#FF0000"},...}'
);

-- 2. Kategorien
INSERT INTO menu_categories (tenantId, name, sortOrder)
VALUES (3, 'Pizzas', 1);

-- 3. Items
INSERT INTO menu_items (categoryId, tenantId, name, price, imageUrl, isAvailable)
VALUES (6, 3, 'Margherita', 10.00, 'https://...', true);
```

**Frontend:** Sofort verfügbar

---

### Option 3: Frontend Admin-UI (Später implementieren)

```typescript
// Geplant: UI im Frontend um Restaurants zu erstellen
// Wird admin.service.ts() aufrufen

import { provisionSite } from "../modules/site/admin.service";

async function createNewRestaurant() {
  await provisionSite({
    slug: "new-pizza",
    name: "New Pizza",
    timezone: "Europe/London",
    currency: "GBP",
    config: { ... },
    categories: [ ... ]
  });
}
```

---

## 🐛 Bugs die JETZT gefixt sind

### Bug 1: tenant.service.ts nicht gelöscht
**Status:** ✅ FIXBAR (alte Datei)
**Lösung:** Diese Datei wird NICHT mehr verwendet. `site.service.ts` ist die neue Version.

### Bug 2: Fehlerhafte API Calls
**Status:** ✅ GEFIXT
- `fetchSite()` ist korrekt (single call)
- `parseConfigJson()` hat Error-Handling
- `apiClient.ts` wirft ApiError mit Status-Code

### Bug 3: Fehlende Fehlerbehandlung
**Status:** ✅ GEFIXT
```typescript
// In LandingPage.tsx
if (code === 404 || code === 400 || !code) {
  // Fallback zu defaultConfig
}
```

### Bug 4: CORS & Admin-Key
**Status:** ✅ GEFIXT
- Backend: CORS aktiviert ✅
- Frontend: Sendet X-Admin-Key Header ✅

---

## 🎯 Checkliste: Neuen Restaurant "Pizzeria Roma" erstellen

### Schritt 1: Admin API aufrufen (oder SQL)

```bash
curl -X POST "http://localhost:5081/api/v1/admin/sites" \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
  "slug": "pizzeria-roma",
  "name": "Pizzeria Roma",
  "timezone": "Europe/Rome",
  "currency": "EUR",
  "config": {
    "brand": {
      "primaryColor": "#DC143C",
      "secondaryColor": "#FFD700",
      "accentColor": "#228B22"
    },
    "contact": {
      "phone": "+39 06 1234 5678",
      "email": "info@pizzeria-roma.it"
    },
    "layout": {
      "hero": {
        "title": "Pizzeria Roma - Authentic Italian Pizza",
        "description": "Trad

izionale Ricette Italiane dal 1990",
        "backgroundImage": "https://..."
      }
    }
  },
  "categories": [
    {
      "name": "Pizze Classiche",
      "sortOrder": 1,
      "items": [
        {"name": "Margherita", "price": 8.00, "description": "...", "isAvailable": true},
        {"name": "Napoletana", "price": 9.00, "description": "...", "isAvailable": true}
      ]
    },
    {
      "name": "Bevande",
      "sortOrder": 2,
      "items": [
        {"name": "Chianti", "price": 6.00, "description": "...", "isAvailable": true}
      ]
    }
  ]
}'
```

**Status:** 201 Created ✅

### Schritt 2: Frontend Test

```
Browser 1: http://localhost:5174/?tenant=tacos-mohammedia
Browser 2: http://localhost:5174/?tenant=blublu-pizza
Browser 3: http://localhost:5174/?tenant=pizzeria-roma  ← NEU!
```

**Erwartet:**
- Rot-Gold-Grün Farben (Italienisches Design)
- Pizze Classiche + Bevande
- EUR Währung
- Italienisches Theme

---

## 📝 Zusammenfassung: Alles in 1 Minute

| Aktion | Wo | Was |
|--------|----|----|
| **Neue Farben** | `tenants.configJson.brand` | primaryColor, secondaryColor, accentColor |
| **Neue Items** | `menu_items` | INSERT mit categoryId, tenantId |
| **Neue Kategorien** | `menu_categories` | INSERT mit tenantId, sortOrder |
| **Hero-Text** | `tenants.configJson.layout.hero` | title, description, backgroundImage |
| **Kontakt** | `tenants.configJson.contact` | phone, email, whatsapp |
| **Neuer Restaurant** | Admin API oder SQL | POST /api/v1/admin/sites oder INSERT |
| **Frontend-URL** | Browser | `http://localhost:5174/?tenant=slug` |

---

## 🚀 Nächste Schritte

- [ ] Alle 3 Tenants testen (Tacos, Blublu, Pizzeria Roma)
- [ ] Farben sollten unterschiedlich sein
- [ ] Preise sollten unterschiedliche Währungen zeigen
- [ ] Menu Items sollten unterschiedlich sein
- [ ] Keine Console-Fehler

**Alles funktioniert?** → System ist READY for Production! 🎉

---

## 💡 Pro-Tipps

**Tip 1:** Slug darf nur Kleinbuchstaben und Bindestriche haben
```
✅ "pizzeria-roma"
❌ "Pizzeria Roma"
❌ "Pizzeria_Roma"
```

**Tip 2:** Farben müssen Hex-Format sein
```
✅ "#FF0000"
❌ "red"
❌ "rgb(255,0,0)"
```

**Tip 3:** Preise sind Dezimalzahlen, nicht Strings
```
✅ 9.50
❌ "9.50"
```

**Tip 4:** isAvailable muss boolean sein
```
✅ true / false
❌ 0 / 1
❌ "yes" / "no"
```

---

## 🎯 Total Control für jeden Restaurant

Du hast **vollständige Kontrolle** über jeden Restaurant:

```
Blublu Pizza:
├── URL: http://localhost:5174/?tenant=blublu-pizza
├── Farben: Blau (#0066FF)
├── Währung: EUR
├── Items: Pizzas, Getränke
└── Kontakt: hello@blublu-pizza.de

Tacos Mohammedia:
├── URL: http://localhost:5174/?tenant=tacos-mohammedia
├── Farben: Orange (#FF6B35)
├── Währung: MAD
├── Items: Tacos, Drinks, Desserts
└── Kontakt: info@tacos.ma

Pizzeria Roma (Neu):
├── URL: http://localhost:5174/?tenant=pizzeria-roma
├── Farben: Rot-Gold (#DC143C)
├── Währung: EUR
├── Items: Pizze, Bevande
└── Kontakt: info@pizzeria-roma.it
```

Jeder Restaurant ist **vollständig unabhängig**, aber sie nutzen alle **denselben Code**!

---

**Das ist die Kraft von Multi-Tenant-Systemen!** 🚀
