/**
 * TEST PLAYWRIGHT - CRM LIVE VALIDATION (ENHANCED)
 * 
 * Version 2.0 - Détection précise des erreurs
 * 
 * Objectif: Valider automatiquement en LIVE avec capture réseau:
 * 1. Login admin
 * 2. Ouvrir liste Prospects
 * 3. Ouvrir une fiche prospect
 * 4. Vérifier affichage nom/email/téléphone + traductions
 * 5. Ajouter une note et vérifier PERSISTENCE après reload
 * 6. Tester conversion avec capture erreur API
 * 7. Tester navigation sidebar avec vérification URL
 * 
 * Date: 6 janvier 2026
 * Environnement: Production (https://israelgrowthventure.com)
 */

const { test, expect } = require('@playwright/test');

// Stockage des erreurs détectées
let detectedErrors = [];
let networkLogs = [];

// Configuration
const ADMIN_EMAIL = 'postmaster@israelgrowthventure.com';
const ADMIN_PASSWORD = 'Admin@igv2025#';
const BASE_URL = 'https://israelgrowthventure.com';
const CRM_URL = `${BASE_URL}/admin`;

test.describe('CRM - Module Prospects (LIVE)', () => {
  
  test('Validation complète fiche prospect - ENHANCED', async ({ page }) => {
    console.log('🎯 Début du test CRM live (version 2.0 - détection erreurs)...');
    
    // Capture des erreurs console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const error = `CONSOLE ERROR: ${msg.text()}`;
        console.log(`❌ ${error}`);
        detectedErrors.push(error);
      }
    });
    
    // Capture des erreurs réseau
    page.on('response', response => {
      if (response.status() >= 400) {
        const log = `NETWORK ERROR: ${response.status()} ${response.request().method()} ${response.url()}`;
        console.log(`❌ ${log}`);
        networkLogs.push(log);
        detectedErrors.push(log);
      }
    });
    
    // Capture des requêtes API
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`📡 API Call: ${request.method()} ${request.url()}`);
      }
    });
    
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
    
    // Attendre que la sidebar soit chargée
    await page.waitForSelector('nav', { timeout: 10000 });
    
    // Chercher le bouton "Leads" dans la navigation
    const leadsButton = page.locator('button:has-text("Leads")').first();
    
    // Vérifier que le bouton existe
    await expect(leadsButton).toBeVisible({ timeout: 5000 });
    
    // Cliquer sur le bouton
    await leadsButton.click();
    console.log('✅ Clic sur bouton Leads effectué');
    
    // CRITIQUE: Attendre que l'URL change vers /admin/crm/leads
    await page.waitForURL('**/admin/crm/leads', { timeout: 10000 });
    console.log('✅ URL changée vers /admin/crm/leads');
    
    // Attendre que le contenu se charge
    await page.waitForTimeout(2000);
    
    // Vérifier que le titre de la page est présent
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
    // STEP 4: VÉRIFIER AFFICHAGE NOM/EMAIL/TÉLÉPHONE + TRADUCTIONS
    // ==========================================================================
    console.log('\n📋 STEP 4: Vérification affichage données prospect');
    
    // Chercher le bouton "Retour à la liste" pour confirmer qu'on est bien en vue détail
    const backButton = page.locator('button:has-text("Retour"), button:has-text("←")').first();
    await expect(backButton).toBeVisible({ timeout: 10000 });
    console.log('✅ Vue détail confirmée (bouton Retour visible)');
    
    // CRITIQUE: Vérifier que le texte "Retour à la liste" est bien traduit (pas la clé brute)
    const backButtonText = await backButton.textContent();
    
    // Détection stricte des clés de traduction non résolues
    if (backButtonText.includes('admin.crm') || backButtonText.includes('common.back_to_list')) {
      const error = `TRADUCTION NON RÉSOLUE: "${backButtonText}" contient une clé brute`;
      console.log(`❌ ${error}`);
      detectedErrors.push(error);
    } else {
      console.log(`✅ Bouton traduit correctement: "${backButtonText}"`);
    }
    
    // Vérifier tout le contenu de la page pour d'autres clés non traduites
    const pageContent = await page.content();
    const untranslatedKeys = pageContent.match(/admin\.crm\.[a-zA-Z_.]+/g);
    if (untranslatedKeys && untranslatedKeys.length > 0) {
      const error = `CLÉS NON TRADUITES DÉTECTÉES: ${untranslatedKeys.join(', ')}`;
      console.log(`❌ ${error}`);
      detectedErrors.push(error);
    } else {
      console.log('✅ Aucune clé de traduction brute détectée');
    }
    
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
    // STEP 5: AJOUTER UNE NOTE ET VÉRIFIER PERSISTENCE
    // ==========================================================================
    console.log('\n📋 STEP 5: Ajout d\'une note + test persistence');
    
    // Chercher l'onglet "Notes"
    const notesTab = page.locator('button:has-text("Notes"), div:has-text("Notes"), [role="tab"]:has-text("Notes")').first();
    
    if (await notesTab.count() > 0) {
      await notesTab.click();
      console.log('✅ Onglet Notes ouvert');
      
      await page.waitForTimeout(1000);
      
      // Compter les notes existantes AVANT ajout
      const notesBefore = await page.locator('div[class*="note"], li[class*="note"], p:has-text("Note")').count();
      console.log(`📝 Notes existantes AVANT: ${notesBefore}`);
      
      // Chercher le champ de saisie de note (textarea ou input)
      const noteInput = page.locator('textarea[placeholder*="note"], textarea[placeholder*="Note"], input[placeholder*="note"], input[placeholder*="Note"], textarea').first();
      
      if (await noteInput.count() > 0) {
        const testNote = `TEST PERSISTENCE ${new Date().toISOString()}`;
        await noteInput.fill(testNote);
        console.log(`✅ Note saisie: "${testNote}"`);
        
        // Chercher le bouton d'ajout avec tous les sélecteurs possibles
        const submitSelectors = [
          'button:has-text("Ajouter")',
          'button:has-text("Envoyer")',
          'button:has-text("Submit")',
          'button[type="submit"]',
          'button:has-text("Soumettre")',
          'button:has(svg)',  // Bouton avec icône
        ];
        
        let submitButton = null;
        for (const selector of submitSelectors) {
          const btn = page.locator(selector).first();
          if (await btn.count() > 0 && await btn.isVisible()) {
            submitButton = btn;
            console.log(`✅ Bouton submit trouvé avec sélecteur: ${selector}`);
            break;
          }
        }
        
        if (submitButton) {
          // Log le state avant clic
          const isButtonDisabled = await submitButton.isDisabled();
          console.log(`🔍 Bouton disabled: ${isButtonDisabled}`);
          
          // Attendre la requête API
          const responsePromise = page.waitForResponse(
            response => response.url().includes('/notes') && response.request().method() === 'POST',
            { timeout: 10000 }
          ).catch(() => null);
          
          await submitButton.click();
          console.log('✅ Note soumise (clic bouton)');
          
          // Attendre la réponse API
          const response = await responsePromise;
          
          if (response) {
            const status = response.status();
            console.log(`📡 Réponse API POST /notes: ${status}`);
            
            if (status >= 400) {
              const error = `NOTE SUBMISSION FAILED: HTTP ${status}`;
              console.log(`❌ ${error}`);
              detectedErrors.push(error);
              
              // Lire le corps de la réponse pour plus de détails
              try {
                const body = await response.json();
                console.log(`❌ Erreur API: ${JSON.stringify(body)}`);
                detectedErrors.push(`API Error: ${JSON.stringify(body)}`);
              } catch (e) {
                console.log('⚠️  Impossible de parser la réponse erreur');
              }
            } else {
              console.log('✅ Note soumise avec succès (HTTP 200/201)');
            }
          } else {
            console.log('⚠️  Aucune requête POST /notes détectée (timeout ou endpoint différent)');
          }
          
          // Attendre que le DOM se mette à jour
          await page.waitForTimeout(2000);
          
          // CRITIQUE: TEST DE PERSISTENCE - Hard Reload
          console.log('🔄 HARD RELOAD pour tester la persistence...');
          await page.reload({ waitUntil: 'networkidle' });
          await page.waitForTimeout(2000);
          
          // Rouvrir l'onglet Notes après reload
          const notesTabAfterReload = page.locator('button:has-text("Notes"), div:has-text("Notes"), [role="tab"]:has-text("Notes")').first();
          if (await notesTabAfterReload.count() > 0) {
            await notesTabAfterReload.click();
            await page.waitForTimeout(1500);
          }
          
          // Chercher la note dans le DOM
          const noteAfterReload = page.locator(`text="${testNote}"`).first();
          const notesAfter = await page.locator('div[class*="note"], li[class*="note"]').count();
          
          console.log(`📝 Notes existantes APRÈS reload: ${notesAfter}`);
          
          if (await noteAfterReload.count() > 0) {
            console.log('✅ NOTE PERSISTÉE: Note visible après hard reload');
          } else {
            const error = 'NOTE NON PERSISTÉE: Note absente après reload (pas sauvegardée en DB)';
            console.log(`❌ ${error}`);
            detectedErrors.push(error);
            
            // Vérifier si des notes sont affichées
            if (notesAfter === 0) {
              console.log('⚠️  Aucune note affichée du tout (bug affichage ou DB vide)');
            }
          }
        } else {
          const error = 'BOUTON SUBMIT NOTE NON TROUVÉ';
          console.log(`❌ ${error}`);
          detectedErrors.push(error);
        }
      } else {
        const error = 'CHAMP SAISIE NOTE NON TROUVÉ';
        console.log(`❌ ${error}`);
        detectedErrors.push(error);
      }
    } else {
      const error = 'ONGLET NOTES NON TROUVÉ';
      console.log(`❌ ${error}`);
      detectedErrors.push(error);
    }
    
    // ==========================================================================
    // STEP 6: CONVERSION EN CONTACT (AVEC CAPTURE ERREUR)
    // ==========================================================================
    console.log('\n📋 STEP 6: Conversion en contact (test complet)');
    
    // Chercher le bouton "Convertir en contact"
    const convertButton = page.locator('button:has-text("Convertir"), button:has-text("Convert")').first();
    
    if (await convertButton.count() > 0) {
      console.log('✅ Bouton Convertir trouvé');
      
      // Vérifier si le bouton est enabled
      const isDisabled = await convertButton.isDisabled();
      
      if (!isDisabled) {
        console.log('✅ Bouton Convertir actif - TEST DE CONVERSION EN LIVE');
        
        // Attendre la requête de conversion
        const conversionPromise = page.waitForResponse(
          response => response.url().includes('/convert') && response.request().method() === 'POST',
          { timeout: 15000 }
        ).catch(() => null);
        
        // Cliquer sur Convertir
        await convertButton.click();
        console.log('🔄 Clic sur Convertir...');
        
        // Attendre un modal de confirmation potentiel
        await page.waitForTimeout(1000);
        
        // Chercher un bouton de confirmation dans le modal
        const confirmButton = page.locator('button:has-text("Confirmer"), button:has-text("Oui"), button:has-text("Convert")').last();
        
        if (await confirmButton.count() > 0 && await confirmButton.isVisible()) {
          console.log('✅ Modal de confirmation détecté');
          await confirmButton.click();
          console.log('✅ Confirmation cliquée');
        }
        
        // Attendre la réponse API
        const response = await conversionPromise;
        
        if (response) {
          const status = response.status();
          console.log(`📡 Réponse API POST /convert: ${status}`);
          
          if (status >= 400) {
            const error = `CONVERSION FAILED: HTTP ${status}`;
            console.log(`❌ ${error}`);
            detectedErrors.push(error);
            
            // Lire le corps de la réponse pour diagnostiquer
            try {
              const body = await response.json();
              const errorDetail = `Conversion Error Detail: ${JSON.stringify(body)}`;
              console.log(`❌ ${errorDetail}`);
              detectedErrors.push(errorDetail);
            } catch (e) {
              console.log('⚠️  Impossible de parser la réponse erreur');
            }
            
            // Chercher un message d'erreur dans le DOM
            await page.waitForTimeout(1000);
            const errorMessage = page.locator('[class*="error"], [role="alert"], .error, .alert-danger, div:has-text("erreur"), div:has-text("error")').first();
            
            if (await errorMessage.count() > 0 && await errorMessage.isVisible()) {
              const errorText = await errorMessage.textContent();
              console.log(`❌ Message erreur UI: "${errorText}"`);
              detectedErrors.push(`UI Error Message: ${errorText}`);
            }
          } else {
            console.log('✅ Conversion réussie (HTTP 200/201)');
            
            // Vérifier notification de succès
            await page.waitForTimeout(1000);
            const successMessage = page.locator('[class*="success"], .alert-success, div:has-text("succès"), div:has-text("success")').first();
            
            if (await successMessage.count() > 0) {
              const successText = await successMessage.textContent();
              console.log(`✅ Message succès: "${successText}"`);
            }
          }
        } else {
          const error = 'CONVERSION API CALL NOT DETECTED (timeout ou endpoint incorrect)';
          console.log(`❌ ${error}`);
          detectedErrors.push(error);
        }
      } else {
        console.log('ℹ️  Bouton Convertir désactivé (prospect déjà converti ou statut incompatible)');
      }
    } else {
      console.log('ℹ️  Bouton Convertir non trouvé (normal selon contexte)');
    }
    
    // ==========================================================================
    // STEP 7: VÉRIFIER NAVIGATION RETOUR
    // ==========================================================================
    console.log('\n📋 STEP 7: Test navigation retour');
    
    // Re-sélectionner le bouton Retour (car page peut avoir été reload)
    const backButtonRetour = page.locator('button:has-text("Retour"), button:has-text("←")').first();
    
    // Vérifier qu'il est visible
    await expect(backButtonRetour).toBeVisible({ timeout: 10000 });
    
    // Cliquer sur "Retour à la liste"
    await backButtonRetour.click();
    await page.waitForTimeout(1000);
    
    // Vérifier que la liste est de nouveau visible
    const listVisible = page.locator('h1:has-text("Prospects"), table, div[role="grid"]').first();
    await expect(listVisible).toBeVisible({ timeout: 5000 });
    console.log('✅ Retour à la liste OK');
    
    // ==========================================================================
    // STEP 8: TESTER NAVIGATION MENU SIDEBAR (CRITIQUE)
    // ==========================================================================
    console.log('\n📋 STEP 8: Test navigation via menu sidebar (CRITIQUE)');
    
    // Ouvrir de nouveau un prospect
    const viewButton2 = page.locator('button:has-text("Voir"), button[title*="Voir"]').first();
    if (await viewButton2.count() > 0) {
      await viewButton2.click();
      await page.waitForTimeout(1500);
      console.log('✅ Fiche prospect réouverte');
      
      // Vérifier qu'on est bien sur une fiche (URL ou présence bouton Retour)
      const isDetailView = await page.locator('button:has-text("Retour"), button:has-text("←")').first().isVisible();
      
      if (isDetailView) {
        console.log('✅ Vue détail confirmée');
        
        // Capturer l'URL actuelle
        const urlBefore = page.url();
        console.log(`📍 URL avant clic sidebar: ${urlBefore}`);
        
        // Maintenant cliquer sur "Leads" dans le menu sidebar
        const menuLeads = page.locator('button:has-text("Leads")').first();
        
        if (await menuLeads.count() > 0) {
          await menuLeads.click();
          console.log('🖱️  Clic sur bouton "Leads" dans sidebar');
          
          await page.waitForTimeout(1500);
          
          // Capturer l'URL après
          const urlAfter = page.url();
          console.log(`📍 URL après clic sidebar: ${urlAfter}`);
          
          // VÉRIFICATION 1: L'URL doit être /admin/crm/leads (pas de detail ID)
          if (urlAfter.includes('/admin/crm/leads') && !urlAfter.match(/\/leads\/[a-zA-Z0-9]+/)) {
            console.log('✅ URL correcte: /admin/crm/leads (pas de detail ID)');
          } else {
            const error = `NAVIGATION SIDEBAR FAILED: URL incorrecte après clic. Attendu: /admin/crm/leads, Reçu: ${urlAfter}`;
            console.log(`❌ ${error}`);
            detectedErrors.push(error);
          }
          
          // VÉRIFICATION 2: La vue détail doit avoir disparu
          await page.waitForTimeout(1000);
          const detailViewStillVisible = await page.locator('button:has-text("Retour"), button:has-text("←")').first().isVisible().catch(() => false);
          
          if (!detailViewStillVisible) {
            console.log('✅ Vue détail fermée (bouton Retour absent)');
          } else {
            const error = 'NAVIGATION SIDEBAR FAILED: Vue détail encore visible après clic menu';
            console.log(`❌ ${error}`);
            detectedErrors.push(error);
          }
          
          // VÉRIFICATION 3: La liste doit être visible
          const listVisible2 = page.locator('h1, h2, table, div[role="grid"]').first();
          
          if (await listVisible2.isVisible()) {
            console.log('✅ Liste prospects visible');
          } else {
            const error = 'NAVIGATION SIDEBAR FAILED: Liste non visible après clic';
            console.log(`❌ ${error}`);
            detectedErrors.push(error);
          }
        } else {
          const error = 'BOUTON LEADS SIDEBAR NON TROUVÉ';
          console.log(`❌ ${error}`);
          detectedErrors.push(error);
        }
      } else {
        console.log('⚠️  Vue détail non confirmée avant test navigation');
      }
    }
    
    console.log('\n✅ TEST COMPLET TERMINÉ');
    
    // ==========================================================================
    // RAPPORT FINAL DES ERREURS
    // ==========================================================================
    console.log('\n' + '='.repeat(80));
    console.log('📊 RAPPORT FINAL DES ERREURS DÉTECTÉES');
    console.log('='.repeat(80));
    
    if (detectedErrors.length > 0) {
      console.log(`\n❌ TOTAL ERREURS DÉTECTÉES: ${detectedErrors.length}\n`);
      detectedErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      
      console.log('\n' + '='.repeat(80));
      console.log('❌ STATUT: ÉCHEC - Des bugs ont été détectés en LIVE');
      console.log('='.repeat(80));
      
      // Échouer le test si des erreurs critiques sont détectées
      throw new Error(`${detectedErrors.length} erreurs critiques détectées. Voir logs ci-dessus.`);
    } else {
      console.log('\n✅ AUCUNE ERREUR DÉTECTÉE');
      console.log('\n' + '='.repeat(80));
      console.log('✅ STATUT: SUCCESS - Tous les tests passent');
      console.log('='.repeat(80));
    }
  });
});
