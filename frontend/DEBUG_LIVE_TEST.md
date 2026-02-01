# 🔍 LIVE TEST DEBUGGING - Admin Changes funktioniert nicht

## Problem
Änderungen im Admin werden nicht live angezeigt nach Speichern.

## Fix Applied
- ✅ Removed localStorage from LandingPage.tsx
- ✅ Now always loads from Backend API
- ✅ AdminPanel sends changes to Backend API

---

## 📋 STEP-BY-STEP TEST

### Step 1: Backend muss laufen!

```bash
# Prüfe ob Backend antwortet
curl -X GET http://localhost:5081/api/v1/public/site?slug=blublu-pizza \
  -H "X-Tenant-Slug: blublu-pizza"
```

**Expected Response:**
```json
{
  "id": "...",
  "slug": "blublu-pizza",
  "name": "Blublu Pizza",
  "categories": [
    {
      "id": "...",
      "name": "Pizzas",
      "items": [...]
    }
  ],
  "tenant": {
    "configJson": "{...}"
  }
}
```

❌ Wenn 404 oder Connection Refused: **Backend läuft nicht!**

---

### Step 2: Check .env.local

```bash
# File: .env.local
cat .env.local
```

**MUST HAVE:**
```
VITE_ADMIN_KEY=dev-admin-key
VITE_API_BASE_URL=http://localhost:5081
VITE_DEFAULT_TENANT=blublu-pizza
```

---

### Step 3: Open Frontend

```bash
# Terminal 1: Start Vite Dev Server
npm run dev

# Should output:
#   VITE v5.x.x  ready in X ms
#   ➜  Local:   http://localhost:5174/
```

---

### Step 4: Test WITHOUT Admin Mode

```
http://localhost:5174/?slug=blublu-pizza
```

**Expected:**
- ✅ Page loads
- ✅ Menu items show from Backend
- ✅ Browser Console: No errors
- ✅ Network Tab: GET /api/v1/public/site?slug=blublu-pizza → 200

**Check Console:**
```
[LandingPage] Loaded site from Backend: {
  slug: "blublu-pizza",
  categories: 3,
  timestamp: "2026-01-30T..."
}
```

---

### Step 5: Open Admin Panel

```
http://localhost:5174/?slug=blublu-pizza&admin=true
```

**Expected:**
- ✅ Admin Gate appears (password screen)
- ✅ Enter password
- ✅ Admin Panel loads with 3 tabs (Gerichte, Hero, Farben)
- ✅ Current data shows

**Check Console:**
```
[AdminPanel] Loaded current site with X categories
[AdminPanel] Categories: ["Pizzas", "Salads", "Drinks"]
```

---

### Step 6: Test Add Dish

**In Admin Panel → Tab "Gerichte":**

```
1. Category: Select "Pizzas"
2. Name: "TEST-PIZZA-123"
3. Price: "9.99"
4. Description: "Test Pizza für Debugging"
5. Image: Leave empty
6. Available: ✓ checked
7. Click "Hinzufügen"
```

**What should happen:**

```
✅ Success Message: "✅ Gericht hinzugefügt!"
✅ Page reloads after ~1 second
✅ Console shows: POST /api/v1/admin/sites/blublu-pizza/items → 201
✅ New dish appears in list after reload
```

**Check Network Tab:**
```
POST http://localhost:5081/api/v1/admin/sites/blublu-pizza/items

Request Headers:
  X-Admin-Key: dev-admin-key
  Content-Type: application/json

Request Body:
  {
    "name": "TEST-PIZZA-123",
    "price": 9.99,
    "description": "Test Pizza für Debugging",
    "imageUrl": null,
    "categoryId": "...",
    "isAvailable": true
  }

Response: 201 Created
```

---

### Step 7: Test No Admin Mode (After adding dish)

```
http://localhost:5174/?slug=blublu-pizza
```

**Expected:**
- ✅ Page loads (NOT admin mode)
- ✅ "TEST-PIZZA-123" is visible in menu
- ✅ Price shows "9.99"

**Check Console:**
```
[LandingPage] Loaded site from Backend: {
  slug: "blublu-pizza",
  categories: 3,  // Should be same as before
  timestamp: "2026-01-30T..."
}
```

✅ **IF YOU SEE "TEST-PIZZA-123" HERE → FRONTEND WORKS!**

---

## 🔴 IF IT DOESN'T WORK

### Symptom 1: "Gericht hinzugefügt" message but NO reload

**Problem:** setTimeout or fetch failed

**Debug:**
```javascript
// Open Browser Console (F12)
console.log(import.meta.env.VITE_API_BASE_URL);
// Should output: http://localhost:5081

console.log(import.meta.env.VITE_ADMIN_KEY);
// Should output: dev-admin-key
```

**Fix:** Restart Vite dev server to reload .env
```bash
npm run dev
# Kill (Ctrl+C) and start again
```

---

### Symptom 2: Error "Falscher Admin-Key!"

**Problem:** Backend rejected X-Admin-Key header

**Debug:**
```bash
# Test Backend with wrong key
curl -X POST http://localhost:5081/api/v1/admin/sites/blublu-pizza/items \
  -H "X-Admin-Key: WRONG-KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}'

# Should return: 401 Unauthorized
```

**Fix:** Check Backend - does it validate X-Admin-Key correctly?
```
Backend MUST check: if (adminKey !== "dev-admin-key") return 401
```

---

### Symptom 3: Error "Tenant nicht gefunden!"

**Problem:** Backend doesn't recognize tenant slug

**Debug:**
```bash
# Test Backend
curl -X GET http://localhost:5081/api/v1/public/site?slug=blublu-pizza

# Should return data, not 404
```

**Fix:** Check Backend - is data stored with this slug?

---

### Symptom 4: Dish added in Admin, but NOT visible without admin mode

**Problem:** Frontend still uses localStorage or stale cache

**Debug:**

Step A - Check LandingPage.tsx loads from Backend:
```bash
grep -n "localStorage" src/pages/LandingPage.tsx
# Should return: (nothing!)
# If returns lines → localStorage still there = BUG
```

Step B - Check Network Tab after reload:
```
F12 → Network Tab → Filter: XHR
Reload page (F5)
Look for: GET /api/v1/public/site?slug=...
Response should have new dish in categories[0].items
```

Step C - Check Console Logs:
```
[LandingPage] Loaded site from Backend: {
  categories: X,  // Count should include new dish
  timestamp: "..."
}
```

---

## ✅ Verification Checklist

### Before each test:
- [ ] Backend is running (http://localhost:5081 responds)
- [ ] .env.local has correct values
- [ ] Vite dev server is running (npm run dev)
- [ ] Browser Cache cleared (Ctrl+Shift+Del or F12 → Settings → Clear site data)
- [ ] No console errors (F12 → Console)

### After adding Dish:
- [ ] ✅ Success message shows
- [ ] ✅ Page reloads (~1 second delay)
- [ ] ✅ Network tab shows POST 201
- [ ] ✅ Dish visible in admin list
- [ ] ✅ Open without ?admin=true → Dish visible

### Multi-Tenant Test:
- [ ] Add dish to blublu-pizza
- [ ] Open ?slug=mohammedia-tacos - dish NOT visible
- [ ] Add different dish to mohammedia-tacos
- [ ] Open ?slug=blublu-pizza - new dish NOT visible (only original)

---

## 🛠️ Common Fixes

### Issue: "Cannot find module 'import.meta.env'"
**Fix:** Restart Vite dev server
```bash
npm run dev
```

### Issue: API returns 500 "Internal Server Error"
**Debug Backend:** Check Backend logs for what went wrong

### Issue: Page doesn't reload after save
**Possible causes:**
1. setTimeout didn't trigger (rare)
2. window.location.reload() didn't execute (rare)
3. Network error after successful save

**Fix:** Check console errors:
```javascript
F12 → Console → Look for any red errors
```

---

## 📊 Expected Flow (After Fix)

```
1. Open Admin: http://localhost:5174/?slug=blublu-pizza&admin=true
   ↓
2. Admin Panel loads with current data from Backend
   ↓
3. Admin fills form and clicks "Speichern"
   ↓
4. Frontend sends POST to http://localhost:5081/api/v1/admin/sites/blublu-pizza/items
   (with X-Admin-Key header)
   ↓
5. Backend validates key, stores in database
   ↓
6. Backend returns 201 Created
   ↓
7. Frontend shows "✅ Gericht hinzugefügt!"
   ↓
8. setTimeout waits 1 second
   ↓
9. window.location.reload() refreshes page
   ↓
10. LandingPage fetches fresh data from Backend (NOT localStorage!)
    ↓
11. Backend queries database → returns new dish in response
    ↓
12. Frontend displays updated menu with new dish ✅
```

---

## 🚀 If everything works:

1. Test with 3+ restaurants
2. Verify dishes don't mix between restaurants
3. Test Update and Delete
4. Test Hero and Colors tabs
5. You're done! ✅

---

## 📞 Still doesn't work?

Run this diagnostic:

```bash
# 1. Check Backend responds
curl -X GET http://localhost:5081/api/v1/public/site?slug=blublu-pizza -v

# 2. Check Frontend env
grep VITE .env.local

# 3. Check no localStorage in code
grep -r "localStorage" src/pages/LandingPage.tsx

# 4. Check AdminPanel sends to right endpoint
grep -r "api/v1/admin/sites" src/modules/admin/

# 5. Check Network logs in Browser F12
# → See if requests are sent and what responses come back
```

Report if any fail!
