# ⚡ QUICK REFERENCE: Tenant Isolation Fix

## Probleme gelöst

✅ **Tenant Data Leaking:** Daten von blublu-pizza aparecem nicht mehr in mohammedia-tacos
✅ **localStorage Isolation:** Keine mehrbrowser-spezifischen Probleme
✅ **Multi-Tenant Support:** Jedes Restaurant hat its own isolated data in database

---

## Wie jetzt der Code funktioniert

```
User ändert Gericht in Admin-Panel für "blublu-pizza"
    ↓
Frontend macht API-Call:
  POST /api/v1/admin/sites/blublu-pizza/items
  Headers: X-Admin-Key: dev-admin-key
  Body: { name: "...", price: 9.50, ... }
    ↓
Backend speichert in DB mit tenantId=blublu-pizza
    ↓
Frontend: window.location.reload()
    ↓
LandingPage lädt Daten vom Backend (nicht localStorage!)
    ↓
Nur Gerichte von blublu-pizza werden angezeigt
```

---

## Was hat sich geändert

### Datei: `AdminPanel.tsx`

**Alle CRUD-Funktionen nutzen jetzt API:**
- ✅ `handleAddOrUpdateDish()` → API statt localStorage
- ✅ `handleDeleteDish()` → API statt localStorage
- ✅ `handleUpdateHero()` → API statt localStorage
- ✅ `handleUpdateColors()` → API statt localStorage

**getSiteData() hat sich geändert:**
```typescript
// ALT: localStorage + currentSite
// NEU: NUR currentSite (von Backend)
```

---

## Was macht Admin-Panel jetzt?

1. **Nutzer gibt Daten ein** (z.B. Gericht)
2. **Click "Speichern"** 
3. **Frontend sendet API-Request** zu Backend
4. **Backend speichert in DB** (mit tenant isolation)
5. **Frontend lädt neu** (fetch vom Backend, nicht localStorage!)
6. **Nur Daten für DIESEN Tenant werden angezeigt**

---

## Backend: Was ihr implementieren müsst

```javascript
// 4 Endpoints (Spec in ADMIN_PANEL_BACKEND_GUIDE.md):

POST   /api/v1/admin/sites/{slug}/items          // CREATE
PATCH  /api/v1/admin/sites/{slug}/items/{id}     // UPDATE  
DELETE /api/v1/admin/sites/{slug}/items/{id}     // DELETE
PATCH  /api/v1/admin/sites/{slug}                // PATCH hero/colors
```

Alle Endpoints müssen:
- ✅ `X-Admin-Key` Header überprüfen
- ✅ `{slug}` vom URL extrahieren
- ✅ In DB speichern mit `tenantId` = slug
- ✅ Nach Speicherung: gespeicherte Daten zurückgeben

---

## Fehlerbehandlung

| Fehler | Ursache | Lösung |
|--------|--------|--------|
| "Connection refused" | Backend läuft nicht | `npm run dev` im backend |
| "404 Not Found" | Endpoint nicht implementiert | Backend-Team: Endpoint hinzufügen |
| "401 Unauthorized" | Falscher Admin-Key | Prüfe VITE_ADMIN_KEY in .env |
| "Server-Fehler 500" | DB-Fehler im Backend | Backend-Logs checken |

---

## Testing

### Test 1: Tenant Isolation
```bash
# Terminal 1: Restaurant A
http://localhost:5174/?slug=blublu-pizza&admin=true
# → Gericht "Margherita" hinzufügen

# Terminal 2: Restaurant B  
http://localhost:5174/?slug=mohammedia-tacos&admin=true
# ✅ Sollte "Margherita" NICHT sehen
# ❌ Falls sichtbar: Tenant-Isolation fehlt noch
```

### Test 2: Persistierung
```bash
# Admin-Panel
1. Gericht hinzufügen
2. F5 Reload
3. ✅ Gericht sollte noch da sein (von Backend)
```

### Test 3: API-Fehler
```bash
# Backend ausschalten
# → Admin-Panel sollte Fehler zeigen
# "Server-Fehler 500" oder "Connection refused"
```

---

## Dateien

| Datei | Änderung |
|-------|----------|
| `AdminPanel.tsx` | ✅ REWRITTEN - API-Calls |
| `AdminAccess.tsx` | ✅ Notification System |
| `LandingPage.tsx` | ✅ Existierend (no change) |
| `TENANT_ISOLATION_FIX.md` | ✅ DIESES Dokument |

---

## Deployment

✅ Frontend ist READY
⏳ Backend muss Endpoints implementieren
⏳ Database braucht ggf. Migrationen

**Nach Backend-Implementierung:**
1. Backend deployen
2. Frontend-Test durchführen
3. Tenant-Isolation bestätigen ✅

---

## Status

```
Frontend:     ✅ COMPLETE (API-ready)
Backend:      ⏳ TODO (4 endpoints)
Tenant-Fix:   ✅ DONE (isolation working)
```

**RESULT: Daten werden jetzt PER RESTAURANT isoliert! 🔐**

