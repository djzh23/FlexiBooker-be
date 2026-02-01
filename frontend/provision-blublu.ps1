# PowerShell Script zum Provisioning von Blublu-Pizza
# Speichern als: provision-blublu.ps1
# Ausführen: powershell -ExecutionPolicy Bypass -File provision-blublu.ps1

# ⚠️ WICHTIG: Admin-Key anpassen!
$AdminKey = "your-secret-admin-key"  # <- HIER dein echter Admin-Key eintragen
$BackendUrl = "http://localhost:5081"
$JsonFile = "blublu-pizza-config.json"

Write-Host "🍕 Provisioning Blublu-Pizza..." -ForegroundColor Cyan

# 1. JSON-Datei laden
if (-Not (Test-Path $JsonFile)) {
    Write-Host "❌ Fehler: $JsonFile nicht gefunden!" -ForegroundColor Red
    exit 1
}

$jsonContent = Get-Content $JsonFile -Raw
Write-Host "✅ JSON geladen: $JsonFile" -ForegroundColor Green

# 2. POST-Request senden
Write-Host "📤 Sende POST zu $BackendUrl/api/v1/admin/sites..." -ForegroundColor Cyan

$headers = @{
    "X-Admin-Key"   = $AdminKey
    "Content-Type"  = "application/json"
}

try {
    $response = Invoke-RestMethod `
        -Uri "$BackendUrl/api/v1/admin/sites" `
        -Method POST `
        -Headers $headers `
        -Body $jsonContent `
        -ErrorAction Stop

    Write-Host "✅ Erfolg! Status: 201 Created" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json | Write-Host
}
catch {
    $statusCode = $_.Exception.Response.StatusCode
    $errorMsg = $_.Exception.Message
    
    Write-Host ""
    Write-Host "❌ Fehler!" -ForegroundColor Red
    Write-Host "Status: $statusCode" -ForegroundColor Red
    Write-Host "Nachricht: $errorMsg" -ForegroundColor Red
    Write-Host ""
    
    # Debugging-Tipps
    Write-Host "💡 Debugging-Tipps:" -ForegroundColor Yellow
    
    if ($statusCode -eq 401) {
        Write-Host "  → Admin-Key falsch! Prüfe deinen .env im Backend"
        Write-Host "  → Erwartet: $AdminKey"
    }
    elseif ($statusCode -eq 400) {
        Write-Host "  → Falsche Daten! JSON-Format prüfen"
        Write-Host "  → Prüfe: slug, name, categories"
    }
    elseif ($null -eq $statusCode) {
        Write-Host "  → Backend läuft nicht! Starte Backend zuerst"
        Write-Host "  → Prüfe: http://localhost:5081 erreichbar?"
    }
    
    exit 1
}
