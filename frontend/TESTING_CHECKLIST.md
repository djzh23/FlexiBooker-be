# ✅ TESTING CHECKLIST - Alles funktioniert?

**Einfache Checkliste um zu testen, dass alles funktioniert**

---

## 🎯 Vor dem Start

- [ ] Backend läuft: `http://localhost:5081` (HTTP Status 200)
- [ ] Frontend läuft: `http://localhost:5174` (Vite Server)
- [ ] Datenbank hat mind. 2 Tenants: `tacos-mohammedia`, `blublu-pizza`
- [ ] Admin-Key ist gesetzt: `ADMIN_API_KEY=dev-admin-key` (Backend .env)

**Befehle zum Prüfen:**

```bash
# Backend prüfen
curl http://localhost:5081/api/v1/public/site?slug=tacos-mohammedia
# Erwartet: 200 OK + JSON mit Tacos-Daten

# Frontend prüfen
curl http://localhost:5174/
# Erwartet: 200 OK + HTML
```

---

## 🍕 Test 1: Tacos Seite (Bestehendes Restaurant)

### Browser URL
```
http://localhost:5174/?tenant=tacos-mohammedia
```

### Visuell Prüfen
- [ ] Seite lädt (nicht "Loading...")
- [ ] Header mit Logo
- [ ] Hero-Section mit Bild
- [ ] Orange Farben (#FF6B35 oder ähnlich)
- [ ] "Tacos Mohammedia" Text sichtbar
- [ ] Stats: "15+ Sauces", "10 Supplements", "24h Delivery"

### Menu Prüfen
- [ ] 3 Kategorien sichtbar:
  - [ ] "TACOS" (oben)
  - [ ] "DRINKS" (Mitte)
  - [ ] "DESSERTS" (unten)
- [ ] Kategorie 1 "TACOS" hat Items:
  - [ ] "Tacos Cordon Bleu" - 55 MAD
  - [ ] "Tacos Chevre Miel" - 55 MAD
- [ ] Kategorie 2 "DRINKS" hat Items:
  - [ ] "Coca Cola" - 15 MAD
  - [ ] etc.
- [ ] Bilder laden (wenn vorhanden)
- [ ] Preise in **MAD** (nicht EUR!)

### Browser Console (F12)
- [ ] Keine roten Fehler-Meldungen
- [ ] Keine CORS Errors
- [ ] Suche nach "Failed to fetch" → sollte NICHT existieren

### Network Tab (F12)
- [ ] `GET /api/v1/public/site?slug=tacos-mohammedia`
  - [ ] Status: **200**
  - [ ] Response ist JSON mit `tenant`, `categories`

---

## 🍕 Test 2: Blublu Pizza (Neues Restaurant)

### Browser URL
```
http://localhost:5174/?tenant=blublu-pizza
```

### Visuell Prüfen
- [ ] Seite lädt
- [ ] **BLAUE** Farben (#0066FF oder ähnlich) - NICHT orange!
- [ ] "Blublu Pizza" Text sichtbar
- [ ] Hero mit Pizza-Bild
- [ ] Stats unterschiedlich von Tacos

### Menu Prüfen
- [ ] 3 Kategorien sichtbar:
  - [ ] "Klassische Pizzas" (oben)
  - [ ] "Spezial Pizzas" (Mitte)
  - [ ] "Getränke" (unten)
- [ ] Kategorie 1 "Klassische Pizzas" hat Items:
  - [ ] "Margherita" - 9.50 EUR
  - [ ] "Pepperoni" - 11.50 EUR
  - [ ] "Quattro Formaggi" - 13.50 EUR
- [ ] Preise in **EUR** (nicht MAD!) ← WICHTIG!
- [ ] Bilder sollten Pizzas zeigen

### Browser Console (F12)
- [ ] Keine roten Fehler-Meldungen
- [ ] Keine Crashes

### Network Tab (F12)
- [ ] `GET /api/v1/public/site?slug=blublu-pizza`
  - [ ] Status: **200**
  - [ ] Response hat Blublu-Daten

### Farben Vergleichen
- [ ] Tacos Seite: Orange (#FF6B35)
- [ ] Blublu Seite: Blau (#0066FF)
- [ ] **UNTERSCHIEDLICHE FARBEN?** ✅ CSS-Variablen funktionieren!

---

## 🍕 Test 3: Default/Fallback

### Browser URL (OHNE ?tenant Parameter)
```
http://localhost:5174/
```

### Was sollte passieren?
- [ ] Seite lädt
- [ ] Zeigt entweder:
  - Option A: DEFAULT_TENANT = "tacos-mohammedia" (dann sollte Tacos-Seite kommen)
  - Option B: Demo-Seite mit defaultConfig (wenn Backend nicht erreichbar)

### Prüf in Console:
```javascript
// Konsole (F12 → Console)
// Schreib:
new URL(window.location.href).searchParams.get("tenant")
// Ergebnis: null oder undefined (kein Parameter)

// Schreib dann:
// (aus src/shared/config/env.ts) DEFAULT_TENANT
// sollte sein: "tacos-mohammedia"
```

---

## 🚀 Test 4: Neuer Restaurant erstellen (Pizzeria Roma)

### Curl Command ausführen

```bash
curl -X POST "http://localhost:5081/api/v1/admin/sites" \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
  "slug": "pizzeria-roma",
  "name": "Pizzeria Roma",
  "timezone": "Europe/Rome",
  "currency": "EUR",
  "config": {
    "brand": {
      "primaryColor": "#DC143C",
      "secondaryColor": "#FFD700",
      "accentColor": "#228B22"
    },
    "contact": {
      "phone": "+39 06 1234 5678",
      "email": "info@pizzeria-roma.it"
    },
    "layout": {
      "hero": {
        "title": "Pizzeria Roma - Authentic Italian",
        "description": "Tradizionale Ricette dal 1990",
        "stats": [
          {"label": "Pizze", "value": "30+"},
          {"label": "Tradition", "value": "Since 1990"}
        ],
        "backgroundImage": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=1600"
      },
      "menuSection": {"enabled": true, "title": "Pizze Famose"},
      "steps": {
        "enabled": true,
        "steps": [
          {"title": "Schritt 1", "subtitle": "Größe", "detail": "Piccola, Media, Grande"},
          {"title": "Schritt 2", "subtitle": "Pizza", "detail": "30+ Sorten"},
          {"title": "Schritt 3", "subtitle": "Zahlen", "detail": "Lieferung"}
        ]
      },
      "gallery": {
        "enabled": true,
        "images": [
          "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400",
          "https://images.unsplash.com/photo-1571407-5daf9e93fa40?w=400"
        ]
      }
    }
  },
  "categories": [
    {
      "name": "Pizze Classiche",
      "sortOrder": 1,
      "items": [
        {"name": "Margherita", "price": 8.00, "description": "Classica", "isAvailable": true},
        {"name": "Napolitana", "price": 9.00, "description": "Mit Anchovi", "isAvailable": true}
      ]
    },
    {
      "name": "Bevande",
      "sortOrder": 2,
      "items": [
        {"name": "Chianti", "price": 6.00, "description": "Rotwein", "isAvailable": true},
        {"name": "Prosecco", "price": 7.00, "description": "Sekt", "isAvailable": true}
      ]
    }
  ]
}'
```

### Curl Response prüfen
- [ ] Status: **201 Created** (nicht 200!)
- [ ] Response enthält:
  ```json
  {
    "tenant": {
      "slug": "pizzeria-roma",
      "name": "Pizzeria Roma",
      "configJson": "..."
    },
    "categories": [...]
  }
  ```

### Frontend Test: Pizzeria Roma URL
```
http://localhost:5174/?tenant=pizzeria-roma
```

### Visuell Prüfen
- [ ] Seite lädt sofort (Backend DB hat Daten!)
- [ ] **ROT-GOLD-GRÜN** Farben (#DC143C, #FFD700, #228B22) - Italienisches Design!
- [ ] "Pizzeria Roma - Authentic Italian" Text
- [ ] 2 Kategorien:
  - [ ] "Pizze Classiche" mit Margherita, Napolitana
  - [ ] "Bevande" mit Chianti, Prosecco
- [ ] Preise in **EUR**
- [ ] Italienischer Hero mit Stats

### Console & Network
- [ ] Keine Fehler
- [ ] GET /api/v1/public/site?slug=pizzeria-roma → 200

---

## 📊 Test 5: Vergleichen Alle 3 Restaurants

### Side-by-Side Öffnen

**Browser Fenster 1:**
```
http://localhost:5174/?tenant=tacos-mohammedia
```
- Farbe: Orange
- Währung: MAD
- Items: Tacos, Drinks, Desserts

**Browser Fenster 2:**
```
http://localhost:5174/?tenant=blublu-pizza
```
- Farbe: Blau
- Währung: EUR
- Items: Pizzas, Getränke

**Browser Fenster 3:**
```
http://localhost:5174/?tenant=pizzeria-roma
```
- Farbe: Rot-Gold
- Währung: EUR
- Items: Pizze, Bevande

### Vergleichen
- [ ] Alle 3 haben unterschiedliche Farben ✅
- [ ] Alle 3 haben unterschiedliche Items ✅
- [ ] Alle 3 laden gleichzeitig ohne Probleme ✅
- [ ] Kein "Loading..." nach >2 Sekunden ✅
- [ ] Keine Console-Fehler in irgendeinem Tab ✅

---

## 🔄 Test 6: Änderung vornehmen & Live-Update

### Änderung: Pizza-Preis ändern

**SQL Query (Backend):**
```sql
UPDATE menu_items
SET price = 15.00
WHERE name = 'Margherita' AND tenantId = 
  (SELECT id FROM tenants WHERE slug = 'pizzeria-roma');
```

**Browser: Pizzeria Roma Seite (noch offen)**
- [ ] Seite NICHT neuladen
- [ ] Preis sollte noch **8.00 EUR** sein

**Browser: Pizzeria Roma Seite (F5 neuladen)**
```
http://localhost:5174/?tenant=pizzeria-roma
```
- [ ] Nach Reload: Preis ist jetzt **15.00 EUR** ✅
- [ ] Backend wurde abgefragt, neue Daten geladen!

---

## 🔄 Test 7: Änderung: Farbe ändern

### Änderung: Pizzeria Roma primärfarbe ändern

**SQL Query:**
```sql
UPDATE tenants
SET configJson = REPLACE(
  configJson,
  '"primaryColor": "#DC143C"',
  '"primaryColor": "#FF69B4"'  -- Pink statt Rot
)
WHERE slug = 'pizzeria-roma';
```

**Browser: Pizzeria Roma (F5 neuladen)**
```
http://localhost:5174/?tenant=pizzeria-roma
```
- [ ] Nach Reload: Header ist jetzt PINK (nicht Rot) ✅
- [ ] CSS-Variablen wurden neu gesetzt!

---

## 🐛 Test 8: Error Handling

### Test 1: Ungültiger Tenant

**Browser:**
```
http://localhost:5174/?tenant=nonexistent-restaurant
```

**Erwartet:**
- [ ] Seite lädt
- [ ] Fehler wird abgefangen (nicht gecrasht!)
- [ ] Fallback zu defaultConfig (Demo-Seite) oder Fehler-Meldung
- [ ] Console: Error-Log aber KEIN Crash

---

### Test 2: Backend nicht erreichbar

**Simulation:**
1. Backend Server stoppen (Ctrl+C im Backend Terminal)
2. Browser Seite neuladen

**Erwartet:**
- [ ] Frontend zeigt noch defaultConfig (Demo-Seite)
- [ ] Oder: Zeigt "Fehler beim Laden" Message
- [ ] NICHT: Leere Seite oder Crash
- [ ] Console: Error aber funktionsfähig

---

### Test 3: Ungültiger Admin-Key

**Curl Command mit falschem Key:**
```bash
curl -X POST "http://localhost:5081/api/v1/admin/sites" \
  -H "X-Admin-Key: WRONG-KEY-12345" \
  -H "Content-Type: application/json" \
  -d '{"slug": "test", ...}'
```

**Erwartet:**
- [ ] Status: **401 Unauthorized** (nicht 500!)
- [ ] Keine neuer Restaurant erstellt
- [ ] Response: Clear Error-Meldung

---

## ✅ Finale Checkliste

### Backend
- [ ] Server läuft auf Port 5081
- [ ] CORS aktiviert (Header werden gesendet)
- [ ] Admin-Key funktioniert
- [ ] Datenbank hat Daten
- [ ] GET /api/v1/public/site funktioniert
- [ ] POST /api/v1/admin/sites funktioniert

### Frontend
- [ ] Server läuft auf Port 5174
- [ ] resolveTenant() liest Query-Parameter korrekt
- [ ] fetchSite() lädt Daten vom Backend
- [ ] parseConfigJson() konvertiert String → Objekt
- [ ] applyTenantTheme() setzt CSS-Variablen
- [ ] LayoutRenderer rendert Kategorien & Items
- [ ] Keine Console-Fehler

### Datenbank
- [ ] tenants Tabelle hat 3+ Einträge
- [ ] menu_categories Tabelle hat ~9 Einträge
- [ ] menu_items Tabelle hat ~20+ Einträge
- [ ] Alle Preise sind Zahlen (nicht Strings)
- [ ] Alle isAvailable sind Booleans (nicht 0/1)

### UX / Visual
- [ ] Tacos: Orange + MAD
- [ ] Blublu: Blau + EUR
- [ ] Pizzeria: Rot-Gold + EUR
- [ ] Keine Bilder-Fehler (alle laden)
- [ ] Layout responsive (auch auf Handy)
- [ ] Keine Flash/Flicker beim Laden

---

## 🎯 Wenn alles Grün ist ✅

Herzlichen Glückwunsch! Dein Multi-Tenant-System ist **Production-Ready**! 🚀

**Du kannst jetzt:**
- ✅ Beliebig viele neue Restaurants hinzufügen
- ✅ Daten per SQL oder Admin-API ändern
- ✅ Jeder Restaurant ist isoliert
- ✅ Frontend braucht keine Änderung
- ✅ System skaliert zu 100+ Restaurants

---

## ⚠️ Wenn etwas nicht Grün ist ❌

**Häufige Probleme:**

| Problem | Lösung |
|---------|--------|
| `404 Tenant nicht gefunden` | Prüf `slug` im curl exakt gleich wie in DB |
| `401 Unauthorized` | Admin-Key falsch in curl oder Backend .env |
| `CORS Error` | Backend hat CORS nicht aktiviert → `app.UseCors()` |
| `Loading... dauert ewig` | Backend antwortet nicht → prüf Backend Logs |
| `Preise zeigen "NaN"` | Price ist String statt Zahl in DB → Fix SQL |
| `isAvailable funktioniert nicht` | isAvailable ist 0/1 statt true/false → Fix SQL |
| `Farben ändern sich nicht` | applyTenantTheme() wird nicht aufgerufen → Check LandingPage |

---

**Viel Erfolg beim Testing!** 🎉
