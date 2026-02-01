# 📌 BACKEND: Dein Action Plan (Copy-Paste)

**Drucke diese Seite aus oder speicher sie auf deinem Schreibtisch.**

---

## 🎯 DAS ZIEL

```
Frontend erwartet EINEN API-Call:
  GET /api/v1/public/site?slug=tacos-mohammedia
  
Backend liefert ALLES in EINER Response:
  {
    "tenant": {...},
    "categories": [{...items...}]
  }
  
Fertig! ✅
```

---

## 🔧 WAS DU IMPLEMENTIERST

```
┌─────────────────────────────────────────┐
│ GET /api/v1/public/site?slug=X          │
│ → Returns: SiteResponse                 │
│ → Error: 400/404/500                    │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ POST /api/v1/admin/sites                │
│ + Header: X-Admin-Key: secret           │
│ → Creates/Updates Tenant                │
│ → Returns: SiteResponse                 │
│ → Error: 400/401/500                    │
└─────────────────────────────────────────┘
```

---

## 💾 DATABASE SCHEMA (Copy-Paste)

```sql
CREATE TABLE tenants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  timezone VARCHAR(255) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  configJson LONGTEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE menu_categories (
  id VARCHAR(36) PRIMARY KEY,
  tenantId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  sortOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tenant_category (tenantId, name)
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
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);
```

---

## 🌐 GET ENDPOINT (Copy-Paste Code)

```typescript
app.get('/api/v1/public/site', async (req, res) => {
  try {
    // 1. Get slug from ?slug= or X-Tenant header
    const slug = req.query.slug || req.headers['x-tenant'];
    if (!slug) {
      return res.status(400).json({ error: 'Missing slug' });
    }

    // 2. Query tenant
    const [tenantRows] = await pool.query(
      'SELECT id, slug, name, timezone, currency, configJson FROM tenants WHERE slug = ?',
      [slug]
    );
    if (!tenantRows || tenantRows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    const tenant = tenantRows[0];

    // 3. Query categories + items
    const [itemRows] = await pool.query(`
      SELECT 
        c.id, c.name, c.sortOrder,
        i.id itemId, i.name itemName, i.description, i.price, i.imageUrl, i.isAvailable
      FROM menu_categories c
      LEFT JOIN menu_items i ON c.id = i.categoryId
      WHERE c.tenantId = ?
      ORDER BY c.sortOrder, c.name
    `, [tenant.id]);

    // 4. Format categories
    const catMap = new Map();
    itemRows.forEach(row => {
      if (!catMap.has(row.id)) {
        catMap.set(row.id, {
          id: row.id,
          name: row.name,
          sortOrder: row.sortOrder,
          items: []
        });
      }
      if (row.itemId) {
        catMap.get(row.id).items.push({
          id: row.itemId,
          name: row.itemName,
          description: row.description,
          price: parseFloat(row.price),
          imageUrl: row.imageUrl,
          isAvailable: row.isAvailable === 1
        });
      }
    });

    // 5. Return response
    res.json({
      tenant: {
        slug: tenant.slug,
        name: tenant.name,
        timezone: tenant.timezone,
        currency: tenant.currency,
        configJson: tenant.configJson
      },
      categories: Array.from(catMap.values())
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

---

## 🔐 POST ENDPOINT (Copy-Paste Code)

```typescript
app.post('/api/v1/admin/sites', async (req, res) => {
  try {
    // 1. Validate admin key
    if (req.headers['x-admin-key'] !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Parse + validate request
    const { slug, name, timezone, currency, config, categories } = req.body;
    if (!slug || !name || !timezone || !currency || !categories) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 3. Upsert tenant
    await pool.query(`
      INSERT INTO tenants (slug, name, timezone, currency, configJson)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        timezone = VALUES(timezone),
        currency = VALUES(currency),
        configJson = VALUES(configJson)
    `, [slug, name, timezone, currency, JSON.stringify(config)]);

    // 4. Get tenant ID
    const [tenantRows] = await pool.query('SELECT id FROM tenants WHERE slug = ?', [slug]);
    const tenantId = tenantRows[0].id;

    // 5. Delete old categories
    await pool.query('DELETE FROM menu_categories WHERE tenantId = ?', [tenantId]);

    // 6. Insert new categories + items
    for (const cat of categories) {
      const catId = require('crypto').randomUUID();
      await pool.query('INSERT INTO menu_categories (id, tenantId, name, sortOrder) VALUES (?, ?, ?, ?)',
        [catId, tenantId, cat.name, cat.sortOrder]);
      
      for (const item of cat.items) {
        await pool.query('INSERT INTO menu_items (id, categoryId, tenantId, name, description, price, imageUrl, isAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [require('crypto').randomUUID(), catId, tenantId, item.name, item.description, item.price, item.imageUrl, item.isAvailable !== false]);
      }
    }

    // 7. Return new site data (fetch + return)
    const [updatedTenant] = await pool.query('SELECT * FROM tenants WHERE slug = ?', [slug]);
    const [updatedItems] = await pool.query(`...same query as GET...`, [tenantId]);
    // Format + return SiteResponse

    res.status(201).json(siteResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

---

## 🧪 TEST COMMANDS (Copy-Paste in Terminal)

```bash
# GET
curl "http://localhost:5081/api/v1/public/site?slug=tacos-mohammedia" | jq .

# POST
curl -X POST "http://localhost:5081/api/v1/admin/sites" \
  -H "X-Admin-Key: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test",
    "name": "Test",
    "timezone": "Europe/Berlin",
    "currency": "EUR",
    "config": {"brand": {}},
    "categories": [{
      "name": "Starters",
      "sortOrder": 1,
      "items": [{"name": "Bread", "price": 5.00}]
    }]
  }'
```

---

## ⚙️ CONFIG

```bash
# Backend .env
ADMIN_API_KEY=your-very-secret-key-here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=flexibooker

# Frontend .env
VITE_ADMIN_KEY=your-very-secret-key-here
VITE_DEFAULT_TENANT=tacos-mohammedia
```

---

## ✅ FINAL CHECKLIST

- [ ] Tables erstellt
- [ ] GET /api/v1/public/site works (curl test)
- [ ] POST /api/v1/admin/sites works (curl test)
- [ ] CORS Header gesetzt
- [ ] npm run dev im Frontend
- [ ] http://localhost:5174/?tenant=tacos-mohammedia
- [ ] Menu rendered
- [ ] No console errors
- [ ] **DONE!** 🚀

---

## 📖 FULL DOCS

Wenn du Details brauchst:
- BACKEND_SPECIFICATION.md (30 pages)
- BACKEND_ARCHITECTURE.md (diagrams)
- BACKEND_CHECKLIST.md (step-by-step)

---

## ⏱️ TIME

- Setup DB: 15 min
- Code GET: 20 min
- Code POST: 20 min
- Test: 10 min
- **Total: ~65 min**

---

**Let's Build!** 🚀
