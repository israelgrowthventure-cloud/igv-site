/**
 * Tests Navigateur Production - Playwright
 * Objectif : Détecter page blanche, erreurs console (notamment "Future is not defined")
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const FRONTEND_URL = 'https://israelgrowthventure.com';

async function runProductionBrowserTests() {
    console.log('='.repeat(80));
    console.log('PRODUCTION BROWSER TESTS - Playwright');
    console.log(`Date UTC: ${new Date().toISOString()}`);
    console.log('='.repeat(80));
    
    const results = {
        timestamp: new Date().toISOString(),
        url: FRONTEND_URL,
        passed: 0,
        failed: 0,
        tests: []
    };
    
    let browser;
    let page;
    
    try {
        // Launch browser
        console.log('\n🚀 Launching browser...');
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });
        page = await context.newPage();
        
        // Capture console errors
        const consoleErrors = [];
        const pageErrors = [];
        
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
                console.log(`❌ Console Error: ${msg.text()}`);
            }
        });
        
        page.on('pageerror', (error) => {
            pageErrors.push(error.message);
            console.log(`❌ Page Error: ${error.message}`);
        });
        
        // Test 1: Load homepage
        console.log(`\n📄 Loading ${FRONTEND_URL}...`);
        const response = await page.goto(FRONTEND_URL, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        
        const status = response.status();
        const statusOk = status === 200;
        console.log(`Status: ${status} ${statusOk ? '✅' : '❌'}`);
        
        // Wait for page to settle
        await page.waitForTimeout(3000);
        
        // Test 2: Check for white page
        const bodyText = await page.evaluate(() => document.body.innerText);
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        const isWhitePage = bodyText.trim().length < 100 || bodyHeight < 100;
        
        console.log(`\n📏 Body height: ${bodyHeight}px`);
        console.log(`📝 Body text length: ${bodyText.length} chars`);
        console.log(`White page: ${isWhitePage ? '❌ YES' : '✅ NO'}`);
        
        // Test 3: Check for "Future is not defined" error
        const hasFutureError = consoleErrors.some(e => e.includes('Future')) || 
                               pageErrors.some(e => e.includes('Future'));
        console.log(`\n🔍 "Future is not defined" error: ${hasFutureError ? '❌ FOUND' : '✅ NOT FOUND'}`);
        
        // Test 4: Check title
        const title = await page.title();
        const hasValidTitle = title && title.length > 0 && !title.includes('Error');
        console.log(`\n📋 Page title: "${title}" ${hasValidTitle ? '✅' : '❌'}`);
        
        // Test 5: Check critical assets loaded
        const scriptTags = await page.evaluate(() => document.scripts.length);
        const linkTags = await page.evaluate(() => document.querySelectorAll('link[rel="stylesheet"]').length);
        console.log(`\n📦 Scripts loaded: ${scriptTags}`);
        console.log(`📦 Stylesheets loaded: ${linkTags}`);
        
        // Summary
        const allTests = [
            { name: 'HTTP 200', passed: statusOk },
            { name: 'Not white page', passed: !isWhitePage },
            { name: 'No Future error', passed: !hasFutureError },
            { name: 'Valid title', passed: hasValidTitle },
            { name: 'Assets loaded', passed: scriptTags > 0 && linkTags > 0 }
        ];
        
        results.tests = allTests;
        results.consoleErrors = consoleErrors;
        results.pageErrors = pageErrors;
        results.status = status;
        results.bodyHeight = bodyHeight;
        results.bodyTextLength = bodyText.length;
        results.title = title;
        results.scriptTags = scriptTags;
        results.linkTags = linkTags;
        
        allTests.forEach(test => {
            if (test.passed) {
                results.passed++;
                console.log(`✅ ${test.name}`);
            } else {
                results.failed++;
                console.log(`❌ ${test.name}`);
            }
        });
        
        // Screenshot
        await page.screenshot({ path: 'scripts/screenshot_prod.png', fullPage: false });
        console.log('\n📸 Screenshot saved to scripts/screenshot_prod.png');
        
    } catch (error) {
        console.error(`\n❌ Fatal error: ${error.message}`);
        results.fatalError = error.message;
        results.failed++;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    // Save results
    writeFileSync(
        'scripts/test_results_browser.json',
        JSON.stringify(results, null, 2),
        'utf-8'
    );
    
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Total: ${results.passed + results.failed}`);
    console.log('\n✓ Results saved to scripts/test_results_browser.json');
    
    process.exit(results.failed === 0 ? 0 : 1);
}

runProductionBrowserTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
