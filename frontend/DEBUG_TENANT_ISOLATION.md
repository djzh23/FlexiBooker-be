# 🧪 TEST & DEBUG GUIDE: Tenant Isolation

## Problem-Symptome

### ❌ FALSCH (localStorage):
```
Aktion: Füge "Margherita" zu blublu-pizza hinzu
Ergebnis: "Margherita" erscheint auch in mohammedia-tacos
Grund: localStorage speichert NICHT tenant-isoliert
```

### ✅ RICHTIG (Backend-API):
```
Aktion: Füge "Margherita" zu blublu-pizza hinzu
Ergebnis: "Margherita" erscheint NUR in blublu-pizza
Grund: Backend speichert mit tenantId in Datenbank
```

---

## Schritt-für-Schritt Test

### Setup

```bash
# Terminal 1: Frontend
cd frontend
npm run dev
# Öffnet: http://localhost:5174

# Terminal 2: Backend (MUSS LAUFEN!)
cd backend
npm run dev
# Läuft auf: http://localhost:5081
```

### Test 1: Restaurant A (blublu-pizza)

```
1. Öffne: http://localhost:5174/?slug=blublu-pizza&admin=true
2. Admin-Key eingeben: dev-admin-key
3. Tab "Gerichte" klicken
4. Formular ausfüllen:
   - Kategorie: "Pizzas"
   - Name: "Margherita TEST"
   - Preis: "9.99"
   - Beschreibung: "Test Gericht"
5. Click "Neues Gericht hinzufügen"
6. BEOBACHTE Browser Console (F12):
   - Sollte POST zum Backend sehen
   - URL: /api/v1/admin/sites/blublu-pizza/items
   - Status: 200 oder 201 ✅
```

**Browser Console:**
```javascript
// Sollte sehen:
POST /api/v1/admin/sites/blublu-pizza/items 201
// Oder falls fehler:
POST /api/v1/admin/sites/blublu-pizza/items 500 (Backend Error)
POST /api/v1/admin/sites/blublu-pizza/items 404 (Endpoint nicht implementiert)
```

### Test 2: Restaurant B (mohammedia-tacos)

```
1. Öffne NEUEN TAB: http://localhost:5174/?slug=mohammedia-tacos&admin=true
2. Admin-Key: dev-admin-key
3. Tab "Gerichte" klicken
4. SCHAU auf die Gerichte-Liste
5. KRITISCH: "Margherita TEST" sollte NICHT sichtbar sein!
   ✅ RICHTIG: Nur Gerichte von mohammedia-tacos
   ❌ FALSCH: "Margherita TEST" von blublu-pizza ist sichtbar
```

---

## Debuggen mit Browser Console

### Schritt 1: Network-Tab öffnen
```
F12 → Network Tab
Filter: XHR (XML Http Request)
```

### Schritt 2: Gericht hinzufügen
```
1. Im Admin-Panel: Neues Gericht hinzufügen
2. Klick Speichern
3. Im Network-Tab: Neue Request sollte erscheinen
```

### Schritt 3: Request inspizieren
```
Network Tab → Klick auf POST /api/v1/admin/sites/...
→ Headers Tab:
   URL: http://localhost:5081/api/v1/admin/sites/blublu-pizza/items
   Method: POST
   X-Admin-Key: dev-admin-key
   
→ Request Payload:
   {
     "name": "Margherita TEST",
     "price": 9.99,
     ...
   }
   
→ Response (Status 200 = OK):
   Sollte gespeichertes Item zurückgeben
   ODER Status 500 = Backend-Fehler
   ODER Status 404 = Endpoint nicht implementiert
```

---

## Häufige Fehler & Lösungen

### Fehler 1: "Connection refused"

```
Browser Console: Error: NetworkError when attempting to fetch resource
```

**Ursache:** Backend läuft nicht
**Lösung:**
```bash
# Prüfen ob Backend läuft:
lsof -i :5081
# Falls nicht:
cd backend
npm run dev
```

---

### Fehler 2: "404 Not Found"

```
Network Tab:
POST /api/v1/admin/sites/blublu-pizza/items 404
```

**Ursache:** Endpoint ist nicht implementiert
**Lösung:**
- Backend-Team: Implementiere die 4 Endpoints (siehe ADMIN_PANEL_BACKEND_GUIDE.md)

---

### Fehler 3: "500 Server Error"

```
Network Tab:
POST /api/v1/admin/sites/blublu-pizza/items 500
```

**Ursache:** Backend-Fehler (wahrscheinlich DB-Fehler)
**Lösung:**
- Prüfe Backend-Logs
- Prüfe ob Datenbank läuft (MySQL)
- Prüfe ob `menu_items` Tabelle existiert

---

### Fehler 4: "401 Unauthorized"

```
Network Tab:
POST /api/v1/admin/sites/blublu-pizza/items 401
```

**Ursache:** Falscher Admin-Key
**Lösung:**
- Prüfe `.env` Datei: `VITE_ADMIN_KEY=dev-admin-key`
- Backend erwartet: `X-Admin-Key: dev-admin-key` Header

---

## localStorage Prüfen (zur Kontrolle)

### localStorage prüfen: Sollte LEER sein!

```javascript
// Browser Console:
localStorage.getItem("admin-site-blublu-pizza")
// Sollte zurückgeben: null
// ✅ RICHTIG: Keine localStorage einträge mehr!
// ❌ FALSCH: Noch localStorage Daten vorhanden
```

### Alle localStorage Einträge löschen

```javascript
// Falls nötig:
localStorage.clear()
```

---

## Multi-Tenant Test

### Szenario: 3 Restaurants, 3 verschiedene Gerichte

```
Restaurant A (blublu-pizza):
  Kategorie: Pizzas
  Gericht: "Margherita" (9.50 EUR)

Restaurant B (mohammedia-tacos):
  Kategorie: Tacos
  Gericht: "Carnitas" (8.50 EUR)

Restaurant C (burger-king):
  Kategorie: Burgers
  Gericht: "Whopper" (7.50 EUR)
```

### Test-Schritte

```
1. Öffne A: ?slug=blublu-pizza&admin=true
   → Füge "Margherita" hinzu
   → Speichern → Reload

2. Öffne B: ?slug=mohammedia-tacos&admin=true
   → Füge "Carnitas" hinzu
   → Speichern → Reload

3. Öffne C: ?slug=burger-king&admin=true
   → Füge "Whopper" hinzu
   → Speichern → Reload

4. Gehe zurück zu A: ?slug=blublu-pizza&admin=true
   → PRÜFE: Nur "Margherita" sollte sichtbar sein
   → ✅ RICHTIG: Keine "Carnitas" oder "Whopper"
   → ❌ FALSCH: "Carnitas" oder "Whopper" sichtbar
```

---

## API Response Format

### CREATE (POST) Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Margherita",
  "price": 9.50,
  "description": "Tomato, Mozzarella",
  "imageUrl": "https://...",
  "categoryId": "cat-123",
  "isAvailable": true,
  "createdAt": "2026-01-30T21:00:00Z"
}
```

### UPDATE (PATCH) Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Margherita (Updated)",
  "price": 10.99,
  ...
}
```

### DELETE Response

```
Status: 204 No Content
(oder 200 mit leerer Body)
```

---

## Performance-Tipps

### Langsame Requests?

```
1. Network Tab → Request inspizieren
2. Schau auf "Time" Spalte
3. Sollte < 500ms sein
4. Falls > 1s: Backend braucht Optimierung
```

### Reload-Verhalten

```
Frontend macht API-Call → Wartet auf Response
→ onSuccess zeigt Nachricht
→ setTimeout(1000) = 1 Sekunde warten
→ window.location.reload()

Grund: User soll Erfolgs-Nachricht sehen, bevor Reload
```

---

## Checkliste

```
☐ Backend läuft auf port 5081
☐ Frontend läuft auf port 5174
☐ Admin-Key ist dev-admin-key
☐ Gericht hinzufügen → Network zeigt POST 201
☐ Gericht sichtbar nur in eigenem Restaurant
☐ Zweites Restaurant: Keine Gerichte vom ersten
☐ localStorage ist LEER (nur currentSite genutzt)
☐ Nach Reload: Daten bleiben (von Backend)
☐ Unterschiedliche tenantSlugs sind isoliert ✅
```

---

## Status

```
✅ Frontend: API-Calls implementiert
⏳ Backend: Endpoints muss noch implementiert
✅ Tenant-Isolation: Garantiert durch Backend
```

**Bei Fragen → Siehe TENANT_ISOLATION_FIX.md**

