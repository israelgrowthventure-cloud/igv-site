# GRAND MÉNAGE IGV - RAPPORT D'ANALYSE COMPLET

**Date du rapport :** 13 janvier 2026  
**Objectif :** Identifier la source de vérité, ce qui est essentiel et ce qui peut être supprimé/archivé

---

## 1. SOURCE DE VÉRITÉ

### ✅ Repo GitHub officiel (PRODUCTION)

| Attribut | Valeur |
|----------|--------|
| **Repo** | `https://github.com/israelgrowthventure-cloud/igv-site.git` |
| **Branche production** | `main` |
| **Dernier commit** | `04ffc13` - "feat: Add CRM missing features - notes users settings" |
| **Dossier local correspondant** | `C:\Users\PC\Desktop\IGV\igv site\igv-site` |
| **Statut Git** | ✅ Propre (aucun fichier non commité) |
| **Déploiement** | Render.com avec auto-deploy sur `main` |

**Pourquoi c'est la source de vérité :**
- C'est le seul repo configuré avec le domaine `israelgrowthventure.com`
- Les commits sont récents (janvier 2026)
- Le fichier `render.yaml` définit le pipeline de production
- La branche `main` est la référence pour Render

### Autres repos GitHub trouvés (NON production)

| Repo | Usage | Statut |
|------|-------|--------|
| `israelgrowthventure-cloud/igv-website-v2` | Ancienne version V2 | ⚠️ Obsolète (dernier commit: déc 2025) |
| `igvcontact/v3` | Tentative V3 abandonnée | ⚠️ Abandonné |

---

## 2. À GARDER ABSOLUMENT

### A) Dossier de travail actif (CRITIQUE)

```
C:\Users\PC\Desktop\IGV\igv site\igv-site\
├── backend\         # ✅ ESSENTIEL - Code serveur Python/FastAPI
├── frontend\        # ✅ ESSENTIEL - Code React 19
├── render.yaml      # ✅ ESSENTIEL - Configuration déploiement
├── README.md        # ✅ Important - Documentation
├── tests\           # ✅ Utile - Tests Playwright
└── .git\            # ✅ CRITIQUE - Historique Git
```

**Taille totale :** ~364 MB (dont ~340 MB en `node_modules` régénérables)  
**Fichiers code réel :** ~24 MB

### B) Documents business importants

```
C:\Users\PC\Desktop\IGV\
├── CLIENTS\              # ✅ 37.31 MB - Dossiers clients
├── contrats\             # ✅ 2.47 MB - Contrats juridiques
├── DOC INTERNE\          # ✅ 26.74 MB - Documentation métier
├── emploi du temps\      # ✅ 0.27 MB
├── facture\              # ✅ 0.05 MB
├── fiches produits\      # ✅ 1.85 MB
├── lettres\              # ✅ 0.27 MB
├── questionnaire client\ # ✅ 0.57 MB
└── propal pour la maison du chocolat\ # ✅ 16.55 MB
```

**Total documents business : ~86 MB**

---

## 3. À ARCHIVER AILLEURS (hors Bureau)

### A) Copies redondantes du code

| Dossier | Taille | Raison de l'archivage |
|---------|--------|----------------------|
| `igv-website-complete` | **567 MB** | Clone obsolète de `igv-site` (commit 542c0ef de déc 2025), contient un venv de 180 MB |
| `igv-website-v2` | **183 MB** | Ancienne version V2, repo séparé non utilisé |
| `v3` | **0.33 MB** | Tentative V3 abandonnée |

**Chemin :** `C:\Users\PC\Desktop\IGV\igv site\`

### B) Archive complète

```
C:\Users\PC\Desktop\IGV__ARCHIVE\         # 518 MB total
├── igv-website-v2_copy\    # 176 MB - Copie de l'ancienne V2
├── IGV_copy\               # 237 MB - Copie complète d'IGV
├── repo_cleanup_20251231\  # ~5 MB - Scripts de nettoyage (143 fichiers)
├── audit_fusion_copy\      # ~0 MB - Vide
└── igv-site__backup_before_cleanup.zip  # 93 MB - Backup
```

**Recommandation :** Déplacer vers un disque externe ou cloud (Google Drive, OneDrive)

### C) Médias lourds non essentiels

```
C:\Users\PC\Desktop\IGV\
├── banque image\           # 94 MB - Images et vidéos marketing
│   └── VIDEO\              # ~37 MB
├── post linkedin\          # 64 MB - Vidéos pour réseaux sociaux
├── posts linkedin 52\      # 6 MB
└── vidéos\                 # 4 MB
```

**Total médias : ~168 MB**

---

## 4. À SUPPRIMER SANS RISQUE

### A) Fichiers de test et scripts temporaires à la racine du repo

**Chemin :** `C:\Users\PC\Desktop\IGV\igv site\igv-site\`

| Fichier | Taille | Raison |
|---------|--------|--------|
| `test_*.py` (39 fichiers) | ~500 KB | Scripts de test ponctuels, non versionnés utilement |
| `*.pdf` (4 fichiers) | 810 KB | Fichiers de preuve générés lors des tests |
| `audit_out.zip` | ~2 MB | Archive de diagnostic |
| `*.json` (résultats tests) | ~50 KB | Résultats de tests ponctuels |
| `RAPPORT_*.md` (6 fichiers) | ~100 KB | Rapports de mission ponctuels |
| `MISSION_*.md` (3 fichiers) | ~50 KB | Notes de mission |

**Liste des fichiers Python à supprimer à la racine :**
```
analyze_pdf_content.py
check_deploy_status.py
create_email_templates.py
diagnostic_delete_user.py
diagnostic_old_users.py
monitor_deploy.py
test_backend_simple.py
test_bugs_production_live.py
test_complet_prospects_templates.py
test_conversion.py
test_corrections_prospects.py
test_create_delete_complete.py
test_create_then_delete.py
test_crm_email_final.py
test_crm_email_send.py
test_crm_local_audit.py
test_crm_production_audit.py
test_delete_force.py
test_delete_old_user.py
test_delete_user_bug.py
test_delete_user_final_proof.py
test_delete_user_proof_final.py
test_final_prospects.py
test_full_crm_live.py
test_id_format.py
test_integration_complete.py
test_live_complete_validation.py
test_login_prod.py
test_minianalyse_he_complete_prod.py
test_minianalyse_he_END_TO_END.py
test_minianalyse_he_prod.py
test_pdf_long_he.py
test_prospects_audit.py
test_prospect_to_contact.py
test_reel_prospects_complet.py
test_smtp_diagnostic.py
test_templates_notes.py
test_validation_post_correction.py
wait_render_deploy.py
```

**PDFs à supprimer :**
```
mini_analyse_he_prod_1767500474.pdf
mini_analyse_he_REEL_1767500870.pdf
PREUVE_PDF_HE_DOWNLOAD.pdf
test_pdf_long_he.pdf
```

### B) Dossiers node_modules régénérables

| Chemin | Taille | Action |
|--------|--------|--------|
| `igv-site\frontend\node_modules` | ~340 MB | ⚠️ Ne pas supprimer manuellement, régénéré par `npm ci` |
| `igv-website-complete\frontend\node_modules` | ~100 MB | Supprimer avec le dossier parent |
| `igv-website-v2\frontend\node_modules` | ~85 MB | Supprimer avec le dossier parent |
| `igv-website-complete\backend\venv` | ~180 MB | Supprimer avec le dossier parent |

### C) Dossiers __pycache__ (toujours régénérés)

Présents dans :
- `backend\__pycache__`
- `igv-website-complete\backend\__pycache__`

---

## 5. PLAN DE GRAND MÉNAGE (Étapes)

### PHASE 1 : Sécurisation (AVANT tout)
1. Vérifier que le repo GitHub `igv-site` est à jour : `git status` dans `igv-site`
2. Faire un backup ZIP du dossier `igv-site` actuel (sans node_modules)
3. Noter les variables d'environnement critiques (`.env` files)

### PHASE 2 : Nettoyage du repo actif
1. Supprimer les 39 fichiers `test_*.py` à la racine de `igv-site`
2. Supprimer les 4 fichiers `.pdf` à la racine de `igv-site`
3. Supprimer les fichiers `*_results.json` à la racine
4. Supprimer `audit_out.zip` et le dossier `audit_out`
5. Supprimer les fichiers `RAPPORT_*.md` et `MISSION_*.md` (garder README.md)

### PHASE 3 : Suppression des copies obsolètes
1. **Supprimer complètement** `C:\Users\PC\Desktop\IGV\igv site\igv-website-complete\` (567 MB)
2. **Supprimer complètement** `C:\Users\PC\Desktop\IGV\igv site\igv-website-v2\` (183 MB)
3. **Supprimer complètement** `C:\Users\PC\Desktop\IGV\igv site\v3\` (0.33 MB)
4. **Supprimer** `C:\Users\PC\Desktop\IGV\igv site\igv-website-complete.zip` si présent

### PHASE 4 : Archivage hors Bureau
1. Déplacer `C:\Users\PC\Desktop\IGV__ARCHIVE\` vers un disque externe ou cloud
2. Déplacer `C:\Users\PC\Desktop\IGV\banque image\VIDEO\` vers cloud
3. Déplacer `C:\Users\PC\Desktop\IGV\post linkedin\` vers cloud

### PHASE 5 : Réorganisation finale du Bureau
Structure cible :
```
C:\Users\PC\Desktop\IGV\
├── igv site\
│   └── igv-site\        # Seul repo actif (source de vérité)
├── CLIENTS\             # Dossiers clients
├── DOC INTERNE\         # Documentation métier
├── contrats\            # Contrats
├── facture\             # Factures
└── [autres docs business légers]
```

---

## 6. RÉSUMÉ DES GAINS

| Action | Gain d'espace |
|--------|---------------|
| Supprimer `igv-website-complete` | **567 MB** |
| Supprimer `igv-website-v2` | **183 MB** |
| Supprimer `v3` | **0.33 MB** |
| Archiver `IGV__ARCHIVE` (hors Bureau) | **518 MB** |
| Supprimer scripts tests racine | **~4 MB** |
| Archiver médias lourds (hors Bureau) | **168 MB** |
| **TOTAL GAINS** | **~1.44 GB** |

---

## 7. STRUCTURE IDÉALE FINALE

### Sur le Bureau (essentiel uniquement)

```
C:\Users\PC\Desktop\
└── IGV\                          # ~250 MB max
    ├── igv site\
    │   └── igv-site\             # Repo Git unique
    │       ├── backend\
    │       ├── frontend\
    │       ├── tests\
    │       ├── render.yaml
    │       └── README.md
    ├── CLIENTS\
    ├── DOC INTERNE\
    ├── contrats\
    └── [docs business légers]
```

### Sur cloud/disque externe (archive)

```
IGV_ARCHIVE_2026/
├── IGV__ARCHIVE/                 # Backup complet
├── banque image/VIDEO/           # Vidéos marketing
├── post linkedin/                # Médias réseaux
└── Old_Code_Versions/
    ├── igv-website-complete/
    ├── igv-website-v2/
    └── v3/
```

---

## 8. PREUVES ET DONNÉES TECHNIQUES

### Tailles vérifiées (13 janvier 2026)

| Élément | Taille | Fichiers |
|---------|--------|----------|
| IGV total (Bureau) | 1.35 GB | - |
| IGV__ARCHIVE | 518 MB | 37,691 |
| igv-site (workspace) | 364 MB | 63,246 |
| igv-website-complete | 567 MB | 69,188 |
| igv-website-v2 | 183 MB | 18,807 |

### Top 10 fichiers les plus lourds

1. `Le Fondateur - Le terrain...mp4` - 34 MB (post linkedin)
2. `Design sans titre.mp4` - 25 MB (post linkedin)
3. `numpy..cp313-win_amd64.whl` - 19 MB (venv obsolète)
4. `7z.dll` - 16 MB (venv obsolète)
5. `Brand Consulting...mp4` - 16 MB (banque image)
6. `Brand Consulting...(1).mp4` - 16 MB (banque image)
7. `scipy...whl` - 15 MB (venv obsolète)
8. `tsserver.js` - 11 MB (node_modules)
9. `tsserverlibrary.js` - 11 MB (node_modules)
10. `esbuild.exe` - 10 MB (node_modules)

### Dates clés

- **Dernier commit igv-site :** 13 janvier 2026
- **Dernière modification backend :** 11 janvier 2026 (`admin_routes.py`)
- **igv-website-complete :** Inactif depuis 13 décembre 2025
- **igv-website-v2 :** Inactif depuis 3 décembre 2025
- **IGV__ARCHIVE :** Créé le 31 décembre 2025

---

## CONCLUSION

**Source de vérité unique :** `igv-site` (repo `israelgrowthventure-cloud/igv-site.git`, branche `main`)

**Action prioritaire :** Supprimer les 3 dossiers de code obsolètes (`igv-website-complete`, `igv-website-v2`, `v3`) pour libérer **750 MB**.

**Gain total possible :** ~1.44 GB en suivant les 5 phases du plan de ménage.

---

*Rapport généré le 13 janvier 2026 - Analyse automatique sans modification*
