#!/bin/bash
# Script de déploiement rapide - israelgrowthventure.com
# Date: 2 janvier 2026

echo "🚀 DÉPLOIEMENT IGV SITE + CRM"
echo "=============================="
echo ""

# 1. Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ] && [ ! -d "frontend" ]; then
    echo "❌ Erreur: Exécutez ce script depuis la racine du projet igv-site"
    exit 1
fi

echo "✅ Répertoire OK"
echo ""

# 2. Build frontend
echo "📦 Build frontend..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build frontend échoué!"
    exit 1
fi

echo "✅ Build frontend réussi"
echo ""

# 3. Vérifier backend
echo "🐍 Vérification backend..."
cd ../backend

# Test import Python basique
python -c "import server; import monetico_routes; import mini_analysis_routes; print('✅ Imports Python OK')"

if [ $? -ne 0 ]; then
    echo "❌ Erreur imports Python backend"
    exit 1
fi

cd ..

echo ""
echo "=============================="
echo "✅ PRÊT POUR DÉPLOIEMENT"
echo "=============================="
echo ""
echo "PROCHAINES ÉTAPES:"
echo "1. Vérifier variables Render (voir RENDER_ENV_VARS_REQUIRED.md)"
echo "2. git add . && git commit -m 'feat: production ready'"
echo "3. git push origin main"
echo "4. Attendre déploiement Render (5-10 min)"
echo "5. Tests LIVE (voir RAPPORT_COMPLET_ACTIONS.md)"
echo ""
echo "🎯 VARIABLES CRITIQUES À VÉRIFIER SUR RENDER:"
echo "   - MONETICO_TPE (à récupérer auprès de CIC)"
echo "   - MONETICO_KEY (clé de sécurité CIC)"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo "   - GEMINI_API_KEY"
echo ""
echo "🚀 GO!"
