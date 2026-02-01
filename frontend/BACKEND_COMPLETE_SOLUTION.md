# Backend Implementation - COMPLETE SOLUTION

## 🚨 The Problem

Your frontend is sending this:
```json
{
  "_mergeStrategy": "deep",
  "layout": {
    "hero": {
      "badge": "New Restaurant Name",
      "title": "New Title",
      "description": "New Description"
    }
  }
}
```

But your backend is probably doing this:
```typescript
// ❌ WRONG - Shallow merge overwrites everything
tenant.configJson = JSON.stringify({ ...currentConfig, ...updateData });
```

Result: All other hero fields (enabled, backgroundImage, cta1, cta2, stats) are DELETED! ❌

---

## ✅ The Solution - Copy This Code

### Step 1: Create a Utility File for Deep Merge

**File: `src/utils/deepMerge.ts` (or similar)**

```typescript
export function deepMerge(target: any, source: any): any {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      // Skip the merge strategy flag
      if (key === "_mergeStrategy") return;
      
      if (isObject(source[key])) {
        if (!(key in output)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          // Recursively merge nested objects
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        // Copy primitive values
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

### Step 2: Update Your PATCH Endpoint

**Find your PATCH /api/v1/admin/sites/:tenant handler and replace it with:**

```typescript
// ============================================
// PATCH /api/v1/admin/sites/:tenant
// ============================================

@Patch("/:tenant")
@UseGuards(AdminKeyGuard) // Your auth guard
async updateSite(
  @Param("tenant") tenantSlug: string,
  @Body() payload: any
): Promise<any> {
  try {
    // 1. Extract _mergeStrategy flag
    const { _mergeStrategy, ...updateData } = payload;

    // 2. Find tenant in database
    const tenant = await this.tenantRepository.findOne({
      where: { slug: tenantSlug }
    });
    
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    // 3. Parse existing config from database
    let config = tenant.configJson 
      ? JSON.parse(tenant.configJson) 
      : {};

    // 4. CRITICAL: Choose merge strategy
    if (_mergeStrategy === "deep") {
      // ✅ CORRECT: Deep merge - preserves all other fields
      config = deepMerge(config, updateData);
    } else {
      // Fallback: Shallow merge (for backward compatibility)
      config = { ...config, ...updateData };
    }

    // 5. Validate the merged config
    this.validateConfig(config);

    // 6. Convert config back to JSON string and save
    tenant.configJson = JSON.stringify(config);
    await this.tenantRepository.save(tenant);

    // 7. Return updated site response
    const updatedSite = await this.buildSiteResponse(tenant);
    return updatedSite;

  } catch (error) {
    console.error(`Error updating site ${tenantSlug}:`, error);
    throw error;
  }
}

private validateConfig(config: any): void {
  // Validate fonts if provided
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

  // Validate font sizes
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

  // Validate colors
  if (config.brand?.primaryColor && !this.isValidHexColor(config.brand.primaryColor)) {
    throw new BadRequestException("Invalid primaryColor format");
  }

  if (config.brand?.secondaryColor && !this.isValidHexColor(config.brand.secondaryColor)) {
    throw new BadRequestException("Invalid secondaryColor format");
  }

  if (config.brand?.accentColor && !this.isValidHexColor(config.brand.accentColor)) {
    throw new BadRequestException("Invalid accentColor format");
  }
}

private isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

private async buildSiteResponse(tenant: Tenant): Promise<any> {
  // Build and return your SiteResponse object
  // This should return the updated tenant with all categories and items
  const categories = await this.categoriesRepository.find({
    where: { tenantId: tenant.id },
    relations: ["items"]
  });

  return {
    tenant: {
      slug: tenant.slug,
      name: tenant.name,
      timezone: tenant.timezone,
      currency: tenant.currency,
      configJson: tenant.configJson
    },
    categories: categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      sortOrder: cat.sortOrder,
      items: cat.items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable
      }))
    }))
  };
}
```

---

## 🧪 Testing Your Implementation

### Test 1: Update Hero Name ONLY

```bash
curl -X PATCH http://localhost:5081/api/v1/admin/sites/tacos-mohammedia \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "_mergeStrategy": "deep",
    "layout": {
      "hero": {
        "badge": "NEW: Bienvenue chez Le #1 Tacos"
      }
    }
  }'
```

**Expected Result in Database:**
```json
{
  "layout": {
    "hero": {
      "badge": "NEW: Bienvenue chez Le #1 Tacos",  // ✅ UPDATED
      "enabled": true,                              // ✅ PRESERVED
      "title": "Le #1 French Tacos au Maroc",      // ✅ PRESERVED
      "description": "Komponiere dein Tacos...",   // ✅ PRESERVED
      "backgroundImage": "https://...",            // ✅ PRESERVED
      "cta1": {...},                               // ✅ PRESERVED
      "cta2": {...},                               // ✅ PRESERVED
      "stats": [...]                               // ✅ PRESERVED
    }
  }
}
```

### Test 2: Update Hero (badge + title + description) from Admin UI

From admin panel, fill in:
- Restaurant Name: "Bienvenue chez Le #1 French Tacos"
- Title: "Le #1 French Tacos au Maroc"
- Description: "Komponiere dein Tacos in 5 Schritten..."

Click Save

**Check Database:**
```sql
SELECT config_json FROM tenants WHERE slug = 'tacos-mohammedia';
```

Should show all 3 fields updated plus all other hero fields preserved.

### Test 3: Update Layout Toggle

```bash
curl -X PATCH http://localhost:5081/api/v1/admin/sites/tacos-mohammedia \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "_mergeStrategy": "deep",
    "layout": {
      "hero": { "enabled": false },
      "menuSection": { "enabled": true },
      "steps": { "enabled": true },
      "gallery": { "enabled": false }
    }
  }'
```

Should only update the `enabled` fields, keep everything else intact.

---

## 📋 Quick Checklist

Before testing, make sure:

- [ ] You imported `deepMerge` function in your controller
- [ ] Your PATCH handler extracts `_mergeStrategy` from the payload
- [ ] You call `deepMerge()` when `_mergeStrategy === "deep"`
- [ ] You stringify the config before saving: `JSON.stringify(config)`
- [ ] You return the full SiteResponse after saving

---

## 🔍 Debugging

If it still doesn't work, add logging:

```typescript
@Patch("/:tenant")
async updateSite(
  @Param("tenant") tenantSlug: string,
  @Body() payload: any
): Promise<any> {
  console.log("=== PATCH REQUEST ===");
  console.log("Tenant:", tenantSlug);
  console.log("Payload:", JSON.stringify(payload, null, 2));
  
  // ... rest of code ...
  
  console.log("=== BEFORE MERGE ===");
  console.log("Current config:", JSON.stringify(config, null, 2));
  
  if (_mergeStrategy === "deep") {
    config = deepMerge(config, updateData);
  }
  
  console.log("=== AFTER MERGE ===");
  console.log("New config:", JSON.stringify(config, null, 2));
  
  // ... rest of code ...
}
```

Then check your server logs to see what's being merged.

---

## Summary

**The 3 things your Backend must do:**

1. ✅ **Extract** `_mergeStrategy` from request body
2. ✅ **Deep Merge** when `_mergeStrategy === "deep"`
3. ✅ **JSON.stringify** and **Save** to database

That's it! Once you implement this, the frontend will work perfectly.

