# 📚 Backend Documentation Index

**Alle Dokumentation für Backend-Implementierung.**

---

## 📖 Wähle deine Dokumentation

### 🚀 **Schnell Starten?**
→ **[BACKEND_TLDR.md](BACKEND_TLDR.md)** (5 Min lesen)
- TL;DR: Was du brauchst
- Code-Snippets
- Quick Checklist

### 🎯 **Details & Implementierung?**
→ **[BACKEND_SPECIFICATION.md](BACKEND_SPECIFICATION.md)** (30 Min lesen)
- Exakte Endpoint-Definitionen
- Request/Response Format
- Komplette Express-Beispiele
- Database Queries
- Error Handling

### ✅ **Schritt-für-Schritt Implementieren?**
→ **[BACKEND_CHECKLIST.md](BACKEND_CHECKLIST.md)** (abhaken während implementieren)
- Phase 1-7 Checkboxes
- Curl Test Commands
- Verification Steps

### 📊 **Architektur verstehen?**
→ **[BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md)** (visualize)
- System Diagramme
- Data Flows
- Timeline/Performance
- Multi-Tenant Routing

### 🔌 **Frontend Integration?**
→ **[FRONTEND_INTEGRATION_GUIDE.md](../FRONTEND_INTEGRATION_GUIDE.md)** (from Frontend perspective)
- Was Frontend erwartet
- Service Code
- Error Handling

---

## 🎯 Nach Rolle

### 👨‍💼 **Project Manager / Tech Lead**
1. BACKEND_TLDR.md (Überblick)
2. BACKEND_ARCHITECTURE.md (Diagramme)
3. BACKEND_CHECKLIST.md (Fortschritt tracken)

### 👨‍💻 **Backend Developer (Express.js)**
1. BACKEND_TLDR.md (Quick Start)
2. BACKEND_SPECIFICATION.md (Details)
3. BACKEND_CHECKLIST.md (Implementierung)
4. Teste mit Curl Commands

### 👨‍💻 **Backend Developer (C#/.NET)**
1. BACKEND_SPECIFICATION.md (API Design)
2. BACKEND_ARCHITECTURE.md (Data Flow)
3. Implementiere Controllers + Services
4. BACKEND_CHECKLIST.md (Verification)

### 🎨 **Frontend Developer**
→ FRONTEND_INTEGRATION_GUIDE.md (was Backend liefert)

### 🧪 **QA / Tester**
1. BACKEND_CHECKLIST.md (Curl Tests)
2. BACKEND_SPECIFICATION.md (Expected Formats)
3. BACKEND_ARCHITECTURE.md (Error Cases)

---

## 🔑 Key Takeaways

### Endpoints (2 Stück!)

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/v1/public/site` | GET | Public: Hole Tenant + Menu | None |
| `/api/v1/admin/sites` | POST | Admin: Create/Update Tenant | X-Admin-Key |

### Database (3 Tabellen!)

```
tenants (id, slug, name, timezone, currency, configJson)
menu_categories (id, tenantId, name, sortOrder)
menu_items (id, tenantId, categoryId, name, price, imageUrl, isAvailable)
```

### Response Format (SiteResponse!)

```json
{
  "tenant": {...},
  "categories": [
    { "id", "name", "sortOrder", "items": [...] }
  ]
}
```

---

## ⏱️ Implementation Time Estimate

| Phase | Task | Time |
|-------|------|------|
| 1 | Database Setup | 15 min |
| 2 | GET /api/v1/public/site | 30 min |
| 3 | POST /api/v1/admin/sites | 30 min |
| 4 | CORS + Headers | 10 min |
| 5 | Testing & Verification | 20 min |
| 6 | Frontend Integration | 10 min |
| **Total** | | **~2 hours** |

---

## ✅ Go/No-Go Checklist

Before calling Frontend ready:

- [ ] GET /api/v1/public/site?slug=tacos-mohammedia → 200 OK ✅
- [ ] POST /api/v1/admin/sites (valid key) → 201 Created ✅
- [ ] POST /api/v1/admin/sites (wrong key) → 401 ✅
- [ ] GET unknown slug → 404 ✅
- [ ] GET without slug → 400 ✅
- [ ] CORS headers present ✅
- [ ] Price is decimal/float (not string) ✅
- [ ] isAvailable is boolean (not 0/1) ✅
- [ ] configJson is string (not parsed object) ✅
- [ ] Categories sorted by sortOrder ✅
- [ ] Items sorted by name ✅
- [ ] Frontend loads without errors ✅
- [ ] Menu displays with items ✅
- [ ] Theme colors applied ✅

---

## 🚀 Next Steps

### If you're starting NOW:
1. Open: **BACKEND_TLDR.md** (5 min)
2. Open: **BACKEND_SPECIFICATION.md** (30 min)
3. Code: Implement GET endpoint
4. Code: Implement POST endpoint
5. Test: **BACKEND_CHECKLIST.md** (curl commands)
6. Verify: Frontend works

### If you need DETAILS:
1. **BACKEND_ARCHITECTURE.md** (visualize first)
2. **BACKEND_SPECIFICATION.md** (then code)
3. Reference **BACKEND_CHECKLIST.md** during implementation

### If you're DEBUGGING:
1. Check: **BACKEND_SPECIFICATION.md** Error Responses
2. Test: **BACKEND_CHECKLIST.md** Curl Commands
3. Verify: Response format matches exactly

---

## 💬 Common Questions

**Q: Warum ein GET und ein POST Endpoint?**  
A: GET für öffentliche Besucher (schnell, gecacht).  
   POST für Admin (provisionieren, aktualisieren).

**Q: Warum configJson als String speichern?**  
A: Flexibilität. Frontend kann es parsen, Backend speichert es roh.

**Q: Warum SiteResponse auf beiden Endpoints?**  
A: Consistency. Frontend erwartet immer gleiche Struktur.

**Q: Warum X-Admin-Key im Header?**  
A: Standard-REST-Practice. Sicherer als in Query-Param.

**Q: Warum DELETE + INSERT statt UPDATE für Items?**  
A: Atomic. Alles-oder-Nichts. Keine Zombies von alten Items.

---

## 📞 Contact / Questions

- Backend nicht klar? → BACKEND_SPECIFICATION.md (Details)
- Architektur nicht klar? → BACKEND_ARCHITECTURE.md (Diagramme)
- Implementation blockiert? → BACKEND_CHECKLIST.md (Schritt-für-schritt)
- Frontend erwartet was? → FRONTEND_INTEGRATION_GUIDE.md

---

## 🎉 You're Ready!

Alle Information ist hier. Backend ist 2 Stunden Arbeit.  
Frontend wartet. Let's Go! 🚀

**Happy Coding!**
