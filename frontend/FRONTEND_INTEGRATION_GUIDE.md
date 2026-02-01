# 🔗 Frontend Integration Guide

Detaillierte Anleitung zur Kommunikation zwischen Frontend und Backend.

---

## 📋 Überblick

Das Frontend nutzt **eine einzige API-Quelle**: `GET /api/v1/public/site`

Diese liefert alles, was nötig ist:
- ✅ Tenant-Informationen (slug, name, currency, timezone)
- ✅ Layout-/Branding-Konfiguration (JSON)
- ✅ Kategorisiertes Menü (alle Items)

**Workflow:**
```
Frontend startet
    ↓
Slug bestimmen (Query-Param / DEFAULT / Header)
    ↓
GET /api/v1/public/site?slug=tacos-mohammedia
    ↓
Backend liefert SiteResponse
    ↓
Frontend parst configJson + rendert LayoutRenderer
    ↓
Benutzer sieht personalisierte Seite ✨
```

---

## 🌐 Public API (für Besucher)

### Endpoint: `GET /api/v1/public/site`

**Anforderung — 3 Wege, Tenant zu übergeben:**

```bash
# Option 1: Query Parameter (empfohlen für Frontend-Links)
GET /api/v1/public/site?slug=tacos-mohammedia

# Option 2: X-Tenant Header
GET /api/v1/public/site
Headers: X-Tenant: tacos-mohammedia

# Option 3: Subdomain (falls konfiguriert)
GET https://tacos.flexibooker.local/api/v1/public/site
```

**Response: `SiteResponse` (200 OK)**

```json
{
  "tenant": {
    "slug": "tacos-mohammedia",
    "name": "Makin Hir Tacos",
    "timezone": "Africa/Casablanca",
    "currency": "MAD",
    "configJson": "{\"brand\": {\"primaryColor\": \"#FF6B35\", ...}, \"layout\": {...}}"
  },
  "categories": [
    {
      "id": "3778c9fc-4c40-4f81-9082-4d801b060106",
      "name": "Tacos",
      "sortOrder": 1,
      "items": [
        {
          "id": "493c702b-4d85-465c-ac99-33225644e104",
          "name": "Tacos Cordon Bleu",
          "description": "Cordon bleu croustillant, fromage gratine et sauce andalouse maison.",
          "price": 55.00,
          "imageUrl": "https://images.unsplash.com/photo-1608039829574-6cffc50b1d5f?w=400",
          "isAvailable": true
        },
        {
          "id": "9223fb30-0cf7-4719-bf59-293a3f74d243",
          "name": "Tacos Chevre Miel",
          "description": "Chevre fondant, touche de miel du Rif et noix torrefiees.",
          "price": 55.00,
          "imageUrl": "https://images.unsplash.com/photo-1608039829743-23a84527b39b?w=400",
          "isAvailable": true
        }
      ]
    },
    {
      "id": "6fe1fad1-7d2f-4a44-9d4f-013a72b38057",
      "name": "Drinks",
      "sortOrder": 2,
      "items": [
        {
          "id": "012e3728-3028-4c21-830c-d2f139fcacc9",
          "name": "Coca Cola",
          "description": "Classic Coca Cola 33cl",
          "price": 15.00,
          "imageUrl": null,
          "isAvailable": true
        }
      ]
    }
  ]
}
```

**Fehlerbehandlung:**

```
400 Bad Request: slug/tenant-header fehlen oder ungültig
404 Not Found:   Tenant nicht in DB vorhanden
500 Server Error: Backend-Problem
```

---

## 🔐 Admin API (für Provisioning/Editing)

### Endpoint: `POST /api/v1/admin/sites`

**Anforderung:**

```bash
curl -X POST http://localhost:5081/api/v1/admin/sites \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your-admin-secret-key" \
  -d '{
    "slug": "new-tenant",
    "name": "Demo Bistro",
    "timezone": "Europe/Berlin",
    "currency": "EUR",
    "config": {
      "brand": {
        "primaryColor": "#FF5500",
        "secondaryColor": "#003366",
        "accentColor": "#1F77D2"
      },
      "contact": {
        "phone": "+49 30 123456",
        "whatsapp": "+49 30 123456",
        "email": "hello@demo-bistro.com"
      },
      "layout": {
        "showSampleShowcase": true,
        "hero": {
          "enabled": true,
          "badge": "Demo Bistro | Berlin",
          "title": "Premium Bistronomie",
          "description": "Finest cuisine...",
          "cta1": {"label": "Jetzt bestellen"},
          "cta2": {"label": "Menü ansehen"},
          "stats": [
            {"label": "Michelin Stars", "value": "2"}
          ],
          "backgroundImage": "https://..."
        },
        "menuSection": {
          "enabled": true,
          "title": "Unsere Specials"
        },
        "steps": {
          "enabled": true,
          "steps": [...]
        },
        "gallery": {
          "enabled": true,
          "images": [...]
        }
      }
    },
    "categories": [
      {
        "name": "Appetizers",
        "sortOrder": 1,
        "items": [
          {
            "name": "Carpaccio",
            "description": "Fresh tuna carpaccio...",
            "price": 18.50,
            "imageUrl": "https://...",
            "isAvailable": true
          }
        ]
      },
      {
        "name": "Main Courses",
        "sortOrder": 2,
        "items": [
          {
            "name": "Entrecote",
            "description": "Premium beef...",
            "price": 35.00,
            "imageUrl": "https://...",
            "isAvailable": true
          }
        ]
      }
    ]
  }'
```

**Response: `SiteResponse` (200 OK / 201 Created)**

Liefert sofort die neue/aktualisierte `SiteResponse`, damit du das Resultat im UI verifizieren kannst.

**Seiteneffekte:**
- Tenant existiert nicht → wird angelegt
- Tenant existiert → Alle Felder (slug ausgenommen) werden aktualisiert
- **Alle bisherigen Kategorien/Items dieses Tenants werden gelöscht und durch die neuen ersetzt**

**Fehlerbehandlung:**

```
400 Bad Request:  Fehlende Felder (slug, name, currency, etc.)
401 Unauthorized: X-Admin-Key fehlt oder ist falsch
500 Server Error: Backend-Problem beim Speichern
```

---

## 📦 Frontend: Welche Services nutzen?

### 1. **Public Site Loading** (`src/modules/site/site.service.ts`)

```typescript
import { fetchSite, parseConfigJson } from "../modules/site/site.service";

// Single call: Hole alles vom Backend
const site = await fetchSite("tacos-mohammedia");

// site.tenant       → TenantInfo
// site.categories   → MenuCategory[]
// site.tenant.configJson  → JSON String (muss geparst werden!)

// Parse Config-JSON
const config = parseConfigJson(site.tenant.configJson);
// config → TenantConfig (mit brand, contact, layout)
```

### 2. **Theme anwenden** (`src/modules/tenant/applyTheme.ts`)

```typescript
import { applyTenantTheme } from "../modules/tenant/applyTheme";

const config = parseConfigJson(site.tenant.configJson);
applyTenantTheme(config);
// Setzt CSS-Variablen: --brand-primary, --brand-accent, etc.
```

### 3. **Rendern mit LayoutRenderer** (`src/modules/tenant/layoutRenderer.tsx`)

```typescript
import { LayoutRenderer } from "../modules/tenant/layoutRenderer";

// Konvertiere Backend-Kategorien zu Display-Format
const displayCategories = site.categories.map((cat) => ({
  id: cat.id,
  name: cat.name,
  items: cat.items.map((item) => ({
    name: item.name,
    price: item.price,
    description: item.description || "",
    image: item.imageUrl || "fallback-url",
    tags: []  // Backend sendet keine Tags → Empty Array
  }))
}));

// Rendern
<LayoutRenderer 
  layout={config.layout} 
  menuCategories={displayCategories} 
/>
```

### 4. **Admin: Neue Tenant erstellen/aktualisieren** (`src/modules/site/admin.service.ts`)

```typescript
import { provisionSite } from "../modules/site/admin.service";
import type { SiteProvisionRequest } from "../modules/tenant/tenant.types";

const request: SiteProvisionRequest = {
  slug: "sushi-perfecto",
  name: "Sushi Perfecto",
  timezone: "Europe/Berlin",
  currency: "EUR",
  config: {
    brand: { primaryColor: "#C41E3A" },
    contact: { phone: "+49 30 111111" },
    layout: { showSampleShowcase: true, hero: {...}, ... }
  },
  categories: [
    {
      name: "Rolls",
      sortOrder: 1,
      items: [
        { name: "California Roll", price: 12.50, ... }
      ]
    }
  ]
};

const result = await provisionSite(request);
// result → SiteResponse (neu/aktualisiert)
// Direkt im UI anzeigen oder State updaten
```

---

## 🛠️ Frontend Code: Komplettes Beispiel

**`src/pages/LandingPage.tsx`**

```typescript
import { useEffect, useMemo, useState } from "react";
import { resolveTenant } from "../shared/config/env";
import { fetchSite, parseConfigJson } from "../modules/site/site.service";
import { applyTenantTheme } from "../modules/tenant/applyTheme";
import { LayoutRenderer } from "../modules/tenant/layoutRenderer";
import { defaultTenantConfig } from "../modules/tenant/defaultConfig";
import type { SiteResponse, TenantConfig } from "../modules/tenant/tenant.types";

export default function LandingPage() {
  const tenantSlug = useMemo(() => resolveTenant(), []);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [siteData, setSiteData] = useState<SiteResponse | null>(null);
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        // Single API call
        const site = await fetchSite(tenantSlug);
        
        // Parse config
        const config = parseConfigJson(site.tenant.configJson);
        
        setSiteData(site);
        setTenantConfig(config);
        applyTenantTheme(config);
        
        setState("ready");
      } catch (error: any) {
        console.error("Failed to load site:", error);
        
        // Fallback: Demo-Config
        setTenantConfig(defaultTenantConfig);
        applyTenantTheme(defaultTenantConfig);
        setSiteData(null);
        setState("ready");
      }
    })();
  }, [tenantSlug]);

  // === LOADING ===
  if (state === "loading") {
    return <div>Lädt...</div>;
  }

  // === ERROR ===
  if (state === "error") {
    return <div>Fehler: {errorMsg}</div>;
  }

  // === READY ===
  const displayCategories = (siteData?.categories || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    items: cat.items.map((item) => ({
      name: item.name,
      price: item.price,
      description: item.description || "",
      image: item.imageUrl || "https://via.placeholder.com/400",
      tags: []
    }))
  }));

  return (
    <div>
      <LayoutRenderer 
        layout={tenantConfig?.layout} 
        menuCategories={displayCategories} 
      />
    </div>
  );
}
```

---

## 🚀 Tenant-Discovery Flow

### Scenario 1: Mehrere Tenants im selben Frontend-Code

```bash
# Lokal: verschiedene Query-Parameter
http://localhost:5174/?tenant=tacos-mohammedia
http://localhost:5174/?tenant=pizzeria-roma
http://localhost:5174/?tenant=sushi-perfecto

# Frontend macht immer denselben Call, aber mit unterschiedlichem Slug
# → Backend liefert tenant-spezifische Daten
```

### Scenario 2: Production mit Subdomains

```bash
# Konfiguriere Backend-Middleware, um Subdomain zu lesen
https://tacos.flexibooker.local/
https://pizza.flexibooker.local/
https://sushi.flexibooker.local/

# Frontend ruft immer auf: GET /api/v1/public/site
# Backend extrahiert slug aus Subdomain und liefert richtige Daten
```

### Scenario 3: Staging mit Slug in URL

```bash
# Frontend-Repo wird deployed mit Fallback:
# 1. ?slug= Query-Param lesen
# 2. Fallback zu DEFAULT_TENANT = "tacos-mohammedia"

# Beispiel: Staging-Umgebung für Preview
https://staging.flexibooker.local/?slug=new-restaurant-preview
```

---

## 💾 Caching Strategy

**Backend Behavior:**
- Menu/Config ändern sich **nur** wenn Admin-Endpoint (`POST /api/v1/admin/sites`) aufgerufen wird
- Solange niemand `POST` macht, ist `GET /api/v1/public/site` **deterministic** (immer gleiche Response)

**Frontend Caching:**

```typescript
// Option 1: Browser LocalStorage
const cached = localStorage.getItem(`site:${tenantSlug}`);
if (cached) {
  const site = JSON.parse(cached);
  // Use cached site
}

// Nach Admin-Update: Cache invalidieren
localStorage.removeItem(`site:${tenantSlug}`);
```

```typescript
// Option 2: Memory Cache (einfach)
const siteCache = new Map<string, SiteResponse>();

async function fetchSiteWithCache(slug: string) {
  if (siteCache.has(slug)) {
    return siteCache.get(slug)!;
  }
  const site = await fetchSite(slug);
  siteCache.set(slug, site);
  return site;
}

// Nach Admin-Update: Cache invalidieren
siteCache.delete(slug);
```

---

## 🔑 Environment Variables

**Frontend (`.env` oder `.env.local`)**

```bash
# Proxy: Backend läuft auf 5081, Frontend auf 5173
# Vite proxy (in vite.config.ts) leitet /api → Backend
VITE_API_BASE_URL=

# Admin Key (für provisioning in UI)
VITE_ADMIN_KEY=your-secret-admin-key

# Default Tenant (wenn kein Query-Param)
VITE_DEFAULT_TENANT=tacos-mohammedia
```

**Backend (`.env`)**

```bash
# Admin Key (muss mit Frontend Secret matchen!)
ADMIN_API_KEY=your-secret-admin-key

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=...
DB_NAME=flexibooker

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## ⚡ Häufige Fehlerfälle

### ❌ Frontend zeigt nur Demo

**Reason:** Backend antwortet nicht
**Check:**
```bash
curl -H "X-Tenant: tacos-mohammedia" http://localhost:5081/api/v1/public/site
```
**Fix:** Backend starten, DB seeding checken

### ❌ CORS Error im Browser

**Error:** `Access-Control-Allow-Origin missing`
**Reason:** Backend hat CORS nicht konfiguriert
**Fix:** Backend muss `Access-Control-Allow-Origin: http://localhost:5173` Header setzen

### ❌ configJson ist null oder leer String

**Reason:** Tenant wurde ohne config in DB eingefügt
**Fix:** Stelle sicher, dass `POST /api/v1/admin/sites` aufgerufen wird mit vollständiger config

### ❌ Menu-Items fehlende oder falsche Preise

**Reason:** Items wurden nicht via Admin-Endpoint eingefügt
**Check:**
```bash
curl -X POST http://localhost:5081/api/v1/admin/sites \
  -H "X-Admin-Key: ..." \
  -d '{"slug": "test", "name": "Test", ...}'
```

### ❌ Slug-Matching-Problem

**Scenario:** Frontend sendet `tacos-mohammedia`, Backend kennt nur `tacos`
**Fix:** Query-Param / Header und Slug in DB müssen exakt matchen (case-sensitive oder normalized?)

---

## 🔄 Workflow: Neue Tenant schnell erstellen

### 1. Clone bestehende Config
```bash
cp tenant-configs/pizzeria-roma.json tenant-configs/sushi-perfecto.json
```

### 2. JSON anpassen
```json
{
  "brand": { "primaryColor": "#FF0000" },
  "contact": { "phone": "+49..." },
  "layout": { ... }
}
```

### 3. Via Admin-API provisionen (Option A: Backend)
```bash
curl -X POST http://localhost:5081/api/v1/admin/sites \
  -H "X-Admin-Key: secret" \
  -d '{"slug": "sushi-perfecto", "config": {...}}'
```

### 4. Oder: In Frontend-Editor eingebaut (Option B: Frontend UI)
```typescript
import { provisionSite } from "../modules/site/admin.service";

const newSite: SiteProvisionRequest = {
  slug: "sushi-perfecto",
  // ... rest of config ...
};

const result = await provisionSite(newSite);
// result → zeige im UI
```

### 5. Testen
```bash
http://localhost:5174/?tenant=sushi-perfecto
```

---

## 📊 TypeScript Types Referenz

```typescript
// src/modules/tenant/tenant.types.ts

export type TenantInfo = {
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  configJson: string;
};

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

export type SiteProvisionRequest = {
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  config: TenantConfig;
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
```

---

## ✅ Checklist: Ready for Production

- [ ] `fetchSite()` nutzt richtig `/api/v1/public/site`
- [ ] `parseConfigJson()` wird aufgerufen (String → Object)
- [ ] `applyTenantTheme()` setzt CSS-Variablen
- [ ] LayoutRenderer rendert kategorisiertes Menü richtig
- [ ] Slug-Resolving (Query-Param / DEFAULT / Header) funktioniert
- [ ] Error-Fallback auf defaultConfig funktioniert
- [ ] Admin-API (`provisionSite()`) kann Tenants erstellen
- [ ] CORS ist konfiguriert
- [ ] X-Admin-Key wird gesendet bei POST
- [ ] Mehrere Tenants (minimal 2) sind in DB + getestet
- [ ] Performance: Caching funktioniert

---

## 🎯 Nächste Schritte

1. Backend gibt `/api/v1/public/site` aus
2. Frontend lädt via `fetchSite()` und rendert
3. Teste mit mindestens 2 Tenants
4. Implementiere Admin-UI für Provisioning (optional)
5. Deploy!

**Questions? Konsultiere die Backend-Dokumentation für API-Details.**
