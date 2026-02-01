# 🚀 Quick Start - Neuen Tenant Hinzufügen

## 5 Minuten Setup für einen neuen Restaurant

### Schritt 1: Basis-Informationen sammeln
```
Restaurant-Name: "Pizzeria Roma"
Slug: "pizzeria-roma"
Stadt: "Casablanca"
Telefon: "+212 6 XX XX XX"
WhatsApp: "+212 6 XX XX XX"
Typ: "pizza" oder "tacos" oder "burger"
```

### Schritt 2: Konfiguration generieren
```bash
cd frontend
node scripts/create-tenant.js \
  --slug=pizzeria-roma \
  --name="Pizzeria Roma" \
  --restaurant-type=pizza
```

**Output:** `tenant-configs/pizzeria-roma.json`

### Schritt 3: JSON anpassen

Öffne die generierte Datei und passe an:

```json
{
  "brand": {
    "primaryColor": "#C1272D",    // Pizza-Rot
    "logoUrl": "https://your-cdn.com/logo.png"
  },
  "contact": {
    "phone": "+212 6 XX XX XX XX",
    "whatsapp": "+212 6 XX XX XX XX"
  },
  "layout": {
    "showSampleShowcase": true,
    "hero": {
      "enabled": true,
      "badge": "Pizzeria Roma | Casablanca",
      "title": "Die besten Pizzas der Stadt",
      "description": "100% authentische italienische Rezepte...",
      "backgroundImage": "https://your-images.com/pizza-hero.jpg"
    },
    "menuSection": { "enabled": true },
    "steps": { "enabled": true },
    "gallery": { "enabled": true }
  }
}
```

### Schritt 4: Backend konfigurieren

**Option A: JSON-Datei (Empfohlen für schnellen Start)**
```bash
# Kopiere die JSON-Datei ins Backend-Projekt
cp tenant-configs/pizzeria-roma.json /path/to/backend/configs/
```

**Option B: Datenbank (Production)**
```sql
INSERT INTO tenants (
  slug, name, currency, timezone, configJson
) VALUES (
  'pizzeria-roma',
  'Pizzeria Roma',
  'MAD',
  'Africa/Casablanca',
  '{ "brand": {...}, "layout": {...} }'
);
```

### Schritt 5: Backend-API Endpoint hinzufügen

Backend-Service sollte Tenant-Konfiguration zurückgeben:
```typescript
// Backend: GET /api/v1/public/tenant?slug=pizzeria-roma
{
  "slug": "pizzeria-roma",
  "name": "Pizzeria Roma",
  "currency": "MAD",
  "configJson": "{...}"
}
```

### Schritt 6: Testen

```bash
# Frontend starten
npm run dev

# Im Browser öffnen (mit env-Variable oder subdomain):
http://localhost:5173/?tenant=pizzeria-roma
# oder
http://pizzeria-roma.localhost:5173
```

✅ **Fertig!** Das Frontend sollte jetzt mit der Konfiguration laden.

---

## 🎨 Voreingestellte Farben

### Tacos 🌮
```json
{
  "primaryColor": "#FF6B35",    // Orange
  "secondaryColor": "#004E89"   // Dunkelblau
}
```

### Pizza 🍕
```json
{
  "primaryColor": "#C1272D",    // Rot
  "secondaryColor": "#FAD201"   // Gelb
}
```

### Burger 🍔
```json
{
  "primaryColor": "#8B6F47",    // Braun
  "secondaryColor": "#D4AF37"   // Gold
}
```

### Kebab 🌯
```json
{
  "primaryColor": "#D4AF37",    // Gold
  "secondaryColor": "#2D2D2D"   // Grau
}
```

---

## 📋 Checkliste

- [ ] Tenant-Slug definiert
- [ ] Restaurant-Informationen gesammelt
- [ ] Konfiguration generiert mit `create-tenant.js`
- [ ] JSON angepasst (Farben, Texte, Bilder)
- [ ] Backend-Konfiguration hinzugefügt
- [ ] API-Endpoint testet (Postman/curl)
- [ ] Frontend mit Tenant-Param geladen
- [ ] UI sieht richtig aus ✨

---

## 🔍 Troubleshooting

### ❌ "Tenant nicht gefunden"
```
→ Backend-API gibt 404 zurück
→ Prüfe: slug in Datenbank korrekt?
→ Prüfe: configJson gültig?
```

### ❌ "Farben werden nicht angewendet"
```
→ CSS-Variablen werden nicht gesetzt
→ Prüfe: applyTenantTheme() wird aufgerufen?
→ Prüfe: primaryColor/secondaryColor in JSON?
```

### ❌ "Bilder werden nicht geladen"
```
→ Image-URLs sind nicht erreichbar
→ Tipp: Nutze Images mit ?auto=format&fit=crop
→ Test: URL direkt im Browser öffnen
```

### ❌ "Showcase wird nicht angezeigt"
```
→ layout.showSampleShowcase ist false
→ Oder: Einzelne Sections haben enabled: false
→ Prüfe JSON-Struktur
```

---

## 📚 Weiterführende Ressourcen

- **CONFIG_REFERENCE.md** - Vollständige JSON-Dokumentation
- **ARCHITECTURE.md** - System-Design und Best Practices
- **MIGRATION_GUIDE.ts** - Alte vs. Neue Struktur
- **layoutRenderer.tsx** - Component-Code

---

## 💡 Pro-Tipps

1. **Schnell kopieren**: Andere Tenant-JSON als Vorlage nutzen
2. **Bilder optimieren**: Sempre `?auto=format&fit=crop&w=1200` anhängen
3. **Typen überprüfen**: IDE-Autocomplete nutzen für Fehlerfreie JSON
4. **Versionieren**: JSON-Dateien in Git speichern
5. **A/B Testing**: Verschiedene Config-Versionen pro AB-Test

---

## 🎓 Nächste Schritte

Nach dem Setup:
1. Menu-Items im Backend hinzufügen (API)
2. Zahlungsgateway konfigurieren
3. Tracking/Analytics einbauen
4. Mobile-Version testen
5. Deployment vorbereiten

**Support:** Bei Fragen die Dokumentationsdateien checken oder Backend-Team kontaktieren 📞
