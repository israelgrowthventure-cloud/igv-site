#!/bin/bash
# Safety Guard - Empêche toute suppression hors du repo Git
# Usage: source scripts/safety_guard.sh && guard_repo_operation

set -e

guard_repo_operation() {
    ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
    if [ -z "$ROOT" ]; then
        echo "ERREUR: Pas dans un repo Git. Opération INTERDITE."
        return 1
    fi
    
    REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
    if [[ ! "$REMOTE" =~ israelgrowthventure-cloud/igv-site ]]; then
        echo "ERREUR: Remote origin ne correspond pas à israelgrowthventure-cloud/igv-site. Remote: $REMOTE"
        return 1
    fi
    
    CURRENT=$(pwd)
    if [[ ! "$CURRENT" =~ ^"$ROOT" ]]; then
        echo "ERREUR: Répertoire courant hors du repo Git. CWD: $CURRENT, ROOT: $ROOT"
        return 1
    fi
    
    echo "✓ Safety guard OK: opération autorisée dans $ROOT"
    echo "$ROOT"
}
