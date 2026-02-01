# 💾 ADMIN-PANEL: Persistierung & Backend-Integration

## Das aktuelle Problem

**Änderungen werden NICHT in der Datenbank gespeichert!**

Grund: Die Backend-API-Endpoints sind noch nicht implementiert.

### Workflow aktuell:
```
Admin ändert Gericht
    ↓
Frontend speichert in localStorage (Browser)
    ↓
Nach Reload: Daten noch da (im Browser)
    ↓
Neuer Browser / PC / Private-Mode: Daten weg!
```

### Workflow nach Backend-Integration:
```
Admin ändert Gericht
    ↓
Frontend sendet POST zu Backend
    ↓
Backend speichert in MySQL Datenbank
    ↓
Nach Reload / Wochen später: Daten persistent!
    ↓
Alle Browser / alle PCs: Daten sichtbar
```

---

## Aktuelle Implementierung (localStorage)

### Speicherung
```typescript
// AdminPanel.tsx speichert hier:
const storageKey = `admin-site-${tenantSlug}`;
localStorage.setItem(storageKey, JSON.stringify(saved));

// Beispiel: admin-site-blublu-pizza
```

### Abruf
```typescript
// LandingPage.tsx lädt von hier:
const savedSiteData = localStorage.getItem(storageKey);
if (savedSiteData) {
  // Nutze gespeicherte Daten statt Backend
}
```

### Problem: localStorage ist NICHT persistent
- ❌ Verschiedene Browser: Andere localStorage
- ❌ Private Mode: localStorage wird gelöscht
- ❌ Nach Cache-Clear: Weg
- ❌ Cross-Device: Nicht synchronisiert
- ❌ Nicht in Datenbank: Kann nicht exportiert werden

---

## Lösung: Backend-Endpoints implementieren

Um persistente Speicherung zu erreichen, braucht das Backend diese 4 Endpoints:

### 1️⃣ Gericht hinzufügen
```
POST /api/v1/admin/sites/{slug}/items
```

**Was Frontend sendet:**
```json
{
  "name": "Margherita",
  "price": 9.50,
  "description": "Tomato, Mozzarella, Basil",
  "imageUrl": "https://...",
  "categoryId": "uuid",
  "isAvailable": true
}
```

**Backend macht:**
```sql
INSERT INTO menu_items 
  (id, tenantId, categoryId, name, price, description, imageUrl, isAvailable, createdAt)
VALUES (?, ?, ?, ?, ?, ?, ?, true, NOW())
```

**Frontend macht dann:**
```typescript
// In AdminPanel.tsx - statt localStorage:
const response = await fetch(
  `/api/v1/admin/sites/${tenantSlug}/items`,
  {
    method: "POST",
    headers: {
      "X-Admin-Key": ADMIN_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name, price, description, imageUrl, categoryId, isAvailable
    })
  }
);
```

### 2️⃣ Gericht bearbeiten
```
PATCH /api/v1/admin/sites/{slug}/items/{itemId}
```

### 3️⃣ Gericht löschen
```
DELETE /api/v1/admin/sites/{slug}/items/{itemId}
```

### 4️⃣ Hero & Farben aktualisieren
```
PATCH /api/v1/admin/sites/{slug}
```

**Details:** Siehe `ADMIN_PANEL_BACKEND_GUIDE.md`

---

## Schritt-für-Schritt: Von localStorage zu Backend

### Phase 1: Jetzt (localStorage)
```typescript
// AdminPanel speichert lokal:
localStorage.setItem(`admin-site-${slug}`, JSON.stringify(data));
// ✅ Funktioniert sofort
// ❌ Nicht persistent
```

### Phase 2: Mit Backend (Hybrid)
```typescript
// AdminPanel sendet zu Backend:
const response = await fetch(
  `/api/v1/admin/sites/${slug}/items`,
  { method: "POST", headers: {...}, body: {...} }
);

// Gleichzeitig localStorage aktualisieren (für schnelle UI):
if (response.ok) {
  localStorage.setItem(`admin-site-${slug}`, JSON.stringify(updatedData));
}
// ✅ Funktioniert
// ✅ In Datenbank gespeichert
// ✅ localStorage als Fallback
```

### Phase 3: Production (nur Backend)
```typescript
// AdminPanel sendet nur zu Backend:
const response = await fetch(`/api/v1/admin/sites/${slug}/items`, {...});

// localStorage nur als Cache (optional):
// localStorage.setItem(...) // nice-to-have, nicht nötig
// ✅ Single source of truth: Datenbank
```

---

## Implementierungs-Roadmap

### Diese Woche (Backend-Team):
1. Implementiere die 4 Endpoints (3 Stunden)
2. Teste mit Curl-Commands (30 min)
3. Gib URL/Keys an Frontend-Team

### Nächste Woche (Frontend-Team):
1. Aktualisiere AdminPanel.tsx:
   - Ersetze localStorage.setItem() mit fetch()
   - Warte auf API-Response
   - Zeige Fehler dem Benutzer
2. Teste Gericht-Erstellung mit echtem Backend
3. Lösche localStorage sobald API 100% funktioniert

---

## Code-Beispiel: Von localStorage zu Backend

### VORHER (nur localStorage):
```typescript
const handleAddDish = async (e: React.FormEvent) => {
  e.preventDefault();
  const storageKey = `admin-site-${tenantSlug}`;
  let saved = JSON.parse(localStorage.getItem(storageKey) || "null");
  
  // Füge Item zu localStorage hinzu
  saved.categories[catIndex].items.push(newItem);
  localStorage.setItem(storageKey, JSON.stringify(saved));
  
  window.location.reload();
}
```

### NACHHER (mit Backend):
```typescript
const handleAddDish = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    // 1. Sende zu Backend
    const response = await fetch(
      `/api/v1/admin/sites/${tenantSlug}/items`,
      {
        method: "POST",
        headers: {
          "X-Admin-Key": ADMIN_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: dishName,
          price: parseFloat(dishPrice),
          description: dishDescription,
          imageUrl: dishImage,
          categoryId: selectedCategory,
          isAvailable
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Backend-Fehler: ${response.status}`);
    }

    const newItem = await response.json();
    onSuccess?.(`✅ Gericht "${dishName}" gespeichert!`);
    
    // 2. Optional: localStorage aktualisieren für schnelle UI
    const storageKey = `admin-site-${tenantSlug}`;
    let saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    saved.categories[catIndex].items.push(newItem);
    localStorage.setItem(storageKey, JSON.stringify(saved));
    
    // 3. UI aktualisieren
    resetDishForm();
    setTimeout(() => window.location.reload(), 1000);
    
  } catch (err: any) {
    onError?.(`❌ Fehler: ${err.message}`);
  }
}
```

---

## Wichtige Punkte

### 1. X-Admin-Key Header
**Alle Requests müssen diesen Header haben:**
```
X-Admin-Key: dev-admin-key
```

### 2. Error-Handling
```typescript
if (!response.ok) {
  // 401: Falscher Admin-Key
  // 404: Tenant nicht gefunden
  // 400: Kategorie nicht gefunden
  // 500: Server-Fehler
  onError?.(`❌ Fehler ${response.status}: ...`);
}
```

### 3. Response-Format
Backend sollte das gleiche Format zurückgeben, das Frontend speichert:
```json
{
  "id": "uuid",
  "name": "Margherita",
  "price": 9.50,
  "description": "...",
  "imageUrl": "...",
  "isAvailable": true
}
```

---

## Testen

### Curl-Test (direkt):
```bash
curl -X POST "http://localhost:5081/api/v1/admin/sites/blublu-pizza/items" \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Margherita",
    "price": 9.50,
    "description": "Tomato, Mozzarella, Basil",
    "imageUrl": null,
    "categoryId": "550e8400-e29b-41d4-a716-446655440000",
    "isAvailable": true
  }'
```

### Browser-Test (via Admin-UI):
1. Admin-Panel öffnen
2. Gericht hinzufügen
3. Browser-Console öffnen (F12)
4. Network-Tab: Sehe POST zu `/api/v1/admin/sites/...`
5. Response: Sollte neu erstelltes Item sein

---

## Status

| Was | Status | Backend | Frontend |
|-----|--------|---------|----------|
| localStorage | ✅ FERTIG | N/A | ✅ Funktioniert |
| Backend-Endpoints | ⏳ TODO | Braucht Impl. | Ready |
| Frontend-Integration | ⏳ TODO | Pending | Ready |
| Persistierung | ⏳ TODO | Pending | Pending |
| Edit/Delete | ⏳ TODO | Braucht Impl. | Frontend vorhanden |

---

## Nächstes Dokument

Nach Backend-Implementation: Siehe `ADMIN_PANEL_BACKEND_INTEGRATION.md`

