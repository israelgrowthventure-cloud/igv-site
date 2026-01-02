# Migration Mini-Analyses vers CRM Leads

## Contexte

Le système IGV génère des mini-analyses via le formulaire `/mini-analysis`. Actuellement, ces mini-analyses sont stockées dans la collection MongoDB `mini_analyses` mais ne créent pas automatiquement de leads dans le CRM.

Cette migration connecte les 40+ mini-analyses existantes au système CRM pour qu'elles apparaissent dans `/admin/crm/prospects`.

## Architecture Actuelle

### Avant Migration
```
Mini-Analysis Form
     ↓
  POST /api/mini-analysis
     ↓
  mini_analyses collection (40+ entries)
     ✗ PAS de leads CRM
```

### Après Migration
```
Mini-Analysis Form
     ↓
  POST /api/mini-analysis
     ↓
  mini_analyses collection + leads collection ✓
     ↓
  Visible dans /admin/crm/prospects ✓
```

## Code Existant

### Création Automatique (déjà en place)

Le code dans `backend/mini_analysis_routes.py` (lignes 739-769) crée déjà automatiquement un lead via `create_lead_in_crm()` :

```python
lead_data = {
    "email": request.email,
    "phone": request.phone,
    "brand_name": request.nom_de_marque,
    "sector": request.secteur,
    "language": language,
    "status": "NEW",  # Sera mis à jour en "GENERATED" si succès
    "assigned_to": None,
    ...
}

lead_result = await create_lead_in_crm(lead_data, request_id)
```

**Statuts possibles:**
- `NEW` → Nouvelle demande
- `QUOTA_BLOCKED` → Quota Gemini atteint
- `GENERATED` → Mini-analyse générée avec succès
- `ERROR` → Erreur technique

## Migration des Données Historiques

### Scripts Créés

#### 1. `check_mini_analyses.py`
Audit des données existantes :
```bash
python backend/check_mini_analyses.py
```

**Affiche:**
- Nombre de mini-analyses totales
- Nombre de leads existants
- Nombre de mini-analyses sans leads correspondants
- Liste détaillée des mini-analyses à migrer

#### 2. `migrate_mini_analyses.py`
Migration automatique :
```bash
python backend/migrate_mini_analyses.py
```

**Fonctionnement:**
1. Lit toutes les mini-analyses de `mini_analyses` collection
2. Pour chaque mini-analyse sans lead correspondant :
   - Crée un lead avec email, phone, brand_name, sector, language
   - Statut = `GENERATED` (analyse déjà créée)
   - Référence à l'analyse originale (`mini_analysis_id`)
3. Évite les doublons (même email + brand_name)
4. Préserve toutes les métadonnées

## Exécution sur Render

### Étape 1: Vérification
```bash
# Se connecter au service Render igv-cms-backend
# Menu: Shell

# Vérifier l'état actuel
python backend/check_mini_analyses.py
```

### Étape 2: Migration
```bash
# Exécuter la migration (une seule fois)
python backend/migrate_mini_analyses.py
```

### Étape 3: Validation
```bash
# Re-vérifier après migration
python backend/check_mini_analyses.py

# Vérifier via l'API
curl https://igv-cms-backend.onrender.com/api/crm/leads | jq
```

### Étape 4: Interface Admin
1. Aller sur https://israelgrowthventure.com/admin/crm/prospects
2. Vérifier que les 40+ leads apparaissent
3. Filtrer par statut `GENERATED`
4. Assigner aux commerciaux si nécessaire

## Données Migrées

Chaque lead créé contient :
```json
{
  "email": "client@example.com",
  "phone": "+33612345678",
  "brand_name": "Ma Marque",
  "sector": "Restauration / Food",
  "language": "fr",
  "status": "GENERATED",
  "source": "mini-analysis-migration",
  "created_at": "2025-01-XX...",  // Date originale de la mini-analyse
  "updated_at": "2025-01-XX...",  // Date de migration
  "mini_analysis_id": "ObjectId(...)",
  "pdf_url": "...",  // Si PDF généré
  "analysis_text": "Premier aperçu de l'analyse...",
  "notes": "Migrated from mini-analysis collection on ..."
}
```

## Prévention des Doublons

Le script vérifie avant chaque insertion :
```python
existing_lead = await db.leads.find_one({
    "email": email,
    "brand_name": brand_name
})
```

Si un lead existe déjà, il est **ignoré** (pas de duplication).

## Workflow Post-Migration

### Pour les Nouvelles Mini-Analyses
✅ **Aucune action nécessaire** - Le code existant crée automatiquement le lead

### Pour les Admins CRM
1. Les 40+ leads apparaissent dans `/admin/crm/prospects`
2. Filtrer par `status=GENERATED` pour voir les mini-analyses complétées
3. Filtrer par `source=mini-analysis-migration` pour voir les leads migrés
4. Assigner manuellement aux commerciaux (`assigned_to`)
5. Suivre le pipeline normal : Lead → Contact → Opportunity

## Rollback (si nécessaire)

Pour annuler la migration :
```python
# MongoDB Shell ou script Python
await db.leads.delete_many({
    "source": "mini-analysis-migration"
})
```

## Logs et Monitoring

Les logs de migration contiennent :
```
[BEFORE MIGRATION]
Mini-analyses: 42
Leads: 5

[MIGRATED] Brand1 | email1@...
[MIGRATED] Brand2 | email2@...
...

[AFTER MIGRATION]
Leads created: 37
Skipped (already exist): 5
Errors: 0
Total leads now: 42
```

## Tests de Validation

### Test 1: Vérifier la visibilité
```bash
curl https://igv-cms-backend.onrender.com/api/crm/leads?limit=50 \
  -H "Authorization: Bearer <admin-token>"
```

### Test 2: Compter les leads par source
```javascript
db.leads.aggregate([
  { $group: { _id: "$source", count: { $sum: 1 } } }
])
```

### Test 3: Nouvelle mini-analyse
1. Aller sur `/mini-analysis`
2. Soumettre une nouvelle mini-analyse
3. Vérifier dans `/admin/crm/prospects` qu'un nouveau lead apparaît immédiatement
4. Statut doit être `GENERATED` si succès, `QUOTA_BLOCKED` si quota atteint

## Commit

```
[CRM] Add migration scripts: mini-analyses -> leads

- check_mini_analyses.py: Audit existing mini-analyses and leads
- migrate_mini_analyses.py: Migrate 40+ mini-analyses to CRM leads
- Connects mini-analysis form submissions to CRM prospects pipeline
- Preserves all metadata: email, phone, brand_name, sector, language, timestamps
- Prevents duplicates: checks email+brand_name before creating leads
- Status: GENERATED for successfully completed mini-analyses
```

Commit: `132d594`
Déployé sur: Render (igv-cms-backend)

## Support

Si des problèmes surviennent :
1. Vérifier les logs Render : Dashboard → igv-cms-backend → Logs
2. Chercher `[ERROR]` ou `[MIGRATED]` dans les logs
3. Re-exécuter `check_mini_analyses.py` pour diagnostiquer
4. Si nécessaire, rollback et contacter le développeur
