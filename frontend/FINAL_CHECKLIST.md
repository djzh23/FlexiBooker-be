# 🎯 FINAL CHECKLIST - Alles was du wissen musst

## ✅ FRONTEND: 100% BEREIT

```
✅ Komponenten:      layoutRenderer.tsx + 4 Sections
✅ Fehlerbehandlung: Fallback-Config wenn Backend offline
✅ Design:           Responsive + Modern
✅ Typen:            Vollständig TypeScript
✅ Dokumentation:    7 Docs + Code-Kommentare
```

## ⏳ BACKEND: Deine Aufgabe

**Dein To-Do (Priorität):**

1. ⏳ **Database erstellen** (15 Min)
   ```bash
   # Kopiere alles aus setup.sql
   mysql -u root -p < setup.sql
   ```

2. ⏳ **API Endpoints implementieren** (30-60 Min)
   ```
   GET /api/v1/public/tenant
   GET /api/v1/public/menu
   ```

3. ⏳ **CORS + Header konfigurieren** (5 Min)
   ```
   Header: X-Tenant: [slug]
   CORS: Origin http://localhost:5173
   ```

4. ⏳ **Testen** (10 Min)
   ```bash
   curl -H "X-Tenant: tacos-mohammedia" \
     http://localhost:5081/api/v1/public/tenant
   ```

---

## 📋 Was Frontend erwartet

### Request Flow
```
Frontend          →    Backend
GET /api/v1/public/tenant
Header: X-Tenant: tacos-mohammedia

                  ←    Response (200 OK)
{
  "slug": "tacos-mohammedia",
  "name": "Makin Hir Tacos",
  "currency": "MAD",
  "timezone": "Africa/Casablanca",
  "configJson": "{...JSON-String...}"
}
```

### Response Types

```typescript
// TenantResponse
{
  slug: string;
  name: string;
  currency: string;
  timezone: string;
  configJson: string;  // ← JSON String!
}

// MenuResponse
{
  categories: [
    {
      id: string;
      name: string;
      sortOrder: number;
      items: [
        {
          id: string;
          name: string;
          description: string;
          price: number;
          imageUrl: string;
          isAvailable: boolean;
        }
      ]
    }
  ]
}
```

---

## 🔧 Backend Implementierung (Schritt-für-Schritt)

### Schritt 1: Database
```bash
# setup.sql ausführen
mysql -u root -p flexibooker < setup.sql

# Prüfen:
mysql -u root -p flexibooker -e "SELECT * FROM tenants;"
```

### Schritt 2: Express Server
```typescript
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Database Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'flexibooker'
});

// Tenant Endpoint
app.get('/api/v1/public/tenant', async (req, res) => {
  try {
    const slug = req.headers['x-tenant'];
    
    if (!slug) {
      return res.status(400).json({ error: 'X-Tenant header required' });
    }

    const connection = await pool.getConnection();
    const [tenant] = await connection.query(
      'SELECT slug, name, currency, timezone, configJson FROM tenants WHERE slug = ?',
      [slug]
    );
    connection.release();

    if (!tenant || tenant.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json(tenant[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Menu Endpoint
app.get('/api/v1/public/menu', async (req, res) => {
  try {
    const slug = req.headers['x-tenant'];
    
    if (!slug) {
      return res.status(400).json({ error: 'X-Tenant header required' });
    }

    const connection = await pool.getConnection();
    
    // Get tenant ID
    const [tenantResult] = await connection.query(
      'SELECT id FROM tenants WHERE slug = ?',
      [slug]
    );

    if (!tenantResult || tenantResult.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenantId = tenantResult[0].id;

    // Get categories and items
    const [rows] = await connection.query(`
      SELECT c.id, c.name, c.sortOrder,
             i.id as itemId, i.name as itemName, i.description, 
             i.price, i.imageUrl, i.isAvailable
      FROM menu_categories c
      LEFT JOIN menu_items i ON c.id = i.categoryId
      WHERE c.tenantId = ?
      ORDER BY c.sortOrder, c.name
    `, [tenantId]);

    connection.release();

    // Format response
    const categoriesMap = {};
    rows.forEach((row) => {
      if (!categoriesMap[row.id]) {
        categoriesMap[row.id] = {
          id: row.id,
          name: row.name,
          sortOrder: row.sortOrder,
          items: []
        };
      }

      if (row.itemId) {
        categoriesMap[row.id].items.push({
          id: row.itemId,
          name: row.itemName,
          description: row.description,
          price: row.price,
          imageUrl: row.imageUrl,
          isAvailable: row.isAvailable
        });
      }
    });

    res.json({
      categories: Object.values(categoriesMap)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(5081, () => {
  console.log('Server running on http://localhost:5081');
});
```

### Schritt 3: Starten
```bash
node server.js
# Server läuft auf http://localhost:5081
```

### Schritt 4: Testen
```bash
# Terminal 1: Backend
node server.js

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Test API
curl -H "X-Tenant: tacos-mohammedia" http://localhost:5081/api/v1/public/tenant
curl -H "X-Tenant: tacos-mohammedia" http://localhost:5081/api/v1/public/menu

# Browser: Frontend
http://localhost:5173/?tenant=tacos-mohammedia
```

---

## 📊 Was passiert nach Backend-Setup

```
User öffnet Frontend
       ↓
Frontend lädt: http://localhost:5173/?tenant=tacos-mohammedia
       ↓
React Component: LandingPage
       ↓
useEffect → fetchTenant("tacos-mohammedia")
       ↓
API Call: GET /api/v1/public/tenant
Header: X-Tenant: tacos-mohammedia
       ↓
Backend Query: SELECT * FROM tenants WHERE slug = "tacos-mohammedia"
       ↓
Response: TenantResponse mit configJson
       ↓
Frontend: Parse configJson → TenantConfig
       ↓
Frontend: applyTenantTheme(config) → CSS-Variablen setzen
       ↓
Frontend: <LayoutRenderer layout={config.layout} />
       ↓
React rendet 4 Sections:
  1. HeroSection (mit Farben aus config)
  2. MenuSection (mit Items vom Backend)
  3. StepsSection (mit Steps aus config)
  4. GallerySection (mit Bildern aus config)
       ↓
Browser zeigt personalisierte Seite! 🎉
```

---

## 🎨 Was der User sieht

### Tacos Restaurant (tacos-mohammedia)
```
╔═══════════════════════════════════╗
║ 🌮 Makin Hir Tacos               ║
║ Le #1 French Tacos au Maroc     ║
║                                 ║
║ [Hero Image + Stats]            ║
║                                 ║
║ Tacos Cordon Bleu    55 MAD     ║
║ Tacos Chevre Miel    55 MAD     ║
║ ... (Menu Items)                ║
╚═══════════════════════════════════╝
```

### Pizza Restaurant (pizzeria-roma)
```
╔═══════════════════════════════════╗
║ 🍕 Pizzeria Roma                 ║
║ Authentische Italienische Pizza ║
║                                 ║
║ [Hero Image + Stats]            ║
║                                 ║
║ Margherita       80 MAD         ║
║ Pepperoni        90 MAD         ║
║ ... (Menu Items)                ║
╚═══════════════════════════════════╝
```

**Jeder Tenant:** Eigene Farben + Texte + Menu!

---

## 🚀 Deployment

### Development
```bash
# Terminal 1: Backend
npm run start

# Terminal 2: Frontend
npm run dev

# Browser: http://localhost:5173/?tenant=tacos-mohammedia
```

### Production
```bash
# Backend
node server.js              # oder pm2/docker

# Frontend
npm run build               # Static files generieren
npm run preview             # Oder zu Hosting deployen

# Environment
Backend Port: 5081 (oder Umgebungsvariable)
Frontend URL: https://yourdomain.com
API URL: https://api.yourdomain.com
```

---

## 📞 Häufige Fehler

### ❌ Frontend zeigt nur Demo-Seite
```
Grund:      Backend antwortet nicht
Lösung:     Backend starten & API testen
Check:      curl -H "X-Tenant: tacos-mohammedia" http://localhost:5081/api/v1/public/tenant
```

### ❌ Menu-Items werden nicht angezeigt
```
Reason:     Falsche Daten oder keine Items in DB
Solution:   Seeding SQL ausführen
Check:      SELECT COUNT(*) FROM menu_items;
```

### ❌ Falsche Farben
```
Reason:     CSS-Variablen nicht gesetzt
Solution:   applyTenantTheme() wird aufgerufen?
Check:      configJson hat primaryColor?
```

### ❌ CORS Error
```
Error:      Access-Control-Allow-Origin missing
Solution:   Backend hat CORS nicht konfiguriert
Fix:        app.use(cors({ origin: 'http://localhost:5173' }));
```

---

## ✅ Finale Checkliste

### Vor dem Go-Live

- [ ] Database Schema erstellt (setup.sql)
- [ ] 2 Test-Tenants in DB (tacos-mohammedia, pizzeria-roma)
- [ ] 30+ Test Menu-Items in DB
- [ ] Backend-API läuft auf Port 5081
- [ ] Frontend lädt von Backend
- [ ] Beide Browser-Tabs öffnen:
  - http://localhost:5173/?tenant=tacos-mohammedia
  - http://localhost:5173/?tenant=pizzeria-roma
- [ ] Menü-Items werden angezeigt
- [ ] Farben sind richtig
- [ ] Responsive auf Mobile

### Produktion

- [ ] SSL/HTTPS aktiviert
- [ ] Database Backups
- [ ] Error Logging
- [ ] Rate Limiting
- [ ] Monitoring aktiv
- [ ] Load Balancer (optional)

---

## 🎯 Nächste Schritte

1. **Jetzt:** setup.sql ausführen
2. **Dann:** API Endpoints implementieren
3. **Dann:** npm run dev
4. **Dann:** Browser testen
5. **Dann:** Deploy!

---

## 📚 Ressourcen

- [setup.sql](setup.sql) - Database Schema + Seeding
- [BACKEND_SETUP.md](BACKEND_SETUP.md) - Detaillierte Anleitung
- [FRONTEND_READY.md](FRONTEND_READY.md) - Frontend Status
- [CONFIG_REFERENCE.md](CONFIG_REFERENCE.md) - JSON-Config
- [ARCHITECTURE.md](ARCHITECTURE.md) - System Design

---

## 🎉 Fertig!

Das Frontend ist **100% bereit** und wartet nur auf dein Backend! 

Nach dem Setup:
- ✅ Beliebig viele Tenants (Restaurants)
- ✅ Jeder mit eigenem Design + Menu
- ✅ Vollständig skalierbar
- ✅ Production-ready

**Let's Go!** 🚀
