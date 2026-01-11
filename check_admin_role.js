const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Vérification du rôle admin affiché...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login
    console.log('1️⃣  Connexion...');
    await page.goto('https://israelgrowthventure.com/admin/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'postmaster@israelgrowthventure.Com');
    await page.fill('input[type="password"]', 'Admin@igv2025#');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Go to Settings
    console.log('2️⃣  Navigation vers Settings...');
    await page.goto('https://israelgrowthventure.com/admin/crm/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Check what text is displayed in the header
    console.log('\n3️⃣  Analyse de l\'affichage du header:\n');
    
    const headerInfo = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      
      // Look for role-related text
      const hasAdmin = bodyText.includes('Admin') || bodyText.includes('Administrateur');
      const hasCommercial = bodyText.includes('Commercial');
      const hasSales = bodyText.includes('Sales');
      
      // Find text near the user info
      const lines = bodyText.split('\n').filter(l => l.trim());
      
      return {
        hasAdmin,
        hasCommercial,
        hasSales,
        allLines: lines.slice(0, 20) // First 20 lines
      };
    });
    
    console.log('Rôle "Admin" trouvé:', headerInfo.hasAdmin ? '✅ OUI' : '❌ NON');
    console.log('Rôle "Commercial" trouvé:', headerInfo.hasCommercial ? '❌ OUI (problème!)' : '✅ NON');
    console.log('Rôle "Sales" trouvé:', headerInfo.hasSales ? '❌ OUI (problème!)' : '✅ NON');
    
    console.log('\n📋 Premières lignes affichées:');
    console.log('-'.repeat(50));
    headerInfo.allLines.forEach((line, i) => {
      if (line.toLowerCase().includes('admin') || line.toLowerCase().includes('commercial') || line.toLowerCase().includes('sales')) {
        console.log(`   ${line}`);
      }
    });
    console.log('-'.repeat(50));
    
    // Check actual user role from API
    console.log('\n4️⃣  Vérification API verify-token:');
    const userInfo = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/admin/verify', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
        });
        const data = await response.json();
        return data;
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('   Réponse API:', JSON.stringify(userInfo, null, 2));
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('           RÉSULTAT');
    console.log('='.repeat(60));
    
    if (headerInfo.hasAdmin && !headerInfo.hasCommercial) {
      console.log('\n✅ Le rôle s\'affiche correctement comme "Admin"');
    } else if (headerInfo.hasCommercial) {
      console.log('\n❌ PROBLÈME: Le rôle affiche "Commercial" au lieu de "Admin"');
      console.log('   Cela vient probablement de la réponse de l\'API verify-token');
    } else {
      console.log('\n⚠️  Rôle non identifiable dans l\'affichage');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await browser.close();
  }
})();
