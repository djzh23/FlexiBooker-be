# Quick Reference - Backend Changes Needed

## TL;DR - Was der Backend machen muss

### Problem
Admin-Änderungen werden nicht in der Datenbank gespeichert, weil der Backend die Config falsch merged.

### Lösung
Implementiere einen **Deep Merge** für die PATCH-Anfragen mit dem Flag `_mergeStrategy: "deep"`.

---

## 1. Frontend sendet jetzt:

```json
{
  "_mergeStrategy": "deep",
  "layout": {
    "hero": { "enabled": false }
  }
}
```

### Das bedeutet:
- "Merge dieses Objekt TIEF in die bestehende Config"
- Nicht: "Ersetze die ganze layout.hero"
- Sondern: "Ändere nur enabled, keep alles andere"

---

## 2. Backend Deep Merge Funktion (Copy-Paste Ready)

```typescript
// TypeScript/Node.js
function deepMerge(target: any, source: any): any {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (key === "_mergeStrategy") return;
      
      if (isObject(source[key])) {
        if (!(key in output)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item);
}
```

```python
# Python equivalent
def deep_merge(target, source):
    output = target.copy()
    
    if isinstance(target, dict) and isinstance(source, dict):
        for key, value in source.items():
            if key == "_mergeStrategy":
                continue
            
            if isinstance(value, dict) and isinstance(target.get(key), dict):
                output[key] = deep_merge(target[key], value)
            else:
                output[key] = value
    
    return output
```

---

## 3. PATCH Endpoint Änderung

**Vorher (falsch):**
```typescript
const config = { ...currentConfig, ...updateData }; // Shallow merge
tenant.configJson = JSON.stringify(config);
await tenant.save();
```

**Nachher (korrekt):**
```typescript
const { _mergeStrategy, ...updateData } = req.body;

let config = JSON.parse(tenant.configJson || "{}");

if (_mergeStrategy === "deep") {
  config = deepMerge(config, updateData); // Deep merge
} else {
  config = { ...config, ...updateData }; // Shallow merge (fallback)
}

tenant.configJson = JSON.stringify(config);
await tenant.save();
```

---

## 4. Requests die der Backend erhalten wird

### Layout Toggle (z.B. Hero deaktivieren)
```json
PATCH /api/v1/admin/sites/tacos-mohammedia
{
  "_mergeStrategy": "deep",
  "layout": {
    "hero": { "enabled": false }
  }
}
```

### Hero Image ändern
```json
PATCH /api/v1/admin/sites/tacos-mohammedia
{
  "_mergeStrategy": "deep",
  "layout": {
    "hero": {
      "backgroundImage": "https://new-image.jpg"
    }
  }
}
```

### Typography ändern
```json
PATCH /api/v1/admin/sites/tacos-mohammedia
{
  "_mergeStrategy": "deep",
  "brand": {
    "fontFamily": "Poppins",
    "headingFontFamily": "Montserrat",
    "fontSizeBody": 18,
    "fontSizeHeading": 42
  }
}
```

---

## 5. Validierung hinzufügen

```typescript
if (config.brand?.fontFamily) {
  const validFonts = ["Inter", "Poppins", "Roboto", "Open Sans", "Lato", "Montserrat", "Playfair Display"];
  if (!validFonts.includes(config.brand.fontFamily)) {
    throw new Error("Invalid fontFamily");
  }
}

if (config.brand?.fontSizeBody) {
  if (config.brand.fontSizeBody < 12 || config.brand.fontSizeBody > 24) {
    throw new Error("fontSizeBody must be 12-24px");
  }
}
```

---

## 6. Erwartetes Resultat nach Updates

**Database Inhalt nach allen Admin-Changes:**

```json
{
  "brand": {
    "primaryColor": "#FF6B35",
    "secondaryColor": "#004E89",
    "accentColor": "#1F77D2",
    "fontFamily": "Poppins",              // NEU ✅
    "headingFontFamily": "Montserrat",    // NEU ✅
    "fontSizeBody": 18,                   // NEU ✅
    "fontSizeHeading": 42                 // NEU ✅
  },
  "layout": {
    "hero": {
      "enabled": false,                   // NEU ✅ (updated)
      "backgroundImage": "https://new-image.jpg",  // NEU ✅ (updated)
      "badge": "...",                     // KEPT ✅
      "title": "...",                     // KEPT ✅
      "description": "...",               // KEPT ✅
      "cta1": {...},                      // KEPT ✅
      "stats": [...]                      // KEPT ✅
    },
    "menuSection": { "enabled": true },   // Etc...
    "steps": { ... },
    "gallery": { ... }
  }
}
```

---

## 7. Schritt-für-Schritt Implementierung

1. **Kopiere die `deepMerge()` Funktion** in deinen Backend-Code
2. **Ändere PATCH Handler** um `_mergeStrategy` zu prüfen
3. **Füge Validierung** für Fonts/Farben/Größen ein
4. **Teste es:**
   - Admin sendet Layout-Update
   - Check database ob `enabled` geändert aber `title` erhalten blieb
   - Admin sendet Typography-Update
   - Check database ob Farben unverändert aber Fonts geändert

---

## 8. Testing mit curl

```bash
# Test Layout Update
curl -X PATCH http://localhost:5081/api/v1/admin/sites/tacos-mohammedia \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "_mergeStrategy": "deep",
    "layout": {
      "hero": { "enabled": false }
    }
  }'

# Check result
curl http://localhost:5081/api/v1/public/site?slug=tacos-mohammedia | jq '.tenant.configJson | fromjson | .layout.hero'
```

Expected output:
```json
{
  "enabled": false,
  "badge": "Makin Hir Tacos | Mohammedia",
  "title": "Le #1 French Tacos au Maroc",
  "backgroundImage": "https://...",
  ...
}
```

✅ `enabled` ist `false` aber alle anderen Felder sind erhalten!

---

## Fragen?

- Brauchst du eine komplett neue PATCH-Implementation?
- Welche Language/Framework nutzt dein Backend?
- Wo ist die PATCH /api/v1/admin/sites/:tenant Handler aktuell?

