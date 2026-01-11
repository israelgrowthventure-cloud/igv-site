const { chromium } = require('playwright');

(async () => {
  console.log('🎯 FINAL DIAGNOSIS: Find the source of WYSIWYG content...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const allConsole = [];
  
  page.on('console', msg => {
    allConsole.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    allConsole.push(`[PAGE ERROR] ${error.message}`);
  });
  
  try {
    // Login
    console.log('1️⃣  Login...');
    await page.goto('https://israelgrowthventure.com/admin/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'postmaster@israelgrowthventure.Com');
    await page.fill('input[type="password"]', 'Admin@igv2025#');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Go directly to settings
    console.log('2️⃣  Go to Settings...');
    await page.goto('https://israelgrowthventure.com/admin/crm/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check React component tree
    console.log('\n3️⃣  React component analysis...');
    const reactInfo = await page.evaluate(() => {
      // Check if we're in a React app
      const root = document.getElementById('root');
      const rootHTML = root ? root.innerHTML.substring(0, 3000) : '';
      
      // Look for specific patterns
      const patterns = {
        hasAdminCRMComplete: rootHTML.includes('IGV CRM') && rootHTML.includes('Dashboard'),
        hasSettingsTab: rootHTML.includes('Changer le mot de passe') || rootHTML.includes('Utilisateurs CRM'),
        hasWYSIWYG: rootHTML.includes('AJOUTER UN ÉLÉMENT') || rootHTML.includes('Titre') || rootHTML.includes('Mode Aperçu'),
        hasNavTabs: rootHTML.includes('Dashboard') && rootHTML.includes('Leads'),
        hasForm: rootHTML.includes('<form') || rootHTML.includes('type="password"'),
        hasTable: rootHTML.includes('<table') || rootHTML.includes('<thead'),
      };
      
      return {
        rootExists: !!root,
        patterns,
        htmlSample: rootHTML.substring(0, 1500)
      };
    });
    
    console.log(`   AdminCRMComplete patterns: ${reactInfo.patterns.hasAdminCRMComplete ? 'YES' : 'NO'}`);
    console.log(`   SettingsTab patterns: ${reactInfo.patterns.hasSettingsTab ? 'YES' : 'NO'}`);
    console.log(`   WYSIWYG patterns: ${reactInfo.patterns.hasWYSIWYG ? 'YES' : 'NO'}`);
    console.log(`   Navigation tabs: ${reactInfo.patterns.hasNavTabs ? 'YES' : 'NO'}`);
    console.log(`   Forms: ${reactInfo.patterns.hasForm ? 'YES' : 'NO'}`);
    console.log(`   Tables: ${reactInfo.patterns.hasTable ? 'YES' : 'NO'}`);
    
    // Check WHERE the WYSIWYG content is in the HTML
    console.log('\n4️⃣  HTML Structure analysis...');
    const html = await page.content();
    
    // Find WYSIWYG section
    const wysiwygIndex = html.indexOf('AJOUTER UN ÉLÉMENT');
    const settingsTabIndex = html.indexOf('Utilisateurs CRM');
    const dashboardIndex = html.indexOf('IGV CRM');
    
    console.log(`   "AJOUTER UN ÉLÉMENT" position: ${wysiwygIndex > -1 ? wysiwygIndex + ' (found)' : 'not found'}`);
    console.log(`   "Utilisateurs CRM" position: ${settingsTabIndex > -1 ? settingsTabIndex + ' (found)' : 'not found'}`);
    console.log(`   "IGV CRM" position: ${dashboardIndex > -1 ? dashboardIndex + ' (found)' : 'not found'}`);
    
    // Get context around WYSIWYG content
    if (wysiwygIndex > -1) {
      const start = Math.max(0, wysiwygIndex - 200);
      const end = Math.min(html.length, wysiwygIndex + 800);
      console.log('\n5️⃣  Context around WYSIWYG content:');
      console.log('─'.repeat(60));
      console.log(html.substring(start, end));
      console.log('─'.repeat(60));
    }
    
    // Check console for React errors
    console.log('\n6️⃣  Console output:');
    const reactErrors = allConsole.filter(c => 
      c.includes('Error') || c.includes('undefined') || c.includes('Cannot') || c.includes('React')
    );
    if (reactErrors.length === 0) {
      console.log('   No React errors detected');
    } else {
      reactErrors.forEach(e => console.log(`   ${e}`));
    }
    
    // Final diagnosis
    console.log('\n═══════════════════════════════════════════');
    console.log('           FINAL DIAGNOSIS');
    console.log('═══════════════════════════════════════════');
    
    if (reactInfo.patterns.hasWYSIWYG && !reactInfo.patterns.hasSettingsTab) {
      console.log('❌ CONFIRMED: Wrong content is rendering!');
      console.log('   ');
      console.log('   The page shows WYSIWYG editor instead of Settings.');
      console.log('   This means either:');
      console.log('   1. AdminCRMComplete is not the active component');
      console.log('   2. SettingsTab has a rendering error');
      console.log('   3. Route is pointing to wrong component');
      console.log('   ');
      console.log('   CHECK: App.js route configuration');
    }
    
    if (!reactInfo.patterns.hasSettingsTab && reactInfo.patterns.hasAdminCRMComplete) {
      console.log('   ');
      console.log('   LIKELY CAUSE:');
      console.log('   - user?.role === "admin" condition fails');
      console.log('   - User object is missing from state');
      console.log('   - SettingsTab is conditionally NOT rendered');
    }
    
    console.log('═══════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
