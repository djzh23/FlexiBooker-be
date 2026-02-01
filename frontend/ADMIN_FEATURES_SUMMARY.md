# Admin Panel - New Features Summary

## What Was Added

Die AdminPanel.tsx wurde erweitert mit **3 neuen Tabs** neben den existierenden 3:

### Existing Tabs ✅
1. **Dishes** - Manage menu items (CRUD)
2. **Hero Text** - Customize title & description
3. **Colors** - Primary & accent colors

### NEW Tabs 🆕

#### 4. **Layout**
- Toggles für alle Seiten-Abschnitte:
  - ☑️ Show Hero Banner
  - ☑️ Show Menu Section
  - ☑️ Show Steps Section
  - ☑️ Show Gallery

**API Call:**
```javascript
PATCH /api/v1/admin/sites/:tenant
Body: {
  layout: {
    hero: { enabled: true },
    menuSection: { enabled: true },
    steps: { enabled: true },
    gallery: { enabled: true }
  }
}
```

---

#### 5. **Hero Image**
- Upload/paste neue Hero-Hintergrundbild-URL
- Live-Preview der Bild-URL
- Unterstützt alle Standard-Image-URLs (Unsplash, etc.)

**API Call:**
```javascript
PATCH /api/v1/admin/sites/:tenant
Body: {
  layout: {
    hero: {
      backgroundImage: "https://..."
    }
  }
}
```

---

#### 6. **Typography**
- Wähle Schriftart für Text (Body Font)
  - Inter, Poppins, Roboto, Open Sans, Lato, Montserrat
  
- Wähle Schriftart für Überschriften (Heading Font)
  - Poppins, Inter, Roboto, Montserrat, Playfair Display
  
- Passe Schriftgröße an:
  - Body: 12-24px
  - Headings: 24-64px

**API Call:**
```javascript
PATCH /api/v1/admin/sites/:tenant
Body: {
  brand: {
    fontFamily: "Poppins",
    headingFontFamily: "Playfair Display",
    fontSizeBody: 16,
    fontSizeHeading: 36
  }
}
```

---

## Frontend Status

✅ **Alles komplett:**
- Alle 6 Tabs implementiert
- Alle Forms mit Validierung
- Success/Error Messages
- Translations in EN/FR/AR
- Build erfolgreich (0 Fehler, 284.76 KB)
- Admin Panel accessible unter `?admin=true`

---

## What Backend Needs to Do

### 1. Accept New Fields in PATCH

Dein Backend muss diese neuen Felder in der `PATCH /api/v1/admin/sites/:tenant` akzeptieren:

**Layout:**
```json
{
  "layout": {
    "hero": { "enabled": true },
    "menuSection": { "enabled": true },
    "steps": { "enabled": true },
    "gallery": { "enabled": true }
  }
}
```

**Hero Image:**
```json
{
  "layout": {
    "hero": {
      "backgroundImage": "https://..."
    }
  }
}
```

**Typography:**
```json
{
  "brand": {
    "fontFamily": "Poppins",
    "headingFontFamily": "Playfair Display",
    "fontSizeBody": 16,
    "fontSizeHeading": 36
  }
}
```

### 2. Merge Logic

Wenn Admin aktualisiert, darfst du nicht die **ganze** config überschreiben!

**Richtig:**
```javascript
const existingConfig = JSON.parse(tenant.configJson);
const newConfig = deepMerge(existingConfig, requestBody);
tenant.configJson = JSON.stringify(newConfig);
```

**Falsch:**
```javascript
// ❌ Das würde alle anderen Felder löschen!
tenant.configJson = JSON.stringify(requestBody);
```

### 3. Validation

Validiere diese Felder:
- `fontFamily`: Muss in Liste sein (Inter, Poppins, etc.)
- `headingFontFamily`: Muss in Liste sein
- `fontSizeBody`: 12-24 px
- `fontSizeHeading`: 24-64 px
- `backgroundImage`: Valid URL, HTTPS recommended

### 4. Database

Stelle sicher, dass die `configJson` Spalte in der Tenant-Tabelle:
- Alle neuen Felder speichern kann
- JSON Type unterstützt (PostgreSQL, MySQL, etc.)
- Nach PATCH aktualisiert wird

---

## Complete Request/Response Example

### Request (Frontend sendet)
```bash
curl -X PATCH http://localhost:5081/api/v1/admin/sites/tacos-mohammedia \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "layout": {
      "hero": { "enabled": true },
      "menuSection": { "enabled": true },
      "steps": { "enabled": true },
      "gallery": { "enabled": true }
    },
    "brand": {
      "fontFamily": "Poppins",
      "headingFontFamily": "Playfair Display",
      "fontSizeBody": 18,
      "fontSizeHeading": 42
    }
  }'
```

### Response (Backend sendet zurück)
```json
{
  "tenant": {
    "slug": "tacos-mohammedia",
    "name": "Makin Hir Tacos",
    "configJson": "{...full updated config...}"
  },
  "categories": [...],
  "status": 200
}
```

---

## Testing Flow

1. **Admin öffnet:** http://localhost:5174/?tenant=tacos-mohammedia&admin=true
2. **Admin loggt ein** mit Passwort
3. **Admin klickt auf neue Tabs:**
   - Layout → Toggle Hero Off → Save
   - Hero Image → Paste neue URL → Save
   - Typography → Select Roboto → Save Heading 42px → Save
4. **Admin refreshed Seite**
5. **Änderungen sollten sichtbar sein:**
   - Hero-Abschnitt verschwunden (wenn toggled off)
   - Neue Hintergrundbild
   - Neue Schrift & Größe

---

## Files to Update (Backend)

**Welche Backend-Dateien müssen angepasst werden:**

1. **Tenant Model/Entity**
   - Überprüfe, dass `configJson` all diese Felder speichern kann

2. **PATCH /api/v1/admin/sites/:tenant Handler**
   - Akzeptiere neue Felder
   - Merging-Logik für partielle Updates
   - Validierung

3. **GET /api/v1/public/site Handler**
   - Stelle sicher, dass neue Felder in der Response enthalten sind

4. **Database Migration (falls nötig)**
   - Falls `configJson` noch nicht existiert, erstelle es

---

## Documentation

📄 **Vollständige API-Spezifikation:** `BACKEND_API_SPECIFICATION.md`

Alles was der Backend-Developer braucht, ist dort dokumentiert:
- Alle neuen Endpoints
- Request/Response Bodies
- Validierung Rules
- Examples
- Testing Checklist

---

## Build Status

✅ **Frontend komplett:**
```
✓ 79 modules transformed
✓ dist/assets/index-Gs0cdEHQ.js (284.76 kB, gzip: 88.11 kB)
✓ built in 1.22s
✓ 0 TypeScript errors
```

Bereit zum Testen sobald Backend bereit ist!

