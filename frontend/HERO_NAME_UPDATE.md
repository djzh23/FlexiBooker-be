# Hero Section - Restaurant Name Update

## What Changed

### Frontend
- ✅ Added new field "Restaurant Name / Badge" in Hero Tab of Admin Panel
- ✅ Field accepts up to 80 characters
- ✅ Includes live character counter
- ✅ Shows preview of badge + title + description
- ✅ All 3 fields (badge, title, description) are now required
- ✅ Uses deep merge strategy to preserve other hero fields

### Backend Changes Needed

When admin saves the Hero section with the new badge field, the backend will receive:

```json
PATCH /api/v1/admin/sites/{tenant}
Headers: X-Admin-Key: dev-admin-key

Body:
{
  "_mergeStrategy": "deep",
  "layout": {
    "hero": {
      "badge": "Bienvenue chez Le #1 French Tacos",
      "title": "Le #1 French Tacos au Maroc",
      "description": "Komponiere dein Tacos in 5 Schritten, wähle aus 15+ artisanalen Sauces..."
    }
  }
}
```

### Database Result
After deep merge, the database will contain:

```json
{
  "layout": {
    "hero": {
      "badge": "Bienvenue chez Le #1 French Tacos",  // ✅ UPDATED
      "title": "Le #1 French Tacos au Maroc",        // ✅ UPDATED
      "description": "Komponiere dein Tacos...",     // ✅ UPDATED
      "enabled": true,                                // ✅ PRESERVED
      "backgroundImage": "https://...",              // ✅ PRESERVED
      "cta1": { "label": "Order Now" },              // ✅ PRESERVED
      "cta2": { "label": "View Menu" },              // ✅ PRESERVED
      "stats": [ ... ]                               // ✅ PRESERVED
    }
  }
}
```

## Testing

1. **In Admin Panel:**
   - Go to "Hero Text" tab
   - Fill in:
     - Restaurant Name: "Bienvenue chez Le #1 French Tacos"
     - Title: "Le #1 French Tacos au Maroc"
     - Description: "Your description..."
   - Click Save

2. **Expected Result:**
   - Success message: "Hero section saved!"
   - Page reloads after 1 second
   - Landing page shows new badge/title/description

3. **Backend Should:**
   - Deep merge only these 3 fields
   - Preserve all other hero fields (enabled, backgroundImage, cta1, cta2, stats)
   - Save to database as JSON string
   - Return updated SiteResponse

## Supported Languages

The frontend sends the same request in all languages (EN/FR/AR). The labels are translated in the UI, but the data sent is language-independent.

## Notes

- Badge field is shown in the gray pill at the top of the hero section
- Title is the main heading
- Description is the subheading text
- All three fields work together to create the complete hero welcome message
