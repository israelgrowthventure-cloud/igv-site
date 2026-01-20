const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Deep diagnostic: Why SettingsTab is not rendering...\n');
  
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
    await page.fill('input[type="email"]', 'postmaster@israelgrowthventure.Com');
    await page.fill('input[type="password"]', 'Admin@igv2025#');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log(`   Logged in: ${page.url()}`);
    
    // Check user object in localStorage
    console.log('\n2️⃣  Checking authentication...');
    const userData = await page.evaluate(() => {
      const token = localStorage.getItem('admin_token');
      // Try to find user data in various storage locations
      let user = null;
      try {
        const userStr = localStorage.getItem('admin_user');
        if (userStr) user = JSON.parse(userStr);
      } catch(e) {}
      return { token: token ? 'EXISTS' : 'MISSING', user };
    });
    console.log(`   Token: ${userData.token}`);
    console.log(`   User object: ${userData.user ? JSON.stringify(userData.user) : 'NOT FOUND'}`);
    
    // Navigate to Settings
    console.log('\n3️⃣  Navigating to Settings...');
    await page.goto('https://israelgrowthventure.com/admin/crm/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    console.log(`   URL: ${page.url()}`);
    
    // Check what's actually rendered
    console.log('\n4️⃣  Analyzing rendered components...');
    
    // Check for IGV CRM text (from AdminCRMComplete header)
    const hasIGVCRM = await page.locator('text=IGV CRM').count();
    console.log(`   IGV CRM header: ${hasIGVCRM > 0 ? 'FOUND ✓' : 'NOT FOUND ✗'}`);
    
    // Check for navigation tabs (from AdminCRMComplete)
    const tabs = ['Dashboard', 'Leads', 'Contacts', 'Pipeline', 'Emails', 'Activities', 'Users', 'Settings'];
    for (const tab of tabs) {
      const count = await page.locator(`text=${tab}`).count();
      if (tab === 'Settings') {
        console.log(`   "${tab}" tab: ${count > 0 ? 'FOUND ✓' : 'NOT FOUND ✗'}`);
      } else {
        console.log(`   "${tab}" tab: ${count > 0 ? 'FOUND' : 'not found'}`);
      }
    }
    
    // Check for specific Settings content
    console.log('\n5️⃣  Checking Settings-specific content...');
    const settingsContent = await page.evaluate(() => {
      const results = {};
      
      // Check for SettingsTab specific elements
      results.profileTab = document.body.innerText.includes('Changer le mot de passe') || document.body.innerText.includes('Profil');
      results.usersSection = document.body.innerText.includes('Utilisateurs CRM') || document.body.innerText.includes('Ajouter un utilisateur');
      results.tagsSection = document.body.innerText.includes('Tags disponibles') || document.body.innerText.includes('Ajouter un tag');
      results.stagesSection = document.body.innerText.includes('Étapes du pipeline') || document.body.innerText.includes('Aucune étape');
      results.userTable = document.body.innerText.includes('Nom') && document.body.innerText.includes('Email');
      results.tagList = document.body.innerText.includes('px') && document.body.innerText.includes('py') && document.body.innerText.includes('rounded-full');
      
      // Check for WYSIWYG (wrong content)
      results.wysiwyg = document.body.innerText.includes('Éditeur WYSIWYG') || document.body.innerText.includes('AJOUTER UN ÉLÉMENT');
      
      return results;
    });
    
    console.log(`   Profile tab: ${settingsContent.profileTab ? 'FOUND ✓' : 'NOT FOUND ✗'}`);
    console.log(`   Users section: ${settingsContent.usersSection ? 'FOUND ✓' : 'NOT FOUND ✗'}`);
    console.log(`   Tags section: ${settingsContent.tagsSection ? 'FOUND ✓' : 'NOT FOUND ✗'}`);
    console.log(`   Stages section: ${settingsContent.stagesSection ? 'FOUND ✓' : 'NOT FOUND ✗'}`);
    console.log(`   User table: ${settingsContent.userTable ? 'FOUND ✓' : 'NOT FOUND ✗'}`);
    console.log(`   WYSIWYG editor (WRONG!): ${settingsContent.wysiwyg ? 'FOUND ✗' : 'Not found ✓'}`);
    
    // Check console errors
    console.log('\n6️⃣  Console errors:');
    if (consoleErrors.length === 0) {
      console.log('   No console errors detected');
    } else {
      consoleErrors.forEach(err => console.log(`   - ${err}`));
    }
    
    // Get actual page text for comparison
    console.log('\n7️⃣  Actual page text (last 800 chars):');
    console.log('─'.repeat(60));
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log(bodyText.substring(bodyText.length - 800));
    console.log('─'.repeat(60));
    
    // Final diagnosis
    console.log('\n═══════════════════════════════════════════');
    console.log('           DIAGNOSIS');
    console.log('═══════════════════════════════════════════');
    
    if (settingsContent.wysiwyg) {
      console.log('❌ PROBLEM IDENTIFIED:');
      console.log('   The page is rendering WYSIWYG editor content');
      console.log('   instead of SettingsTab component!');
      console.log('   ');
      console.log('   This means:');
      console.log('   1. AdminCRMComplete IS loading');
      console.log('   2. But SettingsTab is NOT rendering');
      console.log('   3. Some other component is rendering instead');
    }
    
    if (!settingsContent.usersSection && !settingsContent.tagsSection && !settingsContent.stagesSection) {
      console.log('   ');
      console.log('   Possible causes:');
      console.log('   - activeTab state !== "settings"');
      console.log('   - user?.role !== "admin" condition fails');
      console.log('   - JavaScript error in SettingsTab');
      console.log('   - Wrong component imported');
    }
    
    console.log('═══════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
