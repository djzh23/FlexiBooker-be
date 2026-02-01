# 🌍 i18n Multi-Language Quick Start

## Was funktioniert jetzt?

✅ **3 Sprachen vollständig integriert:**
- 🇬🇧 English (EN)
- 🇫🇷 Français (FR)  
- 🇲🇦 Darija/العربية (AR)

✅ **Alle Pages/Components übersetzt:**
- Admin Panel (alle Tabs)
- Admin Gate (Password Screen)
- Landing Page
- Error Messages
- Success Messages

✅ **Features:**
- Language Switcher (oben rechts)
- Automatisches RTL für Arabisch
- Language Persistence (localStorage)
- Browser Language Detection
- Instant Language Switching (keine Seiten-Reload nötig)

---

## 🚀 Wie benutze ich es?

### Schritt 1: Frontend starten

```bash
npm run dev
```

### Schritt 2: Website öffnen

```
http://localhost:5174/?slug=blublu-pizza
```

### Schritt 3: Sprache wechseln

Klick auf Language Switcher **oben rechts**:
- 🇬🇧 **EN** - English
- 🇫🇷 **FR** - Français
- 🇲🇦 **AR** - Darija (Arabisch)

→ Alle Texte wechseln sofort! ✨

---

## 🔐 Admin Panel Test

```bash
# Mit Password
http://localhost:5174/?slug=blublu-pizza&admin=true
```

1. Password: `dev-admin-key` (aus .env.local)
2. Admin Panel öffnet sich
3. Alle Texte folgen deiner Sprach-Auswahl

---

## 📝 Neue Texte hinzufügen

### Schritt 1: Translations aktualisieren

**src/locales/en.json:**
```json
{
  "mySection": {
    "myKey": "My English Text"
  }
}
```

**src/locales/fr.json:**
```json
{
  "mySection": {
    "myKey": "Mon texte français"
  }
}
```

**src/locales/ar.json:**
```json
{
  "mySection": {
    "myKey": "نصي بالعربية"
  }
}
```

### Schritt 2: Im Code verwenden

```typescript
import { useTranslation } from "react-i18next";

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t("mySection.myKey")}</h1>
    </div>
  );
}
```

### Schritt 3: Vite neu starten

```bash
npm run dev
```

✅ Neue Texte sind aktiv!

---

## 🧪 Testing

### Test 1: Alle Sprachen checken

```bash
# Normale Website
http://localhost:5174/?slug=blublu-pizza

# Admin Panel
http://localhost:5174/?slug=blublu-pizza&admin=true

# Dann: EN → FR → AR → EN wechseln
# Prüfen: Alle Texte sind richtig übersetzt
```

### Test 2: Language Persistence

```bash
1. Öffne Site in FR
2. Refresh Page (F5)
3. → Sollte immer noch FR sein ✓

4. Öffner neuer Tab gleiche URL
5. → Neuer Tab zeigt auch FR ✓
```

### Test 3: Multi-Tenant + Sprache

```bash
1. blublu-pizza: FR selected
2. Öffne: mohammedia-tacos: FR ist aktiv (shared)
3. Ändere zu: AR
4. Zurück zu: blublu-pizza
5. → AR ist aktiv (persisted) ✓
```

### Test 4: Admin Error Messages

```bash
1. Admin Panel öffnen
2. Falsche Daten eingeben
3. → Error Message in richtiger Sprache ✓
```

---

## 📂 Dateien Übersicht

### Created Files
```
src/
  ├─ i18n.ts                              # i18n Konfiguration
  ├─ locales/
  │  ├─ en.json                          # English Translations
  │  ├─ fr.json                          # French Translations
  │  └─ ar.json                          # Arabic Translations
  └─ modules/common/
     ├─ LanguageSwitcher.tsx             # Language Switcher Component
     └─ LanguageSwitcher.css             # Language Switcher Styling
```

### Updated Files
```
src/
  ├─ main.tsx                             # i18n import hinzugefügt
  ├─ pages/
  │  ├─ LandingPage.tsx                   # useTranslation + LanguageSwitcher
  │  └─ LandingPage.css                   # Switcher positioning
  └─ modules/admin/
     ├─ AdminPanel.tsx                    # Alle Texte übersetzt
     └─ AdminGate.tsx                     # Password screen übersetzt
```

### Package.json
```json
{
  "dependencies": {
    "i18next": "^23.x",
    "react-i18next": "^14.x"
  }
}
```

---

## ⚙️ Konfiguration

### .env.local (erforderlich)
```bash
VITE_ADMIN_KEY=dev-admin-key
VITE_API_BASE_URL=http://localhost:5081
VITE_DEFAULT_TENANT=blublu-pizza
```

### i18n Fallback
- **Standard Sprache**: English (EN)
- **Auto-Detect**: Browser Language
- **Speicherung**: localStorage (`i18n_language`)

---

## 🌍 Supported Languages

| Code | Language | Flag | RTL | Status |
|------|----------|------|-----|--------|
| en | English | 🇬🇧 | No | ✅ |
| fr | Français | 🇫🇷 | No | ✅ |
| ar | العربية | 🇲🇦 | Yes | ✅ |

---

## 🎨 Language Switcher Styling

### Position
- **Desktop**: Fixed oben rechts
- **Mobile**: Nur Flags (Text hidden)
- **Arabisch**: Oben links (RTL)

### Active State
- Blauer Background (#0066FF)
- Weiße Schrift
- Scale Animation

---

## 🔍 Debugging

### Problem: Texte sind nicht übersetzt

**Lösung:**
1. Browser Console öffnen (F12)
2. Check for errors mit "i18n"
3. Vite Dev Server neu starten: `npm run dev`
4. Prüfe: translations JSON hat korrekt formatierte Keys

### Problem: Language persists nicht

**Lösung:**
1. Öffne DevTools → Application → localStorage
2. Check: `i18n_language` Key existiert
3. Wenn nicht: Clear localStorage und neu laden

### Problem: Arabisch ist nicht RTL

**Lösung:**
1. Prüfe: `document.documentElement.dir` = "rtl"
2. CSS: Nutze `html[dir="rtl"]` selectors
3. Text-align: Automatisch adjusted

---

## 💡 Best Practices

✅ **DO:**
- Verwende `t("key")` für alle User-facing Texte
- Halte Translation Keys organisiert (sections)
- Nutze Interpolation für Variablen: `t("key", { name: "value" })`

❌ **DON'T:**
- Hardcode Deutsche Texte in Komponenten
- Vergesse localStorage.clear() bei i18n-Tests
- Nutze nicht-standardisierte Language Codes

---

## 🚀 Production Ready

✅ **Checklist:**
- [x] 3 Sprachen konfiguriert
- [x] Alle Admin-Komponenten übersetzt
- [x] Language Switcher UI funktioniert
- [x] RTL-Support aktiv
- [x] Language Persistence works
- [x] Error Handling multilingual
- [x] Build erfolgreich (npm run build)
- [x] Keine TypeScript Fehler

**Status: READY FOR PRODUCTION** 🎉

---

## 📞 Support

**Neue Sprache hinzufügen?**
1. Neue JSON-Datei in `src/locales/`
2. Übersetze alle Keys
3. Register in `i18n.ts`
4. Neue Button in `LanguageSwitcher.tsx`

**Texte verbessern?**
1. Öffne relevante JSON-Datei
2. Ändere Text
3. Dev Server macht Auto-Reload

**Bug melden?**
- Check Browser Console (F12)
- Inspect Network Tab (XHR requests)
- Test mit `localStorage.clear()`
