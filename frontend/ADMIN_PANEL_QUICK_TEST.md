# 🚀 ADMIN-PANEL: QUICK TEST ANLEITUNG

## Setup (einmalig)

### 1. Frontend starten
```bash
npm run dev
```
Öffnet typischerweise auf: `http://localhost:5174`

### 2. Admin-Mode öffnen
Url mit tenant + admin-parameter:
```
http://localhost:5174/?slug=blublu-pizza&admin=true
```

Oder alternativ:
```
http://localhost:5174?admin=true
```
(Nutzt `VITE_DEFAULT_TENANT=blublu-pizza` aus `.env`)

### 3. Admin-Key eingeben
Wenn das AdminGate-Fenster kommt: **`dev-admin-key`**

Nach erfolgreichem Login: 🔓 Admin-Panel ist entsperrt

---

## Feature 1️⃣: GERICHTE HINZUFÜGEN

### Schritt 1: Tab "Gerichte" öffnen
- Sollte bereits aktiv sein
- Siehst du ein Formular

### Schritt 2: Neues Gericht hinzufügen
**Ausfüllen:**
1. **Kategorie**: "Pizzas" (oder andere Kategorie)
2. **Name**: "Margherita"
3. **Preis**: "9.50"
4. **Beschreibung**: "Tomato, Mozzarella, Fresh Basil"
5. **Bild-URL** (optional):
   ```
   https://images.unsplash.com/photo-1614049162883-ffddf92d722d?w=400
   ```
6. **Verfügbar**: Checkbox aktiviert (Standard)

### Schritt 3: Speichern
Klick auf **"Neues Gericht hinzufügen"**
- ✅ Grüne Erfolgsmeldung oben
- Seite lädt sich nach 1 Sekunde automatisch neu

### Schritt 4: Verifikation
Nach Reload:
- 📍 Neues Gericht in der Liste unter "Pizzas"
- 🖼️ Bild wird angezeigt (falls URL gültig)
- 💰 Preis: "9.50 EUR"
- 📝 Beschreibung angezeigt
- 🟢 Verfügbar-Badge sichtbar

---

## Feature 2️⃣: GERICHT BEARBEITEN

### Schritt 1: Gericht-Card finden
- Scrolle zu den aktuellen Gerichten
- Suche nach "Margherita" (was wir eben hinzugefügt haben)

### Schritt 2: Edit-Button klicken
- Jede Card hat **"Bearbeiten"** Button
- Klick darauf

### Schritt 3: Form wird gefüllt
- Formular scrollt nach oben
- **Name:** "Margherita" (vorausgefüllt)
- **Preis:** "9.50" (vorausgefüllt)
- etc.

### Schritt 4: Änderung machen
Beispiel:
- **Preis**: von "9.50" auf "10.99" ändern

### Schritt 5: Speichern
Klick auf **"Gericht bearbeiten"**
- ✅ Erfolgsmeldung
- Seite lädt neu

### Schritt 6: Verifikation
Nach Reload:
- 💰 Preis ist jetzt "10.99 EUR"

---

## Feature 3️⃣: GERICHT LÖSCHEN

### Schritt 1: Gericht-Card finden
- Suche nach "Margherita"

### Schritt 2: Delete-Button klicken
- Jede Card hat **"Löschen"** Button
- Klick darauf

### Schritt 3: Bestätigung
- Popup: "Gericht wirklich löschen: Margherita?"
- Klick **OK**

### Schritt 4: Verifikation
Nach Reload:
- ❌ Gericht ist aus der Liste weg

---

## Feature 4️⃣: HERO-SECTION BEARBEITEN

### Schritt 1: Tab "Hero-Text" klicken
- Seite mit Formular öffnet sich

### Schritt 2: Werte eingeben
**Beispiel:**
- **Haupttitel:** "Die besten Pizzas in Berlin"
- **Beschreibung:** "Handgemachte Pizzas mit italienischen Zutaten"

### Schritt 3: Speichern
Klick **"Speichern"**

### Schritt 4: Verifikation
- ✅ Erfolgsmeldung
- Seite lädt
- In Hauptseite (ohne Admin) sollte neuer Text angezeigt werden

---

## Feature 5️⃣: FARBEN ANPASSEN

### Schritt 1: Tab "Farben" klicken
- Formular mit zwei Farbauswählern

### Schritt 2: Farbe ändern
**Beispiel:**
- **Primärfarbe:** Click auf Farbquadrat → "Rot" wählen (#FF0000)
- **Akzentfarbe:** "Orange" (#FF6600)

### Schritt 3: Speichern
Klick **"Farben speichern"**

### Schritt 4: Verifikation
- ✅ Erfolgsmeldung
- Seite lädt
- Header/Buttons sollten neue Farbe haben

---

## 🔧 DEBUG: localStorage prüfen

Falls du überprüfen willst, was lokal gespeichert ist:

### Im Browser (F12 Console):
```javascript
// Anzeige aller gespeicherten Admin-Daten:
const key = "admin-site-blublu-pizza";
const data = JSON.parse(localStorage.getItem(key));
console.log(data);

// Löschen (um Reset zu machen):
localStorage.removeItem(key);
```

---

## 🔄 Nach jedem Test: Page Reload

Falls Änderungen nicht angezeigt werden:
1. **F5** oder **Ctrl+Shift+R** (Hard Reload)
2. Oder Browser-Cache löschen: DevTools → Settings → Clear site data

---

## ❌ Häufige Fehler

| Problem | Lösung |
|---------|--------|
| **Admin-Key funktioniert nicht** | `.env` File braucht `VITE_ADMIN_KEY=dev-admin-key` |
| **Änderungen verschwinden nach Reload** | Sind im localStorage! Browser-Cache clearen → neu testen |
| **Bilder werden nicht angezeigt** | URL muss https:// sein; inkorrekte URLs zeigen "Fehler beim Laden" |
| **Seite hängt beim Speichern** | localStorage-Check durchführen (1 MB Limit) |

---

## ✅ Vollständige Test-Checkliste

```
☐ Admin-Panel öffnet sich
☐ Admin-Key wird akzeptiert
☐ Tab 1 - Gericht hinzufügen: Mit Bild
☐ Tab 1 - Gericht bearbeiten: Preis ändern
☐ Tab 1 - Gericht löschen: Mit Bestätigung
☐ Tab 2 - Hero-Text: Speichert und zeigt
☐ Tab 3 - Farben: Speichert und aktualisiert
☐ Nach Reload: Alle Änderungen bleiben
```

---

## ⏭️ Nächster Schritt

**Nach erfolgreichem Test:**
- Dokumentation an Backend-Team übergeben
- Backend-Endpoints implementieren (siehe `ADMIN_PANEL_BACKEND_GUIDE.md`)
- Echte Datenbank-Persistierung starten

