#!/bin/bash
# Script d'exécution des tests production (HTTP + Browser)
# Exit code non-zero si un test échoue

set -e  # Exit on error

echo "========================================"
echo "PRODUCTION TESTS RUNNER"
echo "Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo "========================================"

# Test 1: HTTP Tests
echo ""
echo ">>> Running HTTP Tests..."
python scripts/test_production_http.py
HTTP_EXIT=$?

# Test 2: Browser Tests (Playwright)
echo ""
echo ">>> Running Browser Tests (Playwright)..."
node scripts/test_production_browser_playwright.mjs
BROWSER_EXIT=$?

# Summary
echo ""
echo "========================================"
echo "FINAL SUMMARY"
echo "========================================"
echo "HTTP Tests: $([[ $HTTP_EXIT -eq 0 ]] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Browser Tests: $([[ $BROWSER_EXIT -eq 0 ]] && echo "✅ PASS" || echo "❌ FAIL")"

if [[ $HTTP_EXIT -eq 0 && $BROWSER_EXIT -eq 0 ]]; then
    echo ""
    echo "🎉 ALL TESTS PASSED"
    exit 0
else
    echo ""
    echo "❌ SOME TESTS FAILED"
    exit 1
fi
