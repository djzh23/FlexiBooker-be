# Backend API Specification - New Admin Features

## Overview
This document specifies all the **new API endpoints and data structures** needed for the extended Admin Panel with layout, typography, and hero image customization.

**Frontend Update:** AdminPanel.tsx now has **6 tabs**:
1. ✅ Dishes (existing) - Manage menu items
2. ✅ Hero Text (existing) - Customize welcome message
3. ✅ Colors (existing) - Customize brand colors
4. 🆕 Layout - Toggle sections on/off
5. 🆕 Hero Image - Change background image
6. 🆕 Typography - Customize fonts

---

## 1. Current API Endpoints (Already Working)

### GET /api/v1/public/site
- **Purpose:** Fetch site data (public, no admin key needed)
- **Query:** `?slug=tenant-slug` or Header: `X-Tenant: tenant-slug`
- **Response:** `SiteResponse` with tenant info + categories + items
- **Status:** ✅ Working

### PATCH /api/v1/admin/sites/:tenant
- **Purpose:** Update site configuration (requires `X-Admin-Key`)
- **Method:** PATCH
- **Headers:** `X-Admin-Key: your-key`
- **Request Body:** Partial update to tenant config
- **Status:** ✅ Working (needs updates below)

### POST /api/v1/admin/sites/:tenant/items
### PATCH /api/v1/admin/sites/:tenant/items/:itemId
### DELETE /api/v1/admin/sites/:tenant/items/:itemId
- **Purpose:** Manage menu items (CRUD operations)
- **Status:** ✅ Working

---

## 2. NEW: Extended Tenant Configuration

The `configJson` field in the Tenant model must support these additional fields:

### Current Structure (Already Supported)
```json
{
  "brand": {
    "primaryColor": "#FF6B35",
    "secondaryColor": "#004E89",
    "accentColor": "#1F77D2",
    "logoUrl": null
  },
  "contact": {
    "phone": "+212 ...",
    "whatsapp": "+212 ...",
    "email": "contact@..."
  },
  "layout": {
    "showSampleShowcase": true,
    "hero": {
      "enabled": true,
      "badge": "...",
      "title": "...",
      "description": "...",
      "backgroundImage": "...",
      ...
    },
    "menuSection": {...},
    "steps": {...},
    "gallery": {...}
  }
}
```

### NEW Fields to Add

#### 2.1 Typography in Brand Config

```json
{
  "brand": {
    "primaryColor": "#FF6B35",
    "secondaryColor": "#004E89",
    "accentColor": "#1F77D2",
    "logoUrl": null,
    
    // NEW FIELDS - Typography
    "fontFamily": "Inter",           // Body text font (default: "Inter")
    "fontUrl": "https://...",        // Optional: Google Fonts URL or custom
    "headingFontFamily": "Poppins",  // Heading font (default: "Poppins")
    
    // Optional: Font sizes
    "fontSizeBody": 16,              // px (default: 16)
    "fontSizeHeading": 32            // px (default: 32)
  }
}
```

**Supported Font Values:**
- `"Inter"` (default)
- `"Poppins"`
- `"Roboto"`
- `"Open Sans"`
- `"Lato"`
- `"Montserrat"`
- `"Playfair Display"`

---

## 3. NEW API Endpoints

### 3.1 Update Layout Configuration

**Endpoint:** `PATCH /api/v1/admin/sites/:tenant`

**Purpose:** Enable/disable page sections

**Request Body:**
```json
{
  "layout": {
    "hero": {
      "enabled": true
    },
    "menuSection": {
      "enabled": true
    },
    "steps": {
      "enabled": true
    },
    "gallery": {
      "enabled": true
    }
  }
}
```

**Response:** Updated site config with same structure

**Example:**
```bash
curl -X PATCH http://localhost:5081/api/v1/admin/sites/tacos-mohammedia \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "layout": {
      "hero": { "enabled": true },
      "menuSection": { "enabled": false },
      "steps": { "enabled": true },
      "gallery": { "enabled": true }
    }
  }'
```

---

### 3.2 Update Hero Image

**Endpoint:** `PATCH /api/v1/admin/sites/:tenant`

**Purpose:** Change hero background image

**Request Body:**
```json
{
  "layout": {
    "hero": {
      "backgroundImage": "https://images.unsplash.com/photo-1234567890?..."
    }
  }
}
```

**Notes:**
- Image URL must be HTTPS (recommended)
- Image should be landscape format (aspect ratio ~16:9)
- Should support common CDNs: Unsplash, Pexels, custom servers

**Example:**
```bash
curl -X PATCH http://localhost:5081/api/v1/admin/sites/tacos-mohammedia \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "layout": {
      "hero": {
        "backgroundImage": "https://images.unsplash.com/photo-1528832992873-5bb5781525d6?auto=format&fit=crop&w=1200&q=80"
      }
    }
  }'
```

---

### 3.3 Update Typography

**Endpoint:** `PATCH /api/v1/admin/sites/:tenant`

**Purpose:** Customize fonts and font sizes

**Request Body:**
```json
{
  "brand": {
    "fontFamily": "Poppins",
    "headingFontFamily": "Montserrat",
    "fontSizeBody": 16,
    "fontSizeHeading": 36
  }
}
```

**Constraints:**
- `fontFamily`: Must be one of allowed values (list above)
- `headingFontFamily`: Must be one of allowed values
- `fontSizeBody`: 12-24 px
- `fontSizeHeading`: 24-64 px

**Example:**
```bash
curl -X PATCH http://localhost:5081/api/v1/admin/sites/tacos-mohammedia \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "brand": {
      "fontFamily": "Roboto",
      "headingFontFamily": "Playfair Display",
      "fontSizeBody": 18,
      "fontSizeHeading": 42
    }
  }'
```

---

## 4. Data Persistence Requirements

### Database Changes Needed

Update the **Tenant** table/model to store:

```sql
-- New fields in tenant config JSON:
ALTER TABLE tenants ADD COLUMN config_json JSON;
-- OR if it exists, update validation to include new fields

-- Example config_json structure (PostgreSQL):
{
  "brand": {
    "primaryColor": "...",
    "secondaryColor": "...",
    "accentColor": "...",
    "logoUrl": "...",
    "fontFamily": "...",
    "headingFontFamily": "...",
    "fontSizeBody": 16,
    "fontSizeHeading": 32
  },
  "contact": {...},
  "layout": {
    "showSampleShowcase": true,
    "hero": {
      "enabled": true,
      "badge": "...",
      "backgroundImage": "...",
      ...
    },
    ...
  }
}
```

---

## 5. Update PATCH Handler Logic

The **PATCH /api/v1/admin/sites/:tenant** endpoint must:

1. **Accept partial updates** - Only update fields that are provided
2. **Merge with existing config** - Don't overwrite entire config
3. **Validate data:**
   - Font values must be in allowed list
   - Font sizes must be within range
   - Image URLs must be valid HTTPS URLs
   - Colors must be valid hex codes or RGB
4. **Store as JSON string** in `tenant.configJson`
5. **Return updated config** in response

### Pseudocode

```javascript
PATCH /api/v1/admin/sites/:tenant
- Verify X-Admin-Key
- Get existing tenant config
- Deep merge request body with existing config
- Validate new config
- Save to database
- Return updated SiteResponse
```

---

## 6. Frontend Implementation Status

✅ **Completed:**
- AdminPanel.tsx has 6 tabs with all UI/forms
- All form handlers send PATCH requests to `/api/v1/admin/sites/:tenant`
- Request bodies follow the spec above
- Error handling with user feedback
- Translations in 3 languages (EN, FR, AR)

❌ **Needs Backend Implementation:**
- Accept `layout.hero.backgroundImage` updates
- Accept `layout.*.enabled` updates
- Accept `brand.fontFamily`, `brand.headingFontFamily` fields
- Accept `brand.fontSizeBody`, `brand.fontSizeHeading` fields
- Validate typography values
- Persist all changes to database

---

## 7. Frontend-to-Backend Request Flow

```
Admin changes typography
       ↓
AdminPanel.tsx sends:
  PATCH /api/v1/admin/sites/:tenant
  Body: { brand: { fontFamily, headingFontFamily, fontSizeBody, fontSizeHeading } }
       ↓
Backend:
  1. Validate X-Admin-Key
  2. Merge new values into existing config
  3. Validate typography constraints
  4. Save to database
  5. Return updated config
       ↓
Frontend:
  1. Show success message
  2. Reload page: window.location.reload()
  3. LandingPage fetches fresh data from GET /api/v1/public/site
  4. New typography applied via CSS variables
```

---

## 8. Testing Checklist (Backend Developer)

- [ ] PATCH accepts partial `layout` updates
- [ ] PATCH accepts partial `brand` updates
- [ ] Hero image URL is saved and returned in GET response
- [ ] Layout toggles (showHero, showMenu, etc.) are saved
- [ ] Typography fields (fontFamily, headingFontFamily) are saved
- [ ] Font size validation: bodySize 12-24, headingSize 24-64
- [ ] All updates merge with existing config (not overwrite)
- [ ] GET /api/v1/public/site returns all new fields
- [ ] Admin key validation works for all PATCH calls
- [ ] Error responses are clear (e.g., "Invalid font size")

---

## 9. Summary of Changes

| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| **Dishes CRUD** | ✅ Working | ✅ Working | Complete |
| **Hero Text** | ✅ Working | ✅ Working | Complete |
| **Colors** | ✅ Working | ✅ Working | Complete |
| **Layout Toggle** | ✅ Ready | ❌ Needs Implementation | In Progress |
| **Hero Image** | ✅ Ready | ❌ Needs Implementation | In Progress |
| **Typography** | ✅ Ready | ❌ Needs Implementation | In Progress |

---

## 10. Example Complete Config (After All Updates)

```json
{
  "brand": {
    "primaryColor": "#FF6B35",
    "secondaryColor": "#004E89",
    "accentColor": "#1F77D2",
    "logoUrl": null,
    "fontFamily": "Poppins",
    "headingFontFamily": "Playfair Display",
    "fontSizeBody": 18,
    "fontSizeHeading": 42
  },
  "contact": {
    "phone": "+212 6 12 34 56 78",
    "whatsapp": "+212 6 12 34 56 78",
    "email": "contact@makintar.com"
  },
  "layout": {
    "showSampleShowcase": true,
    "hero": {
      "enabled": true,
      "badge": "Makin Hir Tacos | Mohammedia",
      "title": "Le #1 French Tacos au Maroc",
      "description": "Komponiere dein Tacos in 5 Schritten...",
      "backgroundImage": "https://iili.io/fLOHakJ.jpg",
      "cta1": { "label": "Jetzt bestellen" },
      "cta2": { "label": "Vollständige Karte ansehen" },
      "stats": [...]
    },
    "menuSection": {
      "enabled": true,
      "badge": "Carte signature",
      "title": "Die beliebtesten Tacos",
      "description": "Rezepte inspiriert vom Original..."
    },
    "steps": {
      "enabled": true,
      "badge": "Ritual",
      "title": "Dein Tacos in 5 Schritten",
      "steps": [...]
    },
    "gallery": {
      "enabled": true,
      "badge": "Ambiance",
      "title": "Shots disponibles pour ta landing",
      "images": [...]
    }
  }
}
```

---

## Questions for Backend Team

1. How should font-family be applied? Via CSS variables in the frontend?
2. Should we load Google Fonts dynamically, or include them in the build?
3. What's the max length for image URLs?
4. Should there be image validation (dimensions, file size)?
5. Should we cache the config or always fetch fresh?

