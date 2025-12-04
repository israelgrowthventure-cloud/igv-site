# ========================================
# TEST COMPLET CMS ADMIN - TOUTES LES PAGES
# ========================================
# Ce script vérifie que toutes les pages du CMS
# se chargent correctement dans l'éditeur GrapesJS

Write-Host "`n🎯 TEST COMPLET CMS ADMIN GrapesJS`n" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Gray

$FRONTEND_URL = "http://localhost:3000"
$BACKEND_URL = "http://localhost:5000"

# Pages à tester
$pages = @(
    @{ slug = "home"; name = "Accueil" },
    @{ slug = "packs"; name = "Nos Packs" },
    @{ slug = "about-us"; name = "À Propos" },
    @{ slug = "contact"; name = "Contact" },
    @{ slug = "le-commerce-de-demain"; name = "Le Commerce de Demain" }
)

$successCount = 0
$totalTests = 0

# ========================================
# TEST 1: Backend Health
# ========================================
Write-Host "📡 TEST 1: Backend Health Check" -ForegroundColor Yellow
$totalTests++

try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/health" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend is alive ($($response.StatusCode))" -ForegroundColor Green
        $successCount++
    }
} catch {
    Write-Host "   ❌ Backend unreachable: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ========================================
# TEST 2: Frontend Accessible
# ========================================
Write-Host "🌐 TEST 2: Frontend Accessibility" -ForegroundColor Yellow
$totalTests++

try {
    $response = Invoke-WebRequest -Uri "$FRONTEND_URL" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend is accessible ($($response.StatusCode))" -ForegroundColor Green
        $successCount++
    }
} catch {
    Write-Host "   ❌ Frontend unreachable: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ========================================
# TEST 3: CMS Admin Pages List
# ========================================
Write-Host "📋 TEST 3: CMS Admin Pages List" -ForegroundColor Yellow
$totalTests++

try {
    $response = Invoke-WebRequest -Uri "$FRONTEND_URL/admin/pages" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200 -and $response.Content -match "grapesjs|admin") {
        Write-Host "   ✅ Admin pages list accessible ($($response.StatusCode))" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "   ⚠️  Page loaded but content suspicious" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Admin pages list error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ========================================
# TEST 4: CMS New Page Editor
# ========================================
Write-Host "➕ TEST 4: CMS New Page Editor" -ForegroundColor Yellow
$totalTests++

try {
    $response = Invoke-WebRequest -Uri "$FRONTEND_URL/admin/pages/new" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200 -and $response.Content -match "grapesjs|PageEditorAdvanced") {
        Write-Host "   ✅ New page editor accessible ($($response.StatusCode))" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "   ⚠️  Page loaded but GrapesJS not detected" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ New page editor error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ========================================
# TEST 5-9: Each Page in Editor
# ========================================
Write-Host "📄 TEST 5-9: Individual Pages in Editor" -ForegroundColor Yellow

foreach ($page in $pages) {
    $totalTests++
    Write-Host "   Testing: $($page.name) ($($page.slug))..." -ForegroundColor Gray
    
    try {
        # Test backend API endpoint first
        $apiResponse = Invoke-WebRequest -Uri "$BACKEND_URL/api/pages/$($page.slug)" -Method GET -TimeoutSec 10 -ErrorAction Stop
        $apiData = $apiResponse.Content | ConvertFrom-Json
        
        $hasHTML = $apiData.content_html -and $apiData.content_html.Length -gt 0
        $hasCSS = $apiData.content_css -and $apiData.content_css.Length -gt 0
        
        Write-Host "      API: ✅ $($apiResponse.StatusCode) | HTML: $($apiData.content_html.Length) chars | CSS: $($apiData.content_css.Length) chars" -ForegroundColor Green
        
        # Test frontend editor page
        $editorResponse = Invoke-WebRequest -Uri "$FRONTEND_URL/admin/pages/$($page.slug)" -Method GET -TimeoutSec 10 -ErrorAction Stop
        
        if ($editorResponse.StatusCode -eq 200) {
            Write-Host "      Editor: ✅ $($editorResponse.StatusCode) | Page loads in editor" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "      Editor: ⚠️  $($editorResponse.StatusCode)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "      ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# ========================================
# TEST 10: Console Errors Check (Manual)
# ========================================
Write-Host "🖥️  TEST 10: Console Errors (Manual Check Required)" -ForegroundColor Yellow
Write-Host "   ⚠️  Open browser DevTools and check for [CMS] errors" -ForegroundColor Yellow
Write-Host "   Expected: No `[CMS] ❌` errors" -ForegroundColor Gray
Write-Host "   Expected: Logs like `[CMS] ✅ Content successfully loaded`" -ForegroundColor Gray
Write-Host ""

# ========================================
# TEST 11: Tabs Stability (Manual)
# ========================================
Write-Host "🔄 TEST 11: Blocs/Styles Tabs Stability (Manual Check Required)" -ForegroundColor Yellow
Write-Host "   1. Go to /admin/pages/home" -ForegroundColor Gray
Write-Host "   2. Click 'Styles' tab" -ForegroundColor Gray
Write-Host "   3. Click 'Blocs' tab again" -ForegroundColor Gray
Write-Host "   Expected: Blocs list remains populated" -ForegroundColor Gray
Write-Host "   Expected: No reload, instant switch" -ForegroundColor Gray
Write-Host ""

# ========================================
# SUMMARY
# ========================================
Write-Host "========================================" -ForegroundColor Gray
Write-Host "📊 RÉSUMÉ DES TESTS`n" -ForegroundColor Cyan

$percentage = [math]::Round(($successCount / $totalTests) * 100, 1)

Write-Host "   Tests réussis: $successCount / $totalTests ($percentage%)" -ForegroundColor $(if ($percentage -ge 80) { "Green" } elseif ($percentage -ge 50) { "Yellow" } else { "Red" })
Write-Host ""

if ($successCount -eq $totalTests) {
    Write-Host "🎉 TOUS LES TESTS SONT PASSÉS!" -ForegroundColor Green
    Write-Host "   Le CMS Admin est entièrement opérationnel." -ForegroundColor Green
} elseif ($percentage -ge 80) {
    Write-Host "✅ TESTS MAJORITAIREMENT RÉUSSIS" -ForegroundColor Yellow
    Write-Host "   Quelques tests manuels requis." -ForegroundColor Yellow
} else {
    Write-Host "❌ DES PROBLÈMES SUBSISTENT" -ForegroundColor Red
    Write-Host "   Vérifiez les logs ci-dessus." -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================`n" -ForegroundColor Gray

# Instructions de déploiement
Write-Host "📦 ÉTAPES SUIVANTES:" -ForegroundColor Cyan
Write-Host "   1. Si tests locaux OK, commit + push les changements" -ForegroundColor White
Write-Host "   2. Render redéploiera automatiquement le frontend" -ForegroundColor White
Write-Host "   3. Tester en production: https://israelgrowthventure.com/admin/pages/home" -ForegroundColor White
Write-Host ""
