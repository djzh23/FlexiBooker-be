# 5-Minute Backend Fix

## The Problem
Admin changes are NOT being saved to database.

## The Root Cause
Your backend is doing **shallow merge** instead of **deep merge**.

When admin sends:
```json
{ "_mergeStrategy": "deep", "layout": { "hero": { "badge": "New Name" } } }
```

You're doing:
```typescript
config = { ...config, ...updateData }; // ❌ WRONG
```

This DELETES all other hero fields!

---

## The Fix (Copy-Paste This)

### 1. Create this function

**File: `src/utils/deepMerge.ts`**

```typescript
export function deepMerge(target: any, source: any): any {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (key === "_mergeStrategy") return;
      
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
```

### 2. Update your PATCH handler

Find this line in your code:
```typescript
config = { ...config, ...updateData }; // OLD
```

Replace it with:
```typescript
if (_mergeStrategy === "deep") {
  config = deepMerge(config, updateData); // ✅ CORRECT
} else {
  config = { ...config, ...updateData };
}
```

### 3. Make sure to extract _mergeStrategy

```typescript
const { _mergeStrategy, ...updateData } = payload; // ✅ Add this
```

### 4. Save as JSON string

```typescript
tenant.configJson = JSON.stringify(config); // ✅ Must stringify
```

---

## Test It

From Admin Panel:
1. Go to "Hero Text" tab
2. Change "Restaurant Name" to something new
3. Click Save
4. Check database - should show the new name + all other fields preserved

---

## That's It!

No other changes needed. The frontend is ready, just implement these 3 steps in the backend.

