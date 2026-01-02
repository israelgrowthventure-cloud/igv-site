# 🧪 COMMANDES DE TEST - CRM IGV

## Configuration préalable

```bash
# Définir l'URL du backend
export BACKEND_URL="https://igv-cms-backend.onrender.com"

# Obtenir un token JWT (remplacer avec vos identifiants)
curl -X POST $BACKEND_URL/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "postmaster@israelgrowthventure.com",
    "password": "Admin@igv2025#"
  }' | jq -r '.access_token'

# Stocker le token
export TOKEN="VOTRE_TOKEN_ICI"
```

---

## 📧 OBJECTIF #1: Tests d'envoi d'emails

### Test 1: Envoyer un email simple
```bash
curl -X POST $BACKEND_URL/api/crm/emails/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "client@example.com",
    "subject": "Test depuis IGV CRM",
    "message": "Bonjour,\n\nCeci est un email de test depuis le CRM IGV.\n\nCordialement,\nL'\''équipe IGV"
  }'
```

### Test 2: Envoyer un email avec contact_id
```bash
curl -X POST $BACKEND_URL/api/crm/emails/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "client@example.com",
    "subject": "Bienvenue chez IGV",
    "message": "Bonjour {{name}},\n\nMerci de votre intérêt...",
    "contact_id": "67564d8e9f1234567890abcd"
  }'
```

### Test 3: Vérifier les emails envoyés (historique)
```bash
curl -X GET "$BACKEND_URL/api/crm/emails/history?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 👥 OBJECTIF #2: Tests de gestion des utilisateurs

### Test 1: Lister tous les utilisateurs
```bash
curl -X GET $BACKEND_URL/api/admin/users \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Test 2: Créer un utilisateur commercial
```bash
curl -X POST $BACKEND_URL/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "commercial.test@igv.com",
    "name": "Jean Dupont",
    "password": "SecurePass123!",
    "role": "commercial",
    "assigned_leads": []
  }' | jq
```

### Test 3: Créer un utilisateur admin
```bash
curl -X POST $BACKEND_URL/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.test@igv.com",
    "name": "Marie Admin",
    "password": "AdminPass123!",
    "role": "admin",
    "assigned_leads": []
  }' | jq
```

### Test 4: Obtenir les détails d'un utilisateur
```bash
# Remplacer USER_ID par l'ID obtenu lors de la création
export USER_ID="67564d8e9f1234567890abcd"

curl -X GET $BACKEND_URL/api/admin/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Test 5: Mettre à jour un utilisateur
```bash
curl -X PUT $BACKEND_URL/api/admin/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean Dupont (Modifié)",
    "role": "admin",
    "is_active": true
  }' | jq
```

### Test 6: Désactiver un utilisateur
```bash
curl -X DELETE $BACKEND_URL/api/admin/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Test 7: Vérifier que l'utilisateur est bien désactivé
```bash
curl -X GET $BACKEND_URL/api/admin/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.is_active'
```

---

## 🔍 Tests d'intégration CRM

### Test 1: Créer un lead et lui envoyer un email
```bash
# 1. Créer un lead
LEAD_RESPONSE=$(curl -X POST $BACKEND_URL/api/crm/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau.lead@example.com",
    "brand_name": "Test Company",
    "name": "Pierre Test",
    "phone": "+33612345678",
    "sector": "retail",
    "language": "fr"
  }')

echo "Lead créé: $LEAD_RESPONSE"

# 2. Envoyer un email au lead
curl -X POST $BACKEND_URL/api/crm/emails/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "nouveau.lead@example.com",
    "subject": "Bienvenue chez IGV",
    "message": "Bonjour Pierre,\n\nMerci de votre intérêt pour nos services..."
  }'
```

### Test 2: Créer un contact et vérifier l'email modal
```bash
# Créer un contact
curl -X POST $BACKEND_URL/api/crm/contacts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau.contact@example.com",
    "name": "Sophie Martin",
    "phone": "+33698765432",
    "position": "CEO",
    "language": "fr"
  }' | jq
```

---

## 🎨 Tests de l'interface (manuels)

### Test 1: Accéder à l'onglet Utilisateurs
1. Ouvrir https://israelgrowthventure.com/admin/crm
2. Se connecter avec les identifiants admin
3. Cliquer sur l'onglet "Utilisateurs"
4. Vérifier que la liste s'affiche

### Test 2: Créer un utilisateur via l'interface
1. Dans l'onglet Utilisateurs
2. Cliquer sur "Nouvel utilisateur"
3. Remplir le formulaire:
   - Email: test@example.com
   - Nom: Test User
   - Mot de passe: TestPass123!
   - Rôle: Commercial
4. Cliquer sur "Créer"
5. Vérifier que l'utilisateur apparaît dans la liste

### Test 3: Envoyer un email depuis un lead
1. Aller dans l'onglet "Leads"
2. Sélectionner un lead avec email
3. Cliquer sur "Envoyer Email" (icône violette)
4. Sélectionner un template
5. Modifier le message si nécessaire
6. Cliquer sur "Envoyer"
7. Vérifier le toast de confirmation

### Test 4: Envoyer un email depuis un contact
1. Aller dans l'onglet "Contacts"
2. Sélectionner un contact
3. Cliquer sur le bouton d'email
4. Vérifier que l'email est pré-rempli
5. Envoyer l'email

---

## 🔐 Tests de sécurité

### Test 1: Vérifier que les routes nécessitent l'authentification
```bash
# Sans token - doit échouer avec 401
curl -X GET $BACKEND_URL/api/admin/users

# Avec token invalide - doit échouer avec 401
curl -X GET $BACKEND_URL/api/admin/users \
  -H "Authorization: Bearer invalid_token"
```

### Test 2: Vérifier que seuls les admins peuvent gérer les utilisateurs
```bash
# 1. Créer un utilisateur commercial
COMMERCIAL_TOKEN=$(curl -X POST $BACKEND_URL/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "commercial.test@igv.com",
    "password": "SecurePass123!"
  }' | jq -r '.access_token')

# 2. Essayer d'accéder aux utilisateurs avec ce token - doit échouer avec 403
curl -X GET $BACKEND_URL/api/admin/users \
  -H "Authorization: Bearer $COMMERCIAL_TOKEN"
```

### Test 3: Vérifier qu'un admin ne peut pas se supprimer
```bash
# Obtenir l'ID de l'admin actuel
ADMIN_ID=$(curl -X GET $BACKEND_URL/api/admin/users \
  -H "Authorization: Bearer $TOKEN" | jq -r '.users[] | select(.email == "postmaster@israelgrowthventure.com") | ._id')

# Essayer de se supprimer - doit échouer avec 400
curl -X DELETE $BACKEND_URL/api/admin/users/$ADMIN_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Tests de validation des données

### Test 1: Email invalide
```bash
curl -X POST $BACKEND_URL/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "name": "Test",
    "password": "Pass123!",
    "role": "commercial"
  }'
# Doit retourner 422 avec détails de validation
```

### Test 2: Mot de passe trop court
```bash
curl -X POST $BACKEND_URL/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test",
    "password": "123",
    "role": "commercial"
  }'
# Doit échouer (minimum 6 caractères)
```

### Test 3: Email déjà existant
```bash
# Créer le même utilisateur deux fois
curl -X POST $BACKEND_URL/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "duplicate@example.com",
    "name": "Test",
    "password": "Pass123!",
    "role": "commercial"
  }'

# Deuxième fois - doit échouer avec 400
curl -X POST $BACKEND_URL/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "duplicate@example.com",
    "name": "Test 2",
    "password": "Pass123!",
    "role": "commercial"
  }'
```

---

## 🧹 Nettoyage après tests

```bash
# Lister tous les utilisateurs de test
curl -X GET $BACKEND_URL/api/admin/users \
  -H "Authorization: Bearer $TOKEN" | jq '.users[] | select(.email | contains("test")) | {email, _id}'

# Supprimer chaque utilisateur de test
for USER_ID in $(curl -X GET $BACKEND_URL/api/admin/users -H "Authorization: Bearer $TOKEN" | jq -r '.users[] | select(.email | contains("test")) | ._id'); do
  curl -X DELETE $BACKEND_URL/api/admin/users/$USER_ID \
    -H "Authorization: Bearer $TOKEN"
  echo "Deleted user: $USER_ID"
done
```

---

## ✅ Checklist de validation

- [ ] Email envoyé avec succès
- [ ] Historique des emails récupéré
- [ ] Utilisateur créé avec rôle commercial
- [ ] Utilisateur créé avec rôle admin
- [ ] Utilisateur modifié
- [ ] Utilisateur désactivé (soft delete)
- [ ] Routes protégées par JWT
- [ ] Routes protégées par rôle admin
- [ ] Validation des données fonctionne
- [ ] Interface utilisateurs accessible en admin
- [ ] Bouton email dans LeadsTab fonctionne
- [ ] Bouton email dans ContactsTab fonctionne
- [ ] EmailModal pré-remplit correctement

---

## 📝 Notes

- Tous les tests nécessitent un token JWT valide
- Le token expire après 24h
- Les utilisateurs supprimés sont soft-deleted (is_active=false)
- Les emails sont envoyés via SMTP configuré dans les variables d'environnement
- Pour les tests locaux, remplacer $BACKEND_URL par `http://localhost:8000`

---

**🎉 Fin des tests**
