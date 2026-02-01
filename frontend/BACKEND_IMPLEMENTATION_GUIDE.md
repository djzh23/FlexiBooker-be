# Backend Implementation Guide - Admin Updates

## Problem Analysis

**Issue:** Frontend sends PATCH requests to update layout/hero/typography, but changes are NOT being saved to database.

**Root Cause:** The PATCH endpoint is likely doing a **shallow replace** instead of a **deep merge**, which overwrites existing config fields that weren't in the request body.

### Example of the Problem

**Current Database State:**
```json
{
  "layout": {
    "hero": {
      "enabled": true,
      "badge": "Makin Hir Tacos",
      "title": "Le #1 French Tacos",
      "description": "Wonderful tacos...",
      "backgroundImage": "https://...",
      "cta1": { "label": "Order Now" },
      "stats": [ ... ]
    }
  }
}
```

**Frontend sends (Layout Toggle):**
```json
{
  "_mergeStrategy": "deep",
  "layout": {
    "hero": { "enabled": false }
  }
}
```

**If Backend uses Object.assign() or replace:**
```json
{
  "layout": {
    "hero": { "enabled": false }  // ❌ ALL OTHER FIELDS DELETED!
  }
}
```

**What we NEED (Deep Merge):**
```json
{
  "layout": {
    "hero": {
      "enabled": false,  // ✅ Updated
      "badge": "Makin Hir Tacos",  // ✅ Preserved
      "title": "Le #1 French Tacos",  // ✅ Preserved
      "description": "Wonderful tacos...",  // ✅ Preserved
      "backgroundImage": "https://...",  // ✅ Preserved
      "cta1": { "label": "Order Now" },  // ✅ Preserved
      "stats": [ ... ]  // ✅ Preserved
    }
  }
}
```

---

## Solution: Implement Deep Merge in Backend

### 1. Frontend Request Format

The frontend now sends requests with a **`_mergeStrategy` flag**:

```json
{
  "_mergeStrategy": "deep",
  "layout": { ... },
  "brand": { ... }
}
```

**This tells the backend:** "Deep merge only these fields into the existing config, don't replace anything"

---

### 2. Backend Implementation

#### Pseudocode

```javascript
PATCH /api/v1/admin/sites/:tenant

1. Extract request body
2. Check if _mergeStrategy === "deep"
3. Get existing tenant config from database
4. If _mergeStrategy === "deep":
     deepMerge(existingConfig, requestBody)
   Else:
     Use default behavior (for backward compatibility)
5. Validate the merged config
6. Save to database
7. Return updated SiteResponse
```

#### JavaScript/Node.js Example

```typescript
// Helper function for deep merging
function deepMerge(target: any, source: any): any {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (key === "_mergeStrategy") return; // Skip the flag
      
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

// In PATCH endpoint handler
router.patch("/api/v1/admin/sites/:tenant", async (req, res) => {
  const { tenant } = req.params;
  const { _mergeStrategy, ...updateData } = req.body;

  try {
    // Get existing tenant
    const existingTenant = await Tenant.findOne({ slug: tenant });
    if (!existingTenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    // Parse existing config
    let currentConfig = JSON.parse(existingTenant.configJson || "{}");

    // Apply merge strategy
    if (_mergeStrategy === "deep") {
      currentConfig = deepMerge(currentConfig, updateData);
    } else {
      currentConfig = { ...currentConfig, ...updateData }; // Shallow merge (default)
    }

    // Validate updated config
    validateConfig(currentConfig);

    // Save to database
    existingTenant.configJson = JSON.stringify(currentConfig);
    await existingTenant.save();

    // Return updated site
    const updatedSite = await buildSiteResponse(existingTenant);
    return res.json(updatedSite);
  } catch (error) {
    console.error("Error updating site:", error);
    return res.status(400).json({ error: error.message });
  }
});
```

#### PostgreSQL/Node.js with TypeORM Example

```typescript
@Patch("/sites/:tenant")
@UseGuards(AdminKeyGuard)
async updateSite(
  @Param("tenant") tenantSlug: string,
  @Body() payload: any
): Promise<SiteResponse> {
  const { _mergeStrategy, ...updateData } = payload;

  // Get existing tenant
  const tenant = await this.tenantRepository.findOne({
    where: { slug: tenantSlug }
  });
  
  if (!tenant) {
    throw new NotFoundException("Tenant not found");
  }

  // Parse current config
  let config = tenant.configJson ? JSON.parse(tenant.configJson) : {};

  // Deep merge if requested
  if (_mergeStrategy === "deep") {
    config = this.deepMergeConfig(config, updateData);
  } else {
    config = { ...config, ...updateData };
  }

  // Validate
  this.validateConfig(config);

  // Save
  tenant.configJson = JSON.stringify(config);
  await this.tenantRepository.save(tenant);

  // Return updated site
  return this.buildSiteResponse(tenant);
}

private deepMergeConfig(target: any, source: any): any {
  const output = { ...target };

  Object.keys(source).forEach(key => {
    if (key === "_mergeStrategy") return;

    if (this.isObject(source[key]) && this.isObject(target[key])) {
      output[key] = this.deepMergeConfig(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });

  return output;
}

private isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item);
}
```

---

### 3. Request Examples from Frontend

#### Layout Update Request

```bash
POST /api/v1/admin/sites/tacos-mohammedia
Header: X-Admin-Key: dev-admin-key
Body:
{
  "_mergeStrategy": "deep",
  "layout": {
    "hero": {
      "enabled": false
    },
    "menuSection": {
      "enabled": true
    },
    "steps": {
      "enabled": true
    },
    "gallery": {
      "enabled": false
    }
  }
}
```

**Backend Processing:**
1. Get existing config (has all hero fields + stats + images)
2. Merge: `{ layout: { hero: { enabled: false } } }` deep into existing
3. Result: hero is now disabled but keeps badge, title, background, etc.
4. Save to DB

---

#### Hero Image Update Request

```bash
POST /api/v1/admin/sites/tacos-mohammedia
Header: X-Admin-Key: dev-admin-key
Body:
{
  "_mergeStrategy": "deep",
  "layout": {
    "hero": {
      "backgroundImage": "https://images.unsplash.com/photo-1234567890?..."
    }
  }
}
```

**Backend Result:**
```json
{
  "layout": {
    "hero": {
      "enabled": true,  // Unchanged
      "badge": "...",   // Unchanged
      "title": "...",   // Unchanged
      "backgroundImage": "https://images.unsplash.com/photo-1234567890?...",  // ✅ Updated
      // All other fields preserved
    }
  }
}
```

---

#### Typography Update Request

```bash
POST /api/v1/admin/sites/tacos-mohammedia
Header: X-Admin-Key: dev-admin-key
Body:
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

**Backend Result:**
```json
{
  "brand": {
    "primaryColor": "#FF6B35",   // Unchanged
    "secondaryColor": "#004E89", // Unchanged
    "accentColor": "#1F77D2",    // Unchanged
    "logoUrl": null,             // Unchanged
    "fontFamily": "Poppins",     // ✅ Updated
    "headingFontFamily": "Montserrat", // ✅ Updated
    "fontSizeBody": 18,          // ✅ Updated
    "fontSizeHeading": 42,       // ✅ Updated
  }
}
```

---

## 4. Configuration Validation

Add validation to ensure only valid values are saved:

```typescript
private validateConfig(config: any): void {
  if (config.brand?.fontFamily) {
    const validFonts = ["Inter", "Poppins", "Roboto", "Open Sans", "Lato", "Montserrat", "Playfair Display"];
    if (!validFonts.includes(config.brand.fontFamily)) {
      throw new BadRequestException(`Invalid fontFamily: ${config.brand.fontFamily}`);
    }
  }

  if (config.brand?.headingFontFamily) {
    const validFonts = ["Inter", "Poppins", "Roboto", "Open Sans", "Lato", "Montserrat", "Playfair Display"];
    if (!validFonts.includes(config.brand.headingFontFamily)) {
      throw new BadRequestException(`Invalid headingFontFamily: ${config.brand.headingFontFamily}`);
    }
  }

  if (config.brand?.fontSizeBody !== undefined) {
    if (config.brand.fontSizeBody < 12 || config.brand.fontSizeBody > 24) {
      throw new BadRequestException("fontSizeBody must be between 12 and 24");
    }
  }

  if (config.brand?.fontSizeHeading !== undefined) {
    if (config.brand.fontSizeHeading < 24 || config.brand.fontSizeHeading > 64) {
      throw new BadRequestException("fontSizeHeading must be between 24 and 64");
    }
  }

  // Validate colors are hex format
  if (config.brand?.primaryColor && !this.isValidHexColor(config.brand.primaryColor)) {
    throw new BadRequestException("Invalid primaryColor format");
  }

  // etc.
}

private isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}
```

---

## 5. Expected Database Result

After implementing deep merge and running all 3 updates, the database should look like:

```json
{
  "brand": {
    "logoUrl": null,
    "accentColor": "#1F77D2",
    "primaryColor": "#FF6B35",
    "secondaryColor": "#004E89",
    "fontFamily": "Poppins",
    "headingFontFamily": "Montserrat",
    "fontSizeBody": 18,
    "fontSizeHeading": 42
  },
  "layout": {
    "hero": {
      "enabled": false,
      "cta1": {
        "label": "Jetzt bestellen"
      },
      "cta2": {
        "label": "Vollständige Karte ansehen"
      },
      "badge": "Makin Hir Tacos | Mohammedia",
      "stats": [ ... ],
      "title": "Le #1 French Tacos au Maroc",
      "description": "Komponiere dein Tacos...",
      "backgroundImage": "https://new-image-from-admin.jpg"
    },
    "steps": {
      "enabled": true,
      "badge": "Ritual",
      "steps": [ ... ],
      "title": "Dein Tacos in 5 Schritten"
    },
    "gallery": {
      "enabled": false,
      "badge": "Ambiance",
      "title": "Shots disponibles pour ta landing",
      "images": [ ... ]
    },
    "menuSection": {
      "enabled": true,
      "badge": "Carte signature",
      "title": "Die beliebtesten Tacos",
      "description": "Rezepte inspiriert vom Original..."
    },
    "showSampleShowcase": true
  },
  "contact": { ... }
}
```

---

## 6. Testing Checklist

- [ ] **Deep Merge Works:** Update one field in layout, verify other fields are preserved
- [ ] **Hero Image Updates:** Change backgroundImage, verify it's saved but title/badge/stats unchanged
- [ ] **Typography Saved:** Update fontFamily/fontSizeBody, verify brand colors unchanged
- [ ] **Layout Toggles:** Disable hero, verify it's saved
- [ ] **Validation Works:** Send invalid font name, should get error
- [ ] **GET Returns Updated Data:** After PATCH, GET /api/v1/public/site returns new values
- [ ] **Frontend Reflects Changes:** After page reload, new values appear on landing page

---

## 7. Frontend Flow (What Happens After Backend Fix)

```
User changes Hero Image in Admin Tab
        ↓
Admin clicks "Save" button
        ↓
Frontend sends:
  PATCH /api/v1/admin/sites/tacos-mohammedia
  Body: {
    "_mergeStrategy": "deep",
    "layout": { "hero": { "backgroundImage": "https://new.jpg" } }
  }
        ↓
Backend:
  1. Reads existing config from DB (has all fields)
  2. Deep merges new backgroundImage into existing
  3. Validates config
  4. Saves full config back to DB
        ↓
Frontend:
  1. Receives success response
  2. Shows "Hero image updated!" message
  3. window.location.reload() after 1 second
        ↓
LandingPage Component:
  1. Calls GET /api/v1/public/site
  2. Gets updated config WITH new backgroundImage
  3. Renders layout with new image
        ↓
User sees new hero image on landing page ✅
```

---

## Summary

**To fix the issue, implement in backend:**

1. ✅ Extract `_mergeStrategy` from request body
2. ✅ Implement `deepMerge()` function
3. ✅ If `_mergeStrategy === "deep"`: use deepMerge, else use shallow merge
4. ✅ Add config validation
5. ✅ Ensure config is JSON stringified before saving to DB
6. ✅ Return full updated SiteResponse to frontend

**Result:** All admin changes will be persisted to database and visible on the landing page after refresh.

