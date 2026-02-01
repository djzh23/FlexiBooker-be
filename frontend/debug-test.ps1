#!/usr/bin/env powershell
# DEBUG-SCRIPT: Teste ob Frontend+Backend korrekt konfiguriert sind

Write-Host "🔍 FRONTEND-BACKEND INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# 1. TEST: .env.local vorhanden?
# ============================================================
Write-Host "1️⃣  Checking .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✅ .env.local exists" -ForegroundColor Green
    $envContent = Get-Content ".env.local" | Select-String "VITE_"
    $envContent | ForEach-Object { Write-Host "   - $_" }
} else {
    Write-Host "   ❌ .env.local NOT FOUND!" -ForegroundColor Red
    Write-Host "   Create it with:" -ForegroundColor Yellow
    Write-Host "   VITE_ADMIN_KEY=dev-admin-key" -ForegroundColor Yellow
    Write-Host "   VITE_API_BASE_URL=http://localhost:5081" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# ============================================================
# 2. TEST: Backend reachable?
# ============================================================
Write-Host "2️⃣  Testing Backend connection..." -ForegroundColor Yellow
$backendUrl = "http://localhost:5081/api/v1/public/site?slug=blublu-pizza"
try {
    $response = Invoke-WebRequest -Uri $backendUrl -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Backend is running (HTTP $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   URL: $backendUrl" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend not responding!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure Backend is running on port 5081" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================
# 3. TEST: No localStorage in LandingPage.tsx?
# ============================================================
Write-Host "3️⃣  Checking for localStorage usage..." -ForegroundColor Yellow
$localStorageMatches = Select-String -Path "src/pages/LandingPage.tsx" -Pattern "localStorage\.(setItem|getItem|removeItem)" -ErrorAction SilentlyContinue
if ($localStorageMatches) {
    Write-Host "   ⚠️  WARNING: localStorage found in LandingPage.tsx:" -ForegroundColor Red
    $localStorageMatches | ForEach-Object { Write-Host "      Line $($_.LineNumber): $($_.Line.Trim())" }
} else {
    Write-Host "   ✅ No localStorage usage in LandingPage.tsx" -ForegroundColor Green
}
Write-Host ""

# ============================================================
# 4. TEST: AdminPanel sends to Backend?
# ============================================================
Write-Host "4️⃣  Checking AdminPanel API calls..." -ForegroundColor Yellow
$adminApiCalls = Select-String -Path "src/modules/admin/AdminPanel.tsx" -Pattern "/api/v1/admin/sites/\${tenantSlug}" -ErrorAction SilentlyContinue
if ($adminApiCalls.Count -gt 0) {
    Write-Host "   ✅ AdminPanel uses Backend API endpoints:" -ForegroundColor Green
    Write-Host "      Found $($adminApiCalls.Count) API calls to Backend" -ForegroundColor Green
} else {
    Write-Host "   ❌ AdminPanel does NOT use Backend API!" -ForegroundColor Red
}
Write-Host ""

# ============================================================
# 5. TEST: Correct API endpoints?
# ============================================================
Write-Host "5️⃣  Verifying API endpoint patterns..." -ForegroundColor Yellow
$endpoints = @(
    "POST.*api/v1/admin/sites/\${tenantSlug}/items",
    "PATCH.*api/v1/admin/sites/\${tenantSlug}/items/\${",
    "DELETE.*api/v1/admin/sites/\${tenantSlug}/items/",
    "PATCH.*api/v1/admin/sites/\${tenantSlug}.*hero|colors"
)

$found = 0
foreach ($endpoint in $endpoints) {
    $match = Select-String -Path "src/modules/admin/AdminPanel.tsx" -Pattern $endpoint -ErrorAction SilentlyContinue
    if ($match) {
        $found++
        Write-Host "   ✅ Found: $endpoint" -ForegroundColor Green
    }
}
Write-Host "   Total: $found/4 API patterns found" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# 6. TEST: Admin Key Header?
# ============================================================
Write-Host "6️⃣  Checking X-Admin-Key header..." -ForegroundColor Yellow
$adminKeyUsage = Select-String -Path "src/modules/admin/AdminPanel.tsx" -Pattern "X-Admin-Key" -ErrorAction SilentlyContinue
if ($adminKeyUsage) {
    Write-Host "   ✅ X-Admin-Key header is being used:" -ForegroundColor Green
    $adminKeyUsage | ForEach-Object { Write-Host "      Line $($_.LineNumber)" }
} else {
    Write-Host "   ❌ X-Admin-Key header NOT found!" -ForegroundColor Red
}
Write-Host ""

# ============================================================
# 7. TEST: TypeScript Errors?
# ============================================================
Write-Host "7️⃣  Checking TypeScript compilation..." -ForegroundColor Yellow
Write-Host "   Run: npm run build" -ForegroundColor Yellow
Write-Host "   Or check in IDE for red underlines" -ForegroundColor Yellow
Write-Host ""

# ============================================================
# SUMMARY
# ============================================================
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ If all checks pass:" -ForegroundColor Green
Write-Host "   1. Run: npm run dev" -ForegroundColor Green
Write-Host "   2. Open: http://localhost:5174/?slug=blublu-pizza&admin=true" -ForegroundColor Green
Write-Host "   3. Add a test dish" -ForegroundColor Green
Write-Host "   4. Check Network tab (F12) → POST should go to Backend" -ForegroundColor Green
Write-Host "   5. After reload → Dish should appear from Backend" -ForegroundColor Green
Write-Host ""
Write-Host "❌ If check 2 fails (Backend not running):" -ForegroundColor Yellow
Write-Host "   Make sure Backend is started on port 5081" -ForegroundColor Yellow
Write-Host ""
Write-Host "❌ If check 3 or 4 fails:" -ForegroundColor Yellow
Write-Host "   Restart Vite dev server: npm run dev" -ForegroundColor Yellow
Write-Host ""
