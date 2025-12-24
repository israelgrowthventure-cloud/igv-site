# Quick Validation for Israel Growth Venture
# Tests critical functionality before deployment

$SITE_URL = if ($env:SITE_URL) { $env:SITE_URL } else { "https://israelgrowthventure.com" }
$BACKEND_URL = if ($env:BACKEND_URL) { $env:BACKEND_URL } else { "https://igv-cms-backend.onrender.com" }

Write-Host "`n=== Israel Growth Venture - Quick Validation ===`n" -ForegroundColor Blue

$tests = @(
    @{ url = "$SITE_URL/"; name = "Homepage" },
    @{ url = "$SITE_URL/about"; name = "About Page" },
    @{ url = "$SITE_URL/mini-analyse"; name = "Mini-Analysis Page" },
    @{ url = "$SITE_URL/contact"; name = "Contact Page" },
    @{ url = "$SITE_URL/appointment"; name = "Appointment Page" },
    @{ url = "$SITE_URL/robots.txt"; name = "robots.txt" },
    @{ url = "$SITE_URL/sitemap.xml"; name = "sitemap.xml" },
    @{ url = "$SITE_URL/llms.txt"; name = "llms.txt" },
    @{ url = "$BACKEND_URL/health"; name = "Backend Health" },
    @{ url = "$BACKEND_URL/"; name = "Backend Root" }
)

$passed = 0
$failed = 0

foreach ($test in $tests) {
    try {
        $response = Invoke-WebRequest -Uri $test.url -Method Get -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ $($test.name): $($test.url)" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "✗ $($test.name): $($test.url) (Status: $($response.StatusCode))" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "✗ $($test.name): $($test.url) (Error: $($_.Exception.Message))" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n=== Test Results ===" -ForegroundColor Blue
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($failed -eq 0) {
    Write-Host "`n✓ All tests passed! Site is ready for production." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n✗ Some tests failed. Please review before deploying." -ForegroundColor Yellow
    exit 1
}
