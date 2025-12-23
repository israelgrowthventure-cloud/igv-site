# Test Post-Déploiement Mini-Analyse IGV
# Execute après configuration GEMINI_API_KEY + GEMINI_MODEL dans Render

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       TESTS POST-DÉPLOIEMENT MINI-ANALYSE IGV                 ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$BACKEND_URL = "https://igv-cms-backend.onrender.com"
$FRONTEND_URL = "https://israelgrowthventure.com"

# Test 1: Health Check Backend
Write-Host "TEST 1: Backend Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BACKEND_URL/api/health" -TimeoutSec 10
    Write-Host "  ✅ Backend accessible" -ForegroundColor Green
    Write-Host "  MongoDB: $($health.mongodb)" -ForegroundColor Cyan
    Write-Host "  DB: $($health.db)`n" -ForegroundColor Cyan
} catch {
    Write-Host "  ❌ Backend inaccessible`n" -ForegroundColor Red
    exit 1
}

# Test 2: Frontend accessible
Write-Host "TEST 2: Frontend Accessible" -ForegroundColor Yellow
try {
    $frontResponse = Invoke-WebRequest -Uri $FRONTEND_URL -TimeoutSec 10
    if ($frontResponse.Content -match "Votre marque") {
        Write-Host "  ✅ Frontend déployé avec nouveau formulaire français`n" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Frontend accessible mais ancien contenu (cache?)`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Frontend inaccessible`n" -ForegroundColor Red
}

# Test 3: Restauration Halal → Whitelist Arabe
Write-Host "TEST 3: Restauration Halal (Whitelist Arabe)" -ForegroundColor Yellow
$body3 = @{
    email = "test_halal@igv.com"
    nom_de_marque = "TestHalalKebab"
    secteur = "Restauration / Food"
    statut_alimentaire = "Halal"
    concept = "Kebab traditionnel"
    positionnement = "Accessible"
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri "$BACKEND_URL/api/mini-analysis" -Method POST -Body $body3 -ContentType "application/json" -TimeoutSec 40
    Write-Host "  ✅ API répond" -ForegroundColor Green
    if ($response3.analysis -match "Nazareth|Umm al-Fahm|Taybeh|arabe") {
        Write-Host "  ✅ Whitelist Arabe utilisée (emplacements arabes détectés)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Pas d'emplacements arabes détectés dans la réponse" -ForegroundColor Yellow
    }
    Write-Host "  Extrait: $($response3.analysis.Substring(0, [Math]::Min(150, $response3.analysis.Length)))...`n" -ForegroundColor Cyan
} catch {
    Write-Host "  ❌ Erreur API: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 4: Restauration Casher → Whitelist Juive
Write-Host "TEST 4: Restauration Casher (Whitelist Juive)" -ForegroundColor Yellow
$body4 = @{
    email = "test_casher@igv.com"
    nom_de_marque = "TestCasherBakery"
    secteur = "Restauration / Food"
    statut_alimentaire = "Casher"
    concept = "Boulangerie casher premium"
    positionnement = "Premium"
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri "$BACKEND_URL/api/mini-analysis" -Method POST -Body $body4 -ContentType "application/json" -TimeoutSec 40
    Write-Host "  ✅ API répond" -ForegroundColor Green
    if ($response4.analysis -match "Tel Aviv|Jerusalem|Bnei Brak|religieux|Dizengoff") {
        Write-Host "  ✅ Whitelist Juive utilisée (emplacements juifs détectés)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Pas d'emplacements juifs détectés" -ForegroundColor Yellow
    }
    Write-Host "  Extrait: $($response4.analysis.Substring(0, [Math]::Min(150, $response4.analysis.Length)))...`n" -ForegroundColor Cyan
} catch {
    Write-Host "  ❌ Erreur API: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 5: Retail non-food → Whitelist Juive (par défaut)
Write-Host "TEST 5: Retail (Whitelist Juive par défaut)" -ForegroundColor Yellow
$body5 = @{
    email = "test_retail@igv.com"
    nom_de_marque = "TestFashionStore"
    secteur = "Retail (hors food)"
    concept = "Mode streetwear"
    positionnement = "Milieu de gamme"
} | ConvertTo-Json

try {
    $response5 = Invoke-RestMethod -Uri "$BACKEND_URL/api/mini-analysis" -Method POST -Body $body5 -ContentType "application/json" -TimeoutSec 40
    Write-Host "  ✅ API répond (retail sans statut alimentaire)" -ForegroundColor Green
    Write-Host "  Extrait: $($response5.analysis.Substring(0, [Math]::Min(150, $response5.analysis.Length)))...`n" -ForegroundColor Cyan
} catch {
    Write-Host "  ❌ Erreur API: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 6: Paramédical → Whitelist Juive
Write-Host "TEST 6: Paramédical/Santé (Whitelist Juive)" -ForegroundColor Yellow
$body6 = @{
    email = "test_dentist@igv.com"
    nom_de_marque = "TestDentalClinic"
    secteur = "Paramédical / Santé"
    concept = "Clinique dentaire moderne"
    positionnement = "Premium"
} | ConvertTo-Json

try {
    $response6 = Invoke-RestMethod -Uri "$BACKEND_URL/api/mini-analysis" -Method POST -Body $body6 -ContentType "application/json" -TimeoutSec 40
    Write-Host "  ✅ API répond (paramédical)" -ForegroundColor Green
    Write-Host "  Extrait: $($response6.analysis.Substring(0, [Math]::Min(150, $response6.analysis.Length)))...`n" -ForegroundColor Cyan
} catch {
    Write-Host "  ❌ Erreur API: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 7: Anti-doublon (même marque 2x)
Write-Host "TEST 7: Anti-doublon (même marque 2 fois)" -ForegroundColor Yellow
$bodyDup = @{
    email = "duplicate@igv.com"
    nom_de_marque = "TestDuplicateBrand"
    secteur = "Services"
    concept = "Test anti-doublon"
} | ConvertTo-Json

try {
    # Première fois
    $responseDup1 = Invoke-RestMethod -Uri "$BACKEND_URL/api/mini-analysis" -Method POST -Body $bodyDup -ContentType "application/json" -TimeoutSec 40
    Write-Host "  ✅ Première analyse créée" -ForegroundColor Green
    
    Start-Sleep -Seconds 2
    
    # Deuxième fois (devrait échouer)
    try {
        $responseDup2 = Invoke-RestMethod -Uri "$BACKEND_URL/api/mini-analysis" -Method POST -Body $bodyDup -ContentType "application/json" -TimeoutSec 40
        Write-Host "  ❌ Anti-doublon ne fonctionne PAS (2ème analyse autorisée)" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 409) {
            Write-Host "  ✅ Anti-doublon fonctionne (HTTP 409 Conflict)!" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Erreur différente: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        }
    }
    Write-Host ""
} catch {
    Write-Host "  ❌ Erreur première création: $($_.Exception.Message)`n" -ForegroundColor Red
}

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TESTS TERMINÉS                             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
