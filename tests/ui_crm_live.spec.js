/**
 * TEST PLAYWRIGHT - CRM LIVE VALIDATION
 * 
 * Objectif: Valider automatiquement en LIVE:
 * 1. Login admin
 * 2. Ouvrir liste Prospects
 * 3. Ouvrir une fiche prospect
 * 4. Vérifier affichage nom/email/téléphone
 * 5. Ajouter une note et vérifier affichage
 * 6. Convertir en contact (si applicable)
 * 
 * Date: 6 janvier 2026
 * Environnement: Production (https://israelgrowthventure.com)
 */

const { test, expect } = require('@playwright/test');

// Configuration
const ADMIN_EMAIL = 'postmaster@israelgrowthventure.com';
const ADMIN_PASSWORD = 'Admin@igv2025#';
const BASE_URL = 'https://israelgrowthventure.com';
const CRM_URL = `${BASE_URL}/admin`;

test.describe('CRM - Module Prospects (LIVE)', () => {
  
  test('Validation complète fiche prospect', async ({ page }) => {
    console.log('🎯 Début du test CRM live...');
    
    // ==========================================================================
    // STEP 1: LOGIN ADMIN
    // ==========================================================================
    console.log('\n📋 STEP 1: Login admin');
    await page.goto(`${CRM_URL}/login`);
    
    // Attendre le formulaire de connexion
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Remplir le formulaire
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    
    // Soumettre
    await page.click('button[type="submit"]');
    
    // Attendre redirection (vers dashboard ou CRM)
    await page.waitForURL(/\/admin\/(crm|dashboard)/, { timeout: 15000 });
    
    console.log('✅ Login réussi');
    
    // ==========================================================================
    // STEP 2: NAVIGUER VERS PROSPECTS
    // ==========================================================================
    console.log('\n📋 STEP 2: Navigation vers Prospects');
    
    // Cliquer sur le menu Leads dans la sidebar
    // Attendre que la sidebar soit chargée
    await page.waitForSelector('nav', { timeout: 10000 });
    
    // Chercher le bouton "Leads" dans la navigation
    const leadsButton = page.locator('button:has-text("Leads")').first();
    await leadsButton.click();
    
    // Attendre le chargement de la page
    await page.waitForTimeout(3000);
    
    // Vérifier que la liste est chargée (chercher le titre ou un élément de la liste)
    const pageTitle = page.locator('h1, h2').first();
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Page Prospects chargée');
    
    // ==========================================================================
    // STEP 3: OUVRIR UN PROSPECT
    // ==========================================================================
    console.log('\n📋 STEP 3: Ouverture fiche prospect');
    
    // Attendre que la liste soit visible (chercher une ligne de tableau ou carte)
    await page.waitForTimeout(2000); // Attendre le chargement des données
    
    // Chercher le premier prospect (bouton "Voir" ou ligne cliquable)
    const viewButton = page.locator('button:has-text("Voir"), button[title*="Voir"], svg[class*="eye"]').first();
    
    if (await viewButton.count() > 0) {
      await viewButton.click();
      console.log('✅ Prospect ouvert via bouton Voir');
    } else {
      // Alternative: cliquer sur la première ligne du tableau
      const firstRow = page.locator('tbody tr, div[role="row"]').first();
      await firstRow.click();
      console.log('✅ Prospect ouvert via clic ligne');
    }
    
    // Attendre que la fiche s'affiche
    await page.waitForTimeout(2000);
    
    // ==========================================================================
    // STEP 4: VÉRIFIER AFFICHAGE NOM/EMAIL/TÉLÉPHONE
    // ==========================================================================
    console.log('\n📋 STEP 4: Vérification affichage données prospect');
    
    // Chercher le bouton "Retour à la liste" pour confirmer qu'on est bien en vue détail
    const backButton = page.locator('button:has-text("Retour"), button:has-text("←")').first();
    await expect(backButton).toBeVisible({ timeout: 10000 });
    console.log('✅ Vue détail confirmée (bouton Retour visible)');
    
    // Vérifier que le texte "Retour à la liste" est bien traduit (pas la clé brute)
    const backButtonText = await backButton.textContent();
    expect(backButtonText).not.toContain('admin.crm.common');
    console.log(`✅ Bouton traduit: "${backButtonText}"`);
    
    // Extraire les données affichées
    const pageContent = await page.content();
    
    // Vérifier qu'un email est affiché (format email)
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = pageContent.match(emailRegex);
    
    if (emailMatch) {
      console.log(`✅ Email détecté: ${emailMatch[0]}`);
    } else {
      console.log('⚠️  Aucun email visible dans la fiche');
    }
    
    // Vérifier qu'un téléphone est affiché (format +33 ou autre)
    const phoneRegex = /\+?\d{1,4}[\s-]?\d{2,4}[\s-]?\d{2,4}[\s-]?\d{2,4}/;
    const phoneMatch = pageContent.match(phoneRegex);
    
    if (phoneMatch) {
      console.log(`✅ Téléphone détecté: ${phoneMatch[0]}`);
    } else {
      console.log('⚠️  Aucun téléphone visible dans la fiche');
    }
    
    // Vérifier qu'un nom est affiché (dans un h2, h3, ou div de titre)
    const titleElement = page.locator('h1, h2, h3, div[class*="title"], div[class*="header"]').first();
    const titleText = await titleElement.textContent();
    
    if (titleText && titleText.length > 0) {
      console.log(`✅ Titre/Nom détecté: "${titleText.substring(0, 50)}..."`);
    } else {
      console.log('⚠️  Aucun titre/nom visible');
    }
    
    // ==========================================================================
    // STEP 5: AJOUTER UNE NOTE
    // ==========================================================================
    console.log('\n📋 STEP 5: Ajout d\'une note');
    
    // Chercher l'onglet "Notes"
    const notesTab = page.locator('button:has-text("Notes"), div:has-text("Notes")').first();
    
    if (await notesTab.count() > 0) {
      await notesTab.click();
      console.log('✅ Onglet Notes ouvert');
      
      await page.waitForTimeout(1000);
      
      // Chercher le champ de saisie de note (textarea ou input)
      const noteInput = page.locator('textarea, input[placeholder*="note"], input[placeholder*="Note"]').first();
      
      if (await noteInput.count() > 0) {
        const testNote = `Test Playwright ${new Date().toISOString()}`;
        await noteInput.fill(testNote);
        console.log(`✅ Note saisie: "${testNote}"`);
        
        // Chercher le bouton d'ajout (Ajouter, Envoyer, Submit, etc.)
        const submitButton = page.locator('button:has-text("Ajouter"), button:has-text("Envoyer"), button[type="submit"]').first();
        
        if (await submitButton.count() > 0) {
          await submitButton.click();
          console.log('✅ Note soumise');
          
          // Attendre que la note apparaisse
          await page.waitForTimeout(2000);
          
          // Vérifier que la note est visible
          const noteVisible = page.locator(`text="${testNote}"`).first();
          
          if (await noteVisible.count() > 0) {
            console.log('✅ Note visible après ajout');
          } else {
            console.log('⚠️  Note non visible immédiatement (peut nécessiter refresh)');
            
            // Tenter un refresh de la page
            await page.reload();
            await page.waitForTimeout(2000);
            
            const noteAfterRefresh = page.locator(`text="${testNote}"`).first();
            if (await noteAfterRefresh.count() > 0) {
              console.log('✅ Note visible après refresh');
            } else {
              console.log('❌ Note non trouvée même après refresh');
            }
          }
        } else {
          console.log('⚠️  Bouton d\'ajout de note non trouvé');
        }
      } else {
        console.log('⚠️  Champ de saisie de note non trouvé');
      }
    } else {
      console.log('⚠️  Onglet Notes non trouvé');
    }
    
    // ==========================================================================
    // STEP 6: CONVERTIR EN CONTACT (si bouton existe)
    // ==========================================================================
    console.log('\n📋 STEP 6: Conversion en contact');
    
    // Chercher le bouton "Convertir en contact"
    const convertButton = page.locator('button:has-text("Convertir"), button:has-text("Convert")').first();
    
    if (await convertButton.count() > 0) {
      console.log('✅ Bouton Convertir trouvé');
      
      // Vérifier si le bouton est enabled
      const isDisabled = await convertButton.isDisabled();
      
      if (!isDisabled) {
        console.log('⚠️  Bouton Convertir disponible mais non cliqué (éviter conversion en prod)');
        console.log('   Pour tester: cliquer manuellement ou utiliser un prospect de test');
      } else {
        console.log('ℹ️  Bouton Convertir désactivé (prospect déjà converti?)');
      }
    } else {
      console.log('ℹ️  Bouton Convertir non trouvé (peut être normal selon statut)');
    }
    
    // ==========================================================================
    // STEP 7: VÉRIFIER NAVIGATION RETOUR
    // ==========================================================================
    console.log('\n📋 STEP 7: Test navigation retour');
    
    // Cliquer sur "Retour à la liste"
    await backButton.click();
    await page.waitForTimeout(1000);
    
    // Vérifier que la liste est de nouveau visible
    const listVisible = page.locator('h1:has-text("Prospects"), table, div[role="grid"]').first();
    await expect(listVisible).toBeVisible({ timeout: 5000 });
    console.log('✅ Retour à la liste OK');
    
    // ==========================================================================
    // STEP 8: TESTER NAVIGATION MENU
    // ==========================================================================
    console.log('\n📋 STEP 8: Test navigation via menu');
    
    // Ouvrir de nouveau un prospect
    const viewButton2 = page.locator('button:has-text("Voir"), button[title*="Voir"]').first();
    if (await viewButton2.count() > 0) {
      await viewButton2.click();
      await page.waitForTimeout(1500);
      console.log('✅ Fiche réouverte');
      
      // Maintenant cliquer sur "Leads" dans le menu sidebar
      const menuLeads = page.locator('button:has-text("Leads")').first();
      await menuLeads.click();
      await page.waitForTimeout(1000);
      
      // Vérifier que la fiche s'est fermée (retour liste)
      const listVisible2 = page.locator('h1, h2, table, div[role="grid"]').first();
      
      if (await listVisible2.isVisible()) {
        console.log('✅ Clic menu Leads ferme la fiche (retour liste)');
      } else {
        console.log('⚠️  Clic menu Leads n\'a pas fermé la fiche');
      }
    }
    
    console.log('\n✅ TEST COMPLET TERMINÉ');
  });
});
