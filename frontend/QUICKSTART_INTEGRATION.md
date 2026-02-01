# ⚡ Quick Start: Frontend + Backend Integration

Minimale Schritte um alles zum Laufen zu bringen.

---

## 🚀 Backend Seite

### 1. Database Setup
```bash
mysql -u root -p < setup.sql
# Oder: Nutze setup.sql als Template und führe die Inserts in deiner DB aus
```

### 2. Implementiere 1 Endpoint
```
GET /api/v1/public/site?slug=tacos-mohammedia
```

**Response (SiteResponse):**
```json
{
  "tenant": {
    "slug": "tacos-mohammedia",
    "name": "Makin Hir Tacos",
    "timezone": "Africa/Casablanca",
    "currency": "MAD",
    "configJson": "{...}"
  },
  "categories": [
    {
      "id": "...",
      "name": "Tacos",
      "sortOrder": 1,
      "items": [...]
    }
  ]
}
```

### 3. CORS Header
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Headers: X-Tenant, Content-Type
```

---

## 🎨 Frontend Seite

### 1. Services nutzen
✅ Bereits implementiert in:
- `src/modules/site/site.service.ts` → `fetchSite()`
- `src/modules/site/admin.service.ts` → `provisionSite()`
- `src/pages/LandingPage.tsx` → nutzt `fetchSite()`

### 2. Starten
```bash
cd frontend
npm install
npm run dev
```

### 3. Testen
```
http://localhost:5174/?tenant=tacos-mohammedia
```

---

## 🔄 Workflow: Neue Seite (z.B. Sushi)

### Schritt 1: Tenant-Config vorbereiten

**Datei:** `tenant-configs/sushi-perfecto.json`
```json
{
  "brand": {
    "primaryColor": "#D32F2F",
    "secondaryColor": "#FFF59D"
  },
  "contact": {
    "phone": "+49 30 123456",
    "whatsapp": "+49 30 123456"
  },
  "layout": {
    "showSampleShowcase": true,
    "hero": {
      "enabled": true,
      "badge": "Sushi Perfecto | Berlin",
      "title": "Premium Sushi",
      "description": "Finest ingredients, handcrafted rolls",
      "backgroundImage": "https://..."
    },
    "menuSection": {
      "enabled": true,
      "title": "Our Rolls"
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
}
```

### Schritt 2: Backend Provisioning

**Option A: Via Backend-Admin-Endpoint (empfohlen)**
```bash
curl -X POST http://localhost:5081/api/v1/admin/sites \
  -H "X-Admin-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "sushi-perfecto",
    "name": "Sushi Perfecto",
    "timezone": "Europe/Berlin",
    "currency": "EUR",
    "config": {...JSON aus tenant-configs/sushi-perfecto.json...},
    "categories": [
      {
        "name": "Rolls",
        "sortOrder": 1,
        "items": [
          {
            "name": "California Roll",
            "description": "...",
            "price": 12.50,
            "imageUrl": "...",
            "isAvailable": true
          }
        ]
      }
    ]
  }'
```

**Option B: Via SQL (wenn kein Admin-Endpoint)**
```sql
INSERT INTO tenants (slug, name, timezone, currency, configJson)
VALUES ('sushi-perfecto', 'Sushi Perfecto', 'Europe/Berlin', 'EUR', '{...configJson...}');

INSERT INTO menu_categories (tenantId, name, sortOrder)
VALUES (LAST_INSERT_ID(), 'Rolls', 1);

-- Dann items einfügen ...
```

**Option C: Frontend-UI (optional, später implementieren)**
- Admin-Interface in React
- Nutze `provisionSite()` aus `admin.service.ts`
- POST-Response sofort im UI anzeigen

### Schritt 3: Testen
```bash
# Backend läuft
npm run dev:backend

# Frontend läuft
cd frontend
npm run dev

# Im Browser:
http://localhost:5174/?tenant=sushi-perfecto
```

---

## 📝 Was passiert intern

```
User öffnet: http://localhost:5174/?tenant=sushi-perfecto
  ↓
Frontend resolveTenant() = "sushi-perfecto"
  ↓
useEffect() aufgerufen
  ↓
fetchSite("sushi-perfecto")
  ↓
GET /api/v1/public/site?slug=sushi-perfecto  (oder X-Tenant Header)
  ↓
Backend liest slug, queriert DB:
  - SELECT * FROM tenants WHERE slug = "sushi-perfecto"
  - SELECT * FROM menu_categories WHERE tenantId = ... ORDER BY sortOrder
  - SELECT * FROM menu_items WHERE categoryId = ... ORDER BY sortOrder
  ↓
Backend liefert SiteResponse
  ↓
Frontend speichert in State: siteData
  ↓
parseConfigJson(tenant.configJson) → TenantConfig
  ↓
applyTenantTheme(config) → CSS-Variablen setzen
  ↓
LayoutRenderer rendert mit config.layout + menuCategories
  ↓
Browser zeigt personalisierte Seite ✨
```

---

## 🛠️ Troubleshooting

| Problem | Reason | Fix |
|---------|--------|-----|
| "404 Tenant not found" | Slug in URL ≠ DB slug | Prüfe slug exakt (case-sensitive?) |
| Demo-Seite statt echtes Menü | Backend antwortet nicht | `curl -H "X-Tenant: ..." localhost:5081/api/v1/public/site` |
| Falsche Farben | configJson fehlerhaft | JSON.parse() in Browser-Console testen |
| CORS Error | Backend hat CORS nicht | `Access-Control-Allow-Origin` Header setzen |
| Items haben falsche Kategorie | Items nicht mit richtiger categoryId | Prüfe Foreign Key in DB |

---

## 📚 Weiterführende Guides

- **Detaillierte Integration**: [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)
- **Backend-Anforderungen**: [BACKEND_SETUP.md](BACKEND_SETUP.md) (oder Backend-Repo docs)
- **Config JSON-Struktur**: [CONFIG_REFERENCE.md](CONFIG_REFERENCE.md)
- **Architektur**: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## ✅ Fertig?

- [ ] Backend hat `/api/v1/public/site` Endpoint
- [ ] CORS konfiguriert
- [ ] Min. 1 Tenant in DB mit configJson
- [ ] Frontend startet ohne Fehler
- [ ] `http://localhost:5174/?tenant=tacos-mohammedia` zeigt Menü
- [ ] Neue Config hinzufügen und testen

**Let's Go!** 🚀
