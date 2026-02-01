# 🧪 TESTING & VERIFICATION GUIDE - i18n

## ✅ Pre-Launch Checklist

### 1. Frontend Setup
```bash
✅ npm install           (i18next packages installed)
✅ npm run dev           (Vite dev server running)
✅ npm run build         (0 errors)
```

### 2. Environment
```bash
✅ .env.local exists
✅ VITE_API_BASE_URL=http://localhost:5081
✅ VITE_ADMIN_KEY=dev-admin-key
✅ VITE_DEFAULT_TENANT=blublu-pizza
```

### 3. Files Created
```bash
✅ src/i18n.ts
✅ src/locales/en.json
✅ src/locales/fr.json
✅ src/locales/ar.json
✅ src/modules/common/LanguageSwitcher.tsx
✅ src/modules/common/LanguageSwitcher.css
```

---

## 🧪 TEST SCENARIO 1: Frontend Website (NO Admin)

### Setup
```bash
1. Terminal: npm run dev
2. Browser: http://localhost:5174/?slug=blublu-pizza
```

### Test Steps
```
1. Page öffnet sich
   ✓ Text ist in DEUTSCH (default)
   ✓ Language Switcher sichtbar oben rechts
   ✓ 3 Buttons: EN | FR | AR

2. Klick auf "EN" Button
   ✓ Seite wird ENGLISH
   ✓ Menu Text englisch
   ✓ Hero Text englisch
   ✓ EN Button ist blau (active)

3. Klick auf "FR" Button
   ✓ Seite wird FRANÇAIS
   ✓ Menu Text französisch
   ✓ Hero Text französisch
   ✓ FR Button ist blau (active)

4. Klick auf "AR" Button (WICHTIG!)
   ✓ Seite wird ARABISCH
   ✓ Text-Richtung ändet sich nach RECHTS
   ✓ Language Switcher bewegt sich nach LINKS
   ✓ AR Button ist blau (active)

5. Zurück zu "EN"
   ✓ Seite wird wieder ENGLISH
   ✓ Text-Richtung zurück nach LINKS
   ✓ Language Switcher zurück nach RECHTS

6. Page Refresh (F5) im EN Mode
   ✓ Seite lädt in EN (nicht Deutsch!)
   ✓ Language wurde persisted
```

### Expected Results
- ✅ Alle Sprachen funktionieren
- ✅ Sprachenumschaltung instant (keine Reload)
- ✅ RTL für Arabisch aktiv
- ✅ Language Persistence nach Reload

---

## 🧪 TEST SCENARIO 2: Admin Panel

### Setup
```bash
1. Browser: http://localhost:5174/?slug=blublu-pizza&admin=true
```

### Test Steps
```
1. Admin Gate Screen öffnet sich
   ✓ "🔐 Admin Panel" Titel sichtbar
   ✓ "Geben Sie Ihren Admin-Schlüssel ein" Text
   ✓ Input Feld für Password
   ✓ "Entsperren" Button

2. Falsche Passwort eingeben
   ✓ Error: "❌ Falscher Admin-Key!"
   ✓ Input Feld wird leer gemacht
   ✓ Error ist auf Deutsch

3. Sprache zu "FR" wechseln
   ✓ Screen zeigt "🔐 Panneau Admin"
   ✓ Error Text ist jetzt FRANZÖSISCH
   ✓ Platzhalter auf Französisch

4. Sprache zu "AR" wechseln
   ✓ Screen ist RIGHT-TO-LEFT
   ✓ Language Switcher nach LINKS
   ✓ Alles auf ARABISCH

5. Zurück zu "EN" + korrektes Passwort
   ✓ Admin Panel öffnet sich
   ✓ Alle Texte auf ENGLISCH
   ✓ 3 Tabs: Dishes | Hero Text | Colors

6. Klick auf "FR"
   ✓ Tab Names wechseln zu: Plats | Texte Hero | Couleurs
   ✓ Form Labels auf Französisch
   ✓ Buttons auf Französisch
   ✓ Help Text auf Französisch

7. Klick auf "AR"
   ✓ Alle Texte ARABISCH
   ✓ RTL Layout aktiv
   ✓ Tab Navigation nach rechts ausgerichtet

8. Test: Gericht hinzufügen (im FR Mode)
   ✓ Form Labels auf Französisch
   ✓ Placeholder Text auf Französisch
   ✓ "Speichern" Button auf Französisch
   ✓ Success Message auf Französisch: "✅ Gericht hinzugefügt!"

9. Fehler-Test: Name leer, dann Save
   ✓ Error: "Veuillez remplir le nom, le prix et la catégorie"
   ✓ Error in FR Sprache
```

### Expected Results
- ✅ Admin Gate vollständig übersetzt
- ✅ Admin Panel vollständig übersetzt
- ✅ Alle Tabs funktionieren in allen Sprachen
- ✅ Error & Success Messages multilingual
- ✅ RTL korrekt für Arabisch

---

## 🧪 TEST SCENARIO 3: Language Persistence

### Setup
```bash
1. Website offen: http://localhost:5174/?slug=blublu-pizza
```

### Test Steps
```
1. Aktuelle Sprache: DEUTSCH
   
2. Wechsle zu: "AR" (Arabisch)
   ✓ Seite zeigt Arabisch
   ✓ Text nach rechts

3. Refresh Seite: F5
   ✓ Seite lädt sich neu
   ✓ Aber IMMER NOCH Arabisch!
   ✓ Language wurde persisted ✅

4. Neuer Tab öffnen: http://localhost:5174/?slug=blublu-pizza
   ✓ Neuer Tab zeigt auch Arabisch
   ✓ Language wird GETEILT über Tabs ✅

5. In neuem Tab: Wechsle zu "EN"
   ✓ Neuer Tab zeigt English
   ✓ ALT-Tab zum ersten Tab
   ✓ Erster Tab zeigt IMMER NOCH Arabisch
   ✓ Languages sind UNABHÄNGIG pro Tab ✅

6. Browsers Konsole öffnen (F12)
   ✓ localStorage sichtbar
   ✓ Key "i18n_language" mit Wert "en" (im 2. Tab)
   ✓ ALT-Tab zum 1. Tab
   ✓ localStorage "i18n_language" hat "ar"
```

### Expected Results
- ✅ Language wird in localStorage gespeichert
- ✅ Nach Refresh ist gleiche Sprache aktiv
- ✅ Jeder Tab kann eigene Sprache haben
- ✅ localStorage wird korrekt aktualisiert

---

## 🧪 TEST SCENARIO 4: Multi-Tenant Isolation

### Setup
```bash
2 Browser Fenster (oder Tabs):
- Tab 1: http://localhost:5174/?slug=blublu-pizza&admin=true
- Tab 2: http://localhost:5174/?slug=mohammedia-tacos&admin=true
```

### Test Steps
```
TAB 1 (blublu-pizza):
1. Admin Panel öffnen (EN Mode)
   
2. Wechsle zu "AR"
   ✓ Admin Panel zeigt Arabisch

3. Gericht hinzufügen + Speichern
   ✓ Message auf Arabisch: "✅ تم إضافة الطبق!"

TAB 2 (mohammedia-tacos):
4. Admin Panel öffnen (ENGLISCH sichtbar)
   ✓ NOT Arabisch! (weil Tab 2 separate Auswahl hat)
   ✓ Language NICHT geteilt zwischen Tabs ✓

5. In Tab 2 auch "AR" setzen
   
6. Gericht in Tab 2 hinzufügen
   ✓ Message auf Arabisch

BOTH TABS:
7. Frontend öffnen (ohne admin=true)
   ✓ Tab 1: http://localhost:5174/?slug=blublu-pizza
   ✓ Tab 2: http://localhost:5174/?slug=mohammedia-tacos

8. Beide sind in AR mode
   ✓ Restaurants sind verschiedene
   ✓ Aber Language ist gleich (shared) ✅
   ✓ Das ist KORREKT Behavior!

9. In Tab 1: Wechsle zu "EN"
   ✓ Tab 1 zeigt English
   ✓ Tab 2 zeigt immer noch Arabisch
   ✓ Restaurants isoliert, Languages auch
```

### Expected Results
- ✅ Multi-Tenant Daten sind korrekt isoliert
- ✅ Language Einstellung kann per Tab sein
- ✅ Frontend/Admin haben gleiche Language-Auswahl
- ✅ Keine Cross-Tenant Daten-Leaks

---

## 🧪 TEST SCENARIO 5: Browser Console Checks

### Setup
```bash
1. Website öffnen
2. F12 drücken (DevTools öffnen)
3. Console Tab
```

### Test Steps
```
1. Type in Console:
   i18n.language
   
   ✓ Output: "en", "fr", oder "ar" (aktuelle Sprache)

2. Type:
   localStorage.getItem("i18n_language")
   
   ✓ Output: "en", "fr", oder "ar"

3. Type:
   document.documentElement.lang
   
   ✓ Output: "en", "fr", oder "ar"

4. Type (für Arabisch-Check):
   document.documentElement.dir
   
   ✓ Wenn AR: "rtl"
   ✓ Wenn EN/FR: "ltr"

5. Type:
   document.querySelectorAll('button')[0].textContent
   
   ✓ Output: Button Text in aktueller Sprache
   ✓ Sprache zu "FR" wechseln
   ✓ Repeat: Button Text ist jetzt FRANZÖSISCH ✓

6. Type (für i18n Status):
   i18n.language
   
   ✓ Output sollte "fr" sein
```

### Expected Results
- ✅ i18n.language zeigt korrekte Sprache
- ✅ localStorage speichert Auswahl
- ✅ document.html attributes aktualisiert
- ✅ RTL korrekt für Arabisch
- ✅ Keine i18n Fehler in Console

---

## 🧪 TEST SCENARIO 6: Responsive / Mobile

### Setup
```bash
1. DevTools öffnen (F12)
2. Click: "Toggle device toolbar" (Ctrl+Shift+M)
3. Select: "iPhone 12" or "Galaxy S10"
```

### Test Steps
```
1. Language Switcher sichtbar
   ✓ Oben rechts (iPhone Portrait)
   ✓ Nur Flags sichtbar (Language Codes hidden)

2. Klick auf Flag
   ✓ Sprache wechselt
   ✓ Text responsive
   ✓ RTL korrekt für AR

3. Landscape Mode (Ctrl+Shift+K für Rotation)
   ✓ Language Switcher noch sichtbar
   ✓ Sprache wechsel funktioniert

4. Mobile Admin Panel
   ✓ Forms sind responsive
   ✓ Labels in korrekter Sprache
   ✓ Buttons sichtbar und klickbar
```

### Expected Results
- ✅ Language Switcher auf Mobile sichtbar
- ✅ Sprachen-Wechsel auf Mobile funktioniert
- ✅ RTL Mobile Layout korrekt
- ✅ Admin Panel Mobile responsive

---

## 🧪 TEST SCENARIO 7: Error Handling

### Setup
```bash
1. Chrome DevTools öffnen
2. Network Tab
3. Throttling: "Slow 3G" setzen
```

### Test Steps
```
1. Page laden mit Slow Connection
   ✓ Loading message sichtbar
   ✓ Text in korrekter Sprache

2. Backend offline machen
   - Ctrl+C im Backend terminal
   
3. Seite neu laden (F5)
   ✓ Error message erscheint
   ✓ Error Text in korrekter Sprache
   ✓ "Try Again" Button auf korrekter Sprache

4. Sprache zu "FR" wechseln (während offline)
   ✓ Error message wechselt zu FRANZÖSISCH
   ✓ "Réessayer" Button auf Französisch

5. Backend wieder starten
   ✓ "Try Again" klicken
   ✓ Seite lädt neu
   ✓ Daten loaded in FR Sprache
```

### Expected Results
- ✅ Loading Messages multilingual
- ✅ Error Messages multilingual
- ✅ Sprach-Wechsel funktioniert auch bei Fehlern
- ✅ Retry funktioniert nach Backend-Start

---

## 🧪 TEST SCENARIO 8: Performance Check

### Setup
```bash
1. Chrome DevTools → Performance Tab
2. Record + Sprache wechseln
```

### Test Steps
```
1. Record starten (Performance Tab)

2. Klick "FR" Button

3. Stop Recording
   ✓ Look at Timeline
   ✓ Keine großen Frame drops
   ✓ Language switch sollte < 100ms sein

4. Rendering Tab
   ✓ Keine unnötigen Paints
   ✓ Layout shifts sind minimal

5. Network Tab (während i18n wechsel)
   ✓ Keine neuen HTTP requests
   ✓ Sprach-Wechsel ist rein JavaScript
```

### Expected Results
- ✅ Sprach-Wechsel instant (< 100ms)
- ✅ Keine Layout Shifts
- ✅ Performance akzeptabel
- ✅ Keine Netzwerk-Requests beim Wechsel

---

## ✅ FINAL VERIFICATION CHECKLIST

### Frontend
- [ ] npm run build erfolgreich
- [ ] 0 TypeScript Fehler
- [ ] 0 Console Warnungen

### UI/UX
- [ ] Language Switcher sichtbar
- [ ] Alle 3 Sprachen funktionieren
- [ ] RTL korrekt für Arabisch
- [ ] Mobile responsive

### Admin Panel
- [ ] Password Screen übersetzt
- [ ] Alle 3 Tabs übersetzt
- [ ] Error Messages übersetzt
- [ ] Success Messages übersetzt

### Data
- [ ] Admin Änderungen funktionieren
- [ ] Language Persistence aktiv
- [ ] localStorage aktualisiert

### Performance
- [ ] Sprach-Wechsel schnell (< 100ms)
- [ ] Keine Layout Shifts
- [ ] Keine Netzwerk-Requests

---

## 🎯 PASS/FAIL CRITERIA

### ✅ TEST PASSED wenn:
1. Alle 3 Sprachen funktionieren
2. RTL für Arabisch aktiv
3. Language Persistence arbeitet
4. Admin Panel voll übersetzt
5. Error Messages multilingual
6. Performance gut
7. Mobile responsive

### ❌ TEST FAILED wenn:
1. Texte bleiben auf Deutsch
2. RTL funktioniert nicht
3. Language nach Reload weg
4. Admin Panel nicht übersetzt
5. Error Messages in Deutsch
6. Langsam (> 500ms pro Wechsel)
7. Mobile nicht responsive

---

## 📞 Troubleshooting

### Problem: Texte sind immer Deutsch
**Lösung:**
```bash
1. npm run dev neu starten
2. Browser Cache clear (Ctrl+Shift+Del)
3. localStorage clear:
   localStorage.clear()
   location.reload()
```

### Problem: RTL funktioniert nicht
**Lösung:**
```bash
1. Prüfe: document.dir === "rtl"
2. CSS: html[dir="rtl"] selectors
3. Warte auf Component re-render
```

### Problem: Language persisted nicht
**Lösung:**
```bash
1. localStorage enabled check
2. Private browsing mode prüfen
3. localStorage.setItem("test", "1")
   localStorage.getItem("test") // sollte "1" sein
```

### Problem: Console Fehler
**Lösung:**
```bash
1. F12 öffnen
2. Suche nach "i18next" Fehler
3. Prüfe: src/i18n.ts Konfiguration
4. npm install erneut laufen
```

---

## 🚀 GO/NO-GO DECISION

### GO wenn:
✅ Alle 8 Test Szenarien PASSED
✅ Keine Critical Issues
✅ Performance acceptable
✅ Mobile funktioniert

### NO-GO wenn:
❌ Irgendein Test FAILED
❌ Admin Panel nicht übersetzt
❌ RTL nicht funktioniert
❌ Texte bleiben Deutsch

---

**Ready to Deploy?** Run through ALL test scenarios first! ✅
