#!/usr/bin/env pwsh

# Script de déploiement manuel Render via Deploy Hook
# Usage: .\trigger-deploy.ps1

Write-Host "🚀 Déclenchement manuel du déploiement Render`n" -ForegroundColor Cyan

# Le Deploy Hook URL doit être défini comme secret GitHub: RENDER_DEPLOY_HOOK_URL
# Format: https://api.render.com/deploy/srv-xxxxxxxxxxxxx?key=yyyyyyyyyyyyyy

$hookUrl = $env:RENDER_DEPLOY_HOOK_URL

if (-not $hookUrl) {
    Write-Host "❌ ERREUR: Variable RENDER_DEPLOY_HOOK_URL non définie`n" -ForegroundColor Red
    Write-Host "Pour configurer:" -ForegroundColor Yellow
    Write-Host '  $env:RENDER_DEPLOY_HOOK_URL = "https://api.render.com/deploy/srv-xxxxx?key=yyyyy"' -ForegroundColor Gray
    Write-Host "`nOu utilisez GitHub Actions workflow_dispatch depuis:" -ForegroundColor Yellow
    Write-Host "  https://github.com/israelgrowthventure-cloud/igv-site/actions/workflows/render-deploy.yml`n" -ForegroundColor Gray
    exit 1
}

Write-Host "Appel du Deploy Hook..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $hookUrl -Method POST -UseBasicParsing
    
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
        Write-Host "✅ Deploy Hook appelé avec succès (HTTP $($response.StatusCode))`n" -ForegroundColor Green
        
        Write-Host "⏳ Attente 60s pour que Render démarre le build...`n" -ForegroundColor Cyan
        Start-Sleep -Seconds 60
        
        Write-Host "🔍 Monitoring du déploiement (15 checks max):`n" -ForegroundColor Cyan
        
        for ($i = 1; $i -le 15; $i++) {
            Write-Host "Check $i/15 - $(Get-Date -Format 'HH:mm:ss'):" -ForegroundColor Gray
            
            try {
                $siteResponse = Invoke-WebRequest -Uri "https://igv-site.onrender.com/?v=$(Get-Random)" `
                    -Headers @{'Cache-Control'='no-cache'} `
                    -UseBasicParsing `
                    -TimeoutSec 10
                
                if ($siteResponse.Content -match 'main\.(\w+)\.js') {
                    $hash = $matches[1]
                    
                    if ($hash -ne '4130aa42') {
                        Write-Host "  🎉 NOUVEAU BUILD DÉTECTÉ: main.$hash.js`n" -ForegroundColor Green
                        Write-Host "✅ DÉPLOIEMENT RÉUSSI!`n" -ForegroundColor Green -BackgroundColor Black
                        Write-Host "📋 RÉCAPITULATIF:" -ForegroundColor Cyan
                        Write-Host "  URL Production: https://israelgrowthventure.com" -ForegroundColor White
                        Write-Host "  Bundle JS: main.$hash.js" -ForegroundColor Green
                        Write-Host "  Ancien bundle: main.4130aa42.js" -ForegroundColor Red
                        exit 0
                    } else {
                        Write-Host "  ⏳ Ancien: main.$hash.js" -ForegroundColor Yellow
                    }
                }
            } catch {
                Write-Host "  ⚠️ Timeout (Render redémarre peut-être)" -ForegroundColor Yellow
            }
            
            if ($i -lt 15) {
                Start-Sleep -Seconds 30
            }
        }
        
        Write-Host "`n⚠️ Timeout du monitoring - vérifiez Render Dashboard" -ForegroundColor Yellow
        Write-Host "https://dashboard.render.com/web/srv-xxxxx (votre service igv-site)`n" -ForegroundColor Gray
        exit 1
        
    } else {
        Write-Host "❌ Deploy Hook a échoué (HTTP $($response.StatusCode))`n" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de l'appel du Deploy Hook:`n$_`n" -ForegroundColor Red
    exit 1
}
