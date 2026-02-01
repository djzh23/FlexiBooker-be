# 📊 SYSTEM ARCHITECTURE - Visuell Erklärt

**Wie alles zusammenhängt**

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER / CLIENT                      │
│  http://localhost:5174/?tenant=blublu-pizza                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP GET/POST
                         │
        ┌────────────────┴─────────────────┐
        │                                  │
┌───────▼────────────────────┐    ┌───────▼──────────────────────┐
│   FRONTEND (React/Vite)     │    │  BACKEND (Node.js / .NET)     │
│   Port: 5174               │    │  Port: 5081                    │
│                            │    │                               │
│ src/pages/LandingPage.tsx  │    │ GET /api/v1/public/site       │
│ ├─ resolveTenant()         │    │ └─ Queries tenants table      │
│ ├─ fetchSite()    ────────────────> Returns: SiteResponse      │
│ ├─ parseConfigJson()       │    │                               │
│ ├─ applyTenantTheme()      │    │ POST /api/v1/admin/sites      │
│ └─ LayoutRenderer          │    │ └─ Creates new tenant         │
│                            │    │    (with X-Admin-Key)         │
│ src/modules/site/          │    │                               │
│ ├─ site.service.ts         │    │ Database Connection           │
│ │  └─ fetchSite()          │    │ ├─ MySQL / SQL Server         │
│ │  └─ parseConfigJson()    │    │ └─ Connection Pool            │
│ └─ admin.service.ts        │    │                               │
│    └─ provisionSite()      │    │                               │
│                            │    │                               │
│ src/shared/api/            │    │                               │
│ └─ apiClient.ts            │    │                               │
│    └─ Error handling       │    │                               │
│    └─ Headers (X-Tenant)   │    │                               │
└────────────────────────────┘    └───────────────────────────────┘
        │                                  │
        │                           ┌──────▼──────┐
        │                           │  DATABASE   │
        │                           │             │
        │                           │ tenants     │
        │                           │ ├─ slug     │
        │                           │ ├─ name     │
        │                           │ ├─ config   │
        │                           │             │
        │                           │ categories  │
        │                           │ ├─ name     │
        │                           │ ├─ items    │
        │                           │             │
        │                           │ items       │
        │                           │ ├─ price    │
        │                           │ ├─ image    │
        │                           └─────────────┘
        │
        └────────────► Renders HTML / Shows to User
```

---

## 🔄 Single Page Load Flow

```
1. User öffnet Browser
   URL: http://localhost:5174/?tenant=blublu-pizza
           │
           ├─ Vite (dev server) lädt index.html
           │
           └─ React App startet
                    │
                    ├─ LandingPage.tsx montiert
                    │
                    └─ useEffect() läuft


2. resolveTenant() aufgerufen
   ├─ Liest Query-Parameter: ?tenant=blublu-pizza
   ├─ Rückgabe: "blublu-pizza"
   │
   └─ Falls kein Parameter: DEFAULT_TENANT ("tacos-mohammedia")


3. fetchSite("blublu-pizza") aufgerufen
   ├─ createApiClient({ tenant: "blublu-pizza" })
   │
   ├─ fetch("http://localhost:5081/api/v1/public/site", {
   │    headers: {
   │      "X-Tenant": "blublu-pizza"  ← WICHTIG!
   │    }
   │  })
   │
   └─ Backend empfängt Request


4. Backend: GET /api/v1/public/site
   ├─ Liest X-Tenant oder ?slug= Parameter
   ├─ Queries:
   │  ├─ SELECT * FROM tenants WHERE slug = 'blublu-pizza'
   │  │  Result: { id: 2, slug: "blublu-pizza", configJson: "..." }
   │  │
   │  ├─ SELECT * FROM menu_categories WHERE tenantId = 2 ORDER BY sortOrder
   │  │  Result: [ { id: 5, name: "Klassische Pizzas" }, ... ]
   │  │
   │  └─ SELECT * FROM menu_items WHERE categoryId IN (...) 
   │     Result: [ { name: "Margherita", price: 9.50 }, ... ]
   │
   └─ Konstruiert SiteResponse Object
      {
        tenant: { slug, name, configJson },
        categories: [ { id, name, items: [...] } ]
      }


5. Backend sendet Response (JSON)
   Status: 200 OK
   Body: SiteResponse als JSON
         ↓ (über HTTP)
   Frontend empfängt


6. Frontend: apiClient.request<SiteResponse>()
   ├─ res.json() parst JSON
   └─ Returns: SiteResponse


7. Frontend: setSiteData(site)
   ├─ State updated: [siteData, categories]
   └─ Trigger Re-render


8. Frontend: parseConfigJson(site.tenant.configJson)
   ├─ configJson ist String: "{ \"brand\": { \"primaryColor\": \"#0066FF\" } }"
   ├─ JSON.parse() konvertiert zu Object
   │  Result: { brand: { primaryColor: "#0066FF" }, ... }
   └─ setTenantConfig(config)


9. Frontend: applyTenantTheme(config)
   ├─ Liest: config.brand.primaryColor = "#0066FF"
   ├─ Setzt CSS-Variable:
   │  document.documentElement.style.setProperty("--brand-primary", "#0066FF")
   │
   └─ Browser rendert HTML mit neuen Farben 🎨


10. Frontend: LayoutRenderer komponente rendert
    ├─ <HeroSection {...config.layout.hero} />
    │  └─ Zeigt: "Die besten Pizzas in Berlin" (blue background!)
    │
    ├─ <MenuSection categories={site.categories} />
    │  └─ Maps über categories:
    │     "Klassische Pizzas"
    │     ├─ Margherita ........... 9.50 EUR
    │     ├─ Pepperoni ........... 11.50 EUR
    │     └─ Quattro Formaggi ... 13.50 EUR
    │
    │     "Spezial Pizzas"
    │     ├─ Vegetariana ........ 11.00 EUR
    │     └─ Carnivora .......... 14.50 EUR
    │
    │     "Getränke"
    │     ├─ Coca Cola .......... 2.50 EUR
    │     └─ Wasser ............ 2.00 EUR
    │
    ├─ <StepsSection {...config.layout.steps} />
    │  └─ Shows 3 steps
    │
    └─ <GallerySection {...config.layout.gallery} />
       └─ Shows 3 images


11. setState({ status: "ready" })
    └─ Komplett seite zeigt!


12. User sieht im Browser:
    ┌─────────────────────────────────────────┐
    │ 🍕 BLUBLU PIZZA (BLUE HEADER)           │
    │                                         │
    │ [Hero with Pizza Image]                 │
    │                                         │
    │ KLASSISCHE PIZZAS                       │
    │ ├─ Margherita ............ 9.50 EUR    │
    │ ├─ Pepperoni ........... 11.50 EUR    │
    │ └─ ...                                  │
    │                                         │
    │ GETRÄNKE                                │
    │ ├─ Coca Cola ............ 2.50 EUR    │
    │ └─ ...                                  │
    │                                         │
    │ [Steps section]                         │
    │ [Gallery section]                       │
    └─────────────────────────────────────────┘
```

---

## 🏢 Multi-Tenant Isolation

```
Browser 1: ?tenant=tacos-mohammedia    Browser 2: ?tenant=blublu-pizza
    │                                       │
    ├─ fetchSite("tacos-mohammedia")       ├─ fetchSite("blublu-pizza")
    │  Header: X-Tenant: tacos-moh...      │  Header: X-Tenant: blublu-pizza
    │                                       │
    └─ Backend                              └─ Backend
       Query:                                  Query:
       SELECT * FROM tenants                  SELECT * FROM tenants
       WHERE slug = 'tacos-mohammedia'        WHERE slug = 'blublu-pizza'
                    │                                      │
                    ├─ ID: 1                              ├─ ID: 2
                    ├─ configJson: {                      ├─ configJson: {
                    │    "primaryColor": "#FF6B35"        │    "primaryColor": "#0066FF"
                    │    "currency": "MAD"                │    "currency": "EUR"
                    │  }                                  │  }
                    │                                      │
                    └─ Categories: [                      └─ Categories: [
                       { name: "Tacos", items: [...] }       { name: "Klassische", items: [...] }
                       { name: "Drinks", items: [...] }      { name: "Getränke", items: [...] }
                    ]                                     ]
                    │                                      │
                    └─ SiteResponse ────────┬──────────── └─ SiteResponse
                         ORANGE Theme       │                  BLUE Theme
                         Tacos Items        │                  Pizza Items
                         MAD Currency       │                  EUR Currency
                                           │
                      Browser zeigt beide Seiten GLEICHZEITIG
                      ohne Konflikte!
```

---

## 📁 Code Flow: Welche Datei macht was?

```
User Action: Öffnet http://localhost:5174/?tenant=blublu-pizza

  ↓

src/main.tsx
  └─ ReactDOM.createRoot() startet die App

  ↓

src/App.tsx
  └─ <LandingPage />

  ↓

src/pages/LandingPage.tsx (HAUPTDATEI!)
  ├─ useMemo(() => resolveTenant(), [])
  │  └─ src/shared/config/env.ts
  │     └─ resolveTenant() → "blublu-pizza"
  │
  ├─ useEffect(() => {
  │    fetchSite("blublu-pizza")
  │    └─ src/modules/site/site.service.ts
  │       └─ fetchSite(tenant)
  │          └─ createApiClient({ tenant })
  │             └─ src/shared/api/apiClient.ts
  │                └─ fetch(url, { headers: { "X-Tenant": tenant } })
  │
  │    data = Response.json()
  │
  │    config = parseConfigJson(data.tenant.configJson)
  │    └─ src/modules/site/site.service.ts
  │       └─ parseConfigJson(string)
  │          └─ JSON.parse() → Object
  │
  │    applyTenantTheme(config)
  │    └─ src/modules/tenant/applyTheme.ts
  │       └─ setProperty("--brand-primary", config.brand.primaryColor)
  │
  │    setSiteData(data)
  │    setTenantConfig(config)
  │    setState({ status: "ready" })
  │  })
  │
  ├─ if (state.status === "loading")
  │  └─ return <div>Lädt...</div>
  │
  └─ if (state.status === "ready")
     └─ return <LayoutRenderer
        layout={tenantConfig.layout}
        categories={siteData.categories}
        tenant={siteData.tenant}
      />
        └─ src/modules/tenant/layoutRenderer.tsx
           ├─ <HeroSection {...} />
           │  └─ Rendert: config.layout.hero
           │
           ├─ <MenuSection categories={categories} />
           │  └─ Maps über categories → rendert Items
           │
           ├─ <StepsSection {...} />
           │  └─ Rendert: config.layout.steps
           │
           └─ <GallerySection {...} />
              └─ Rendert: config.layout.gallery
```

---

## 🌐 API Endpoints

### GET /api/v1/public/site (Public, kein Auth)

```
Request:
GET /api/v1/public/site?slug=blublu-pizza
Header: X-Tenant: blublu-pizza
Accept: application/json

Response (200 OK):
{
  "tenant": {
    "slug": "blublu-pizza",
    "name": "Blublu Pizza",
    "timezone": "Europe/Berlin",
    "currency": "EUR",
    "configJson": "{...JSON String...}"
  },
  "categories": [
    {
      "id": "ca137343-...",
      "name": "Klassische Pizzas",
      "sortOrder": 1,
      "items": [
        {
          "id": "c6a0b18c-...",
          "name": "Margherita",
          "description": "...",
          "price": 9.50,
          "imageUrl": "https://...",
          "isAvailable": true
        }
      ]
    }
  ]
}
```

---

### POST /api/v1/admin/sites (Admin, mit Auth)

```
Request:
POST /api/v1/admin/sites
Header: X-Admin-Key: dev-admin-key
Content-Type: application/json

Body:
{
  "slug": "pizzeria-roma",
  "name": "Pizzeria Roma",
  "timezone": "Europe/Rome",
  "currency": "EUR",
  "config": {
    "brand": { "primaryColor": "#DC143C", ... },
    "contact": { "phone": "+39 06 ...", ... },
    "layout": { "hero": {...}, "steps": {...} }
  },
  "categories": [
    {
      "name": "Pizze Classiche",
      "sortOrder": 1,
      "items": [ ... ]
    }
  ]
}

Response (201 Created):
{
  "tenant": { ... },
  "categories": [ ... ]
}

Error (401 Unauthorized):
{
  "message": "Unauthorized"
}
```

---

## 💾 Database Schema

```
┌─────────────────────────────────────┐
│         TENANTS TABLE               │
├──────────┬──────────┬────────────────┤
│ id (int) │ slug     │ name           │
├──────────┼──────────┼────────────────┤
│ 1        │ tacos-mo │ Tacos Mohamm.. │
│ 2        │ blublu-p │ Blublu Pizza   │
│ 3        │ pizzeria │ Pizzeria Roma  │
└─────────────────────────────────────┘
         │  timezone │ currency │ configJson
         │  Europe.. │ MAD      │ "{ \"brand\": ...}"
         │  Europe.. │ EUR      │ "{ \"brand\": ...}"
         │  Europe.. │ EUR      │ "{ \"brand\": ...}"

┌────────────────────────────────────────────────────────┐
│         MENU_CATEGORIES TABLE                          │
├────────┬──────────┬────────┬──────────┬──────────────┤
│ id     │ tenantId │ name   │ sortOrder│ createdAt    │
├────────┼──────────┼────────┼──────────┼──────────────┤
│ 5      │ 1        │ Tacos  │ 1        │ 2024-01-30   │
│ 6      │ 1        │ Drinks │ 2        │ 2024-01-30   │
│ 7      │ 2        │ Klasse │ 1        │ 2024-01-30   │
│ 8      │ 2        │ Spezial│ 2        │ 2024-01-30   │
└────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│         MENU_ITEMS TABLE                                             │
├────────┬──────────┬──────────┬─────────┬─────────┬───────┬──────────┤
│ id     │ tenantId │ category │ name    │ price   │image  │ available│
├────────┼──────────┼──────────┼─────────┼─────────┼───────┼──────────┤
│ 100    │ 1        │ 5        │ Tacos.. │ 55.00   │ url   │ true     │
│ 101    │ 1        │ 6        │ Coca.. │ 15.00   │ url   │ true     │
│ 200    │ 2        │ 7        │ Margh.. │ 9.50    │ url   │ true     │
│ 201    │ 2        │ 8        │ Veget.. │ 11.00   │ null  │ true     │
└──────────────────────────────────────────────────────────────────────┘

Relationen:
  TENANTS (1) ──── (N) MENU_CATEGORIES
  TENANTS (1) ──── (N) MENU_ITEMS
  MENU_CATEGORIES (1) ──── (N) MENU_ITEMS
```

---

## 🔐 Security Flow

```
Frontend wants to create new Restaurant:
  ├─ admin.service.ts: provisionSite(request)
  │  └─ Sends: POST /api/v1/admin/sites
  │     Headers: X-Admin-Key: dev-admin-key
  │              Content-Type: application/json
  │     Body: SiteProvisionRequest { slug, name, ... }
  │
  └─ Backend receives:
     ├─ Prüft: Existiert X-Admin-Key Header?
     │  └─ Falls nein: 400 Bad Request
     │
     ├─ Prüft: X-Admin-Key == "dev-admin-key"?
     │  └─ Falls nein: 401 Unauthorized
     │  └─ Falls ja: Continue
     │
     ├─ Validiert: Daten vollständig?
     │  └─ Falls nein: 400 Bad Request (Bad Payload)
     │
     ├─ Insertet: In Datenbank
     │  └─ INSERT INTO tenants (slug, name, ...) VALUES (...)
     │
     └─ Sendet: 201 Created + SiteResponse

Frontend empfängt:
  ├─ Falls 201: Success! Neue Daten verwendet
  ├─ Falls 401: "Ungültiger Admin-Key" Error zeigen
  └─ Falls 400: "Ungültige Daten" Error zeigen
```

---

## 🎨 Theme & Styling Flow

```
Backend sendet:
  configJson: "{
    \"brand\": {
      \"primaryColor\": \"#0066FF\",
      \"secondaryColor\": \"#FFAA00\",
      \"accentColor\": \"#FF0000\"
    }
  }"

Frontend parst:
  parseConfigJson() → Object
  {
    brand: {
      primaryColor: "#0066FF",
      secondaryColor: "#FFAA00",
      accentColor: "#FF0000"
    }
  }

Frontend appliziert:
  applyTenantTheme(config)
    ├─ document.documentElement.style
    │  .setProperty("--brand-primary", "#0066FF")
    │
    └─ document.documentElement.style
       .setProperty("--brand-accent", "#FF0000")

CSS verwendet:
  /* src/app/styles/themes.css */
  :root {
    --brand-primary: #FF6B35;    ← Wird von JS überschrieben!
    --brand-accent: #FF4500;
    --brand-secondary: #FFAA00;
  }

  header {
    background-color: var(--brand-primary);  /* Blau! */
  }

  button {
    background-color: var(--brand-accent);   /* Rot! */
  }

Browser rendert:
  ┌─────────────────────────────────┐
  │ [BLUE HEADER]                   │  ← var(--brand-primary)
  │                                 │
  │ [RED BUTTON] [RED BUTTON]       │  ← var(--brand-accent)
  │                                 │
  │ ...Pizza Items...               │
  └─────────────────────────────────┘
```

---

## 🚀 Zusammenfassung

```
1. User öffnet URL mit ?tenant=X
2. Frontend liest Slug aus URL
3. Frontend macht SINGLE API Call: GET /api/v1/public/site?slug=X
4. Backend queries Datenbank (tenants + categories + items)
5. Backend sendet SiteResponse (tenant + categories)
6. Frontend parst configJson
7. Frontend appliziert Theme (Farben)
8. Frontend rendert LayoutRenderer mit Categories & Items
9. Browser zeigt personalisierte Seite
10. Multiple Tenants können GLEICHZEITIG offen sein!

Jeder Tenant ist vollständig isoliert:
  - Verschiedene Farben
  - Verschiedene Items
  - Verschiedene Währungen
  - Verschiedene Kontakt-Infos
  
Aber: Alle nutzen denselben Frontend-Code!
```

---

**Das ist die Kraft von Multi-Tenant Architektur!** 🚀
