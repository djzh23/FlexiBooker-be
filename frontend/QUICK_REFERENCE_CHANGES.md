# 🎯 QUICK REFERENCE - Wo man Änderungen macht

**Schnelle Übersicht: Welche Datei für welche Änderung?**

---

## 📋 Restaurant Anpassen: Schritt-für-Schritt

### 1. **FARBEN ÄNDERN** 🎨

**Problem:** Neue Farben für Restaurant

**Lösung:** Backend Datenbank → `tenants` Tabelle → `configJson` Feld

```json
// Im configJson String:
{
  "brand": {
    "primaryColor": "#0066FF",    ← Ändere Primärfarbe
    "secondaryColor": "#FFAA00",  ← Ändere Sekundärfarbe
    "accentColor": "#FF0000"      ← Ändere Akzentfarbe
  }
}
```

**Frontend:** Automatisch! `applyTenantTheme()` liest die Farben und setzt CSS-Variablen.

**Datei:** `src/modules/tenant/applyTheme.ts` (nur anschauen, nicht ändern!)

---

### 2. **HERO SECTION TEXT ÄNDERN** 📝

**Problem:** Hero-Titel, Beschreibung, Bild ändern

**Lösung:** Backend → `tenants` → `configJson`

```json
{
  "layout": {
    "hero": {
      "enabled": true,
      "badge": "Blublu Pizza | Berlin",         ← Ändere Badge
      "title": "Die besten Pizzas in Berlin",   ← Ändere Titel
      "description": "Handgemachte...",         ← Ändere Beschreibung
      "backgroundImage": "https://...",         ← Ändere Hintergrundbild
      "cta1": { "label": "Jetzt bestellen" },   ← Ändere Button 1
      "cta2": { "label": "Menü ansehen" }       ← Ändere Button 2
    }
  }
}
```

**Frontend:** Automatisch! `HeroSection` in `layoutRenderer.tsx` liest und rendert diese Werte.

**Datei:** `src/modules/tenant/layoutRenderer.tsx` (nur anschauen, nicht ändern!)

---

### 3. **MENU ITEMS HINZUFÜGEN/ÄNDERN** 🍕

**Problem:** Neue Pizzas, Drinks, etc. hinzufügen

**Lösung:** Backend → SQL INSERT/UPDATE in `menu_items`

```sql
-- Items für "Klassische Pizzas" Kategorie
INSERT INTO menu_items (categoryId, tenantId, name, price, description, imageUrl, isAvailable)
VALUES (
  5,                              -- Welche Kategorie? (Klassische Pizzas)
  2,                              -- Welcher Restaurant? (Blublu = ID 2)
  'Neue Pizza',                   -- Name
  12.50,                          -- Preis (als Zahl!)
  'Description...',               -- Beschreibung
  'https://image.url/...',        -- Bild-URL
  true                            -- Verfügbar?
);
```

**Frontend:** Automatisch! `MenuSection` in `layoutRenderer.tsx` liest `site.categories` und rendert Items.

**Datei:** `src/modules/tenant/layoutRenderer.tsx` (Komponente `MenuSection`, Zeile ~60-80)

---

### 4. **NEUE KATEGORIE HINZUFÜGEN** 📂

**Problem:** "Spezial Pizzas" hinzufügen, "Desserts" umbenennen

**Lösung:** Backend → SQL INSERT/UPDATE in `menu_categories`

```sql
-- Neue Kategorie hinzufügen
INSERT INTO menu_categories (tenantId, name, sortOrder)
VALUES (
  2,                    -- Welcher Restaurant? (Blublu)
  'Spezial Pizzas',    -- Kategorie-Name
  2                     -- Reihenfolge (1=erste, 2=zweite, etc.)
);

-- Kategorie umbenennen
UPDATE menu_categories
SET name = 'Nachtische'
WHERE name = 'Desserts' AND tenantId = 1;
```

**Frontend:** Automatisch! Kategorien werden in `MenuSection` gerendert, sortiert nach `sortOrder`.

**Datei:** `src/modules/tenant/layoutRenderer.tsx` (Komponente `MenuSection`, mapped über `categories`)

---

### 5. **KONTAKT INFORMATIONEN ÄNDERN** 📞

**Problem:** Telefon, Email, WhatsApp aktualisieren

**Lösung:** Backend → `tenants` → `configJson`

```json
{
  "contact": {
    "phone": "+49 30 999 2000",       ← Ändere Telefon
    "whatsapp": "+49 30 999 2000",    ← Ändere WhatsApp
    "email": "hello@blublu-pizza.de"  ← Ändere Email
  }
}
```

**Frontend:** Wird (noch) nicht angezeigt. Kann später in `ContactSection` verwendet werden.

**Datei:** `src/modules/tenant/layoutRenderer.tsx` (neue Komponente notwendig)

---

### 6. **STEPS SECTION ÄNDERN** 👣

**Problem:** "Wie man bestellt" / Prozess-Schritte ändern

**Lösung:** Backend → `tenants` → `configJson`

```json
{
  "layout": {
    "steps": {
      "enabled": true,
      "badge": "Bestellprozess",
      "title": "Deine Pizza in 3 Schritten",
      "steps": [
        {
          "title": "Schritt 1",        ← Ändere
          "subtitle": "Größe wählen",  ← Ändere
          "detail": "Klein, Mittel, Groß"  ← Ändere
        },
        { ... }
      ]
    }
  }
}
```

**Frontend:** Automatisch! `StepsSection` in `layoutRenderer.tsx` liest und rendert diese Werte.

**Datei:** `src/modules/tenant/layoutRenderer.tsx` (Komponente `StepsSection`, Zeile ~100-120)

---

### 7. **GALLERY BILDER ÄNDERN** 🖼️

**Problem:** Neue Fotos von Pizzas, Restaurant, etc.

**Lösung:** Backend → `tenants` → `configJson`

```json
{
  "layout": {
    "gallery": {
      "enabled": true,
      "title": "Unsere Pizzas",
      "images": [
        "https://images.unsplash.com/...",  ← Ändere Bild 1
        "https://images.unsplash.com/...",  ← Ändere Bild 2
        "https://images.unsplash.com/..."   ← Ändere Bild 3
      ]
    }
  }
}
```

**Frontend:** Automatisch! `GallerySection` in `layoutRenderer.tsx` liest und rendert diese URLs.

**Datei:** `src/modules/tenant/layoutRenderer.tsx` (Komponente `GallerySection`, Zeile ~130-150)

---

## 🔧 Backend-Datenbank Struktur

### Tabelle: `tenants`

```sql
CREATE TABLE tenants (
  id INT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,              -- ← Was man in URL eingibt
  name VARCHAR(255),                     -- ← Restaurant-Name
  timezone VARCHAR(255),                 -- ← Zeitzone
  currency VARCHAR(3),                   -- ← EUR, MAD, GBP
  configJson LONGTEXT,                   -- ← ALLES für Design: Farben, Hero, Steps, Gallery
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Was ändern:**
- `configJson`: Alle Design-Änderungen (Farben, Text, Bilder)

---

### Tabelle: `menu_categories`

```sql
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY,
  tenantId INT REFERENCES tenants(id),
  name VARCHAR(255),                     -- ← "Tacos", "Drinks", "Spezial Pizzas"
  sortOrder INT,                         -- ← Reihenfolge (1, 2, 3)
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Was ändern:**
- `name`: Kategorie-Namen
- `sortOrder`: Reihenfolge

---

### Tabelle: `menu_items`

```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY,
  categoryId UUID REFERENCES menu_categories(id),
  tenantId INT REFERENCES tenants(id),
  name VARCHAR(255),                     -- ← "Margherita"
  description TEXT,                      -- ← "Tomato, Mozzarella..."
  price DECIMAL(10, 2),                  -- ← 9.50 (MUSS Zahl sein!)
  imageUrl VARCHAR(500),                 -- ← Pizza-Foto URL
  isAvailable BOOLEAN DEFAULT true,      -- ← true/false (nicht 0/1!)
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Was ändern:**
- `name`: Item-Namen
- `price`: Preise (als Dezimalzahl!)
- `imageUrl`: Bilder
- `isAvailable`: Verfügbarkeit

---

## 🎯 Praktische Beispiele

### Beispiel 1: "Margherita" Pizza teurer machen

**SQL:**
```sql
UPDATE menu_items
SET price = 11.50  -- War 9.50, ist jetzt 11.50
WHERE name = 'Margherita' AND tenantId = 2;
```

**Frontend:** Automatically zeigt neuen Preis! 🚀

---

### Beispiel 2: Hero-Titel für Blublu Pizza ändern

**SQL:**
```sql
UPDATE tenants
SET configJson = REPLACE(
  configJson,
  '"title": "Die besten Pizzas in Berlin"',
  '"title": "Italiens beste Pizzas - Jetzt in Berlin"'
)
WHERE slug = 'blublu-pizza';
```

**Frontend:** Automatically zeigt neuen Text! 🚀

---

### Beispiel 3: Neue Kategorie "Desserts" mit Items

**SQL:**
```sql
-- 1. Kategorie hinzufügen
INSERT INTO menu_categories (tenantId, name, sortOrder)
VALUES (2, 'Desserts', 4);  -- ID wird auto-generated (z.B. d2312ae8...)

-- 2. Items hinzufügen
INSERT INTO menu_items (categoryId, tenantId, name, price, description, isAvailable)
VALUES (
  'd2312ae8-461a-44ae-91cd-77e23443f1e9',  -- Die neue Category ID
  2,  -- Blublu Pizza
  'Tiramisu',
  7.50,
  'Italian dessert with mascarpone and cocoa',
  true
);
```

**Frontend:** Neue Kategorie erscheint automatisch bei nächstem Laden! 🚀

---

## 📱 Frontend-Code: Wo werden die Änderungen angezeigt?

| Komponente | Datei | Zeile | Liest von |
|------------|-------|-------|-----------|
| **HeroSection** | `src/modules/tenant/layoutRenderer.tsx` | ~30-50 | `config.layout.hero` |
| **MenuSection** | `src/modules/tenant/layoutRenderer.tsx` | ~60-80 | `site.categories[]` |
| **StepsSection** | `src/modules/tenant/layoutRenderer.tsx` | ~100-120 | `config.layout.steps` |
| **GallerySection** | `src/modules/tenant/layoutRenderer.tsx` | ~130-150 | `config.layout.gallery` |
| **Farben** | `src/modules/tenant/applyTheme.ts` | ~5-10 | `config.brand.primaryColor` |

**Regel:** Alles kommt von Backend, Frontend liest nur und rendert! ✨

---

## ❌ Häufige Fehler

### ❌ Fehler 1: Price als String statt Zahl

```sql
❌ FALSCH:
INSERT INTO menu_items (..., price, ...)
VALUES (..., '9.50', ...);

✅ RICHTIG:
INSERT INTO menu_items (..., price, ...)
VALUES (..., 9.50, ...);
```

**Resultat:** Frontend zeigt `"9.50 EUR"` statt `9.50 EUR`

---

### ❌ Fehler 2: isAvailable als 0/1 statt boolean

```sql
❌ FALSCH:
INSERT INTO menu_items (..., isAvailable, ...)
VALUES (..., 1, ...);  -- 1 für true, 0 für false

✅ RICHTIG:
INSERT INTO menu_items (..., isAvailable, ...)
VALUES (..., true, ...);
```

**Resultat:** Frontend-Filter funktionieren nicht

---

### ❌ Fehler 3: Kategorien nicht sortiert

```sql
❌ FALSCH:
INSERT INTO menu_categories (tenantId, name, sortOrder)
VALUES (2, 'Desserts', null);  -- sortOrder fehlt!

✅ RICHTIG:
INSERT INTO menu_categories (tenantId, name, sortOrder)
VALUES (2, 'Desserts', 4);  -- sortOrder gesetzt
```

**Resultat:** Kategorien erscheinen in zufälliger Reihenfolge

---

## 🚀 Zusammenfassung

| Änderung | Wo? | Datei |
|----------|-----|-------|
| Farben | `tenants.configJson.brand` | Backend SQL |
| Hero-Text | `tenants.configJson.layout.hero` | Backend SQL |
| Menu Items | `menu_items` Tabelle | Backend SQL |
| Kategorien | `menu_categories` Tabelle | Backend SQL |
| Steps | `tenants.configJson.layout.steps` | Backend SQL |
| Gallery | `tenants.configJson.layout.gallery` | Backend SQL |
| Frontend Layout | `layoutRenderer.tsx` | Frontend (nur wenn Struktur ändert) |
| Frontend Styling | `App.css` / `themes.css` | Frontend (nur wenn CSS ändert) |

**Regel der Thumb:**
- **Design & Daten:** Backend (Datenbank)
- **Layout & Struktur:** Frontend (React Code)
- **Styling:** Frontend (CSS)

---

## ✨ Du bist bereit!

Jetzt kannst du:
- ✅ Farben ändern
- ✅ Text ändern
- ✅ Menu Items ändern
- ✅ Neue Kategorien hinzufügen
- ✅ Neue Restaurants erstellen
- ✅ Alles ohne Frontend-Code zu ändern!

**Multi-Tenant-Power!** 🚀
