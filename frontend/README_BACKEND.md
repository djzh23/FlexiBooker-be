# 🎯 Backend Implementation - Your Starting Point

**Welcome Backend Developer!** 

Below ist dein kompletter Roadmap zum Implementieren der zwei API-Endpoints, die Frontend erwartet.

---

## ⚡ Quick Start (5 Minutes)

1. **Lies** → [BACKEND_ACTION_PLAN.md](BACKEND_ACTION_PLAN.md) — Die Copy-Paste Version
2. **Implementiere** → GET + POST Endpoints (Code bereits dort)
3. **Teste** → Curl Commands im Plan
4. **Verify** → npm run dev im Frontend

**Done!** ✅

---

## 📚 Documentation (Choose Your Path)

### 🏃 **I'm in a Hurry**
```
BACKEND_ACTION_PLAN.md (5 min)
├─ Database Schema (Copy-Paste)
├─ GET Endpoint Code (Copy-Paste)
├─ POST Endpoint Code (Copy-Paste)
├─ Test Commands (Copy-Paste)
└─ Checklist
```

### 🚀 **I'm Starting Now**
```
1. BACKEND_TLDR.md (10 min)
   └─ Overview + Code Snippets

2. BACKEND_SPECIFICATION.md (30 min)
   └─ Detailed Endpoints + Error Handling

3. BACKEND_CHECKLIST.md
   └─ Step-by-Step Implementation + Tests
```

### 🎓 **I Want to Understand Architecture**
```
1. BACKEND_ARCHITECTURE.md (20 min)
   └─ System Diagrams + Data Flows

2. BACKEND_SPECIFICATION.md (30 min)
   └─ Implementation Details

3. FRONTEND_INTEGRATION_GUIDE.md
   └─ What Frontend Expects
```

### 📋 **I'm Following a Checklist**
```
1. BACKEND_CHECKLIST.md
   └─ Phase 1-7 (abhaken während implementieren)
   └─ Curl test commands included
   └─ Verification steps included
```

---

## 🎯 The 3 Core Files

| File | Purpose | Time | Best For |
|------|---------|------|----------|
| [BACKEND_ACTION_PLAN.md](BACKEND_ACTION_PLAN.md) | Copy-Paste Ready | 5 min | Quick Implementation |
| [BACKEND_SPECIFICATION.md](BACKEND_SPECIFICATION.md) | Complete Reference | 30 min | Detailed Understanding |
| [BACKEND_CHECKLIST.md](BACKEND_CHECKLIST.md) | Step-by-Step | Ongoing | Phase-by-Phase Tracking |

---

## 🚀 What You Need to Build

### **2 Endpoints**

```
GET  /api/v1/public/site?slug=X
POST /api/v1/admin/sites (+ X-Admin-Key header)
```

### **3 Database Tables**

```
tenants
├─ slug (UNIQUE)
├─ configJson (LONGTEXT)
└─ ...

menu_categories
├─ tenantId (FK)
└─ ...

menu_items
├─ categoryId (FK)
├─ tenantId (FK)
└─ ...
```

### **1 Response Format**

```json
{
  "tenant": {...},
  "categories": [{...items...}]
}
```

---

## 📖 Full Documentation Index

### Getting Started
- 🚀 [BACKEND_ACTION_PLAN.md](BACKEND_ACTION_PLAN.md) — Copy-Paste Implementation
- ⚡ [BACKEND_TLDR.md](BACKEND_TLDR.md) — 5-Minute Overview

### Detailed Reference
- 📋 [BACKEND_SPECIFICATION.md](BACKEND_SPECIFICATION.md) — Complete Endpoint Specs
- 🏗️ [BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md) — System Architecture & Diagrams
- ✅ [BACKEND_CHECKLIST.md](BACKEND_CHECKLIST.md) — Implementation Checklist

### Integration
- 🔌 [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) — What Frontend Expects
- 📚 [BACKEND_DOCS_INDEX.md](BACKEND_DOCS_INDEX.md) — Documentation Navigation

### Related
- [QUICKSTART_INTEGRATION.md](QUICKSTART_INTEGRATION.md) — Whole System Quick Start
- [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) — Complete Project Checklist

---

## ⏱️ Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Database Schema | 15 min |
| 2 | GET /api/v1/public/site | 20 min |
| 3 | POST /api/v1/admin/sites | 20 min |
| 4 | CORS + Testing | 15 min |
| **Total** | | **~70 min** |

---

## ✅ Your Checklist Right Now

- [ ] Read [BACKEND_ACTION_PLAN.md](BACKEND_ACTION_PLAN.md) (5 min)
- [ ] Copy Database Schema
- [ ] Implement GET Endpoint (use code from action plan)
- [ ] Implement POST Endpoint (use code from action plan)
- [ ] Test with curl commands (copy-paste from action plan)
- [ ] Start Frontend: `npm run dev`
- [ ] Open: http://localhost:5174/?tenant=tacos-mohammedia
- [ ] Verify: Menu displays without errors
- [ ] **Done!** 🎉

---

## 🔑 Key Information

### Request to GET Endpoint
```bash
GET /api/v1/public/site?slug=tacos-mohammedia
```

### Response from GET Endpoint
```json
{
  "tenant": {
    "slug": "...",
    "name": "...",
    "configJson": "..." // JSON String
  },
  "categories": [
    {
      "id": "...",
      "name": "...",
      "items": [
        { "id": "...", "name": "...", "price": 55.00, ... }
      ]
    }
  ]
}
```

### Request to POST Endpoint
```bash
POST /api/v1/admin/sites
X-Admin-Key: your-secret

{
  "slug": "...",
  "name": "...",
  "categories": [...]
}
```

### Response from POST Endpoint
```
Same SiteResponse format as GET
Status: 201 Created (new) or 200 OK (updated)
```

---

## 🎯 Success Criteria

✅ All of these working:

```bash
# Test 1: GET with valid slug
curl http://localhost:5081/api/v1/public/site?slug=tacos-mohammedia
→ 200 OK with SiteResponse

# Test 2: GET with invalid slug
curl http://localhost:5081/api/v1/public/site?slug=unknown
→ 404 Not Found

# Test 3: GET without slug
curl http://localhost:5081/api/v1/public/site
→ 400 Bad Request

# Test 4: POST with valid admin key
curl -X POST ... -H "X-Admin-Key: secret" ...
→ 201 Created with SiteResponse

# Test 5: POST with invalid admin key
curl -X POST ... -H "X-Admin-Key: wrong" ...
→ 401 Unauthorized

# Test 6: Frontend Integration
npm run dev
Open: http://localhost:5174/?tenant=tacos-mohammedia
→ Menu displays correctly ✅
```

---

## 💡 Pro Tips

1. **Start with Action Plan** — It has working code you can copy-paste
2. **Test as you code** — Use curl commands from checklist
3. **CORS might trip you up** — Set headers early
4. **Price handling** — Must be float, not string
5. **isAvailable handling** — Must be boolean, not 0/1
6. **configJson** — Store as string, frontend will parse
7. **Categories/Items** — DELETE old before INSERT new (atomic)

---

## 🆘 Stuck?

### Backend Questions?
→ [BACKEND_SPECIFICATION.md](BACKEND_SPECIFICATION.md) (Detailed reference)

### Architecture Questions?
→ [BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md) (Diagrams + flows)

### Testing Questions?
→ [BACKEND_CHECKLIST.md](BACKEND_CHECKLIST.md) (Curl commands)

### Frontend Integration Questions?
→ [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) (What frontend expects)

---

## 🚀 You're Ready!

Everything you need is documented below. Start with [BACKEND_ACTION_PLAN.md](BACKEND_ACTION_PLAN.md), follow the copy-paste code, test with curl, and you're done.

**Let's Build!** 💪

---

## 📞 Quick Links Summary

**For Implementation:**
- 🚀 [BACKEND_ACTION_PLAN.md](BACKEND_ACTION_PLAN.md)
- ✅ [BACKEND_CHECKLIST.md](BACKEND_CHECKLIST.md)

**For Understanding:**
- 📋 [BACKEND_SPECIFICATION.md](BACKEND_SPECIFICATION.md)
- 🏗️ [BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md)
- ⚡ [BACKEND_TLDR.md](BACKEND_TLDR.md)

**For Integration:**
- 🔌 [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)
- 📚 [BACKEND_DOCS_INDEX.md](BACKEND_DOCS_INDEX.md)

---

**Happy Coding! 🎉**
