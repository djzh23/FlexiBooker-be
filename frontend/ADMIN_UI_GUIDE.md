# 🔧 ADMIN-UI IMPLEMENTIERUNGSANLEITUNG

## Das Problem, das wir lösen

**Alte Workflow ("Dev führt POST aus"):**
- Restaurant möchte Preis ändern
- Restaurant kontaktiert Developer
- Developer macht manuell SQL UPDATE
- **Nicht skalierbar = Nicht rentabel**

**Neue Workflow (Admin-UI):**
- Restaurant möchte Preis ändern
- Restaurant geht zur Admin-UI und klickt einen Button
- Change wird sofort live
- **Selbst-Service = Skalierbar = Rentabel ✅**

---

## 🏗️ Architektur

```
LandingPage.tsx
    ↓
    ├─→ Normale Benutzer: Sehen LayoutRenderer (Menü, Hero, etc.)
    │
    ├─→ Admin-Modus (?admin=true): Zeigt AdminAccess
        ├─→ AdminGate (Passwort-Eintrag)
        ├─→ AdminPanel (3 Tabs: Gerichte, Hero, Farben)
```

### Komponenten

| Datei | Zweck |
|-------|-------|
| `AdminAccess.tsx` | Wrapper: AdminGate + AdminPanel + Notifications |
| `AdminGate.tsx` | Passwort-Screen (Sicherheit) |
| `AdminPanel.tsx` | 3-Tab Dashboard (Gerichte, Hero, Farben) |
| Admin CSS | Styling |

---

## 🚀 Integration in LandingPage.tsx

```typescript
import { AdminAccess } from "../modules/admin/AdminAccess";

// In LandingPage.tsx useEffect:
const urlParams = new URLSearchParams(window.location.search);
const isAdminMode = urlParams.get("admin") === "true";

// Render normal OR admin:
return (
  <>
    {isAdminMode ? (
      <AdminAccess
        tenantSlug={tenantSlug}
        adminKey={getAdminKey()} // Aus env
        currentSite={siteData}
      />
    ) : (
      <LayoutRenderer config={config} categories={categories} />
    )}
  </>
);
```

### Admin-Key laden

**Aus env.ts:**
```typescript
export const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || "dev-admin-key";

function getAdminKey(): string {
  // Option 1: Master-Admin-Key (alle Restaurants)
  return ADMIN_KEY;
  
  // Option 2 (Zukunft): Per-Restaurant Key aus Datenbank
  // return siteData?.tenant?.adminKey;
}
```

---

## 🔐 Sicherheit

### Current: Master Admin Key
```env
VITE_ADMIN_KEY=dev-admin-key
```

### Future: Per-Restaurant Key
```typescript
// In admin.service.ts POST /api/v1/admin/sites
// Backend generiert adminKey und speichert im DB
{
  tenant: {
    slug: "blublu-pizza",
    adminKey: "secret-key-for-this-restaurant-only"
  }
}
```

---

## 📝 Forms im AdminPanel

### Tab 1: 🍽️ Gerichte
- **Kategorie wählen** → Dropdown
- **Gericht-Name** → Text input
- **Preis** → Number input (EUR/USD/CHF)
- **Beschreibung** → Optional textarea
- **Button:** ✅ Gericht hinzufügen

**Backend-Integration (TODO):**
```typescript
// Neue Endpoints nötig:
POST /api/v1/admin/sites/{tenantSlug}/items
  Body: { name, price, description, categoryId }
  Header: X-Admin-Key
```

### Tab 2: 📝 Hero-Section
- **Haupttitel** → 60 Zeichen max
- **Beschreibung** → 150 Zeichen max
- **Button:** ✅ Speichern

**Speichert in:** configJson → tenant.hero
```json
{
  "hero": {
    "title": "Die besten Pizzas in Berlin",
    "description": "Handgemachte Pizzas mit italienischen Zutaten"
  }
}
```

### Tab 3: 🎨 Farben
- **Primärfarbe** → Color picker + Hex-Input
- **Akzentfarbe** → Color picker + Hex-Input
- **Button:** ✅ Farben speichern
- **Preview:** Live-Vorschau der Farben

**Speichert in:** configJson → tenant.brand
```json
{
  "brand": {
    "colors": {
      "primary": "#0066FF",
      "accent": "#FF0000",
      "secondary": "#00AA55"
    }
  }
}
```

---

## 🔗 Workflow: Gericht hinzufügen

1. Admin öffnet `https://restaurant.de/?admin=true`
2. AdminGate zeigt Passwort-Screen
3. Admin gibt Admin-Key ein (z.B. "dev-admin-key")
4. AdminGate → AdminPanel freigeschaltet
5. Admin wählt Tab "🍽️ Gerichte"
6. Füllt Form: Name="Margherita", Preis="9.50"
7. Klick "✅ Gericht hinzufügen"
8. AdminPanel → Calls Backend POST /api/v1/admin/sites/{slug}/items
9. Backend → DB: INSERT in menu_items
10. Frontend zeigt Success-Notification
11. Liste aktualisiert sich
12. ✅ Fertig — keine Developer-Hilfe nötig!

---

## 🔗 Backend-Endpoints (TODO)

Diese Endpoints müssen noch implementiert werden:

### 1️⃣ Gericht hinzufügen
```
POST /api/v1/admin/sites/{tenantSlug}/items

Header:
  X-Admin-Key: dev-admin-key

Body:
{
  "name": "Margherita",
  "price": 9.50,
  "description": "Tomato, Mozzarella, Basil",
  "categoryId": "uuid-here"
}

Response:
{
  "id": "uuid",
  "name": "Margherita",
  "price": 9.50,
  "created": "2024-01-15T10:30:00Z"
}
```

### 2️⃣ Gericht bearbeiten
```
PATCH /api/v1/admin/sites/{tenantSlug}/items/{itemId}

Header:
  X-Admin-Key: dev-admin-key

Body:
{
  "name": "Margherita (neue)",
  "price": 10.50
}
```

### 3️⃣ Gericht löschen
```
DELETE /api/v1/admin/sites/{tenantSlug}/items/{itemId}

Header:
  X-Admin-Key: dev-admin-key
```

### 4️⃣ Hero-Section & Farben aktualisieren
```
PATCH /api/v1/admin/sites/{tenantSlug}

Header:
  X-Admin-Key: dev-admin-key

Body:
{
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
}
```

---

## 📊 Live-Updates nach Änderung

Momentan: Nach Admin-Change muss Browser neu laden um Updates zu sehen.

**Besser (Zukunft):** WebSocket oder Polling
```typescript
// Nach erfolgreicher Admin-Änderung:
// 1. Cache invalidieren
// 2. fetchSite() erneut aufrufen
// 3. UI neu rendern
```

---

## 🧪 Test-Workflow

### 1. Admin-UI öffnen
```
http://localhost:5174/?slug=blublu-pizza&admin=true
```

### 2. AdminGate-Test
- Falscher Key eingeben → "❌ Falscher Admin-Schlüssel"
- Richtiger Key eingeben → AdminPanel freigeschaltet

### 3. Gericht-Form-Test
- Alle Felder füllen
- Submit → Success-Notification
- Neue Liste zeigt Gericht

### 4. Hero-Form-Test
- Titel + Beschreibung ändern
- Vorschau aktualisiert sich live
- Submit → Success-Notification

### 5. Farben-Form-Test
- Primärfarbe ändern → Vorschau zeigt neue Farbe
- Akzentfarbe ändern → Vorschau aktualisiert sich
- Submit → Success-Notification
- (Nach Seiten-Reload: Neue Farben live)

---

## 🎯 Minimale MVP (Was wir haben)

✅ AdminPanel mit 3 Tabs (Gerichte, Hero, Farben)
✅ AdminGate Passwort-Screen
✅ Forms mit Validierung
✅ Live-Previews
✅ Success/Error Notifications
✅ Responsive Design

---

## 🚧 Nächste Schritte

1. **Backend-Endpoints** implementieren (4x POST/PATCH/DELETE)
2. **Form-Submission** mit echten API-Calls verbinden
3. **Live-Updates** nach Änderung (Cache-Invalidierung)
4. **Per-Restaurant Admin-Keys** (statt Master-Key)
5. **Edit/Delete-Funktionen** für bestehende Gerichte
6. **Image-Upload** für Gericht-Bilder
7. **Bulk-Operations** (mehrere Gerichte auf einmal ändern)

---

## 💡 Pro-Tipps

### Debug-Modus
```typescript
// In AdminPanel.tsx addieren:
const DEBUG = true;
if (DEBUG) console.log("Form submitted:", { dishName, dishPrice });
```

### Admin-Key in localStorage speichern
```typescript
// In AdminGate.tsx:
const handleSubmit = (e: React.FormEvent) => {
  if (inputKey === adminKey) {
    localStorage.setItem("admin-key", inputKey);
    setIsLocked(false);
  }
};

// On mount: Auto-unlock if key saved
useEffect(() => {
  const savedKey = localStorage.getItem("admin-key");
  if (savedKey === adminKey) setIsLocked(false);
}, []);
```

### Quick-Access Button
```typescript
// In LandingPage.tsx Header:
<button onClick={() => window.location.href += "?admin=true"}>
  🔧 Admin
</button>
```

---

## 🎓 Zusammenfassung

Diese Admin-UI ist der **Schlüssel zu echter SaaS-Skalierbarkeit**:

- ❌ **Alte Weg:** Jede Änderung = Developer involvement = Nicht skalierbar
- ✅ **Neue Weg:** Besitzer können selbst Änderungen machen = Skalierbar

Mit dieser UI können Restaurants in **Minuten** ohne Developer ihre Seite anpassen. Das ist der Unterschied zwischen "interessantem Projekt" und "professionellem SaaS-Produkt".

---

**Status:** MVP fertig, Backend-Integration pending
**Zeitaufwand:** Frontend ~2h, Backend ~3h, Testing ~1h
