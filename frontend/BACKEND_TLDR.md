# 🔥 BACKEND: Die Essentials (TL;DR)

**Für Entwickler die es schnell verstehen wollen.**

---

## ⚡ Was du implementieren musst

### 1️⃣ GET /api/v1/public/site

**Input:** `?slug=tacos-mohammedia` oder `X-Tenant: tacos-mohammedia`  
**Output:** Ein JSON mit Tenant + Menu (alles zusammen!)

```json
{
  "tenant": {
    "slug": "tacos-mohammedia",
    "name": "Makin Hir Tacos",
    "timezone": "Africa/Casablanca",
    "currency": "MAD",
    "configJson": "{...JSON String...}"
  },
  "categories": [
    {
      "id": "uuid",
      "name": "Tacos",
      "sortOrder": 1,
      "items": [
        {
          "id": "uuid",
          "name": "Tacos Cordon Bleu",
          "price": 55.00,
          "description": "...",
          "imageUrl": "https://...",
          "isAvailable": true
        }
      ]
    }
  ]
}
```

### 2️⃣ POST /api/v1/admin/sites

**Header:** `X-Admin-Key: your-secret`  
**Input:** Neue Tenant-Daten + Menu  
**Output:** Samma SiteResponse wie GET

```json
{
  "slug": "sushi-perfecto",
  "name": "Sushi Perfecto",
  "timezone": "Europe/Berlin",
  "currency": "EUR",
  "config": { "brand": {...}, "layout": {...} },
  "categories": [
    {
      "name": "Rolls",
      "sortOrder": 1,
      "items": [
        { "name": "California", "price": 12.50, ... }
      ]
    }
  ]
}
```

---

## 🗄️ Database (einfach)

Drei Tabellen. Kopiere das Schema:

```sql
tenants → id, slug (UNIQUE), name, timezone, currency, configJson (LONGTEXT)
menu_categories → id, tenantId (FK), name, sortOrder
menu_items → id, categoryId (FK), tenantId (FK), name, price, imageUrl, isAvailable
```

**Wichtig:** `configJson` ist ein **String**, nicht JSON!

---

## 🔑 Der Workflow

```
Besucher öffnet: http://localhost:5174/?tenant=tacos-mohammedia

Frontend macht: GET /api/v1/public/site?slug=tacos-mohammedia

Backend:
  1. SELECT * FROM tenants WHERE slug = ?
  2. SELECT categories + items WHERE tenantId = ?
  3. Kombiniere zu SiteResponse
  4. Return JSON

Frontend parst configJson → Theme-Farben + Layout
Browser zeigt personalisierte Seite
```

---

## 💻 Code (Express.js schnell geschrieben)

### GET Endpoint

```typescript
app.get('/api/v1/public/site', async (req, res) => {
  const slug = req.query.slug || req.headers['x-tenant'];
  
  if (!slug) return res.status(400).json({ error: 'Missing slug' });
  
  // Tenant
  const tenant = await db.query('SELECT * FROM tenants WHERE slug = ?', [slug]);
  if (!tenant) return res.status(404).json({ error: 'Not found' });
  
  // Categories + Items
  const items = await db.query(`
    SELECT c.id, c.name, c.sortOrder,
           i.id itemId, i.name itemName, i.price, i.imageUrl, i.isAvailable
    FROM menu_categories c
    LEFT JOIN menu_items i ON c.id = i.categoryId
    WHERE c.tenantId = ?
    ORDER BY c.sortOrder
  `, [tenant.id]);
  
  // Format
  const categories = groupByCategory(items);
  
  res.json({ tenant, categories });
});
```

### POST Endpoint

```typescript
app.post('/api/v1/admin/sites', async (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { slug, name, timezone, currency, config, categories } = req.body;
  
  // Upsert Tenant
  await db.query(`
    INSERT INTO tenants (slug, name, timezone, currency, configJson)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      name = VALUES(name),
      timezone = VALUES(timezone),
      currency = VALUES(currency),
      configJson = VALUES(configJson)
  `, [slug, name, timezone, currency, JSON.stringify(config)]);
  
  // Get ID
  const tenant = await db.query('SELECT id FROM tenants WHERE slug = ?', [slug]);
  
  // Delete old categories
  await db.query('DELETE FROM menu_categories WHERE tenantId = ?', [tenant.id]);
  
  // Insert new categories + items
  for (const cat of categories) {
    const catId = uuidv4();
    await db.query('INSERT INTO menu_categories VALUES (?, ?, ?, ?)', 
      [catId, tenant.id, cat.name, cat.sortOrder]);
    
    for (const item of cat.items) {
      await db.query('INSERT INTO menu_items VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), tenant.id, catId, item.name, item.description, 
         item.price, item.imageUrl, item.isAvailable]);
    }
  }
  
  // Return new SiteResponse
  const site = await fetchSiteData(slug);
  res.status(201).json(site);
});
```

---

## 🧪 Testen (Copy-Paste)

```bash
# GET
curl http://localhost:5081/api/v1/public/site?slug=tacos-mohammedia

# POST
curl -X POST http://localhost:5081/api/v1/admin/sites \
  -H "X-Admin-Key: secret" \
  -d '{"slug":"test","name":"Test",...}'
```

---

## ✅ Checklist (5 Min)

- [ ] Schema in DB
- [ ] GET /api/v1/public/site works
- [ ] POST /api/v1/admin/sites works
- [ ] CORS Header gesetzt
- [ ] curl test erfolgreich
- [ ] Frontend zeigt Daten

---

## 🚀 Fertig!

Wenn das funktioniert, lädt Frontend sich selbst. Keine zusätzlichen Calls nötig. **Single Source of Truth!** 🎯
