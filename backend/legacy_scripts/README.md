# Legacy Scripts - OBSOLETES

⚠️ **ATTENTION** : Ces scripts contiennent des secrets hardcodés et ne doivent PAS être utilisés en production.

## Scripts déplacés ici

- `init_db_direct.py` - Contenait MONGO_URL et ADMIN_PASSWORD hardcodés
- `create_initial_pages.py` - Contenait MONGO_URL hardcodée  
- `analyze_packs.py` - Contenait ADMIN_PASSWORD hardcodé
- `cleanup_packs.py` - Contenait ADMIN_PASSWORD hardcodé

## Pourquoi ces scripts sont obsolètes

1. **Sécurité** : Ils contenaient des credentials en clair dans le code
2. **Architecture** : Ils ne respectaient pas les bonnes pratiques d'utilisation des variables d'environnement
3. **Maintenance** : Duplication de logique déjà présente dans `server.py`

## Si vous devez utiliser ces fonctionnalités

**Pour l'initialisation DB** :
```bash
# Définir les variables d'environnement
export MONGO_URL="votre_url_mongodb"
export INITIAL_ADMIN_PASSWORD="votre_mot_de_passe"

# Utiliser les endpoints API du backend
curl -X POST https://igv-cms-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@igv.co.il","password":"<SECURE_PASSWORD>","role":"admin"}'
```

**Pour analyser les packs** :
```bash
# Utiliser l'API existante
curl https://igv-cms-backend.onrender.com/api/packs
```

**Pour nettoyer les packs** :
```bash
# Utiliser l'interface admin à /admin/packs
```

## Notes

- Ces scripts sont conservés uniquement pour référence historique
- **NE PAS** les utiliser en production
- **NE PAS** commit de nouveaux secrets dans ces fichiers
- Les credentials réels ont été révoqués

## Date de déplacement

7 décembre 2025 - Phase 1 de sécurisation
