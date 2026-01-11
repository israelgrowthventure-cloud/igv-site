const { chromium } = require('playwright');

(async () => {
  console.log('🧪 TEST COMPLET - CRM Phase 1 Fixes Verification\n');
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const testResults = {
    login: { passed: false, details: '' },
    userObject: { passed: false, details: '' },
    settingsTab: { passed: false, details: '' },
    settingsUsers: { passed: false, details: '' },
    settingsTags: { passed: false, details: '' },
    settingsStages: { passed: false, details: '' },
    usersTab: { passed: false, details: '' },
    contactsNotes: { passed: false, details: '' },
    leadsConversion: { passed: false, details: '' },
    navigation: { passed: false, details: '' }
  };
  
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[CONSOLE] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`[PAGE ERROR] ${error.message}`);
  });
  
  try {
    // TEST 1: Login
    console.log('\n📋 TEST 1: Authentication');
    console.log('-'.repeat(40));
    
    await page.goto('https://israelgrowthventure.com/admin/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'postmaster@israelgrowthventure.Com');
    await page.fill('input[type="password"]', 'Admin@igv2025#');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const loginUrl = page.url();
    if (loginUrl.includes('/admin/crm')) {
      testResults.login.passed = true;
      testResults.login.details = '✅ Login successful, redirected to CRM';
      console.log('   ✅ Login successful');
    } else {
      testResults.login.details = `❌ Login failed, URL: ${loginUrl}`;
      console.log(`   ❌ Login failed: ${loginUrl}`);
    }
    
    // TEST 2: User Object Verification
    console.log('\n📋 TEST 2: User Object Verification');
    console.log('-'.repeat(40));
    
    const userData = await page.evaluate(() => {
      // Check localStorage for user data
      let user = null;
      try {
        // Check various storage locations
        const adminUser = localStorage.getItem('admin_user');
        if (adminUser) user = JSON.parse(adminUser);
      } catch (e) {}
      
      // Also check if the page has user info displayed
      const headerText = document.body.innerText;
      const hasAdminRole = headerText.includes('Admin') || headerText.includes('Administrator');
      
      return { userExists: !!user, hasAdminRole };
    });
    
    if (userData.userExists || userData.hasAdminRole) {
      testResults.userObject.passed = true;
      testResults.userObject.details = '✅ User object exists with admin role';
      console.log('   ✅ User object found');
    } else {
      testResults.userObject.details = '❌ User object not found';
      console.log('   ❌ User object not found');
    }
    
    // TEST 3: Settings Tab
    console.log('\n📋 TEST 3: Settings Tab Access');
    console.log('-'.repeat(40));
    
    await page.goto('https://israelgrowthventure.com/admin/crm/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const settingsPage = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        url: window.location.href,
        hasUtilisateurs: text.includes('Utilisateurs') || text.includes('Users'),
        hasTags: text.includes('Tags') || text.includes('Étapes'),
        hasParametres: text.includes('Paramètres') || text.includes('Profil'),
        hasChangerMotDePasse: text.includes('Changer le mot de passe'),
        hasTable: text.includes('<table') || text.includes('Nom') && text.includes('Email'),
        isEmpty: text.length < 500
      };
    });
    
    if (settingsPage.hasUtilisateurs && !settingsPage.isEmpty) {
      testResults.settingsTab.passed = true;
      testResults.settingsTab.details = '✅ Settings page loads with content';
      console.log('   ✅ Settings page has content');
    } else {
      testResults.settingsTab.details = '❌ Settings page is empty or missing content';
      console.log('   ❌ Settings page issue detected');
    }
    
    if (settingsPage.hasChangerMotDePasse) {
      testResults.settingsUsers.passed = true;
      testResults.settingsUsers.details = '✅ Profile section visible';
      console.log('   ✅ Profile section visible');
    }
    
    // TEST 4: Users Tab
    console.log('\n📋 TEST 4: Users Tab');
    console.log('-'.repeat(40));
    
    await page.goto('https://israelgrowthventure.com/admin/crm/users', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const usersPage = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasHeader: text.includes('Utilisateurs') || text.includes('Users'),
        hasAddButton: text.includes('Nouvel utilisateur') || text.includes('Ajouter'),
        hasTable: text.includes('Email') && text.includes('Rôle'),
        isEmpty: text.length < 400
      };
    });
    
    if (usersPage.hasHeader && usersPage.hasTable) {
      testResults.usersTab.passed = true;
      testResults.usersTab.details = '✅ Users tab loads correctly';
      console.log('   ✅ Users tab renders correctly');
    } else {
      testResults.usersTab.details = '❌ Users tab not rendering properly';
      console.log('   ❌ Users tab issue');
    }
    
    // TEST 5: Navigation Test
    console.log('\n📋 TEST 5: Navigation Links');
    console.log('-'.repeat(40));
    
    const navPages = [
      { path: '/admin/crm/dashboard', name: 'Dashboard' },
      { path: '/admin/crm/leads', name: 'Leads' },
      { path: '/admin/crm/contacts', name: 'Contacts' },
      { path: '/admin/crm/pipeline', name: 'Pipeline' },
      { path: '/admin/crm/settings', name: 'Settings' }
    ];
    
    let navSuccess = 0;
    for (const nav of navPages) {
      await page.goto(`https://israelgrowthventure.com${nav.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      if (page.url().includes(nav.path)) {
        navSuccess++;
        console.log(`   ✅ ${nav.name} navigates correctly`);
      } else {
        console.log(`   ❌ ${nav.name} navigation failed`);
      }
    }
    
    if (navSuccess === navPages.length) {
      testResults.navigation.passed = true;
      testResults.navigation.details = `✅ All ${navSuccess} navigation links work`;
    }
    
    // TEST 6: Check for Console Errors
    console.log('\n📋 TEST 6: Console Errors');
    console.log('-'.repeat(40));
    
    if (errors.length === 0) {
      console.log('   ✅ No console errors detected');
    } else {
      console.log(`   ❌ ${errors.length} console errors found:`);
      errors.slice(0, 5).forEach(e => console.log(`      - ${e.substring(0, 100)}`));
    }
    
    // SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('           RÉSUMÉ DES TESTS');
    console.log('='.repeat(60));
    
    const totalTests = Object.keys(testResults).length;
    const passedTests = Object.values(testResults).filter(t => t.passed).length;
    
    console.log(`\nTests Passed: ${passedTests}/${totalTests}`);
    console.log('');
    
    for (const [test, result] of Object.entries(testResults)) {
      const status = result.passed ? '✅' : '❌';
      const testName = test.replace(/([A-Z])/g, ' $1').trim();
      console.log(`${status} ${testName}`);
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (passedTests === totalTests) {
      console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
      console.log('Les corrections Phase 1 fonctionnent correctement.');
      console.log('\n📦 Vous pouvez maintenant déployer avec le hash actuel.');
    } else {
      console.log('\n⚠️  Certains tests ont échoué.');
      console.log('Vérifiez les détails ci-dessus pour les corrections nécessaires.');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Test execution error:', error.message);
  } finally {
    await browser.close();
  }
})();
