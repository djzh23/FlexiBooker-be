# 🎯 KOMPLETTES SETUP GUIDE - Frontend ist bereit!

## ✅ Status

**Frontend:** ✅ BEREIT
- ✅ Komponenten implementiert
- ✅ Fallback-Config vorhanden
- ✅ Error-Handling hinzugefügt
- ✅ Responsive Design
- ✅ TypeScript Types

**Backend:** ⏳ DEINE AUFGABE
- Database Schema
- Seeding-Daten
- API Endpoints
- Deployment

---

## 🚀 So sieht das Frontend aus

**Die Seite zeigt jetzt:**
1. **Hero Section** - Mit Willkommens-Nachricht
2. **Info Steps** - 5 Schritte des Systems
3. **Demo Gallery** - Placeholder Bilder
4. **Farbschema** - Orange (#FF6B35) + Blau (#004E89)

```
╔════════════════════════════════════════╗
║  🌮 DEMO MODE                          ║
║  Willkommen!                           ║
║  Dies ist eine Demo-Seite. Das        ║
║  Backend antwortet nicht...            ║
╠════════════════════════════════════════╣
║  1️⃣ Frontend (React + TypeScript)      ║
║  2️⃣ Backend (API)                      ║
║  3️⃣ JSON Config                        ║
║  4️⃣ Database                           ║
║  5️⃣ Live Deploy                        ║
╚════════════════════════════════════════╝
```

**Sobald Backend läuft → sieht es anders aus!**

---

## 📋 Datenfluss (Frontend-Seite)

```
User öffnet:
http://localhost:5173/?tenant=tacos-mohammedia
       ↓
Frontend laden
       ↓
fetchTenant("tacos-mohammedia") → API Call
       ↓
GET /api/v1/public/tenant
Header: X-Tenant: tacos-mohammedia
       ↓
Response: TenantResponse
{
  slug: "tacos-mohammedia",
  name: "Makin Hir Tacos",
  configJson: "{...}"
}
       ↓
Parse configJson → TenantConfig
       ↓
LayoutRenderer rendet Sections
       ↓
Browser zeigt personalisierte Seite
```

---

## 🔧 Was muss das Backend vorbereiten?

### 1. Database Schema (MySQL/PostgreSQL)

```sql
-- Tenants Tabelle
CREATE TABLE tenants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'MAD',
  timezone VARCHAR(255) NOT NULL,
  configJson LONGTEXT NOT NULL
);

-- Menu Kategorien
CREATE TABLE menu_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenantId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  sortOrder INT DEFAULT 0,
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- Menu Items
CREATE TABLE menu_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  categoryId INT NOT NULL,
  tenantId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  imageUrl VARCHAR(1024),
  isAvailable BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (categoryId) REFERENCES menu_categories(id),
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);
```

### 2. API Endpoints (Express/Node.js)

```typescript
// GET /api/v1/public/tenant
// Header: X-Tenant: tacos-mohammedia
// Response: TenantResponse (siehe unten)

// GET /api/v1/public/menu
// Header: X-Tenant: tacos-mohammedia
// Response: MenuResponse (siehe unten)
```

### 3. Seeding-Daten

Zwei Test-Tenants mit echten Menu-Items:
- **tacos-mohammedia** - Tacos Restaurant
- **pizzeria-roma** - Pizza Restaurant

(Detaillierte SQL-Queries siehe BACKEND_SETUP.md)

### 4. Response Types

#### TenantResponse
```typescript
{
  slug: string;
  name: string;
  currency: string;
  timezone: string;
  configJson: string; // ← JSON String (wird geparst!)
}
```

#### MenuResponse
```typescript
{
  categories: Array<{
    id: string;
    name: string;
    sortOrder: number;
    items: Array<{
      id: string;
      name: string;
      description?: string;
      price: number;
      imageUrl?: string;
      isAvailable: boolean;
    }>;
  }>;
}
```

---

## 💻 Backend-Implementierung (Step by Step)

### Step 1: Database Schema erstellen
```bash
mysql -u root -p < create_schema.sql
```

### Step 2: Seeding-Daten einfügen
```bash
mysql -u root -p < seed_data.sql
```

### Step 3: API Endpoints implementieren
```typescript
// backend/routes/public.ts
app.get('/api/v1/public/tenant', async (req, res) => {
  const slug = req.headers['x-tenant'];
  const tenant = await db.query(
    'SELECT * FROM tenants WHERE slug = ?',
    [slug]
  );
  if (!tenant) return res.status(404).json({});
  res.json(tenant[0]);
});

app.get('/api/v1/public/menu', async (req, res) => {
  const slug = req.headers['x-tenant'];
  // Get tenant ID from slug, then get categories and items
  res.json({ categories: [...] });
});
```

### Step 4: CORS konfigurieren
```typescript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Step 5: Starten
```bash
npm run start
# Server läuft auf http://localhost:5081
```

---

## 🧪 Testing

### Frontend Test
```bash
cd frontend
npm run dev
# http://localhost:5173/?tenant=tacos-mohammedia
```

### Backend Test (curl)
```bash
curl -H "X-Tenant: tacos-mohammedia" \
  http://localhost:5081/api/v1/public/tenant

curl -H "X-Tenant: tacos-mohammedia" \
  http://localhost:5081/api/v1/public/menu
```

### Beide zusammen
Wenn Frontend + Backend läuft:
1. Frontend lädt von Backend ✅
2. Konfiguration wird angewendet ✅
3. Menu-Items werden angezeigt ✅
4. Farben aus JSON werden gesetzt ✅

---

## 📊 Tenant-Konfiguration (JSON)

Dieses JSON definiert das Design + Layout:

```json
{
  "brand": {
    "primaryColor": "#FF6B35",
    "secondaryColor": "#004E89"
  },
  "contact": {
    "phone": "+212 6 12 34 56 78",
    "whatsapp": "+212 6 12 34 56 78"
  },
  "layout": {
    "showSampleShowcase": true,
    "hero": {
      "enabled": true,
      "badge": "Makin Hir Tacos",
      "title": "Le #1 French Tacos au Maroc",
      "description": "..."
    },
    "menuSection": { "enabled": true },
    "steps": { "enabled": true },
    "gallery": { "enabled": true }
  }
}
```

**Alles wird im `configJson` Feld gespeichert!**

---

## 🔄 Workflow nach Backend-Setup

```
1. User öffnet Frontend
   http://localhost:5173/?tenant=tacos-mohammedia

2. Frontend macht API Call
   GET /api/v1/public/tenant
   GET /api/v1/public/menu

3. Backend antwortet mit Daten + Config

4. Frontend rendet personalisierte Seite
   - Farben aus JSON
   - Menu-Items vom Backend
   - Layout Sections basierend auf Config

5. User sieht Tacos-Restaurant-Seite!
```

---

## 🛠️ Troubleshooting

### ❌ "Seite ist leer"
```
→ Backend antwortet nicht
→ Frontend fällt auf Demo-Config zurück
→ Sollte trotzdem Info-Seite zeigen
```

### ❌ "Keine Menu-Items"
```
→ Menu API antwortet nicht
→ Frontend zeigt nur Hero/Steps/Gallery
→ Check: Endpoint /api/v1/public/menu
```

### ❌ "Falsche Farben"
```
→ CSS-Variablen nicht gesetzt
→ Check: applyTenantTheme() wird aufgerufen
→ Check: primaryColor im configJson
```

### ✅ "Alles funktioniert"
```
→ Glückwunsch! 🎉
→ Du kannst nun neue Tenants hinzufügen
→ Jeder mit eigenem Design + Menu
```

---

## 📚 Wichtige Dateien

### Frontend
- [layoutRenderer.tsx](src/modules/tenant/layoutRenderer.tsx) - Haupt-Renderer
- [tenant.service.ts](src/modules/tenant/tenant.service.ts) - API Calls
- [LandingPage.tsx](src/pages/LandingPage.tsx) - Main Page
- [tenant.types.ts](src/modules/tenant/tenant.types.ts) - Typen

### Dokumentation
- [BACKEND_SETUP.md](BACKEND_SETUP.md) - Komplette Backend-Anleitung
- [CONFIG_REFERENCE.md](CONFIG_REFERENCE.md) - JSON-Dokumentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System-Design

---

## 🎯 Checkliste: Was Backend machen muss

### Datenbank
- [ ] MySQL/PostgreSQL installiert
- [ ] Database Schema erstellt (3 Tabellen)
- [ ] Seeding-Daten eingefügt (2 Tenants)
- [ ] Test-Abfrage: `SELECT * FROM tenants`

### Backend-API
- [ ] Express/Node.js Server läuft
- [ ] `/api/v1/public/tenant` Endpoint (mit X-Tenant Header)
- [ ] `/api/v1/public/menu` Endpoint (mit X-Tenant Header)
- [ ] CORS konfiguriert
- [ ] Läuft auf http://localhost:5081

### Integration
- [ ] Frontend lädt von Backend
- [ ] API antwortet mit korrektem JSON
- [ ] ConfigJson wird geparst
- [ ] Farben werden angewendet
- [ ] Menu-Items werden angezeigt

### Produktion
- [ ] SSL/HTTPS aktiviert
- [ ] Rate Limiting hinzugefügt
- [ ] Error Handling verbessert
- [ ] Database Backups
- [ ] Monitoring aktiv

---

## 🚀 Los geht's!

1. **Jetzt:** Lese [BACKEND_SETUP.md](BACKEND_SETUP.md)
2. **Dann:** Implementiere Database Schema
3. **Dann:** Implementiere API Endpoints
4. **Dann:** Teste Frontend ↔ Backend Integration
5. **Dann:** Deploye alles zusammen!

---

## 📞 Fragen?

- Frontend Issue? → Schaue [INDEX.md](INDEX.md)
- Backend Issue? → Schaue [BACKEND_SETUP.md](BACKEND_SETUP.md)
- JSON-Config? → Schaue [CONFIG_REFERENCE.md](CONFIG_REFERENCE.md)

---

**Backend-Setup ist die letzte Hürde!** 🏁

Nach dem Setup:
- ✅ Beliebig viele Tenants (Restaurants)
- ✅ Jeder mit eigenem Design + Menu
- ✅ Alles konfigurierbar via JSON
- ✅ Skalierbar für Production

**Viel Erfolg!** 🚀
