# 🔧 DEBUGGING: Blublu-Pizza Provisioning

**Dein curl-Befehl hat nicht funktioniert. Hier sind die Lösungen:**

---

## ⚡ Schritt 1: Schnelle Tests

### Test 1: Backend antwortet überhaupt?

```bash
curl http://localhost:5081/api/v1/public/site?slug=tacos-mohammedia
```

**Erwartet:** 200 OK mit Tacos-Daten

**Wenn nicht:**
- ❌ `Connection refused` → Backend läuft nicht!
  - **Lösung:** Terminal öffnen, `cd backend && npm run dev`
- ❌ `404 Not Found` → Backend läuft aber Endpoint ist falsch
  - **Lösung:** Prüfe Backend: `GET /api/v1/public/site` existiert?

---

### Test 2: Admin-Key korrekt?

**Finde deinen echten Admin-Key:**

```bash
# Backend .env Datei öffnen
# Suche nach: ADMIN_API_KEY=...
```

**Beispiel aus Backend:**
```
ADMIN_API_KEY=my-super-secret-key-123
```

**Dieser Key muss exakt verwendet werden im Request!**

---

## 🚀 Lösung 1: PowerShell-Skript verwenden (EMPFOHLEN)

**Das ist Windows-freundlich und funktioniert:**

### Schritt 1: Admin-Key setzen

Öffne `provision-blublu.ps1` und ersetze:

```powershell
$AdminKey = "your-secret-admin-key"  # <- HIER dein echter Admin-Key
```

Mit:

```powershell
$AdminKey = "my-super-secret-key-123"  # Dein echter Key
```

### Schritt 2: Script ausführen

```powershell
cd c:\Users\Admin\source\repos\FlexiBooker-be\frontend
powershell -ExecutionPolicy Bypass -File provision-blublu.ps1
```

**Erwartet Output:**
```
🍕 Provisioning Blublu-Pizza...
✅ JSON geladen: blublu-pizza-config.json
📤 Sende POST zu http://localhost:5081/api/v1/admin/sites...
✅ Erfolg! Status: 201 Created
Response:
{...SiteResponse...}
```

---

## 🚀 Lösung 2: Node.js-Skript verwenden

**Noch sicherer, weil es die JSON-Datei liest:**

### Schritt 1: Admin-Key als Umgebungsvariable setzen

```powershell
$env:ADMIN_KEY = "my-super-secret-key-123"
```

### Schritt 2: Script ausführen

```bash
cd c:\Users\Admin\source\repos\FlexiBooker-be\frontend
node provision-blublu.js
```

**Oder mit Admin-Key direkt:**

```bash
$env:ADMIN_KEY = "my-super-secret-key-123"; node provision-blublu.js
```

**Erwartet Output:**
```
🍕 Provisioning Blublu-Pizza...
✅ JSON geladen: blublu-pizza-config.json
✅ JSON validiert
   - slug: blublu-pizza
   - name: Blublu Pizza
   - categories: 3
📤 Sende POST zu http://localhost:5081/api/v1/admin/sites...
✅ Erfolg! Status: 201 Created
Response:
{...}
```

---

## 🚀 Lösung 3: Postman / Insomnia verwenden

**Falls Scripts nicht funktionieren:**

1. **Postman öffnen** (oder Insomnia installieren)
2. **Neue POST-Request erstellen**
   - URL: `http://localhost:5081/api/v1/admin/sites`
3. **Header:**
   ```
   X-Admin-Key: my-super-secret-key-123
   Content-Type: application/json
   ```
4. **Body → raw → JSON**
   ```json
   {
     "slug": "blublu-pizza",
     "name": "Blublu Pizza",
     "timezone": "Europe/Berlin",
     "currency": "EUR",
     ...
   }
   ```
5. **Send!**

---

## 🐛 Häufige Fehler & Lösungen

### ❌ Error: 401 Unauthorized

```
❌ Fehler! Status: 401
```

**Ursache:** Falscher Admin-Key

**Lösung:**
```bash
# 1. Backend .env prüfen
# Datei: backend/.env
# ADMIN_API_KEY=???

# 2. Diesen Key verwenden:
$env:ADMIN_KEY = "der-richtige-key-hier"
node provision-blublu.js
```

---

### ❌ Error: 400 Bad Request

```
❌ Fehler! Status: 400
```

**Ursache:** JSON-Format falsch

**Prüf in blublu-pizza-config.json:**

```bash
# Validiere JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('blublu-pizza-config.json')))"
```

**Häufige Fehler:**
- [ ] `price` muss Zahl sein (9.50), nicht String ("9.50")
- [ ] `isAvailable` muss boolean (true/false), nicht 0/1
- [ ] `slug` darf nur Kleinbuchstaben und Bindestriche haben
- [ ] `categories` ist Array, nicht einzelnes Objekt

---

### ❌ Error: 500 Internal Server Error

```
❌ Fehler! Status: 500
```

**Ursache:** Backend-Fehler (Datenbank, etc.)

**Lösung:**
1. Backend-Terminal öffnen
2. Suche nach Error-Meldung in Logs
3. Typisch: Datenbank nicht verbunden
   - Prüfe: MySQL/SQL Server läuft?
   - Prüfe: Connection-String korrekt?

---

### ❌ Error: Connection refused

```
❌ Request-Fehler: connect ECONNREFUSED 127.0.0.1:5081
```

**Ursache:** Backend läuft nicht

**Lösung:**
```bash
# Terminal 1: Backend starten
cd backend
npm run dev
# oder: dotnet run

# Warte bis: "Backend läuft auf http://localhost:5081"
```

---

## ✅ Vollständige Anleitung (Schritt-für-Schritt)

### Schritt 1: Backend prüfen

```bash
# Terminal 1 öffnen
cd backend
npm run dev

# Output sollte sein:
# Server running on http://localhost:5081
# ✅ Database connected
```

**Wenn nicht:** Prüfe Backend-Konfiguration!

---

### Schritt 2: Admin-Key finden

**Backend .env öffnen:**

```bash
# Datei: backend/.env
ADMIN_API_KEY=my-secret-key-12345
```

**Notiere:** `my-secret-key-12345`

---

### Schritt 3: blublu-pizza-config.json prüfen

```bash
# Terminal 2 öffnen
cd frontend

# JSON validieren
node -e "console.log(JSON.parse(require('fs').readFileSync('blublu-pizza-config.json', 'utf8')).slug)"

# Output sollte sein: blublu-pizza
```

---

### Schritt 4: Provisioning starten

**Option A: PowerShell-Skript**

```bash
# Datei öffnen: provision-blublu.ps1
# Admin-Key setzen: $AdminKey = "my-secret-key-12345"
# Speichern!

powershell -ExecutionPolicy Bypass -File provision-blublu.ps1
```

**Option B: Node.js-Skript**

```bash
$env:ADMIN_KEY = "my-secret-key-12345"
node provision-blublu.js
```

**Option C: Curl (Windows PowerShell)**

```powershell
$headers = @{
    "X-Admin-Key" = "my-secret-key-12345"
    "Content-Type" = "application/json"
}

$body = Get-Content blublu-pizza-config.json -Raw

Invoke-RestMethod `
    -Uri "http://localhost:5081/api/v1/admin/sites" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

---

### Schritt 5: Verifikation

```bash
# Wenn 201 Created → Erfolg!

# Test: Blublu-Pizza abrufen
curl "http://localhost:5081/api/v1/public/site?slug=blublu-pizza"

# Output sollte sein: 200 OK mit Pizza-Daten ✅
```

---

## 🎯 Meine Empfehlung

**Verwende das Node.js-Skript:**

```bash
# 1. Admin-Key aus Backend .env kopieren
# 2. Ausführen:
$env:ADMIN_KEY = "dein-admin-key-hier"
node provision-blublu.js
```

**Warum?**
- ✅ Windows-freundlich
- ✅ Liest JSON-Datei (keine Escape-Probleme)
- ✅ Besseres Error-Reporting
- ✅ Funktioniert überall

---

## 📞 Wenn immer noch nichts funktioniert

**Schreib mir folgende Infos:**

1. Welche **exakte Fehlermeldung** bekommst du?
2. **Output von:** `curl http://localhost:5081/api/v1/public/site?slug=tacos-mohammedia`
3. **Backend läuft?** (Prüfe Terminal-Output)
4. **Admin-Key korrekt?** (Aus .env kopiert?)
5. **blublu-pizza-config.json vorhanden?** (Prüfe mit: `ls blublu-pizza-config.json`)

Dann kann ich dir spezifisch helfen! 💪
