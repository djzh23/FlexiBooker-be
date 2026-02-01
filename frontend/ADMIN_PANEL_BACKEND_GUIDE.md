# 🔧 BACKEND: Admin-Panel API Endpoints

## Überblick

Das Frontend Admin-Panel ruft diese Endpoints auf. **Diese müssen noch implementiert werden:**

---

## 1️⃣ Gericht hinzufügen

```
POST /api/v1/admin/sites/{tenantSlug}/items
```

### Header
```
X-Admin-Key: dev-admin-key
Content-Type: application/json
```

### Body
```json
{
  "name": "Margherita",
  "price": 9.50,
  "description": "Tomato, Mozzarella, Basil",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response (201 Created)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Margherita",
  "price": 9.50,
  "description": "Tomato, Mozzarella, Basil",
  "imageUrl": null,
  "isAvailable": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Error Cases
- **401 Unauthorized**: X-Admin-Key ist falsch
- **404 Not Found**: Tenant {tenantSlug} existiert nicht
- **400 Bad Request**: categoryId existiert nicht für diesen Tenant

---

## 2️⃣ Gericht bearbeiten

```
PATCH /api/v1/admin/sites/{tenantSlug}/items/{itemId}
```

### Header
```
X-Admin-Key: dev-admin-key
Content-Type: application/json
```

### Body (beliebige Kombination)
```json
{
  "name": "Margherita (piccolo)",
  "price": 8.50,
  "description": "Small size version",
  "isAvailable": false
}
```

### Response (200 OK)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Margherita (piccolo)",
  "price": 8.50,
  "description": "Small size version",
  "isAvailable": false,
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

---

## 3️⃣ Gericht löschen

```
DELETE /api/v1/admin/sites/{tenantSlug}/items/{itemId}
```

### Header
```
X-Admin-Key: dev-admin-key
```

### Response (204 No Content)
```
[empty body]
```

---

## 4️⃣ Hero & Farben aktualisieren

```
PATCH /api/v1/admin/sites/{tenantSlug}
```

### Header
```
X-Admin-Key: dev-admin-key
Content-Type: application/json
```

### Body
```json
{
  "configJson": {
    "hero": {
      "title": "Die besten Pizzas in Berlin",
      "description": "Handgemachte Pizzas mit italienischen Zutaten"
    },
    "brand": {
      "colors": {
        "primary": "#0066FF",
        "accent": "#FF0000"
      }
    }
  }
}
```

### Response (200 OK)
```json
{
  "tenant": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "blublu-pizza",
    "configJson": "{\"hero\":{...},\"brand\":{...}}"
  },
  "categories": [...]
}
```

---

## 🔐 Sicherheit

### Auth-Pattern
```typescript
// In jedem Endpoint:
const adminKey = req.header("X-Admin-Key");
if (adminKey !== process.env.ADMIN_KEY) {
  return res.status(401).json({ error: "Unauthorized" });
}
```

### Zukunft: Per-Restaurant Keys
```typescript
// Irgendwann können Restaurants eigen Keys haben:
const dbAdminKey = await db.query(
  "SELECT adminKey FROM tenants WHERE slug = ?",
  [tenantSlug]
);
if (adminKey !== dbAdminKey) {
  return res.status(401).json({ error: "Unauthorized" });
}
```

---

## 💾 Datenbankoperationen

### Gericht hinzufügen (SQL)
```sql
INSERT INTO menu_items (id, tenantId, categoryId, name, price, description, isAvailable, createdAt)
VALUES (?, ?, ?, ?, ?, ?, true, NOW())
```

### Gericht bearbeiten (SQL)
```sql
UPDATE menu_items 
SET name = ?, price = ?, description = ?, isAvailable = ?, updatedAt = NOW()
WHERE id = ? AND tenantId = ?
```

### Gericht löschen (SQL)
```sql
DELETE FROM menu_items 
WHERE id = ? AND tenantId = ?
```

### Hero & Farben aktualisieren (SQL)
```sql
UPDATE tenants 
SET configJson = ?, updatedAt = NOW()
WHERE slug = ?
```

---

## 🧪 Test-Curl-Commands

### Test 1: Gericht hinzufügen
```bash
curl -X POST "http://localhost:5081/api/v1/admin/sites/blublu-pizza/items" \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Margherita",
    "price": 9.50,
    "description": "Tomato, Mozzarella, Basil",
    "categoryId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Test 2: Gericht bearbeiten
```bash
curl -X PATCH "http://localhost:5081/api/v1/admin/sites/blublu-pizza/items/550e8400-e29b-41d4-a716-446655440001" \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 10.50
  }'
```

### Test 3: Gericht löschen
```bash
curl -X DELETE "http://localhost:5081/api/v1/admin/sites/blublu-pizza/items/550e8400-e29b-41d4-a716-446655440001" \
  -H "X-Admin-Key: dev-admin-key"
```

### Test 4: Hero & Farben aktualisieren
```bash
curl -X PATCH "http://localhost:5081/api/v1/admin/sites/blublu-pizza" \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "configJson": {
      "hero": {
        "title": "Neue Überschrift",
        "description": "Neue Beschreibung"
      },
      "brand": {
        "colors": {
          "primary": "#FF0000",
          "accent": "#00FF00"
        }
      }
    }
  }'
```

---

## 📊 Implementierungs-Reihenfolge (Empfohlen)

1. **POST /api/v1/admin/sites/{tenantSlug}/items** (Gericht hinzufügen)
   - Komplexität: ⭐⭐ (Medium)
   - Impact: ⭐⭐⭐⭐⭐ (Sehr wichtig)
   - Zeit: ~30 min

2. **PATCH /api/v1/admin/sites/{tenantSlug}** (Hero/Farben)
   - Komplexität: ⭐⭐ (Medium)
   - Impact: ⭐⭐⭐⭐ (Wichtig)
   - Zeit: ~20 min

3. **PATCH /api/v1/admin/sites/{tenantSlug}/items/{itemId}** (Gericht bearbeiten)
   - Komplexität: ⭐⭐ (Medium)
   - Impact: ⭐⭐⭐⭐ (Wichtig)
   - Zeit: ~20 min

4. **DELETE /api/v1/admin/sites/{tenantSlug}/items/{itemId}** (Gericht löschen)
   - Komplexität: ⭐ (Einfach)
   - Impact: ⭐⭐⭐ (Nützlich)
   - Zeit: ~10 min

---

## 📝 Pseudocode-Beispiel (Express.js)

```typescript
// POST /api/v1/admin/sites/:tenantSlug/items
app.post("/api/v1/admin/sites/:tenantSlug/items", async (req, res) => {
  try {
    // 1. Auth prüfen
    const adminKey = req.header("X-Admin-Key");
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 2. Tenant existiert?
    const tenant = await db.query(
      "SELECT id FROM tenants WHERE slug = ?",
      [req.params.tenantSlug]
    );
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    // 3. Kategorie existiert?
    const category = await db.query(
      "SELECT id FROM menu_categories WHERE id = ? AND tenantId = ?",
      [req.body.categoryId, tenant.id]
    );
    if (!category) {
      return res.status(400).json({ error: "Category not found" });
    }

    // 4. INSERT
    const itemId = generateUUID();
    await db.query(
      "INSERT INTO menu_items (id, tenantId, categoryId, name, price, description, isAvailable, createdAt) VALUES (?, ?, ?, ?, ?, ?, true, NOW())",
      [itemId, tenant.id, req.body.categoryId, req.body.name, req.body.price, req.body.description]
    );

    // 5. Response
    return res.status(201).json({
      id: itemId,
      tenantId: tenant.id,
      categoryId: req.body.categoryId,
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      isAvailable: true,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
```

---

## ✅ Validierung Checkliste

Vor dem Go-Live prüfen:

- [ ] Alle 4 Endpoints implementiert
- [ ] Auth (X-Admin-Key) funktioniert
- [ ] Datenbankoperationen (INSERT/UPDATE/DELETE) funktionieren
- [ ] Error-Handling: 401, 404, 400 Responses
- [ ] Alle Curl-Tests erfolgreich
- [ ] Frontend-Admin-Panel sendet richtige Payloads
- [ ] Response-Format matcht Frontend-Erwartungen
- [ ] Keine SQL-Injection möglich
- [ ] Performance: Anfragen unter 500ms

---

## 📞 Support

Bei Fragen zur Backend-Implementation:
- Siehe ADMIN_UI_GUIDE.md für Frontend-Seite
- Siehe START_HERE.md für Architektur-Überblick
