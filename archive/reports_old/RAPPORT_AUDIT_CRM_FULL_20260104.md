# RAPPORT AUDIT CRM COMPLET - IGV
**Date**: 2026-01-04 21:58:18
**Environnement**: Production (TEST autorisé)
**API_BASE**: https://igv-cms-backend.onrender.com/api

---

## A) TABLE BUGS (P0/P1/P2)

| Bug | Preuve (file:line + endpoint + payload + status + response/log) | Repro | Cause |
|-----|-------------------------------------------------------------------|-------|-------|
| **P1 - Create Email Template - require_role not defined** | backend/crm_complete_routes.py:1458<br>POST /api/crm/emails/templates<br>Status: 500<br>Response: {"error":"Internal Server Error","message":"name 'require_role' is not defined"} | 1. POST /api/crm/emails/templates avec payload valide<br>2. Status 500 retourné | VÉRIFIÉ: require_role existe dans auth_middleware.py:107 mais n'est PAS importé dans crm_complete_routes.py:22-30 |

## B) TABLE INCOHÉRENCES API (frontend vs backend)

| Call Frontend | Route Backend | Diff | Impact |
|---------------|---------------|------|--------|
| src\components\CRMTabs.js:29<br>GET /crm/leads/export/csv | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |
| src\components\CRMTabs.js:46<br>PUT /crm/leads/${leadId} | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |
| src\components\CRMTabs.js:56<br>POST /crm/leads/${leadId}/notes | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |
| src\components\CRMTabs.js:68<br>POST /crm/leads/${leadId}/convert-to-contact | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |
| src\components\crm\PipelineTab.js:24<br>PUT /api/crm/pipeline/opportunities/${oppId} | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |
| src\components\crm\SettingsTab.js:34<br>DELETE /api/crm/settings/users/${userId} | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |
| src\pages\DemandeRappel.js:51<br>POST /crm/lead-from-pack | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |
| src\pages\client\Dashboard.js:33<br>GET /client/profile | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |
| src\pages\client\Dashboard.js:34<br>GET /client/analyses | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |
| src\pages\client\Dashboard.js:52<br>GET /client/analyses/${analysisId}/download | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |
| src\utils\api.js:36<br>POST ${API}/contact | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |
| src\utils\api.js:42<br>GET ${API}/contacts | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |
| src\utils\api.js:48<br>POST ${API}/cart | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |
| src\utils\api.js:53<br>GET ${API}/cart | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |
| src\utils\api.js:60<br>GET ${API}/detect-location | None:None<br>None | Path mismatch | BUG_P1 - Route backend manquante |

## C) TABLE COUVERTURE TESTS

- **Routes backend totales**: 115
- **Routes testées**: 118
- **Tests passed**: 61
- **Tests failed**: 57

## D) CHECKLIST UI (clics précis + attendu/obtenu)

**Voir fichier**: `audit_out/ui_manual_steps.md` pour checklist complète

Les tests UI doivent être exécutés manuellement dans le navigateur.

---

## RÉSUMÉ EXÉCUTIF

- **Routes backend**: 115
- **Appels frontend**: 129
- **Matching YES**: 55
- **Matching NO**: 74
- **Tests exécutés**: 118
- **Tests réussis**: 61
- **Bugs identifiés**: 1

---

**Fichiers générés**:
- audit_out/backend_routes.json
- audit_out/frontend_calls.json
- audit_out/matching_table.json
- audit_out/api_test_results.json
- audit_out/api_test_console.log
- audit_out/ui_manual_steps.md
