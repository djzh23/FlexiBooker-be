# ✅ BACKEND IMPLEMENTATION CHECKLIST

**Drucke diese Checkliste aus oder nutze sie zum Abhaken.**

---

## 🎯 Phase 1: Database Setup (15 Min)

```sql
-- Kopiere diese Schema in deine Database

CREATE TABLE tenants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  timezone VARCHAR(255) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  configJson LONGTEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
);

CREATE TABLE menu_categories (
  id VARCHAR(36) PRIMARY KEY,
  tenantId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  sortOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tenant_category (tenantId, name),
  INDEX idx_tenant (tenantId)
);

CREATE TABLE menu_items (
  id VARCHAR(36) PRIMARY KEY,
  categoryId VARCHAR(36) NOT NULL,
  tenantId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  imageUrl VARCHAR(1024),
  isAvailable BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES menu_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_category (categoryId),
  INDEX idx_tenant (tenantId)
);
```

### ✅ Checklist Phase 1:
- [ ] Tables erstellt
- [ ] Foreign Keys konfiguriert
- [ ] Indices gesetzt
- [ ] Seed data eingefügt (tacos-mohammedia, pizzeria-roma)

---

## 🌐 Phase 2: GET /api/v1/public/site (30 Min)

### Anforderungen:

- [ ] **Endpoint existiert**: `GET /api/v1/public/site`
- [ ] **Tenant Identifizierung**: 
  - [ ] Query Parameter: `?slug=tacos-mohammedia`
  - [ ] ODER Header: `X-Tenant: tacos-mohammedia`
- [ ] **Request Validation**:
  - [ ] Slug/Tenant-Header ist pflicht (400 if missing)
  - [ ] Slug existiert in DB (404 if not found)
- [ ] **Response Format** (SiteResponse):
  ```json
  {
    "tenant": {
      "slug": "...",
      "name": "...",
      "timezone": "...",
      "currency": "...",
      "configJson": "..." // RAW JSON STRING
    },
    "categories": [
      {
        "id": "...",
        "name": "...",
        "sortOrder": 1,
        "items": [
          {
            "id": "...",
            "name": "...",
            "description": "...",
            "price": 55.00,
            "imageUrl": "...",
            "isAvailable": true
          }
        ]
      }
    ]
  }
  ```
- [ ] **Database Queries**:
  - [ ] SELECT tenant by slug
  - [ ] LEFT JOIN categories + items
  - [ ] ORDER BY sortOrder + name
  - [ ] Group by category (im Code, nicht in SQL)

### Database Query:

```sql
SELECT 
  c.id,
  c.name,
  c.sortOrder,
  i.id AS itemId,
  i.name AS itemName,
  i.description,
  i.price,
  i.imageUrl,
  i.isAvailable
FROM menu_categories c
LEFT JOIN menu_items i ON c.id = i.categoryId
WHERE c.tenantId = ?
ORDER BY c.sortOrder ASC, c.name ASC
```

### ✅ Checklist Phase 2:
- [ ] Endpoint registriert
- [ ] Slug/Header Parsing funktioniert
- [ ] Tenant-Lookup funktioniert
- [ ] Category + Item JOIN funktioniert
- [ ] Response-Formatierung korrekt
- [ ] Error-Responses (400/404) korrekt
- [ ] Preise sind Dezimalzahlen (nicht Strings)
- [ ] isAvailable ist Boolean (nicht 0/1)

---

## 🔐 Phase 3: POST /api/v1/admin/sites (30 Min)

### Anforderungen:

- [ ] **Endpoint existiert**: `POST /api/v1/admin/sites`
- [ ] **Header-Validierung**:
  - [ ] Content-Type: application/json
  - [ ] X-Admin-Key: (aus env.ADMIN_API_KEY)
  - [ ] Falsche Key = 401 Unauthorized
- [ ] **Request Body Validation**:
  - [ ] slug (erforderlich, unique)
  - [ ] name (erforderlich)
  - [ ] timezone (erforderlich)
  - [ ] currency (erforderlich)
  - [ ] config (JSON Object, als String speichern)
  - [ ] categories (Array, minimum 1)
  - [ ] categories[].items (Array)
- [ ] **Upsert Logic**:
  - [ ] Slug nicht vorhanden? → INSERT
  - [ ] Slug existiert? → UPDATE
- [ ] **Category/Item Handling**:
  - [ ] DELETE all existing categories/items für Tenant
  - [ ] INSERT neue categories
  - [ ] INSERT neue items pro category
- [ ] **Response**: Volle SiteResponse (wie GET)

### Request Body Beispiel:

```json
{
  "slug": "sushi-perfecto",
  "name": "Sushi Perfecto",
  "timezone": "Europe/Berlin",
  "currency": "EUR",
  "config": {
    "brand": { "primaryColor": "#D32F2F" },
    "contact": { "phone": "+49 30 123" },
    "layout": { "showSampleShowcase": true }
  },
  "categories": [
    {
      "name": "Rolls",
      "sortOrder": 1,
      "items": [
        {
          "name": "California",
          "description": "...",
          "price": 12.50,
          "imageUrl": "...",
          "isAvailable": true
        }
      ]
    }
  ]
}
```

### ✅ Checklist Phase 3:
- [ ] Endpoint registriert
- [ ] X-Admin-Key Validierung
- [ ] Request Body Parsing
- [ ] Slug Normalisierung (lowercase?)
- [ ] Tenant INSERT logic
- [ ] Tenant UPDATE logic
- [ ] Category/Item DELETE vorher
- [ ] Category INSERT mit UUID
- [ ] Item INSERT mit UUID
- [ ] config als JSON String speichern
- [ ] Transaktionen (atomare Operationen)
- [ ] Response SiteResponse zurückgeben
- [ ] Error responses (400/401/500)

---

## 🔌 Phase 4: CORS + Headers (10 Min)

```typescript
// Express.js Beispiel
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:5173',  // Frontend URL
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Tenant', 'X-Admin-Key'],
  credentials: false
}));

// Oder manuell:
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Tenant, X-Admin-Key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});
```

### ✅ Checklist Phase 4:
- [ ] CORS aktiviert
- [ ] Access-Control-Allow-Origin = localhost:5173 (lokal)
- [ ] Access-Control-Allow-Headers includes X-Tenant, X-Admin-Key
- [ ] OPTIONS requests funktionieren

---

## 🧪 Phase 5: Testing (20 Min)

### Test 1: GET Endpoint (Query Param)
```bash
curl -i "http://localhost:5081/api/v1/public/site?slug=tacos-mohammedia"
```
✅ Expected:
- Status: 200
- Body: SiteResponse mit categories

### Test 2: GET Endpoint (Header)
```bash
curl -i -H "X-Tenant: tacos-mohammedia" "http://localhost:5081/api/v1/public/site"
```
✅ Expected: 200 + SiteResponse

### Test 3: GET Endpoint (404)
```bash
curl -i "http://localhost:5081/api/v1/public/site?slug=unknown"
```
✅ Expected: 404 + error message

### Test 4: GET Endpoint (400)
```bash
curl -i "http://localhost:5081/api/v1/public/site"
```
✅ Expected: 400 + error message

### Test 5: POST Endpoint (New Tenant)
```bash
curl -X POST "http://localhost:5081/api/v1/admin/sites" \
  -H "X-Admin-Key: secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test-bistro",
    "name": "Test Bistro",
    "timezone": "Europe/Berlin",
    "currency": "EUR",
    "config": {"brand": {}},
    "categories": [
      {
        "name": "Starters",
        "sortOrder": 1,
        "items": [{"name": "Bread", "price": 5.00}]
      }
    ]
  }'
```
✅ Expected: 201 Created + SiteResponse

### Test 6: POST Endpoint (Update Tenant)
```bash
# Gleicher curl wie Test 5
```
✅ Expected: 200 OK + updated SiteResponse

### Test 7: POST Endpoint (Wrong Admin Key)
```bash
curl -X POST "http://localhost:5081/api/v1/admin/sites" \
  -H "X-Admin-Key: wrong-key" \
  -d '{...}'
```
✅ Expected: 401 Unauthorized

### ✅ Checklist Phase 5:
- [ ] Test 1 erfolgreich
- [ ] Test 2 erfolgreich
- [ ] Test 3 erfolgreich
- [ ] Test 4 erfolgreich
- [ ] Test 5 erfolgreich
- [ ] Test 6 erfolgreich (Update)
- [ ] Test 7 erfolgreich (Unauthorized)

---

## 🎨 Phase 6: Frontend Integration (10 Min)

```bash
# Terminal 1: Backend starten
npm run dev  # oder node server.js

# Terminal 2: Frontend starten
cd frontend
npm run dev

# Browser:
http://localhost:5174/?tenant=tacos-mohammedia
```

### ✅ Checklist Phase 6:
- [ ] Backend läuft auf Port 5081
- [ ] Frontend läuft auf Port 5173/5174
- [ ] Browser zeigt keine CORS-Fehler
- [ ] Frontend lädt Menu-Items
- [ ] Farben werden korrekt angewendet
- [ ] Kategorien und Items sind sichtbar
- [ ] Mehrere Tenants testbar (?tenant=pizzeria-roma)

---

## 📦 Phase 7: Production Ready (30 Min)

### ✅ Checklist Phase 7:
- [ ] ADMIN_API_KEY konfiguriert (starker Secret)
- [ ] CORS_ORIGIN auf Production gesetzt
- [ ] Database Connection Pool konfiguriert
- [ ] Error Logging implementiert
- [ ] Rate Limiting (optional)
- [ ] SSL/HTTPS konfiguriert
- [ ] Database Backups aktiv
- [ ] Monitoring aktiv
- [ ] Load Balancer (falls nötig)
- [ ] Performance getestet (< 100ms response time)

---

## 🚀 FINAL VERIFICATION

```bash
# 1. Database prüfen
mysql -u root -p flexibooker -e "SELECT COUNT(*) FROM tenants;"

# 2. Backend Status
curl http://localhost:5081/api/v1/public/site?slug=tacos-mohammedia | jq .

# 3. Frontend laden
open http://localhost:5174/?tenant=tacos-mohammedia

# 4. Browser-Konsole prüfen
# - Keine Errors
# - Network-Tab zeigt 200 für /api/v1/public/site
# - UI rendert korrekt
```

---

## ✨ Fertig!

Wenn alle Checkboxes abhakt sind:
- ✅ Backend implementiert
- ✅ Frontend funktioniert
- ✅ Multi-Tenant system läuft
- ✅ Admin-Provisioning bereit

**Deployment Ready** 🚀
