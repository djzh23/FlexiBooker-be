# 📁 Tenant-Konfigurationen

Alle JSON-Konfigurationen für verschiedene Restaurants/Tenants befinden sich hier.

## 📋 Struktur

```
tenant-configs/
├── README.md                    (diese Datei)
├── tacos-mohammedia.json       (Tacos-Restaurant - Beispiel)
├── pizzeria-roma.json          (Pizza-Restaurant - Beispiel)
├── burger-master.json          (Burger-Restaurant - Beispiel)
└── [your-tenant-name].json    (Neue Tenants)
```

## 🎯 Verwendung

### Frontend - Automatisches Laden
Das Frontend lädt die Konfiguration automatisch vom Backend:

```typescript
// src/pages/LandingPage.tsx
const { tenant, config } = await fetchTenant(tenantSlug);
// config wird dann zu LayoutRenderer gepasst
```

### Backend - JSON Speichern
Die JSON-Datei wird im Backend gespeichert:

**Option A: JSON-Datei**
```
/backend/configs/tacos-mohammedia.json
```

**Option B: Datenbank**
```sql
tenants.configJson = '{"brand": {...}, "layout": {...}}'
```

## 📝 Template-Beispiele

### Tacos-Restaurant
- **Datei:** `tacos-mohammedia.json`
- **Farben:** Orange (#FF6B35) + Dunkelblau
- **Hero Title:** "Le #1 French Tacos au Maroc"
- **Steps:** 5 Schritte (Größe → Viande → Sauce → Supplements → Gratinieren)

### Pizza-Restaurant
- **Datei:** `pizzeria-roma.json`
- **Farben:** Rot (#C1272D) + Gelb
- **Hero Title:** "Authentische Italienische Pizzas"
- **Steps:** 4 Schritte (Größe → Pizza → Extras → Kasse)

### Burger-Restaurant
- **Datei:** `burger-master.json`
- **Farben:** Braun (#8B6F47) + Gold
- **Hero Title:** "Handmade Premium Burgers"
- **Steps:** 5 Schritte (Fleisch → Brot → Toppings → Sauce → Extras)

## 🚀 Neuen Tenant Hinzufügen

### Methode 1: Script verwenden (Empfohlen)
```bash
node scripts/create-tenant.js \
  --slug=dein-restaurant \
  --name="Dein Restaurant" \
  --restaurant-type=tacos
```

### Methode 2: Manual kopieren
1. Wähle ähnliches Restaurant (z.B. `tacos-mohammedia.json`)
2. Kopiere die Datei: `cp tacos-mohammedia.json dein-restaurant.json`
3. Bearbeite `dein-restaurant.json` und passe an:
   - Brand-Farben
   - Contact-Daten
   - Hero-Texte
   - Bilder-URLs
   - Steps (Prozess anpassen)

## 🔧 Bearbeitung

Öffne die JSON-Datei in deinem Editor:

```json
{
  "brand": {
    "primaryColor": "#FF6B35",
    "secondaryColor": "#004E89"
  },
  "contact": {
    "phone": "+212 6 XX XX XX XX",
    "whatsapp": "+212 6 XX XX XX XX"
  },
  "layout": {
    "showSampleShowcase": true,
    "hero": { ... },
    "menuSection": { ... },
    "steps": { ... },
    "gallery": { ... }
  }
}
```

## ✅ Validierung

Vor dem Deployment prüfen:

- [ ] `slug` eindeutig (nur Kleinbuchstaben, Bindestriche)
- [ ] `brand.primaryColor` ist valide Hex-Farbe
- [ ] `contact.phone` und `whatsapp` haben das gleiche Format
- [ ] `hero.title` ist nicht zu lang (<60 Zeichen)
- [ ] Alle `backgroundImage` URLs sind erreichbar
- [ ] `steps.steps` Array hat die richtige Anzahl
- [ ] `gallery.images` sind hochwertige Bilder

## 📚 Dokumentation

- **CONFIG_REFERENCE.md** - Detaillierte JSON-Dokumentation
- **QUICK_START.md** - 5-Minuten Setup
- **ARCHITECTURE.md** - System-Design
- **MIGRATION_GUIDE.ts** - Alte vs. Neue Struktur

## 💡 Pro-Tipps

1. **Farbe wählen:** Nutze https://colorhexa.com für Hex-Codes
2. **Bilder optimieren:** Verwende `?auto=format&fit=crop&w=1200` für responsive Images
3. **Typos vermeiden:** Nutze JSON-Validator (https://jsonlint.com)
4. **Versionieren:** Speichere alte Versionen in Git
5. **A/B Testing:** Erstelle zwei Versions (z.B. `...-v1.json`, `...-v2.json`)

## 🎯 Next Steps

Nach dem Erstellen der JSON:

1. Backend-Konfiguration hinzufügen
2. API-Endpoint testet (Postman)
3. Frontend mit Tenant laden
4. Menu-Items vom Backend laden
5. Zahlungsgateway einrichten
6. Deployment vorbereiten

---

**Fragen?** Siehe QUICK_START.md oder ARCHITECTURE.md
