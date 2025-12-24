# DIAGNOSTIC COMPLET - 24 DÉC 2025

## PROBLÈMES IDENTIFIÉS

### 1. ❌ Page "Le Commerce de Demain" non accessible
- **Route existe** : `/future-commerce` dans App.js ligne 61
- **Problème** : Aucun lien dans Header ou Home pour y accéder
- **Solution** : Ajouter lien dans Header navigation

### 2. ❌ Géolocalisation non visible
- **Code existe** : Home.js ligne 13-16, affichage ligne 93-98
- **API existe** : backend /api/detect-location
- **Problème possible** :
  - L'API retourne toujours Europe par défaut
  - L'affichage est conditionnel (if location) et location peut être null
  - Timeout de 1s trop court?
- **Solution** : Vérifier l'affichage et forcer un fallback visible

### 3. ❌ Prix des packs non géolocalisés (Israel)
- **Code existe** : Packs.js utilise getPricing(region)
- **Problème** : La détection de région ne fonctionne pas correctement
- **Solution** : Vérifier le backend /api/detect-location pour Israel

### 4. ⚠️ Clé Gemini à tester
- **Ancienne clé** : AIzaSyDvb82H0QqEB7GCWMsZtYDbxYdquBL6tTk (INVALIDE)
- **Nouvelle clé** : ...pwmU (IGV – Mini Analysis, créée 24 déc 2025)
- **Action** : Récupérer et tester la nouvelle clé

## CORRECTIONS À APPLIQUER

### A. Header.js - Ajouter lien "Commerce de Demain"
```javascript
const navLinks = [
  { path: '/', label: t('nav.home') },
  { path: '/about', label: t('nav.about') },
  { path: '/packs', label: t('nav.packs') },
  { path: '/future-commerce', label: t('nav.futureCommerce') },  // AJOUTER
  { path: '/contact', label: t('nav.contact') }
];
```

### B. Home.js - Améliorer affichage géolocalisation
Actuellement ligne 93-98 :
```javascript
{location && (
  <div className="mt-6 text-sm text-gray-500">
    ...
  </div>
)}
```

Problème : Si location est null, rien ne s'affiche.

Solution : Forcer un affichage avec fallback

### C. Backend - Vérifier detect-location pour Israel
Le backend doit détecter correctement l'IP israélienne et retourner region: 'israel'

### D. Tester nouvelle clé Gemini
Avant tout déploiement, valider que la nouvelle clé fonctionne

## PLAN D'ACTION

1. ✅ Diagnostiquer (EN COURS)
2. ⏳ Récupérer + tester nouvelle clé Gemini
3. ⏳ Corriger Header (lien Commerce de Demain)
4. ⏳ Corriger Home (affichage géolocalisation)
5. ⏳ Vérifier backend detect-location
6. ⏳ Tester localement
7. ⏳ Commit + Push + Deploy UNE SEULE FOIS
