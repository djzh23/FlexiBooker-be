# 🍕 BLUBLU-PIZZA: Schritt-für-Schritt Anleitung

**Wie man einen neuen Restaurant erstellt, provisioniert und in der ganzen App testet.**

---

## 🎯 Übersicht: Was wir tun

```
1. Blublu-Pizza Daten vorbereiten (JSON)
2. Backend: POST /api/v1/admin/sites aufrufen
3. Backend bestätigt: SiteResponse mit neuen Daten
4. Frontend: Beide Tenants testen
5. Verifizieren: Alles funktioniert ✅
```

---

## ✅ Schritt 1: Vorbereitung

### Terminal 1: Backend starten

```bash
cd backend
# (oder wo immer dein backend ist)
npm run dev
# oder: dotnet run (wenn .NET)
```

**Expected Output:**
```
Backend läuft auf http://localhost:5081
CORS aktiviert für Frontend (http://localhost:5173)
```

### Terminal 2: Frontend starten

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
Frontend läuft auf http://localhost:5174 (oder 5173)
Vite ready
```

### Verify: Beide laufen?

```bash
# Terminal 3: Test existing tenant
curl "http://localhost:5081/api/v1/public/site?slug=tacos-mohammedia"
# Expected: 200 OK mit Tacos-Daten
```

✅ **Wenn 200 OK zurück kommt:** Weiter zu Schritt 2!

---

## 🍕 Schritt 2: Blublu-Pizza Daten definieren

Erstelle diese Datei: `blublu-pizza-config.json`

```json
{
  "slug": "blublu-pizza",
  "name": "Blublu Pizza",
  "timezone": "Europe/Berlin",
  "currency": "EUR",
  "config": {
    "brand": {
      "primaryColor": "#0066FF",
      "secondaryColor": "#FFAA00",
      "accentColor": "#FF0000",
      "logoUrl": null
    },
    "contact": {
      "phone": "+49 30 999 2000",
      "whatsapp": "+49 30 999 2000",
      "email": "hello@blublu-pizza.de"
    },
    "layout": {
      "showSampleShowcase": true,
      "hero": {
        "enabled": true,
        "badge": "Blublu Pizza | Berlin",
        "title": "Die besten Pizzas in Berlin",
        "description": "Handgemachte Pizzas mit italienischen Zutaten, zubereitet in unserem Holzofen.",
        "cta1": { "label": "Jetzt bestellen" },
        "cta2": { "label": "Menü ansehen" },
        "stats": [
          { "label": "Pizzas", "value": "20+" },
          { "label": "Holzofen", "value": "24h" },
          { "label": "Lieferzeit", "value": "30min" }
        ],
        "backgroundImage": "https://plus.unsplash.com/premium_photo-1769376812336-847642b315a2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      "menuSection": {
        "enabled": true,
        "badge": "Spezialitäten",
        "title": "Unsere Top Pizzas",
        "description": "Klassische und moderne Rezepte"
      },
      "steps": {
        "enabled": true,
        "badge": "Bestellprozess",
        "title": "Deine Pizza in 3 Schritten",
        "steps": [
          { "title": "Schritt 1", "subtitle": "Größe wählen", "detail": "Klein (25cm), Mittel (30cm), Groß (35cm)" },
          { "title": "Schritt 2", "subtitle": "Pizza wählen", "detail": "Aus 20+ verschiedenen Sorten" },
          { "title": "Schritt 3", "subtitle": "Bezahlen & Liefern", "detail": "Kontaktlose Lieferung oder Abholen" }
        ]
      },
      "gallery": {
        "enabled": true,
        "badge": "Galerie",
        "title": "Unsere Pizzas",
        "images": [
          "https://plus.unsplash.com/premium_photo-1769376812336-847642b315a2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://plus.unsplash.com/premium_photo-1661762555601-47d088a26b50?q=80&w=1192&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=728&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      }
    }
  },
  "categories": [
    {
      "name": "Klassische Pizzas",
      "sortOrder": 1,
      "items": [
        {
          "name": "Margherita",
          "description": "Tomato, Fresh Mozzarella, Basil, Olive Oil",
          "price": 9.50,
          "imageUrl": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=400",
          "isAvailable": true
        },
        {
          "name": "Pepperoni",
          "description": "Tomato, Mozzarella, Italian Pepperoni",
          "price": 11.50,
          "imageUrl": "https://images.unsplash.com/photo-1612967774789-2a643fc3115d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=400",
          "isAvailable": true
        },
        {
          "name": "Quattro Formaggi",
          "description": "Mozzarella, Parmesan, Gorgonzola, Ricotta",
          "price": 13.50,
          "imageUrl": "https://plus.unsplash.com/premium_photo-1722945691819-e58990e7fb27?q=80&w=1021&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=400",
          "isAvailable": true
        }
      ]
    },
    {
      "name": "Spezial Pizzas",
      "sortOrder": 2,
      "items": [
        {
          "name": "Vegetariana",
          "description": "Tomato, Mozzarella, Bell Pepper, Mushroom, Onion, Olives",
          "price": 11.00,
          "imageUrl": null,
          "isAvailable": true
        },
        {
          "name": "Carnivora",
          "description": "Tomato, Mozzarella, Prosciutto, Bacon, Sausage",
          "price": 14.50,
          "imageUrl": null,
          "isAvailable": true
        }
      ]
    },
    {
      "name": "Getränke",
      "sortOrder": 3,
      "items": [
        {
          "name": "Coca Cola",
          "description": "Coca Cola 33cl",
          "price": 2.50,
          "imageUrl": null,
          "isAvailable": true
        },
        {
          "name": "Wasser",
          "description": "Stilles oder sprudelndes Wasser 50cl",
          "price": 2.00,
          "imageUrl": null,
          "isAvailable": true
        }
      ]
    }
  ]
}
```

**Speichere diese Datei als:** `blublu-pizza-config.json` (Projekt-Root oder Desktop)

---

## 🔌 Schritt 3: Backend provisionieren

### Option A: Curl Command (Empfohlen)

**Terminal 3:** Kopiere diesen Command und führe ihn aus:

```bash
curl -X POST "http://localhost:5081/api/v1/admin/sites" \
  -H "X-Admin-Key: your-secret-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
  "slug": "blublu-pizza",
  "name": "Blublu Pizza",
  "timezone": "Europe/Berlin",
  "currency": "EUR",
  "config": {
    "brand": {
      "primaryColor": "#0066FF",
      "secondaryColor": "#FFAA00",
      "accentColor": "#FF0000"
    },
    "contact": {
      "phone": "+49 30 999 2000",
      "whatsapp": "+49 30 999 2000",
      "email": "hello@blublu-pizza.de"
    },
    "layout": {
      "showSampleShowcase": true,
      "hero": {
        "enabled": true,
        "badge": "Blublu Pizza | Berlin",
        "title": "Die besten Pizzas in Berlin",
        "description": "Handgemachte Pizzas mit italienischen Zutaten, zubereitet in unserem Holzofen.",
        "cta1": { "label": "Jetzt bestellen" },
        "cta2": { "label": "Menü ansehen" },
        "stats": [
          { "label": "Pizzas", "value": "20+" },
          { "label": "Holzofen", "value": "24h" }
        ],
        "backgroundImage": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=1600&q=80"
      },
      "menuSection": { "enabled": true, "title": "Unsere Top Pizzas" },
      "steps": {
        "enabled": true,
        "steps": [
          { "title": "Schritt 1", "subtitle": "Größe", "detail": "Klein, Mittel, Groß" },
          { "title": "Schritt 2", "subtitle": "Pizza", "detail": "20+ Sorten" },
          { "title": "Schritt 3", "subtitle": "Zahlen", "detail": "Lieferung oder Abholen" }
        ]
      },
      "gallery": {
        "enabled": true,
        "images": [
          "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1571407-5daf9e93fa40?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    }
  },
  "categories": [
    {
      "name": "Klassische Pizzas",
      "sortOrder": 1,
      "items": [
        { "name": "Margherita", "description": "Tomato, Mozzarella, Basil", "price": 9.50, "imageUrl": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=400", "isAvailable": true },
        { "name": "Pepperoni", "description": "Tomato, Mozzarella, Pepperoni", "price": 11.50, "imageUrl": "https://images.unsplash.com/photo-1571407-5daf9e93fa40?auto=format&fit=crop&w=400", "isAvailable": true },
        { "name": "Quattro Formaggi", "description": "4 Käsesorten", "price": 13.50, "imageUrl": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400", "isAvailable": true }
      ]
    },
    {
      "name": "Spezial Pizzas",
      "sortOrder": 2,
      "items": [
        { "name": "Vegetariana", "description": "Gemüse", "price": 11.00, "isAvailable": true },
        { "name": "Carnivora", "description": "Fleisch", "price": 14.50, "isAvailable": true }
      ]
    },
    {
      "name": "Getränke",
      "sortOrder": 3,
      "items": [
        { "name": "Coca Cola", "description": "33cl", "price": 2.50, "isAvailable": true },
        { "name": "Wasser", "description": "50cl", "price": 2.00, "isAvailable": true }
      ]
    }
  ]
}'
```

**⚠️ WICHTIG:** Ersetze `your-secret-admin-key` mit dem echten Admin-Key aus deinem Backend!

### Expected Response (201 Created):

```json
{
  "tenant": {
    "slug": "blublu-pizza",
    "name": "Blublu Pizza",
    "timezone": "Europe/Berlin",
    "currency": "EUR",
    "configJson": "{...}"
  },
  "categories": [
    {
      "id": "...",
      "name": "Klassische Pizzas",
      "sortOrder": 1,
      "items": [...]
    }
  ]
}
```

### Option B: Postman / Insomnia

1. Neue POST-Request erstellen
2. URL: `http://localhost:5081/api/v1/admin/sites`
3. Header:
   ```
   X-Admin-Key: your-secret-admin-key
   Content-Type: application/json
   ```
4. Body: JSON aus `blublu-pizza-config.json`
5. Send

✅ **Status 201 Created?** → Weiter zu Schritt 4!

---

## 🧪 Schritt 4: Verify Backend Response

**Teste beide Tenants:**

```bash
# Test 1: Blublu-Pizza
curl "http://localhost:5081/api/v1/public/site?slug=blublu-pizza"

# Expected: 200 OK
# - slug: "blublu-pizza"
# - categories: Klassische Pizzas, Spezial Pizzas, Getränke
# - Items mit Preisen

# Test 2: Tacos (alte sollte noch da sein)
curl "http://localhost:5081/api/v1/public/site?slug=tacos-mohammedia"

# Expected: 200 OK
# - slug: "tacos-mohammedia"
# - categories: Tacos, Drinks, Desserts
```

✅ **Beide 200 OK?** → Frontend ist nächst!

---

## 🎨 Schritt 5: Frontend Testen

### Browser Tab 1: Tacos (Existierender Tenant)

```
http://localhost:5174/?tenant=tacos-mohammedia
```

**Verifiziere:**
- [ ] Hero-Section mit Tacos-Logo
- [ ] Primärfarbe: Orange (#FF6B35)
- [ ] Tacos-Kategorien angezeigt
- [ ] Menu Items mit Bildern und Preisen
- [ ] Keine Console-Fehler

### Browser Tab 2: Blublu Pizza (Neuer Tenant)

```
http://localhost:5174/?tenant=blublu-pizza
```

**Verifiziere:**
- [ ] Hero-Section mit Blublu-Brand
- [ ] Primärfarbe: Blau (#0066FF)
- [ ] Klassische Pizzas, Spezial Pizzas, Getränke
- [ ] Items mit Preisen (EUR statt MAD)
- [ ] Gallery mit Pizza-Bildern
- [ ] Steps-Section
- [ ] Keine Console-Fehler

### Browser Tab 3: Default (Fallback)

```
http://localhost:5174/
```

**Verifiziere:**
- [ ] Falls DEFAULT_TENANT = "tacos-mohammedia" → sollte tacos laden
- [ ] Oder: Falls keine Query-Param → sollte demo fallback zeigen

---

## ✅ Schritt 6: Vollständige Checkliste

### Backend-Seite

- [ ] Terminal 1: Backend läuft (Port 5081)
- [ ] CORS aktiviert
- [ ] curl `?slug=tacos-mohammedia` → 200
- [ ] curl POST Blublu-Pizza → 201
- [ ] curl `?slug=blublu-pizza` → 200
- [ ] Beide Tenants unterschiedliche Daten

### Frontend-Seite

- [ ] Terminal 2: Frontend läuft (Port 5174)
- [ ] `?tenant=tacos-mohammedia` → Tacos laden
  - Hero angezeigt
  - Orange Farben
  - Menu Items
- [ ] `?tenant=blublu-pizza` → Blublu laden
  - Hero angezeigt
  - Blaue Farben
  - Pizza Items
  - EUR Währung
- [ ] Browser Console: keine Errors
- [ ] Network Tab: /api/v1/public/site → 200

### Network Traffic

- [ ] Frontend macht GET /api/v1/public/site?slug=X
- [ ] Backend antwortet mit SiteResponse
- [ ] Headers: X-Tenant oder ?slug= Parameter

### Styling

- [ ] Tacos: primärfarbe Orange/Rot (#FF6B35)
- [ ] Blublu: primärfarbe Blau (#0066FF)
- [ ] CSS-Variablen werden gesetzt
- [ ] Responsive Layout funktioniert

---

## 🎯 Ergebnis: So sollte es aussehen

### Tacos Seite
```
┌─────────────────────────────────────┐
│ 🌮 Makin Hir Tacos (Orange Header)  │
│                                     │
│ [Hero Image + Stats]                │
│ ├─ 15+ Sauces                       │
│ ├─ 10 Supplements                   │
│ └─ 24h Delivery                     │
│                                     │
│ TACOS (Kategorie 1)                 │
│ ├─ Tacos Cordon Bleu    55 MAD      │
│ ├─ Tacos Chevre Miel    55 MAD      │
│ └─ ...                              │
│                                     │
│ DRINKS (Kategorie 2)                │
│ ├─ Coca Cola            15 MAD      │
│ └─ ...                              │
│                                     │
│ DESSERTS (Kategorie 3)              │
│ └─ ...                              │
└─────────────────────────────────────┘
```

### Blublu Pizza Seite
```
┌─────────────────────────────────────┐
│ 🍕 Blublu Pizza (Blau Header)       │
│                                     │
│ [Hero Image + Stats]                │
│ ├─ 20+ Pizzas                       │
│ ├─ Holzofen                         │
│ └─ 30min Delivery                   │
│                                     │
│ KLASSISCHE PIZZAS (Kategorie 1)     │
│ ├─ Margherita           9.50 EUR    │
│ ├─ Pepperoni           11.50 EUR    │
│ └─ Quattro Formaggi    13.50 EUR    │
│                                     │
│ SPEZIAL PIZZAS (Kategorie 2)        │
│ ├─ Vegetariana         11.00 EUR    │
│ └─ Carnivora           14.50 EUR    │
│                                     │
│ GETRÄNKE (Kategorie 3)              │
│ ├─ Coca Cola            2.50 EUR    │
│ └─ Wasser               2.00 EUR    │
└─────────────────────────────────────┘
```

---

## 🚨 Fehlerbehebung

### ❌ curl: 401 Unauthorized

**Problem:** Falscher Admin-Key

**Lösung:**
```bash
# Prüfe deinen Backend .env
ADMIN_API_KEY=your-secret-admin-key

# Verwendeter Key im curl muss exakt matchen!
```

### ❌ Frontend zeigt Demo statt Menu

**Problem:** Backend antwortet nicht oder Slug ist falsch

**Lösung:**
```bash
# Prüfe im Browser-Network:
# GET /api/v1/public/site?slug=blublu-pizza
# → Status 200?
# → Response hat Daten?

# Curl-Test:
curl "http://localhost:5081/api/v1/public/site?slug=blublu-pizza"
```

### ❌ CORS Error im Browser

**Problem:** Backend hat CORS nicht aktiviert

**Lösung (Backend, z.B. C#):**
```csharp
// Program.cs
app.UseCors("Frontend");
```

### ❌ Preise als Strings oder isAvailable = 0/1

**Problem:** Datentyp falsch vom Backend

**Lösung:** Backend muss:
- price als DECIMAL → parseFloat() → float
- isAvailable als BOOLEAN → true/false (nicht 0/1)

### ❌ Kategorien unsortiert

**Problem:** ORDER BY nicht in Query

**Lösung (Backend SQL):**
```sql
ORDER BY c.sortOrder ASC, c.name ASC
```

---

## 🎉 Success Path

```
✅ Schritt 1: Backend & Frontend laufen
   ↓
✅ Schritt 2: Daten vorbereitet
   ↓
✅ Schritt 3: POST /api/v1/admin/sites → 201
   ↓
✅ Schritt 4: GET /api/v1/public/site → 200
   ↓
✅ Schritt 5: Browser zeigt beide Tenants
   ↓
✅ Schritt 6: Alle Checks bestanden
   ↓
🎉 FERTIG! Multi-Tenant System läuft!
```

---

## 📝 Notes

**Wenn alles funktioniert:**
- Backend ist **production-ready**
- Frontend ist **production-ready**
- System ist **multi-tenant-ready**
- Neue Tenants können beliebig hinzugefügt werden via admin API

**Nächste Schritte (optional):**
- Admin-UI bauen (Provisioning im Frontend)
- Cache-Strategy implementieren
- Monitoring/Logging
- Performance-Optimierungen
- Production-Deployment

---

## 🚀 Fertig!

Wenn alles funktioniert: **Glückwunsch!** 🎉

Dein System ist voll funktionsfähig. Du kannst jetzt beliebig viele neue Restaurants hinzufügen, indem du einfach `POST /api/v1/admin/sites` aufrufst!
