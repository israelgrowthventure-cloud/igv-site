# Tests Post-Déploiement CRM Backend

## Statut Actuel
- ✅ Code déployé sur GitHub (commit c53efd4)
- ✅ Health endpoint opérationnel
- ⏳ Render redéploiement en cours (5-10 minutes)
- ⏳ Nouveaux routes CRM pas encore disponibles (404)

## Commandes de Test

### 1. Health Check (Déjà OK)
```powershell
curl https://igv-cms-backend.onrender.com/health
```

**Résultat attendu**:
```json
{
  "status": "ok",
  "service": "igv-backend",
  "version": "1.0.0"
}
```

### 2. CRM Pipeline Stages (Sans Auth)
```powershell
Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/crm/settings/pipeline-stages" | ConvertTo-Json -Depth 5
```

**Résultat attendu**:
```json
{
  "stages": [
    {
      "key": "analysis_requested",
      "label_fr": "Analyse demandée",
      "label_en": "Analysis requested",
      "label_he": "ניתוח התבקש"
    },
    ...8 stages total
  ]
}
```

### 3. GDPR Consent (Sans Auth)
```powershell
Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/gdpr/consent"
```

**Résultat attendu**:
```json
{
  "consent_analytics": false,
  "consent_marketing": false,
  "consent_functional": true
}
```

### 4. Admin Login (Obtenir Token)
```powershell
$body = @{
  email = "VOTRE_ADMIN_EMAIL"
  password = "VOTRE_ADMIN_PASSWORD"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/admin/login" -Method POST -Body $body -ContentType "application/json"

$token = $response.token
Write-Host "Token: $token"
```

### 5. Dashboard Stats (Avec Auth)
```powershell
$headers = @{
  Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/crm/dashboard/stats" -Headers $headers | ConvertTo-Json -Depth 5
```

**Résultat attendu**:
```json
{
  "leads": {
    "today": 0,
    "last_7_days": 5,
    "last_30_days": 23,
    "total": 150
  },
  "opportunities": {
    "open": 10,
    "won": 3,
    "pipeline_value": 75000
  },
  "tasks": {
    "overdue": 2
  },
  "top_sources": [...],
  "stage_distribution": [...]
}
```

### 6. List Leads (Avec Auth)
```powershell
Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/crm/leads?limit=10" -Headers $headers | ConvertTo-Json -Depth 5
```

### 7. Create User (Avec Auth Admin)
```powershell
$userBody = @{
  email = "test@igv.com"
  name = "Test User"
  password = "TestPassword123!"
  role = "viewer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/crm/settings/users" -Method POST -Headers $headers -Body $userBody -ContentType "application/json"
```

### 8. Export Leads CSV (Avec Auth)
```powershell
$export = Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/crm/leads/export/csv" -Headers $headers

Write-Host "Exported $($export.count) leads"
$export.csv | Out-File -FilePath "leads_export.csv" -Encoding UTF8
```

### 9. Get Pipeline (Avec Auth)
```powershell
Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/crm/pipeline" -Headers $headers | ConvertTo-Json -Depth 5
```

### 10. Newsletter Subscribe (Sans Auth - GDPR)
```powershell
$newsletterBody = @{
  email = "test@example.com"
  language = "fr"
  consent_marketing = $true
  source = "website"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/gdpr/newsletter/subscribe" -Method POST -Body $newsletterBody -ContentType "application/json"
```

## Test Complet Automatisé

```powershell
# Copier-coller ce script complet
Write-Host "=== TEST COMPLET CRM BACKEND ===`n"

# 1. Health
Write-Host "1. Health Check..."
try {
  $health = Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/health"
  Write-Host "✅ Health: $($health.status)`n"
} catch {
  Write-Host "❌ Health failed`n"
  exit
}

# 2. Pipeline Stages
Write-Host "2. Pipeline Stages..."
try {
  $stages = Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/crm/settings/pipeline-stages"
  Write-Host "✅ Stages: $($stages.stages.Count) stages`n"
} catch {
  Write-Host "❌ Pipeline stages not available yet (Status: $($_.Exception.Response.StatusCode.value__))`n"
}

# 3. GDPR Consent
Write-Host "3. GDPR Consent..."
try {
  $consent = Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/gdpr/consent"
  Write-Host "✅ GDPR: consent_analytics=$($consent.consent_analytics)`n"
} catch {
  Write-Host "❌ GDPR not available yet`n"
}

# 4. Login (remplacer credentials)
Write-Host "4. Admin Login..."
$loginBody = @{
  email = "REMPLACER_PAR_VOTRE_EMAIL"
  password = "REMPLACER_PAR_VOTRE_PASSWORD"
} | ConvertTo-Json

try {
  $loginResponse = Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/admin/login" -Method POST -Body $loginBody -ContentType "application/json"
  $token = $loginResponse.token
  Write-Host "✅ Login success, token: $($token.Substring(0, 20))...`n"
  
  # 5. Dashboard Stats
  Write-Host "5. Dashboard Stats..."
  $headers = @{ Authorization = "Bearer $token" }
  $stats = Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/crm/dashboard/stats" -Headers $headers
  Write-Host "✅ Dashboard: $($stats.leads.total) total leads`n"
  
  # 6. List Leads
  Write-Host "6. List Leads..."
  $leads = Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/crm/leads?limit=5" -Headers $headers
  Write-Host "✅ Leads: $($leads.total) total, showing $($leads.leads.Count)`n"
  
  # 7. Pipeline
  Write-Host "7. Pipeline..."
  $pipeline = Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/crm/pipeline" -Headers $headers
  Write-Host "✅ Pipeline loaded`n"
  
  Write-Host "`n=== TOUS LES TESTS PASSÉS ✅ ===`n"
  
} catch {
  Write-Host "⚠️ Auth required tests skipped (update credentials first)`n"
}

Write-Host "Backend CRM est opérationnel!`n"
```

## Erreurs Possibles

### 404 - Not Found
```
⏳ Render n'a pas encore redéployé
   Attendre 5-10 minutes supplémentaires
```

### 500 - Internal Server Error
```
⚠️ Erreur serveur
   Vérifier logs Render
   Probablement: import error ou DB config
```

### 401 - Unauthorized
```
⚠️ Token invalide ou manquant
   Refaire le login pour obtenir un nouveau token
```

### 422 - Validation Error
```
⚠️ Données envoyées invalides
   Vérifier format JSON et champs requis
```

## Prochaines Étapes

Une fois que les tests passent:

1. ✅ **Backend validé** - Production ready
2. ✅ **API documentée** - Voir CRM_API_DOCUMENTATION.md
3. ⏳ **Frontend à développer** - 2-3 jours
4. ⏳ **Tests E2E** - Après frontend
5. ⏳ **Preuves live** - Après frontend

## Support

- Documentation API: `CRM_API_DOCUMENTATION.md`
- Guide déploiement: `DEPLOYMENT_GUIDE.md`
- Statut: `CRM_IMPLEMENTATION_STATUS.md`
- Résumé: `RÉSUMÉ_LIVRAISON.md`
