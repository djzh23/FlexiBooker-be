# 📖 JSON-Konfiguration Referenz

## 🎯 Schnelleinstieg

Alle UI-Elemente werden über JSON gesteuert. Ein Tenant benötigt nur **EINE** JSON-Datei:

```json
{
  "brand": { /* Farben, Logo */ },
  "contact": { /* Telefon, WhatsApp */ },
  "layout": { /* UI-Sections */ }
}
```

---

## 🎨 Brand-Konfiguration

```typescript
brand: {
  primaryColor?: string;      // Hauptfarbe (Buttons, Accents)
  secondaryColor?: string;    // Sekundärfarbe (Hintergrund)
  accentColor?: string;       // Akzentfarbe (Highlights)
  logoUrl?: string | null;    // Logo-URL
}
```

### Beispiele:
```json
{
  "brand": {
    "primaryColor": "#FF6B35",
    "secondaryColor": "#004E89",
    "logoUrl": "https://cdn.example.com/logo.png"
  }
}
```

---

## 📞 Contact-Konfiguration

```typescript
contact: {
  phone?: string;     // Telefon für Anrufe
  whatsapp?: string;  // WhatsApp Link
  email?: string;     // E-Mail
}
```

### Beispiele:
```json
{
  "contact": {
    "phone": "+212 6 12 34 56 78",
    "whatsapp": "+212 6 12 34 56 78",
    "email": "hello@example.com"
  }
}
```

---

## 🎭 Layout-Konfiguration

### Gesamtstruktur:
```typescript
layout: {
  showSampleShowcase: boolean;     // Showcase anzeigen/verstecken
  hero?: HeroConfig;               // Banner-Section
  menuSection?: MenuSectionConfig; // Menu-Cards
  steps?: StepsConfig;             // Process Steps
  gallery?: GalleryConfig;         // Bilder-Galerie
}
```

---

## 🏆 Hero-Section (Banner)

```typescript
hero: {
  enabled: boolean;              // An/Aus
  badge?: string;                // Kleines Label oben
  title?: string;                // Haupttitel (mit # für Highlights)
  description?: string;          // Beschreibung
  cta1?: { label: string };      // Button 1
  cta2?: { label: string };      // Button 2
  stats?: Array<{                // Statistiken
    label: string;
    value: string;
  }>;
  backgroundImage?: string;      // Hintergrundbild
}
```

### Beispiel:
```json
{
  "hero": {
    "enabled": true,
    "badge": "Makin Hir Tacos | Mohammedia",
    "title": "Le #1 French Tacos au Maroc",
    "description": "Komponiere dein Tacos in 5 Schritten...",
    "cta1": { "label": "Jetzt bestellen" },
    "cta2": { "label": "Vollständige Karte" },
    "stats": [
      { "label": "Sauces", "value": "15+" },
      { "label": "Supplements", "value": "10" },
      { "label": "Lieferung", "value": "24h" }
    ],
    "backgroundImage": "https://images.unsplash.com/photo-1528732263440-4d74ae930053?..."
  }
}
```

### Besonderheit - Title mit Highlighting:
```json
"title": "Le #1 French Tacos"
```
Das `#1` wird in `<span>#1</span>` gewrapped und mit CSS-Farbe hervorgehoben.

---

## 📋 Menu-Section

```typescript
menuSection: {
  enabled: boolean;    // An/Aus
  badge?: string;      // Label
  title?: string;      // Überschrift
  description?: string; // Beschreibung
}
```

**Hinweis:** Die echten Menu-Items kommen vom Backend (API).

### Beispiel:
```json
{
  "menuSection": {
    "enabled": true,
    "badge": "Carte signature",
    "title": "Die beliebtesten Gerichte",
    "description": "Rezepte inspiriert vom Original, modernisiert..."
  }
}
```

---

## 🔄 Steps-Section (Bestellprozess)

```typescript
steps: {
  enabled: boolean;
  badge?: string;
  title?: string;
  steps?: Array<{
    title: string;       // z.B. "Schritt 1"
    subtitle: string;    // z.B. "Wähle deine Größe"
    detail: string;      // z.B. "L, XL, XXL"
  }>;
}
```

### Beispiel:
```json
{
  "steps": {
    "enabled": true,
    "badge": "Ritual",
    "title": "Dein Gericht in 5 Schritten",
    "steps": [
      {
        "title": "Schritt 1",
        "subtitle": "Wähle deine Größe",
        "detail": "L (1 Portion) - XL (2) - XXL (3)"
      },
      {
        "title": "Schritt 2",
        "subtitle": "Wähle deine Proteine",
        "detail": "Tenders, Steak, Escalope, Kebab, Nuggets..."
      },
      // ... weitere Schritte
    ]
  }
}
```

### Varianten pro Restauranttyp:

**Tacos:**
```json
{
  "steps": [
    { "title": "Schritt 1", "subtitle": "Größe", "detail": "L, XL, XXL" },
    { "title": "Schritt 2", "subtitle": "Proteine", "detail": "Fleisch-Optionen" },
    { "title": "Schritt 3", "subtitle": "Sauce", "detail": "15+ Saucen" }
  ]
}
```

**Pizza:**
```json
{
  "steps": [
    { "title": "Schritt 1", "subtitle": "Größe", "detail": "25, 30, 35cm" },
    { "title": "Schritt 2", "subtitle": "Belag", "detail": "Klassisch oder Custom" },
    { "title": "Schritt 3", "subtitle": "Extras", "detail": "Käse, Kräuter" }
  ]
}
```

---

## 🖼️ Gallery-Section

```typescript
gallery: {
  enabled: boolean;
  badge?: string;
  title?: string;
  images?: string[];  // Array von Image-URLs
}
```

### Beispiel:
```json
{
  "gallery": {
    "enabled": true,
    "badge": "Ambiance",
    "title": "Impressionen",
    "images": [
      "https://images.unsplash.com/photo-1528832992873-5bb5781525d6?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1605433247501-698725862cea?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1576866209830-589e1bfbb87b?auto=format&fit=crop&w=1200"
    ]
  }
}
```

---

## 📝 Komplettes Beispiel

```json
{
  "brand": {
    "primaryColor": "#FF6B35",
    "secondaryColor": "#004E89",
    "accentColor": "#1F77D2",
    "logoUrl": null
  },
  "contact": {
    "phone": "+212 6 12 34 56 78",
    "whatsapp": "+212 6 12 34 56 78",
    "email": "hello@example.com"
  },
  "layout": {
    "showSampleShowcase": true,
    
    "hero": {
      "enabled": true,
      "badge": "Makin Hir Tacos",
      "title": "Le #1 French Tacos",
      "description": "Komponiere dein Tacos in 5 Schritten",
      "cta1": { "label": "Jetzt bestellen" },
      "cta2": { "label": "Karte ansehen" },
      "stats": [
        { "label": "Sauces", "value": "15+" },
        { "label": "Supplements", "value": "10" }
      ],
      "backgroundImage": "https://images.unsplash.com/..."
    },
    
    "menuSection": {
      "enabled": true,
      "badge": "Carte",
      "title": "Beliebteste Gerichte"
    },
    
    "steps": {
      "enabled": true,
      "badge": "Ritual",
      "title": "5 Schritte",
      "steps": [
        { "title": "Schritt 1", "subtitle": "Größe", "detail": "L, XL, XXL" }
      ]
    },
    
    "gallery": {
      "enabled": true,
      "badge": "Fotos",
      "title": "Galerie",
      "images": ["https://...", "https://..."]
    }
  }
}
```

---

## 🎮 Verwendungsszenarien

### Szenario 1: Nur Hero anzeigen
```json
{
  "layout": {
    "showSampleShowcase": true,
    "hero": { "enabled": true, ... },
    "menuSection": { "enabled": false },
    "steps": { "enabled": false },
    "gallery": { "enabled": false }
  }
}
```

### Szenario 2: Showcase komplett verstecken
```json
{
  "layout": {
    "showSampleShowcase": false
  }
}
```
→ Zeigt nur echte Backend-Menü

### Szenario 3: Minimal (nur Hero + Menu)
```json
{
  "layout": {
    "showSampleShowcase": true,
    "hero": { "enabled": true, ... },
    "menuSection": { "enabled": true, ... },
    "steps": { "enabled": false },
    "gallery": { "enabled": false }
  }
}
```

---

## 🔄 Dynamische Anpassung

Die JSON wird vom Backend geladen. Um Änderungen zu machen:

```bash
# 1. JSON bearbeiten
vim tenant-configs/tacos-mohammedia.json

# 2. Backend aktualisieren
POST /api/v1/admin/tenants/tacos-mohammedia/config

# 3. Frontend wird automatisch aktualisiert! 🚀
```

Kein Frontend-Deploy nötig!

---

## 🎯 Best Practices

✅ **DO:**
- Verwende aussagekräftige `badge`-Namen
- Optimiere Bilder (use `?auto=format&fit=crop&w=1200`)
- Halte Beschreibungen kurz und prägnant
- Teste auf Mobile-Geräten

❌ **DON'T:**
- Vergesse `enabled: true` zu setzen
- Verwende zu lange Texte
- Nutze nicht-validierte URLs
- Hardcode Daten im Frontend

---

## 📞 Support

Für weitere Hilfe siehe:
- `ARCHITECTURE.md` - System-Übersicht
- `MIGRATION_GUIDE.ts` - Migrations-Hilfe
- `layoutRenderer.tsx` - Component-Referenz
