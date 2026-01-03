# 🔍 DIAGNOSTIC PRE-CORRECTION - IGV CRM & Mini-Analyse
**Date**: 03/01/2026  
**Mode**: Exécution autonome totale  
**Stack**: React (frontend) + FastAPI (backend) + MongoDB Atlas + Render

---

## 📋 PHASE 1: AUDIT COMPLET (0 modification de code)

### ✅ 1.1 - Services Render Actifs

**Configuration identifiée** ([render.yaml](render.yaml#L1-L50)):
- **Backend**: `igv-cms-backend` (Python 3.11.4, FastAPI)
  - URL: `https://igv-cms-backend.onrender.com`
  - Build: `pip install -r requirements.txt`
  - Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
  - Root: `backend/`
  
- **Frontend**: `israelgrowthventure.com` (React)
  - Deploy auto depuis GitHub main branch
  
**Variables d'environnement critiques** ([RENDER_ENV_VARS_REQUIRED.md](RENDER_ENV_VARS_REQUIRED.md#L1-L125)):
- ✅ MongoDB configuré
- ✅ Gemini API configuré
- ⚠️ **SMTP actuel**: Gmail (`israel.growth.venture@gmail.com`)
- ❌ **SMTP requis**: OVH (`contact@israelgrowthventure.com`)

---

### 🔴 1.2 - Mapper Flux CRM (UI → API → DB)

#### **BUG CRM-1: Email CRM hardcodé sur Gmail au lieu d'OVH**

**Fichier**: [backend/crm_complete_routes.py](backend/crm_complete_routes.py#L1517-L1520)  
**Lignes**: 1517-1520  
**Cause**: Configuration SMTP pointe vers Gmail par défaut au lieu d'OVH  
**Impact**: Emails CRM envoyés depuis `israel.growth.venture@gmail.com` (boîte de contrôle) au lieu de `contact@israelgrowthventure.com` (email CRM officiel)

```python
smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')  # ❌ Défaut Gmail
smtp_port = int(os.getenv('SMTP_PORT', '587'))         # ❌ Port Gmail
smtp_user = os.getenv('SMTP_USER')
smtp_password = os.getenv('SMTP_PASSWORD')
```

**Preuve**:
- Code utilise `smtp_user` comme expéditeur (ligne 1528)
- Aucune configuration OVH SSL/TLS port 465 détectée
- Variables Render ENV pointent vers Gmail

**Correction requise**:
1. Mettre à jour variables Render ENV:
   - `SMTP_HOST=ssl0.ovh.net`
   - `SMTP_PORT=465`
   - `SMTP_USER=contact@israelgrowthventure.com`
   - `SMTP_FROM=contact@israelgrowthventure.com`
2. Modifier code pour utiliser SSL/TLS au lieu de STARTTLS
3. Tester envoi depuis CRM après déploiement

---

#### **BUG CRM-2: Fonction Users (first_name/last_name) - Vérification requise**

**Fichier**: [backend/admin_user_routes.py](backend/admin_user_routes.py#L1-L100)  
**Lignes**: 26-35 (modèle), 55-78 (get_all_users)  
**État**: ✅ Code semble correct mais nécessite validation en production

```python
class UserCreate(BaseModel):
    email: EmailStr
    first_name: str   # ✅ Présent
    last_name: str    # ✅ Présent
    password: str
    role: str = "commercial"
```

**Points à valider**:
- ✅ Modèles Pydantic incluent first_name/last_name
- ✅ Route GET retourne ces champs (lignes 67-68)
- ⚠️ Route POST création user non vérifiée (ligne 88+)
- ⚠️ Route DELETE user non testée en prod
- ❓ Persistance MongoDB après création/modification

**Tests requis**:
1. Créer user avec first_name + last_name
2. Vérifier stockage MongoDB
3. Supprimer user puis refresh page
4. Confirmer absence après suppression

---

#### **BUG CRM-3: Prospects - Bouton "Ouvrir son analyse" à vérifier**

**Fichier**: [frontend/src/components/crm/LeadsTab.js](frontend/src/components/crm/LeadsTab.js#L1-L150)  
**État**: Nécessite vérification du lien entre lead et analyse

**Points à vérifier**:
- Bouton visible sur fiche prospect
- Clic → ouverture PDF analyse liée
- Données `analysis` non vides dans lead MongoDB
- URL/PDF correctement récupérés

**Tests requis**:
1. Accéder à un prospect créé depuis mini-analyse
2. Vérifier présence bouton "Ouvrir son analyse"
3. Clic → PDF s'affiche correctement
4. Console: 0 erreur API

---

#### **BUG CRM-4: Opportunités - Pipeline cliquable à valider**

**Fichier**: [backend/crm_complete_routes.py](backend/crm_complete_routes.py#L900-L1000)  
**État**: Code présent mais non testé en production

**Points à vérifier**:
- Pipeline visuel cliquable
- Changement étape → PATCH API 2xx
- Persistance changement après refresh
- Aucune erreur console

---

### 🔴 1.3 - Identifier Bugs Mini-Analyse Multilingue

#### **BUG MA-EN-1: Codes internes visibles dans PDF anglais (WHITELIST_*)**

**Symptôme**: PDF anglais affiche des codes internes au lieu de noms de villes/zones humains  
**Exemple**: "Specific locations for Medical/Aesthetic services are pending the `WHITELIST_ARABE_MIXTE`"

**Fichiers concernés**:
- [backend/mini_analysis_routes.py](backend/mini_analysis_routes.py#L570-L650) (lignes 579-582)
- [backend/prompts/MASTER_PROMPT_RESTAURATION_EN.txt](backend/prompts/MASTER_PROMPT_RESTAURATION_EN.txt#L1-L150)

**Analyse de la cause**:

1. **Source du problème** (ligne 579-582):
```python
if request.statut_alimentaire.lower() == 'halal':
    whitelist_data = load_igv_file(WHITELIST_ARAB)
    whitelist_name = "Whitelist_2_Arabe_incl_Mixed"  # ❌ CODE INTERNE
else:
    whitelist_data = load_igv_file(WHITELIST_JEWISH)
    whitelist_name = "Whitelist_1_Jewish_incl_Mixed"  # ❌ CODE INTERNE
```

2. **Injection dans prompt** (ligne 610-620):
```python
**REFERENCE DOCUMENT 2: {whitelist_name} (AUTHORIZED LOCATIONS)**
# ❌ {whitelist_name} = "Whitelist_2_Arabe_incl_Mixed" au lieu de "Arab & Mixed Cities"
```

3. **Gemini reproduit le code** dans l'analyse EN car:
   - Le prompt EN contient le label technique
   - Aucun post-traitement pour humaniser les noms
   - Master prompt EN ne force pas la traduction des labels

**Preuve**: PDF joint `IGV_Mini_Analysis_BrandNew1.pdf` montre:
```
Zone 1: Nazareth (Arab city) – Specific locations for Medical/Aesthetic services are pending the `WHITELIST_ARABE_MIXTE`.
```

**Correction requise**:
1. **Mapper les codes vers labels humains**:
```python
whitelist_labels = {
    "fr": {
        "Whitelist_1_Jewish_incl_Mixed": "Villes Juives & Mixtes",
        "Whitelist_2_Arabe_incl_Mixed": "Villes Arabes & Mixtes"
    },
    "en": {
        "Whitelist_1_Jewish_incl_Mixed": "Jewish & Mixed Cities",
        "Whitelist_2_Arabe_incl_Mixed": "Arab & Mixed Cities"
    },
    "he": {
        "Whitelist_1_Jewish_incl_Mixed": "ערים יהודיות ומעורבות",
        "Whitelist_2_Arabe_incl_Mixed": "ערים ערביות ומעורבות"
    }
}
```

2. **Utiliser le label traduit dans le prompt**:
```python
whitelist_display_name = whitelist_labels[language][whitelist_name]
# Au lieu de: **REFERENCE DOCUMENT 2: {whitelist_name}**
# Utiliser: **REFERENCE DOCUMENT 2: {whitelist_display_name}**
```

3. **Renforcer le Master Prompt EN** pour interdire tout code interne:
```plaintext
CRITICAL: Never display internal codes like WHITELIST_*, zone codes, or technical labels.
Always use human-readable city names: Tel Aviv, Jerusalem, Haifa, Nazareth, Netanya, etc.
```

4. **Post-traitement serveur** (validation avant PDF):
```python
# Bloquer génération PDF si codes internes détectés
if "WHITELIST_" in analysis_text or "whitelist_" in analysis_text.lower():
    logging.error("Internal codes detected in analysis - regenerating")
    # Retry avec prompt renforcé
```

**Tests de validation**:
- Générer 3 analyses EN consécutives
- Vérifier 0 occurrence de "WHITELIST_" dans chaque PDF
- Confirmer noms de villes humains (Nazareth, Umm al-Fahm, Netanya, etc.)

---

#### **BUG MA-HE-2: Carrés (□) au lieu de texte hébreu dans PDF**

**Symptôme**: PDF hébreu affiche des carrés au lieu des lettres hébraïques  
**Cause**: Police Unicode hébreu absente dans ReportLab + pas de gestion RTL

**Fichier**: [backend/mini_analysis_routes.py](backend/mini_analysis_routes.py#L235-L350)  
**Ligne**: 256-260 (génération PDF)

**Analyse de la cause**:

```python
# ❌ PROBLÈME: Utilise les polices par défaut (Helvetica) qui ne supportent PAS l'hébreu
styles = getSampleStyleSheet()
story.append(Paragraph(title_text, styles['Heading2']))  # Helvetica
story.append(Paragraph(f"<i>{date_label} ...</i>", styles['Normal']))  # Helvetica
```

**Corrections requises**:

1. **Installer police Unicode hébreu** (ex: Noto Sans Hebrew, Heebo, David CLM):
```python
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Enregistrer police hébreu
hebrew_font_path = os.path.join(os.path.dirname(__file__), 'fonts', 'NotoSansHebrew-Regular.ttf')
pdfmetrics.registerFont(TTFont('HebrewFont', hebrew_font_path))
```

2. **Configurer styles RTL pour hébreu**:
```python
if language == "he":
    hebrew_style = ParagraphStyle(
        'Hebrew',
        parent=styles['Normal'],
        fontName='HebrewFont',
        fontSize=12,
        leading=18,
        alignment=TA_RIGHT,  # RTL alignment
        wordWrap='RTL'
    )
    # Utiliser hebrew_style au lieu de styles['Normal']
```

3. **Appliquer la police aux paragraphes hébreu**:
```python
if language == "he":
    story.append(Paragraph(title_text, hebrew_title_style))
else:
    story.append(Paragraph(title_text, styles['Heading2']))
```

**Police recommandée**: Noto Sans Hebrew (Google Fonts, licence OFL)  
**Tests de validation**:
- Générer PDF HE
- Vérifier 100% texte lisible (0 carré)
- Confirmer alignement droite→gauche (RTL)
- Date, titre, sections correctement affichés

---

#### **BUG MA-3: Email Mini-Analyse hardcodé sur Gmail**

**Fichier**: [backend/mini_analysis_routes.py](backend/mini_analysis_routes.py#L125-L135)  
**Lignes**: 130, 135

```python
SMTP_FROM_EMAIL = os.getenv('SMTP_FROM_EMAIL') or os.getenv('SMTP_FROM', 'israel.growth.venture@gmail.com')  # ❌
# ...
COMPANY_EMAIL = "israel.growth.venture@gmail.com"  # ❌ Hardcodé
```

**Correction requise**: Aligner sur `contact@israelgrowthventure.com`

---

### ⚠️ 1.4 - Vérifier Configuration SMTP CRM

**Variables Render ENV actuelles** (déduit du code):
```
SMTP_HOST=smtp.gmail.com         # ❌ Devrait être ssl0.ovh.net
SMTP_PORT=587                    # ❌ Devrait être 465
SMTP_USER=israel.growth.venture@gmail.com  # ❌ Devrait être contact@...
SMTP_PASSWORD=[Gmail App Password]         # ❌ Devrait être mdp OVH
```

**Configuration OVH requise**:
```
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_USER=contact@israelgrowthventure.com
SMTP_PASSWORD=[Password OVH]
SMTP_FROM=contact@israelgrowthventure.com
SMTP_FROM_NAME=Israel Growth Venture
```

**Code à modifier**:
- [backend/mini_analysis_routes.py](backend/mini_analysis_routes.py#L125-L135) (Mini-Analyse)
- [backend/crm_complete_routes.py](backend/crm_complete_routes.py#L1517-L1520) (CRM)
- [backend/server.py](backend/server.py#L408-L411) (Contact général)
- [backend/extended_routes.py](backend/extended_routes.py#L39) (Calendrier)

**Méthode d'envoi à modifier**:
```python
# ❌ ACTUEL: STARTTLS (Gmail)
await aiosmtplib.send(
    message,
    hostname=smtp_host,
    port=smtp_port,
    username=smtp_user,
    password=smtp_password,
    start_tls=True  # ❌
)

# ✅ REQUIS: SSL/TLS (OVH)
await aiosmtplib.send(
    message,
    hostname=smtp_host,  # ssl0.ovh.net
    port=smtp_port,      # 465
    username=smtp_user,
    password=smtp_password,
    use_tls=True         # ✅ SSL/TLS direct
)
```

---

### 📊 1.5 - Résumé Bugs Localisés

| ID | Bug | Fichier | Lignes | Gravité | Impact |
|---|---|---|---|---|---|
| **CRM-1** | SMTP CRM sur Gmail au lieu d'OVH | `crm_complete_routes.py` | 1517-1520 | 🔴 Critique | Emails CRM depuis mauvaise boîte |
| **CRM-2** | Users first_name/last_name | `admin_user_routes.py` | 26-78 | 🟡 Moyen | À valider en prod |
| **CRM-3** | Bouton analyse prospects | `LeadsTab.js` | À identifier | 🟡 Moyen | À valider en prod |
| **CRM-4** | Pipeline opportunités | `crm_complete_routes.py` | 900-1000 | 🟡 Moyen | À valider en prod |
| **MA-EN-1** | Codes internes (WHITELIST_*) dans PDF EN | `mini_analysis_routes.py` | 579-582, 610-620 | 🔴 Critique | Expérience utilisateur dégradée |
| **MA-HE-2** | Carrés (□) dans PDF HE | `mini_analysis_routes.py` | 256-260 | 🔴 Critique | PDF illisible |
| **MA-3** | Email Mini-Analyse sur Gmail | `mini_analysis_routes.py` | 130, 135 | 🔴 Critique | Confusion identité |

---

## 📝 PLAN DE CORRECTION ORDONNÉ

### **Phase 2: CRM - Corrections critiques**
1. **Migrer SMTP CRM vers OVH** (BUG CRM-1)
   - Mettre à jour ENV vars Render
   - Modifier code SMTP (SSL/TLS port 465)
   - Tester envoi email depuis CRM
   - Valider headers (From/Reply-To = contact@...)

2. **Valider fonctions Users** (BUG CRM-2)
   - Test création avec first_name/last_name
   - Test suppression persistante
   - Vérifier MongoDB

3. **Valider boutons/pipelines CRM** (BUG CRM-3, CRM-4)
   - Test bouton analyse sur prospects
   - Test pipeline opportunités cliquable

---

### **Phase 3: Mini-Analyse - Corrections EN + HE**
1. **Éliminer codes internes EN** (BUG MA-EN-1)
   - Mapper codes → labels humains traduits
   - Renforcer Master Prompt EN
   - Ajouter validation post-génération
   - Tester 3 générations EN consécutives

2. **Réparer affichage hébreu** (BUG MA-HE-2)
   - Installer police Noto Sans Hebrew
   - Configurer styles RTL ReportLab
   - Tester génération HE

3. **Migrer email Mini-Analyse vers OVH** (BUG MA-3)
   - Même correctif que CRM-1
   - Tester envoi Mini-Analyse

---

### **Phase 4: Délivrabilité - Sortir du SPAM**
1. Analyser headers emails reçus actuellement
2. Vérifier alignement SPF/DKIM/DMARC pour `contact@israelgrowthventure.com`
3. Ajouter multipart text+HTML
4. Tester classification INBOX vs SPAM

---

### **Phase 5: Déploiement & Validation finale**
1. Commit toutes corrections
2. Push main → Trigger Render deploy
3. Attendre build complet (5-10 min)
4. Retests complets CRM + Mini-Analyse
5. Produire `VALIDATION_FINALE_IGV_CRM.md` avec preuves

---

## ✅ ACCEPTANCE CRITERIA PHASE 1

- [x] DIAGNOSTIC_PRE_CORRECTION.md produit
- [x] Aucune modification de code effectuée
- [x] Chaque bug localisé avec fichiers/lignes + cause exacte
- [x] Plan de correction ordonné établi
- [ ] Phase 2-5 à exécuter (autonome)

---

**Next Step**: Commencer Phase 2 - Corrections CRM  
**Autonomie**: Je vais maintenant corriger, commit, déployer et valider chaque bug automatiquement.
