# 📊 Architecture: Backend ↔ Frontend

Visueller Überblick wie alles zusammenhängt.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER BROWSER                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ http://localhost:5174/?tenant=tacos
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/TypeScript)              │
│                    ├─ resolveTenant() → "tacos-mohammedia"  │
│                    ├─ fetchSite(slug)                       │
│                    ├─ parseConfigJson()                     │
│                    ├─ applyTenantTheme()                    │
│                    └─ <LayoutRenderer />                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        │ GET /?slug  │ POST config │ X-Admin-Key
        │             │             │
        ↓             ↓             ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Express.js)                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ GET /api/v1/public/site?slug=X                      │  │
│  │ → DB Query: Tenant + Categories + Items             │  │
│  │ → Response: SiteResponse (formatted)                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ POST /api/v1/admin/sites                            │  │
│  │ → Validate X-Admin-Key                              │  │
│  │ → Upsert Tenant                                     │  │
│  │ → Delete old categories/items                       │  │
│  │ → Insert new categories/items                       │  │
│  │ → Response: SiteResponse (new data)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ SQL
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   TENANTS    │  │ CATEGORIES   │  │    ITEMS     │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ id (PK)      │  │ id (PK)      │  │ id (PK)      │     │
│  │ slug (UQ)    │  │ tenantId (FK)│  │ categoryId   │     │
│  │ name         │  │ name         │  │ (FK)         │     │
│  │ timezone     │  │ sortOrder    │  │ tenantId (FK)│     │
│  │ currency     │  └──────────────┘  │ name         │     │
│  │ configJson   │                    │ price        │     │
│  └──────────────┘                    │ imageUrl     │     │
│                                       │ isAvailable  │     │
│                                       └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow: GET Request

```
┌─ Browser ────────────────────────────────────────┐
│  http://localhost:5174/?tenant=tacos-mohammedia  │
└─────────────┬─────────────────────────────────────┘
              │
              ↓
┌─ Frontend (LandingPage.tsx) ─────────────────────┐
│  useEffect() {                                   │
│    tenantSlug = resolveTenant()                  │
│    site = await fetchSite(tenantSlug)            │
│  }                                               │
└─────────────┬─────────────────────────────────────┘
              │
              ↓
┌─ API Call ────────────────────────────────────────┐
│  GET /api/v1/public/site?slug=tacos-mohammedia    │
│  Headers: { X-Tenant: tacos-mohammedia }          │
└─────────────┬─────────────────────────────────────┘
              │
              ↓
┌─ Backend (Express) ────────────────────────────────────┐
│  1. Extract slug from query/header                     │
│  2. db.query("SELECT * FROM tenants WHERE slug=?")    │
│  3. Check: tenant exists? → 404 if not                │
│  4. db.query("SELECT categories+items WHERE tenantId")│
│  5. Format into SiteResponse                          │
│  6. Return 200 + JSON                                 │
└─────────────┬──────────────────────────────────────────┘
              │
              ↓
┌─ API Response ────────────────────────────────────────┐
│  200 OK                                               │
│  {                                                    │
│    "tenant": {...},                                  │
│    "categories": [...]                               │
│  }                                                    │
└─────────────┬──────────────────────────────────────────┘
              │
              ↓
┌─ Frontend (site.service.ts) ──────────────────────────┐
│  const site = response.json()                         │
│  setSiteData(site)                                    │
│  config = parseConfigJson(site.tenant.configJson)    │
│  applyTenantTheme(config)                            │
│  <LayoutRenderer categories={site.categories} />     │
└─────────────┬──────────────────────────────────────────┘
              │
              ↓
┌─ Browser Render ──────────────────────────────────────┐
│  Hero Section (Config)                                │
│  Menu Section (Categories + Items)                    │
│  Steps Section (Config)                               │
│  Gallery Section (Config)                             │
│                                                       │
│  CSS Variables set: --brand-primary, --brand-accent   │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow: POST Request (Admin)

```
┌─ Admin Panel / Script ─────────────────────────┐
│  provisionSite({                               │
│    slug: "sushi-perfecto",                     │
│    name: "Sushi Perfecto",                     │
│    config: {...},                              │
│    categories: [...]                           │
│  })                                            │
└─────────────┬──────────────────────────────────┘
              │
              ↓
┌─ API Call ─────────────────────────────────────┐
│  POST /api/v1/admin/sites                      │
│  Headers: {                                    │
│    X-Admin-Key: "your-secret-key",             │
│    Content-Type: "application/json"            │
│  }                                             │
│  Body: SiteProvisionRequest                    │
└─────────────┬──────────────────────────────────┘
              │
              ↓
┌─ Backend (Express) ────────────────────────────┐
│  1. Validate X-Admin-Key                       │
│     → 401 if wrong                             │
│  2. Parse + validate request body              │
│     → 400 if invalid                           │
│  3. BEGIN TRANSACTION                          │
│  4. UPSERT into tenants                        │
│  5. GET tenantId                               │
│  6. DELETE FROM menu_categories WHERE ...      │
│  7. INSERT new categories + items              │
│  8. COMMIT TRANSACTION                         │
│  9. Fetch + return SiteResponse                │
└─────────────┬──────────────────────────────────┘
              │
              ↓
┌─ API Response ─────────────────────────────────┐
│  201 Created                                   │
│  {                                             │
│    "tenant": {...new data...},                 │
│    "categories": [...new menu...]              │
│  }                                             │
└─────────────┬──────────────────────────────────┘
              │
              ↓
┌─ Admin UI (Frontend) ───────────────────────────┐
│  Display SiteResponse for verification          │
│  Show success message                           │
│  Update cache / invalidate                      │
└──────────────────────────────────────────────────┘
```

---

## 📦 SiteResponse Format

```
SiteResponse {
  tenant: {
    slug: string              // "tacos-mohammedia"
    name: string              // "Makin Hir Tacos"
    timezone: string          // "Africa/Casablanca"
    currency: string          // "MAD"
    configJson: string        // "{...raw JSON...}"
  }
  categories: [
    {
      id: string              // UUID
      name: string            // "Tacos"
      sortOrder: number       // 1
      items: [
        {
          id: string          // UUID
          name: string        // "Tacos Cordon Bleu"
          description: string // "..."
          price: number       // 55.00
          imageUrl: string    // "https://..."
          isAvailable: bool   // true/false
        }
      ]
    }
  ]
}
```

---

## 🔐 Admin Request Format

```
SiteProvisionRequest {
  slug: string                // "sushi-perfecto"
  name: string                // "Sushi Perfecto"
  timezone: string            // "Europe/Berlin"
  currency: string            // "EUR"
  config: TenantConfig        // UI Layout + Branding JSON
  categories: [
    {
      name: string            // "Rolls"
      sortOrder: number       // 1
      items: [
        {
          name: string        // "California Roll"
          description: string // "..."
          price: number       // 12.50
          imageUrl: string    // "https://..."
          isAvailable: bool   // true
        }
      ]
    }
  ]
}
```

---

## ⚡ Request/Response Timeline

```
Time    Event                                     Status
────────────────────────────────────────────────────────
0ms     Frontend: resolveTenant()                 OK
5ms     Frontend: fetchSite("tacos-mohammedia")   PENDING
10ms    Backend: Receive GET request             OK
15ms    Backend: Query tenants table             OK
20ms    Backend: Query categories+items           OK
25ms    Backend: Format SiteResponse             OK
30ms    Backend: Send response (200)              OK
35ms    Frontend: Receive + parse JSON            OK
40ms    Frontend: parseConfigJson()               OK
45ms    Frontend: applyTenantTheme()             OK
50ms    Frontend: <LayoutRenderer />              OK
100ms   Browser: Render complete                 ✅ DONE
```

---

## 🚨 Error Handling

```
Frontend Request
        ↓
    ┌───┴───┐
    │       │
    ↓       ↓
  Backend  Network
  Error    Error
  (400/    (timeout/
   401/    CORS/
   404/    DNS)
   500)    
    │       │
    └───┬───┘
        ↓
   Handle in
   Frontend
   Fallback:
   defaultConfig
   + Demo UI
```

---

## 🎯 Single Source of Truth

**One GET request delivers everything:**

```
Before (Bad):
  GET /api/v1/public/tenant
  GET /api/v1/public/menu
  → 2 API calls, race conditions, complex state management

After (Good):
  GET /api/v1/public/site
  → 1 API call, atomic response, simple state management
```

---

## 🔄 Multi-Tenant Routing

```
URL                          Slug Resolved    Backend Query
────────────────────────────────────────────────────────────
localhost:5174/
?tenant=tacos-mohammedia     tacos-mohammedia SELECT WHERE slug=?
                             
localhost:5174/
?tenant=pizzeria-roma        pizzeria-roma    SELECT WHERE slug=?

localhost:5174/
?tenant=sushi-perfecto       sushi-perfecto   SELECT WHERE slug=?

Production:
tacos.flexibooker.com        tacos            SELECT WHERE slug=?

Production:
pizza.flexibooker.com        pizza            SELECT WHERE slug=?
```

---

## 📋 Implementation Order

```
PHASE 1: Database         15 Min
  └─ Create tables, indexes, constraints

PHASE 2: GET Endpoint     30 Min
  └─ Query tenant + categories/items
  └─ Format SiteResponse
  └─ Error handling

PHASE 3: POST Endpoint    30 Min
  └─ Validate X-Admin-Key
  └─ Upsert tenant + categories/items
  └─ Transactions

PHASE 4: CORS             10 Min
  └─ Headers konfigurieren

PHASE 5: Testing          20 Min
  └─ Curl commands
  └─ Frontend integration

TOTAL:                    ~2 Hours
```

---

## ✅ Ready Checklist

- [ ] Database Schema ok
- [ ] GET /api/v1/public/site works
- [ ] POST /api/v1/admin/sites works
- [ ] CORS Header set
- [ ] Error responses (400/401/404/500)
- [ ] Frontend loads without errors
- [ ] Menu renders with items
- [ ] Theme colors applied
- [ ] Multiple tenants work
- [ ] Admin provisioning works

**→ Deploy!** 🚀
