# Safety Guard - Empêche toute suppression hors du repo Git
# Usage: . .\scripts\safety_guard.ps1; Guard-RepoOperation

$ErrorActionPreference = "Stop"

function Guard-RepoOperation {
    $ROOT = git rev-parse --show-toplevel 2>$null
    if (-not $ROOT) {
        throw "ERREUR: Pas dans un repo Git. Opération INTERDITE."
    }
    
    $REMOTE = git remote get-url origin 2>$null
    if ($REMOTE -notmatch "israelgrowthventure-cloud/igv-site") {
        throw "ERREUR: Remote origin ne correspond pas à israelgrowthventure-cloud/igv-site. Remote: $REMOTE"
    }
    
    $CURRENT = (Get-Location).Path
    $ROOT_NORMALIZED = (Resolve-Path $ROOT).Path
    
    if (-not $CURRENT.StartsWith($ROOT_NORMALIZED)) {
        throw "ERREUR: Répertoire courant hors du repo Git. CWD: $CURRENT, ROOT: $ROOT_NORMALIZED"
    }
    
    Write-Host "✓ Safety guard OK: opération autorisée dans $ROOT_NORMALIZED" -ForegroundColor Green
    return $ROOT_NORMALIZED
}

Export-ModuleMember -Function Guard-RepoOperation
