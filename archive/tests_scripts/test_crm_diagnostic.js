const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting detailed CRM diagnostic...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const consoleErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`ERROR: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(`PAGE ERROR: ${error.message}`);
  });
  
  try {
    // Login
    console.log('1️⃣  Logging in...');
    await page.goto('https://israelgrowthventure.com/admin/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"]', 'postmaster@israelgrowthventure.Com');
    await page.fill('input[type="password"], input[name="password"]', 'Admin@igv2025#');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log(`   URL: ${page.url()}`);
    
    // Navigate to Settings
    console.log('\n2️⃣  Going to Settings...');
    await page.goto('https://israelgrowthventure.com/admin/crm/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    console.log(`   URL: ${page.url()}`);
    
    // Get full page content
    const fullHTML = await page.content();
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    console.log('\n3️⃣  Page Content Analysis:');
    console.log('─'.repeat(60));
    console.log(bodyText.substring(0, 2000));
    console.log('─'.repeat(60));
    
    // Check specific UI elements
    console.log('\n4️⃣  UI Elements Check:');
    
    // Check for React root
    const reactRoot = await page.$('#root, [id=root]');
    console.log(`   React root exists: ${reactRoot ? 'YES' : 'NO'}`);
    
    // Check for admin CRM container
    const adminContainer = await page.$('[class*="admin"], [class*="crm"]');
    console.log(`   Admin/CRM container: ${adminContainer ? 'YES' : 'NO'}`);
    
    // List all headings
    const h1s = await page.$$('h1');
    const h2s = await page.$$('h2');
    const h3s = await page.$$('h3');
    console.log(`   H1 tags: ${h1s.length}`);
    console.log(`   H2 tags: ${h2s.length}`);
    console.log(`   H3 tags: ${h3s.length}`);
    
    // Print all headings text
    const h2Text = await page.$$eval('h2', els => els.map(e => e.innerText));
    const h3Text = await page.$$eval('h3', els => els.map(e => e.innerText));
    console.log(`   H2 content: ${JSON.stringify(h2Text)}`);
    console.log(`   H3 content: ${JSON.stringify(h3Text)}`);
    
    // Check for table rows
    const trs = await page.$$('tr');
    console.log(`   Table rows: ${trs.length}`);
    
    // Check for cards/sections
    const cards = await page.$$('.card, [class*="card"]');
    console.log(`   Card elements: ${cards.length}`);
    
    // Check navigation
    const navButtons = await page.$$('nav button, [role="tab"]');
    console.log(`   Navigation tabs: ${navButtons.length}`);
    
    // Console errors
    console.log('\n5️⃣  Console Errors:');
    if (consoleErrors.length === 0) {
      console.log('   No errors detected');
    } else {
      consoleErrors.forEach(err => console.log(`   - ${err}`));
    }
    
    // Check API endpoints
    console.log('\n6️⃣  API Calls Analysis:');
    const apiCalls = await page.evaluate(() => {
      return window.performance.getEntriesByType('resource')
        .filter(r => r.name.includes('api') && (r.name.includes('users') || r.name.includes('settings') || r.name.includes('tags')))
        .map(r => ({
          url: r.name.split('?')[0],
          status: Math.round(r.responseStatus || 0),
          duration: Math.round(r.duration),
          transferSize: Math.round(r.transferSize)
        }));
    });
    
    if (apiCalls.length === 0) {
      console.log('   No relevant API calls found');
    } else {
      apiCalls.forEach(call => {
        console.log(`   - ${call.url}`);
        console.log(`     Status: ${call.status}, Time: ${call.duration}ms, Size: ${call.transferSize}b`);
      });
    }
    
    // Summary
    console.log('\n═══════════════════════════════════════════');
    console.log('           SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log(`Settings URL: ${page.url()}`);
    console.log(`Text content: ${bodyText.length} chars`);
    console.log(`Tables: 0, Forms: 0, Rows: ${trs.length}`);
    console.log(`Headings: H2=${h2s.length}, H3=${h3s.length}`);
    console.log(`Console errors: ${consoleErrors.length}`);
    console.log(`API calls: ${apiCalls.length}`);
    console.log('═══════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
