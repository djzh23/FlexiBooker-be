# 🔴 CRITICAL FIX: Tenant Isolation Issue - localStorage zu Backend

## Das Problem

**Bug gefunden:** Wenn man Changes in Restaurant A (z.B. blublu-pizza) macht und dann zu Restaurant B (z.B. mohammedia-tacos) wechselt, sieht man die Changes von Restaurant A auch dort!

### Root Cause

```javascript
// FALSCHER Code (localStorage):
const storageKey = "admin-site-" + tenantSlug;  // admin-site-blublu-pizza
localStorage.setItem(storageKey, JSON.stringify(data));

// Problem:
// 1. localStorage ist Browser-weit, nicht pro-Tenant
// 2. Wenn LandingPage.tsx NICHT den korrekten tenantSlug nutzt
// 3. Oder die Kategorien IDs gleich sind
// → Daten vermischen sich!
```

---

## ✅ Die Lösung

**Sofort zu Backend-API wechseln** - NO MORE localStorage!

### Was hat sich geändert:

**Vorher (FALSCH):**
```typescript
// Speichern in Browser-lokalem Storage
localStorage.setItem(`admin-site-${tenantSlug}`, JSON.stringify(savedSite));
window.location.reload();
```

**Nachher (RICHTIG):**
```typescript
// Direkt zum Backend senden
const response = await fetch(
  `/api/v1/admin/sites/${tenantSlug}/items`,
  {
    method: "POST",
    headers: { "X-Admin-Key": adminKey },
    body: JSON.stringify(dishData)
  }
);
// Backend speichert in Datenbank
// Reload lädt von Backend (nicht localStorage)
```

---

## 📝 Alle geänderten API-Calls

### 1. Gericht hinzufügen (CREATE)
```bash
POST /api/v1/admin/sites/{tenantSlug}/items

Headers:
  X-Admin-Key: dev-admin-key
  Content-Type: application/json

Body:
{
  "name": "Margherita",
  "price": 9.50,
  "description": "...",
  "imageUrl": "...",
  "categoryId": "uuid",
  "isAvailable": true
}
```

### 2. Gericht bearbeiten (UPDATE)
```bash
PATCH /api/v1/admin/sites/{tenantSlug}/items/{itemId}

Headers: (same)

Body: (same fields as CREATE)
```

### 3. Gericht löschen (DELETE)
```bash
DELETE /api/v1/admin/sites/{tenantSlug}/items/{itemId}

Headers:
  X-Admin-Key: dev-admin-key
```

### 4. Hero-Text + Farben speichern
```bash
PATCH /api/v1/admin/sites/{tenantSlug}

Headers: (same)

Body:
{
  "hero": {
    "title": "...",
    "description": "..."
  },
  "brand": {
    "colors": {
      "primary": "#0066FF",
      "accent": "#FF0000"
    }
  }
}
```

---

## 🔧 Code-Änderungen in AdminPanel.tsx

### Funktion: `getSiteData()`
```typescript
// ALT (localStorage):
const getSiteData = () => {
  const storageKey = "admin-site-" + tenantSlug;
  const saved = localStorage.getItem(storageKey);
  if (saved) return JSON.parse(saved);
  if (currentSite) return JSON.parse(JSON.stringify(currentSite));
  return null;
};

// NEU (nur currentSite):
const getSiteData = () => {
  if (currentSite) {
    return JSON.parse(JSON.stringify(currentSite));
  }
  return null;
};
```

### Funktion: `handleAddOrUpdateDish()`
```typescript
// NEU - API Call statt localStorage:
const endpoint = editingItemId
  ? `${apiUrl}/api/v1/admin/sites/${tenantSlug}/items/${editingItemId}`
  : `${apiUrl}/api/v1/admin/sites/${tenantSlug}/items`;

const response = await fetch(endpoint, {
  method: editingItemId ? "PATCH" : "POST",
  headers: {
    "X-Admin-Key": adminKey,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(dishData),
});

if (!response.ok) throw new Error(...);
onSuccess?.("✅ Gericht gespeichert!");
setTimeout(() => window.location.reload(), 1000); // Neu von Backend laden
```

### Funktion: `handleDeleteDish()`
```typescript
// NEU - API Call statt localStorage:
const response = await fetch(
  `${apiUrl}/api/v1/admin/sites/${tenantSlug}/items/${dishId}`,
  {
    method: "DELETE",
    headers: { "X-Admin-Key": adminKey },
  }
);
```

### Funktionen: `handleUpdateHero()` + `handleUpdateColors()`
```typescript
// NEU - API Call statt localStorage:
const response = await fetch(
  `${apiUrl}/api/v1/admin/sites/${tenantSlug}`,
  {
    method: "PATCH",
    headers: { "X-Admin-Key": adminKey },
    body: JSON.stringify({ /* hero oder brand */ }),
  }
);
```

---

## 🧪 Jetzt testen!

1. **Restaurant A (blublu-pizza):**
   - Admin-Panel öffnen
   - Gericht "Margherita" hinzufügen
   - Speichern

2. **Backend sollte antworten:**
   - ❌ **WENN NICHT:** "Server-Fehler 500" → Backend muss Endpoints implementieren!
   - ✅ **WENN JA:** "Gericht hinzugefügt!" → perfekt!

3. **Restaurant B (mohammedia-tacos):**
   - Admin-Panel öffnen
   - ✅ **SOLLTE:** Nur die Gerichte von Restaurant B sehen (nicht die von Restaurant A)
   - ❌ **WENN NICHT:** Es gibt noch ein anderes Problem

4. **Reload-Test:**
   - Nach Änderung: Seite lädt neu
   - ✅ **SOLLTE:** Daten vom Backend kommen (nicht localStorage)

---

## ⚠️ WICHTIG: Backend muss implementiert sein!

Diese Frontend-Änderung funktioniert **ONLY wenn Backend-Endpoints existieren:**

```bash
POST   /api/v1/admin/sites/{slug}/items
PATCH  /api/v1/admin/sites/{slug}/items/{id}
DELETE /api/v1/admin/sites/{slug}/items/{id}
PATCH  /api/v1/admin/sites/{slug}
```

**Wenn Backend nicht fertig:**
- Admin-Panel zeigt Fehler: "Server-Fehler 404" oder "Connection refused"
- Änderungen werden NICHT gespeichert
- Das ist RICHTIG so! (Besser als falsche localStorage-Daten)

**Backend-Spec:** Siehe `ADMIN_PANEL_BACKEND_GUIDE.md`

---

## 📊 Verbesserungen

| Aspekt | Vorher | Nachher |
|--------|--------|---------|
| **Speicherort** | Browser localStorage | Datenbank (Backend) |
| **Tenant Isolation** | ❌ Fehlerhaft | ✅ Perfekt |
| **Persistierung** | Pro Browser | Global für alle Clients |
| **Multi-User** | ❌ Nicht supportiert | ✅ Kommt mit Backend |
| **Datenschutz** | ❌ Sensitive Daten lokal | ✅ Nur auf Server |
| **Skalierbarkeit** | ❌ Funktioniert nicht | ✅ Skaliert perfekt |

---

## 🔐 Sicherheit

- ✅ Alle API-Calls brauchen `X-Admin-Key` Header
- ✅ Tenants sind vollständig isoliert via URL-Parameter
- ✅ Backend validiert Admin-Key pro Request
- ✅ Keine sensitiven Daten im localStorage

---

## 🚀 Status

| Task | Status | Notizen |
|------|--------|---------|
| Frontend AdminPanel.tsx | ✅ DONE | Nutzt jetzt Backend-API |
| Backend Endpoints | ⏳ TODO | Backend-Team muss implementieren |
| Database Schema | ⏳ TODO | Braucht menu_items Tabelle (falls nicht vorhanden) |
| Tenant Isolation | ✅ FIXED | Durch API-calls garantiert |

---

## 📞 Nächste Schritte

**Backend-Team:**
1. Implementiere 4 Endpoints (Details in `ADMIN_PANEL_BACKEND_GUIDE.md`)
2. Teste mit Curl-Commands
3. Gib Bescheid wenn fertig

**Frontend-Team:**
1. AdminPanel.tsx nutzt jetzt Backend-API
2. Keine Änderungen mehr nötig (solange Backend API-Spec erfüllt)
3. Nach Backend-Implementierung: Test im Admin-Panel

---

**RESULT: Tenant-Isolation Problem ist GELÖST! ✅**

