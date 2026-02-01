# 🔧 Backend Implementation Specification

**Für den Backend-Entwickler: Alles was nötig ist um die Frontend-Integration zu erfüllen.**

---

## 📋 Übersicht: Was Backend liefern muss

### 2 Public Endpoints

| Endpoint | Method | Purpose | Header/Query |
|----------|--------|---------|--------------|
| `/api/v1/public/site` | GET | Hole Tenant-Info + Menu | `?slug=X` oder `X-Tenant: X` |
| `/api/v1/admin/sites` | POST | Erstelle/Update Tenant | `X-Admin-Key: secret` |

### Database Schema

```sql
CREATE TABLE tenants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  timezone VARCHAR(255) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  configJson LONGTEXT NOT NULL,  -- JSON String
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE menu_categories (
  id VARCHAR(36) PRIMARY KEY,  -- UUID/GUID
  tenantId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  sortOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tenant_category (tenantId, name)
);

CREATE TABLE menu_items (
  id VARCHAR(36) PRIMARY KEY,  -- UUID/GUID
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

## 🌐 PUBLIC ENDPOINT 1: GET /api/v1/public/site

### Request

**3 Wege, Tenant zu übergeben (choose one):**

```bash
# Option 1: Query Parameter (RECOMMENDED)
GET /api/v1/public/site?slug=tacos-mohammedia

# Option 2: Header
GET /api/v1/public/site
X-Tenant: tacos-mohammedia

# Option 3: Subdomain (advanced)
GET /api/v1/public/site
Host: tacos.flexibooker.local
```

### Response: 200 OK

```json
{
  "tenant": {
    "slug": "tacos-mohammedia",
    "name": "Makin Hir Tacos",
    "timezone": "Africa/Casablanca",
    "currency": "MAD",
    "configJson": "{\"brand\": {\"primaryColor\": \"#FF6B35\", \"secondaryColor\": \"#004E89\", \"accentColor\": \"#1F77D2\"}, \"contact\": {\"phone\": \"+212 6 12 34 56 78\", \"whatsapp\": \"+212 6 12 34 56 78\", \"email\": \"hello@makintar.com\"}, \"layout\": {\"showSampleShowcase\": true, \"hero\": {...}, \"menuSection\": {...}, \"steps\": {...}, \"gallery\": {...}}}"
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
          "imageUrl": "https://images.unsplash.com/photo-1608039829574-6cffc50b1d5f?auto=format&fit=crop&w=1200&q=80",
          "isAvailable": true
        },
        {
          "id": "9223fb30-0cf7-4719-bf59-293a3f74d243",
          "name": "Tacos Chevre Miel",
          "description": "Chevre fondant, touche de miel du Rif et noix torrefiees.",
          "price": 55.00,
          "imageUrl": "https://images.unsplash.com/photo-1608039829743-23a84527b39b?auto=format&fit=crop&w=1200&q=80",
          "isAvailable": true
        },
        {
          "id": "686d6892-9425-414e-8f62-dc4b481f87b7",
          "name": "Tacos Cordon Bleu",
          "description": "Cordon bleu croustillant, fromage gratine et sauce andalouse maison.",
          "price": 55.00,
          "imageUrl": "https://images.unsplash.com/photo-1608039829574-6cffc50b1d5f?auto=format&fit=crop&w=1200&q=80",
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
        },
        {
          "id": "34e34744-5c97-4258-9110-e097120b893e",
          "name": "Fresh Orange Juice",
          "description": "100% fresh squeezed orange juice",
          "price": 25.00,
          "imageUrl": null,
          "isAvailable": true
        }
      ]
    },
    {
      "id": "14b76a07-34cc-4645-b8e5-074a4b9f6514",
      "name": "Desserts",
      "sortOrder": 3,
      "items": [
        {
          "id": "dbae3c06-f81b-4759-96b4-2de24291d8fc",
          "name": "Chocolate Cake",
          "description": "Rich chocolate cake with ice cream",
          "price": 40.00,
          "imageUrl": null,
          "isAvailable": true
        },
        {
          "id": "3ea28ee3-3214-4d0b-9b43-3d42f91748e3",
          "name": "Tiramisu",
          "description": "Classic Italian Tiramisu",
          "price": 35.00,
          "imageUrl": null,
          "isAvailable": true
        }
      ]
    }
  ]
}
```

### Error Responses

```json
// 400 Bad Request: slug/tenant fehlen
{
  "error": "Missing tenant identifier: ?slug= or X-Tenant header required"
}

// 404 Not Found: Tenant existiert nicht
{
  "error": "Tenant not found: tacos-unknown"
}

// 500 Server Error
{
  "error": "Internal server error"
}
```

### Database Query

```sql
-- 1. Get Tenant by slug
SELECT id, slug, name, timezone, currency, configJson 
FROM tenants 
WHERE slug = ? 
LIMIT 1;

-- 2. Get Categories + Items (ordered)
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
ORDER BY c.sortOrder ASC, c.name ASC, i.name ASC;
```

### Implementation Example (Express.js + MySQL)

```typescript
import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'flexibooker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// === PUBLIC ENDPOINT ===
app.get('/api/v1/public/site', async (req, res) => {
  try {
    // 1. Extract slug from query or header
    const slug = (req.query.slug as string) || (req.headers['x-tenant'] as string);

    if (!slug) {
      return res.status(400).json({
        error: 'Missing tenant identifier: ?slug= or X-Tenant header required'
      });
    }

    const connection = await pool.getConnection();

    // 2. Fetch tenant
    const [tenantRows] = await connection.query(
      'SELECT id, slug, name, timezone, currency, configJson FROM tenants WHERE slug = ? LIMIT 1',
      [slug.toLowerCase()] // normalize slug
    );

    if (!tenantRows || (tenantRows as any[]).length === 0) {
      connection.release();
      return res.status(404).json({
        error: `Tenant not found: ${slug}`
      });
    }

    const tenant = (tenantRows as any[])[0];
    const tenantId = tenant.id;

    // 3. Fetch categories + items
    const [itemRows] = await connection.query(`
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
      ORDER BY c.sortOrder ASC, c.name ASC, i.name ASC
    `, [tenantId]);

    connection.release();

    // 4. Format response
    const categoriesMap = new Map();

    (itemRows as any[]).forEach((row) => {
      if (!categoriesMap.has(row.id)) {
        categoriesMap.set(row.id, {
          id: row.id,
          name: row.name,
          sortOrder: row.sortOrder,
          items: []
        });
      }

      if (row.itemId) {
        categoriesMap.get(row.id).items.push({
          id: row.itemId,
          name: row.itemName,
          description: row.description,
          price: parseFloat(row.price), // IMPORTANT: convert to number
          imageUrl: row.imageUrl,
          isAvailable: row.isAvailable === 1 // convert tinyint to boolean
        });
      }
    });

    const categories = Array.from(categoriesMap.values());

    res.json({
      tenant: {
        slug: tenant.slug,
        name: tenant.name,
        timezone: tenant.timezone,
        currency: tenant.currency,
        configJson: tenant.configJson // ← Raw JSON String!
      },
      categories
    });
  } catch (error) {
    console.error('Error in GET /api/v1/public/site:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## 🔐 ADMIN ENDPOINT: POST /api/v1/admin/sites

### Request Headers

```
Content-Type: application/json
X-Admin-Key: your-secret-admin-key
```

**WICHTIG:** X-Admin-Key muss mit Backend Config matchen. Umgebungsvariable:
```bash
ADMIN_API_KEY=your-secret-admin-key
```

### Request Body

```json
{
  "slug": "new-tenant",
  "name": "Demo Bistro",
  "timezone": "Europe/Berlin",
  "currency": "EUR",
  "config": {
    "brand": {
      "primaryColor": "#FF5500",
      "secondaryColor": "#003366",
      "accentColor": "#1F77D2",
      "logoUrl": null
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
        "description": "Finest cuisine in Berlin",
        "cta1": { "label": "Jetzt bestellen" },
        "cta2": { "label": "Menü ansehen" },
        "stats": [
          { "label": "Years", "value": "10" },
          { "label": "Staff", "value": "15" }
        ],
        "backgroundImage": "https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1600&q=80"
      },
      "menuSection": {
        "enabled": true,
        "badge": "Carte",
        "title": "Unsere Specials",
        "description": "Handpicked dishes"
      },
      "steps": {
        "enabled": true,
        "badge": "Prozess",
        "title": "Deine Bestellung",
        "steps": [
          { "title": "Step 1", "subtitle": "Wählen", "detail": "Pick your dish" },
          { "title": "Step 2", "subtitle": "Customize", "detail": "Add extras" },
          { "title": "Step 3", "subtitle": "Zahlen", "detail": "Checkout" }
        ]
      },
      "gallery": {
        "enabled": true,
        "badge": "Ambiance",
        "title": "Fotos",
        "images": [
          "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600",
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"
        ]
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
          "description": "Fresh tuna carpaccio with citrus",
          "price": 18.50,
          "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400",
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
          "description": "Prime beef with truffle sauce",
          "price": 45.00,
          "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400",
          "isAvailable": true
        }
      ]
    }
  ]
}
```

### Response: 200 OK or 201 Created

**Returns the full SiteResponse** (same format as GET /api/v1/public/site):

```json
{
  "tenant": {
    "slug": "new-tenant",
    "name": "Demo Bistro",
    "timezone": "Europe/Berlin",
    "currency": "EUR",
    "configJson": "{...}"
  },
  "categories": [...]
}
```

### Error Responses

```json
// 400 Bad Request: Missing fields
{
  "error": "Invalid request: slug, name, timezone, currency, categories required"
}

// 401 Unauthorized: Wrong/missing X-Admin-Key
{
  "error": "Unauthorized: Invalid X-Admin-Key"
}

// 500 Server Error
{
  "error": "Failed to provision site"
}
```

### Implementation Logic

**Backend Behavior (wichtig!):**

1. **Slug nicht vorhanden** → INSERT new tenant
2. **Slug existiert** → UPDATE existing tenant
3. **Kategorien/Items** → DELETE ALL existing categories + items, dann INSERT neue

```typescript
app.post('/api/v1/admin/sites', async (req, res) => {
  try {
    // 1. Verify Admin Key
    const adminKey = req.headers['x-admin-key'] as string;
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid X-Admin-Key' });
    }

    // 2. Validate request
    const { slug, name, timezone, currency, config, categories } = req.body;
    
    if (!slug || !name || !timezone || !currency || !categories || !Array.isArray(categories)) {
      return res.status(400).json({
        error: 'Invalid request: slug, name, timezone, currency, categories required'
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 3. Upsert Tenant
      const slugLower = slug.toLowerCase();
      const configJsonString = JSON.stringify(config);

      const [tenantResult] = await connection.query(
        `INSERT INTO tenants (slug, name, timezone, currency, configJson)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           name = VALUES(name),
           timezone = VALUES(timezone),
           currency = VALUES(currency),
           configJson = VALUES(configJson),
           updatedAt = NOW()`,
        [slugLower, name, timezone, currency, configJsonString]
      );

      // Get tenant ID
      const [tenantRows] = await connection.query(
        'SELECT id FROM tenants WHERE slug = ?',
        [slugLower]
      );
      const tenantId = (tenantRows as any[])[0].id;

      // 4. DELETE all existing categories + items for this tenant
      await connection.query(
        'DELETE FROM menu_categories WHERE tenantId = ?',
        [tenantId]
      );

      // 5. INSERT new categories + items
      for (const cat of categories) {
        const categoryId = generateUUID(); // uuid or nanoid

        await connection.query(
          'INSERT INTO menu_categories (id, tenantId, name, sortOrder) VALUES (?, ?, ?, ?)',
          [categoryId, tenantId, cat.name, cat.sortOrder || 0]
        );

        if (cat.items && Array.isArray(cat.items)) {
          for (const item of cat.items) {
            const itemId = generateUUID();

            await connection.query(
              `INSERT INTO menu_items 
               (id, tenantId, categoryId, name, description, price, imageUrl, isAvailable)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                itemId,
                tenantId,
                categoryId,
                item.name,
                item.description || null,
                item.price,
                item.imageUrl || null,
                item.isAvailable !== false // default true
              ]
            );
          }
        }
      }

      await connection.commit();
      connection.release();

      // 6. Fetch + return the new SiteResponse (same as GET endpoint)
      const site = await fetchSiteData(slugLower); // reuse GET logic
      const statusCode = (tenantResult as any).affectedRows === 1 ? 200 : 201;
      res.status(statusCode).json(site);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error in POST /api/v1/admin/sites:', error);
    res.status(500).json({ error: 'Failed to provision site' });
  }
});

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

---

## 🧪 Testing: Curl Commands

### Test GET Endpoint

```bash
# GET with query param
curl -i http://localhost:5081/api/v1/public/site?slug=tacos-mohammedia

# GET with header
curl -i -H "X-Tenant: tacos-mohammedia" http://localhost:5081/api/v1/public/site

# Expected: 200 OK with SiteResponse
```

### Test POST Endpoint (Provisioning)

```bash
curl -X POST http://localhost:5081/api/v1/admin/sites \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your-secret-key" \
  -d '{
    "slug": "test-bistro",
    "name": "Test Bistro",
    "timezone": "Europe/Berlin",
    "currency": "EUR",
    "config": {
      "brand": {"primaryColor": "#FF5500"},
      "contact": {"phone": "+49 30 123456"},
      "layout": {"showSampleShowcase": true}
    },
    "categories": [
      {
        "name": "Starters",
        "sortOrder": 1,
        "items": [
          {
            "name": "Bread",
            "description": "Fresh bread",
            "price": 5.00,
            "isAvailable": true
          }
        ]
      }
    ]
  }'

# Expected: 201 Created with SiteResponse
```

### Test Error Cases

```bash
# 400: Missing slug
curl -i http://localhost:5081/api/v1/public/site

# 404: Unknown tenant
curl -i http://localhost:5081/api/v1/public/site?slug=unknown

# 401: Wrong admin key
curl -X POST http://localhost:5081/api/v1/admin/sites \
  -H "X-Admin-Key: wrong-key" \
  -d '...'
```

---

## 📝 Implementation Checklist

- [ ] Database schema erstellt (tenants, menu_categories, menu_items)
- [ ] GET /api/v1/public/site implementiert mit slug/X-Tenant
- [ ] Correct Response Format (SiteResponse with nested categories)
- [ ] Error handling (400/404/500)
- [ ] POST /api/v1/admin/sites implementiert
- [ ] X-Admin-Key validation
- [ ] Upsert logic (INSERT if new, UPDATE if exists)
- [ ] Category/Item deletion before re-insert
- [ ] Transaction handling (atomic operations)
- [ ] CORS Header konfiguriert
  ```
  Access-Control-Allow-Origin: http://localhost:5173
  Access-Control-Allow-Headers: Content-Type, X-Tenant, X-Admin-Key
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  ```
- [ ] Slug normalization (lowercase?)
- [ ] Price conversion (DECIMAL → float)
- [ ] isAvailable conversion (tinyint/boolean)
- [ ] configJson als String speichern + zurückgeben
- [ ] Test with curl commands
- [ ] Test with Frontend (npm run dev)

---

## 🚀 Deployment Checklist

- [ ] ADMIN_API_KEY in production gesetzt (starker Secret)
- [ ] CORS_ORIGIN auf Production-URL gesetzt
- [ ] Database Backups konfiguriert
- [ ] Error Logging aktiv
- [ ] Rate Limiting (optional, aber empfohlen)
- [ ] SSL/HTTPS erzwungen
- [ ] Database Connection Pooling konfiguriert
- [ ] Load Balancer (falls mehrere Backend-Instanzen)

---

## 🎯 Nächste Schritte

1. **Schema**: setup.sql anpassen + ausführen
2. **Endpoints**: GET + POST implementieren
3. **Test**: Curl commands ausführen
4. **Frontend**: npm run dev starten
5. **Verify**: http://localhost:5174/?tenant=tacos-mohammedia im Browser
6. **Deploy**: Production-ready machen

**Backend Ready?** → Frontend wird sofort funktionieren! 🚀
