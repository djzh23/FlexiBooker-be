# 🔧 Backend Setup & Database Seeding Guide

## 📋 Überblick

Das Frontend erwartet folgende Backend-Struktur:

```
/api/v1/public/tenant          ← Tenant-Konfiguration
/api/v1/public/menu            ← Menu-Items
```

---

## 1️⃣ API Endpoint: Tenant-Konfiguration

### Request
```
GET /api/v1/public/tenant
Header: X-Tenant: tacos-mohammedia
```

### Response
```json
{
  "slug": "tacos-mohammedia",
  "name": "Makin Hir Tacos",
  "currency": "MAD",
  "timezone": "Africa/Casablanca",
  "configJson": "{\"brand\": {...}, \"layout\": {...}}"
}
```

### TypeScript Response Type (Backend)
```typescript
interface TenantResponse {
  slug: string;
  name: string;
  currency: string;
  timezone: string;
  configJson: string;  // JSON String (wird im Frontend geparst)
}
```

---

## 2️⃣ API Endpoint: Menu-Items

### Request
```
GET /api/v1/public/menu
Header: X-Tenant: tacos-mohammedia
```

### Response
```json
{
  "categories": [
    {
      "id": "cat-1",
      "name": "Tacos",
      "sortOrder": 1,
      "items": [
        {
          "id": "item-1",
          "name": "Tacos Cordon Bleu",
          "description": "Cordon bleu croustillant, fromage gratine et sauce andalouse maison.",
          "price": 55,
          "imageUrl": "https://images.unsplash.com/photo-1608039829574-6cffc50b1d5f?auto=format&fit=crop&w=1200&q=80",
          "isAvailable": true
        },
        {
          "id": "item-2",
          "name": "Tacos Chevre Miel",
          "description": "Chevre fondant, touche de miel du Rif et noix torrefiees.",
          "price": 55,
          "imageUrl": "https://images.unsplash.com/photo-1608039829743-23a84527b39b?auto=format&fit=crop&w=1200&q=80",
          "isAvailable": true
        }
      ]
    },
    {
      "id": "cat-2",
      "name": "Drinks",
      "sortOrder": 2,
      "items": [
        {
          "id": "item-3",
          "name": "Fresh Orange Juice",
          "description": "100% fresh squeezed",
          "price": 25,
          "imageUrl": null,
          "isAvailable": true
        }
      ]
    }
  ]
}
```

### TypeScript Response Type (Backend)
```typescript
interface MenuResponse {
  categories: MenuCategory[];
}

interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
}
```

---

## 3️⃣ Database Schema

### Tenants Table
```sql
CREATE TABLE tenants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'MAD',
  timezone VARCHAR(255) NOT NULL DEFAULT 'Africa/Casablanca',
  configJson LONGTEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Menu Categories Table
```sql
CREATE TABLE menu_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenantId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  sortOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tenant_category (tenantId, name)
);
```

### Menu Items Table
```sql
CREATE TABLE menu_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  categoryId INT NOT NULL,
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

## 4️⃣ Database Seeding (SQL)

### Insert Tenants
```sql
INSERT INTO tenants (slug, name, currency, timezone, configJson) VALUES
(
  'tacos-mohammedia',
  'Makin Hir Tacos',
  'MAD',
  'Africa/Casablanca',
  '{
    "brand": {
      "primaryColor": "#FF6B35",
      "secondaryColor": "#004E89",
      "accentColor": "#1F77D2",
      "logoUrl": null
    },
    "contact": {
      "phone": "+212 6 12 34 56 78",
      "whatsapp": "+212 6 12 34 56 78",
      "email": "hello@makintar.com"
    },
    "layout": {
      "showSampleShowcase": true,
      "hero": {
        "enabled": true,
        "badge": "Makin Hir Tacos | Mohammedia",
        "title": "Le #1 French Tacos au Maroc",
        "description": "Komponiere dein Tacos in 5 Schritten, wähle aus 15+ artisanalen Sauces und lasse unsere Chefs es grillen.",
        "cta1": {"label": "Jetzt bestellen"},
        "cta2": {"label": "Vollständige Karte ansehen"},
        "stats": [
          {"label": "Sauces artisanales", "value": "15+"},
          {"label": "Signature Supplements", "value": "10"},
          {"label": "Service livraison", "value": "24h"}
        ],
        "backgroundImage": "https://images.unsplash.com/photo-1528732263440-4d74ae930053?auto=format&fit=crop&w=1600&q=80"
      },
      "menuSection": {
        "enabled": true,
        "badge": "Carte signature",
        "title": "Die beliebtesten Tacos",
        "description": "Rezepte inspiriert vom Original, modernisiert mit Premium-Look."
      },
      "steps": {
        "enabled": true,
        "badge": "Ritual",
        "title": "Dein Tacos in 5 Schritten",
        "steps": [
          {"title": "Schritt 1", "subtitle": "Wähle deine Größe", "detail": "L (1 Viande) - XL (2) - XXL (3)"},
          {"title": "Schritt 2", "subtitle": "Wähle deine Viande", "detail": "Tenders, Steak, Escalope, Kebab, Nuggets, Cordon Bleu..."},
          {"title": "Schritt 3", "subtitle": "Selektiere die Sauce", "detail": "Barbecue, Biggy, Fromagere, Algerienne, Samourai, Curry..."},
          {"title": "Schritt 4", "subtitle": "Füge Supplements hinzu", "detail": "Cheddar, Oignons Crispy, Bacon Dinde, Oeuf..."},
          {"title": "Schritt 5", "subtitle": "Fais gratiner", "detail": "Cheddar, Mozzarella ou Chevre Miel + 10 MAD"}
        ]
      },
      "gallery": {
        "enabled": true,
        "badge": "Ambiance",
        "title": "Shots disponibles pour ta landing",
        "images": [
          "https://images.unsplash.com/photo-1528832992873-5bb5781525d6?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1605433247501-698725862cea?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1576866209830-589e1bfbb87b?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    }
  }'
),
(
  'pizzeria-roma',
  'Pizzeria Roma',
  'MAD',
  'Africa/Casablanca',
  '{
    "brand": {
      "primaryColor": "#C1272D",
      "secondaryColor": "#FAD201",
      "logoUrl": null
    },
    "contact": {
      "phone": "+212 6 98 76 54 32",
      "whatsapp": "+212 6 98 76 54 32"
    },
    "layout": {
      "showSampleShowcase": true,
      "hero": {
        "enabled": true,
        "badge": "Pizzeria Roma | Casablanca",
        "title": "Authentische Italienische #Pizzas",
        "description": "Handgemachte Pizzas mit original italienischen Zutaten",
        "cta1": {"label": "Pizza bestellen"},
        "cta2": {"label": "Menü ansehen"},
        "stats": [
          {"label": "Pizzas", "value": "30+"},
          {"label": "Toppings", "value": "25+"},
          {"label": "Lieferzeit", "value": "45min"}
        ]
      },
      "menuSection": {"enabled": true, "badge": "Specialties", "title": "Unsere beliebtesten Pizzas"},
      "steps": {
        "enabled": true,
        "steps": [
          {"title": "Schritt 1", "subtitle": "Größe", "detail": "25cm, 30cm, 35cm"},
          {"title": "Schritt 2", "subtitle": "Pizza", "detail": "Klassisch oder Custom"},
          {"title": "Schritt 3", "subtitle": "Extras", "detail": "Toppings hinzufügen"},
          {"title": "Schritt 4", "subtitle": "Kasse", "detail": "Bezahlung & Lieferung"}
        ]
      },
      "gallery": {"enabled": true, "images": []}
    }
  }'
);
```

### Insert Menu Categories
```sql
INSERT INTO menu_categories (tenantId, name, sortOrder) VALUES
(1, 'Tacos', 1),
(1, 'Drinks', 2),
(1, 'Desserts', 3),
(2, 'Pizzas', 1),
(2, 'Pasta', 2),
(2, 'Drinks', 3);
```

### Insert Menu Items
```sql
-- Tacos (tenantId=1, categoryId=1)
INSERT INTO menu_items (tenantId, categoryId, name, description, price, imageUrl, isAvailable) VALUES
(1, 1, 'Tacos Cordon Bleu', 'Cordon bleu croustillant, fromage gratine et sauce andalouse maison.', 55, 'https://images.unsplash.com/photo-1608039829574-6cffc50b1d5f?auto=format&fit=crop&w=1200&q=80', TRUE),
(1, 1, 'Tacos Chevre Miel', 'Chevre fondant, touche de miel du Rif et noix torrefiees.', 55, 'https://images.unsplash.com/photo-1608039829743-23a84527b39b?auto=format&fit=crop&w=1200&q=80', TRUE),
(1, 1, 'Tacos 3 Fromages', 'Mozza, cheddar et emmental enveloppes dans une tortilla XL.', 54, 'https://images.unsplash.com/photo-1612874472202-0f535f04c9f0?auto=format&fit=crop&w=1200&q=80', TRUE),
(1, 1, 'Tacos Shawarma ou Tenders', 'Poulet marie facon shawarma ou tenders croustillants.', 53, 'https://images.unsplash.com/photo-1478144592103-25e218a04891?auto=format&fit=crop&w=1200&q=80', TRUE),
(1, 1, 'Tacos Poulet ou Viande Hachee', 'Classique de la maison, salsa rouge et frites maison.', 44, 'https://images.unsplash.com/photo-1612197594794-9526bfea1a6a?auto=format&fit=crop&w=1200&q=80', TRUE);

-- Drinks (tenantId=1, categoryId=2)
INSERT INTO menu_items (tenantId, categoryId, name, description, price, imageUrl, isAvailable) VALUES
(1, 2, 'Fresh Orange Juice', '100% fresh squeezed orange juice', 25, NULL, TRUE),
(1, 2, 'Coca Cola', 'Classic Coca Cola 33cl', 15, NULL, TRUE),
(1, 2, 'Water', 'Bottled water', 5, NULL, TRUE);

-- Pizzas (tenantId=2, categoryId=4)
INSERT INTO menu_items (tenantId, categoryId, name, description, price, imageUrl, isAvailable) VALUES
(2, 4, 'Margherita', 'Tomato, Mozzarella, Basil', 80, 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=1200&q=80', TRUE),
(2, 4, 'Pepperoni', 'Tomato, Mozzarella, Pepperoni', 90, 'https://images.unsplash.com/photo-1571407-5daf9e93fa40?auto=format&fit=crop&w=1200&q=80', TRUE),
(2, 4, 'Four Cheese', 'Mozzarella, Parmesan, Gorgonzola, Ricotta', 100, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80', TRUE);
```

---

## 5️⃣ Backend Implementation (Node.js/Express Beispiel)

### Get Tenant
```typescript
// GET /api/v1/public/tenant
app.get('/api/v1/public/tenant', async (req, res) => {
  const tenantSlug = req.headers['x-tenant'] as string;
  
  if (!tenantSlug) {
    return res.status(400).json({ error: 'X-Tenant header required' });
  }

  try {
    const tenant = await db.query(
      'SELECT slug, name, currency, timezone, configJson FROM tenants WHERE slug = ?',
      [tenantSlug]
    );

    if (tenant.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json(tenant[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

### Get Menu
```typescript
// GET /api/v1/public/menu
app.get('/api/v1/public/menu', async (req, res) => {
  const tenantSlug = req.headers['x-tenant'] as string;

  if (!tenantSlug) {
    return res.status(400).json({ error: 'X-Tenant header required' });
  }

  try {
    // Get tenant ID from slug
    const tenantResult = await db.query(
      'SELECT id FROM tenants WHERE slug = ?',
      [tenantSlug]
    );

    if (tenantResult.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenantId = tenantResult[0].id;

    // Get categories and items
    const categories = await db.query(`
      SELECT c.id, c.name, c.sortOrder, 
             i.id as itemId, i.name as itemName, i.description, i.price, i.imageUrl, i.isAvailable
      FROM menu_categories c
      LEFT JOIN menu_items i ON c.id = i.categoryId
      WHERE c.tenantId = ?
      ORDER BY c.sortOrder, c.name
    `, [tenantId]);

    // Format response
    const result = {};
    categories.forEach((row) => {
      if (!result[row.id]) {
        result[row.id] = {
          id: row.id,
          name: row.name,
          sortOrder: row.sortOrder,
          items: []
        };
      }

      if (row.itemId) {
        result[row.id].items.push({
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
      categories: Object.values(result)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

---

## 6️⃣ Environment Variables

```bash
# Backend .env
DATABASE_URL=mysql://user:password@localhost:3306/flexibooker
API_PORT=5081
NODE_ENV=development
```

```bash
# Frontend .env.local
VITE_API_URL=http://localhost:5081
```

---

## 7️⃣ Testing der APIs

### Test mit curl
```bash
# Test Tenant-Endpoint
curl -H "X-Tenant: tacos-mohammedia" http://localhost:5081/api/v1/public/tenant

# Test Menu-Endpoint
curl -H "X-Tenant: tacos-mohammedia" http://localhost:5081/api/v1/public/menu
```

### Test mit Postman
1. Collection erstellen
2. GET `{{BASE_URL}}/api/v1/public/tenant`
   - Header: `X-Tenant: tacos-mohammedia`
3. GET `{{BASE_URL}}/api/v1/public/menu`
   - Header: `X-Tenant: tacos-mohammedia`

---

## 8️⃣ Deployment Checklist

### Development
- [ ] Database schema erstellt
- [ ] Seeding-Daten eingefügt
- [ ] Backend läuft auf Port 5081
- [ ] Frontend lädt von Backend
- [ ] Beide Endpoints testen

### Production
- [ ] SSL/HTTPS aktivieren
- [ ] CORS konfigurieren
- [ ] Rate Limiting hinzufügen
- [ ] Database backups
- [ ] Monitoring & Logging

---

## 🎯 Nächste Schritte

1. ✅ Database Schema erstellen (oben)
2. ✅ Seeding-Daten einfügen (oben)
3. ✅ Backend-Endpoints implementieren (oben)
4. ⏳ Frontend testen
5. ⏳ Neuen Tenant hinzufügen
6. ⏳ Produktion deployen

---

**Backend-Setup fertig!** 🚀
