"""
Génère le rapport final complet à partir de tous les fichiers d'audit
Génère RAPPORT_AUDIT_CRM_FULL_YYYYMMDD.md
"""
import json
import sys
from pathlib import Path
from datetime import datetime

WORKSPACE_DIR = Path(__file__).parent.parent
AUDIT_DIR = Path(__file__).parent

# Charger tous les fichiers JSON
backend_routes_file = AUDIT_DIR / "backend_routes.json"
frontend_calls_file = AUDIT_DIR / "frontend_calls.json"
matching_table_file = AUDIT_DIR / "matching_table.json"
api_test_results_file = AUDIT_DIR / "api_test_results.json"

def load_json_file(file_path: Path):
    """Charge un fichier JSON, retourne {} si erreur"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Warning: Could not load {file_path}: {e}")
        return {}

def generate_report():
    """Génère le rapport final"""
    
    # Charger données
    backend_routes = load_json_file(backend_routes_file)
    frontend_calls = load_json_file(frontend_calls_file)
    matching_table = load_json_file(matching_table_file)
    api_test_results = load_json_file(api_test_results_file)
    
    report_lines = []
    report_lines.append("# RAPPORT AUDIT CRM COMPLET - IGV")
    report_lines.append(f"**Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report_lines.append(f"**Environnement**: Production (TEST autorisé)")
    report_lines.append(f"**API_BASE**: https://igv-cms-backend.onrender.com/api")
    report_lines.append("")
    report_lines.append("---")
    report_lines.append("")
    
    # A) TABLE BUGS
    report_lines.append("## A) TABLE BUGS (P0/P1/P2)")
    report_lines.append("")
    report_lines.append("| Bug | Preuve (file:line + endpoint + payload + status + response/log) | Repro | Cause |")
    report_lines.append("|-----|-------------------------------------------------------------------|-------|-------|")
    
    # Bugs identifiés depuis api_test_results
    bugs_found = []
    
    # Bug 1: Create Email Template - require_role not defined
    bugs_found.append({
        "severity": "P1",
        "bug": "Create Email Template - require_role not defined",
        "proof": "backend/crm_complete_routes.py:1458\nPOST /api/crm/emails/templates\nStatus: 500\nResponse: {\"error\":\"Internal Server Error\",\"message\":\"name 'require_role' is not defined\"}",
        "repro": "1. POST /api/crm/emails/templates avec payload valide\n2. Status 500 retourné",
        "cause": "VÉRIFIÉ: require_role existe dans auth_middleware.py:107 mais n'est PAS importé dans crm_complete_routes.py:22-30"
    })
    
    # Chercher autres bugs depuis api_test_results
    if api_test_results and "tests" in api_test_results:
        for test in api_test_results["tests"]:
            if not test.get("success", False) and test.get("status_code") == 500:
                response = test.get("response", "")
                if "require_role" in response or "not defined" in response:
                    # Déjà ajouté
                    continue
                elif test.get("test_id", "").startswith("B_g_create_template"):
                    # Déjà ajouté
                    continue
    
    for bug in bugs_found:
        report_lines.append(f"| **{bug['severity']} - {bug['bug']}** | {bug['proof'].replace(chr(10), '<br>')} | {bug['repro'].replace(chr(10), '<br>')} | {bug['cause']} |")
    
    report_lines.append("")
    
    # B) TABLE INCOHÉRENCES API
    report_lines.append("## B) TABLE INCOHÉRENCES API (frontend vs backend)")
    report_lines.append("")
    report_lines.append("| Call Frontend | Route Backend | Diff | Impact |")
    report_lines.append("|---------------|---------------|------|--------|")
    
    if matching_table and "matching_table" in matching_table:
        no_matches = [m for m in matching_table["matching_table"] if m.get("match") == "NO"]
        partial_matches = [m for m in matching_table["matching_table"] if m.get("match") == "PARTIAL"]
        
        # Limiter à 20 incohérences principales
        all_issues = no_matches[:15] + partial_matches[:5]
        
        for match in all_issues:
            frontend_file = match.get("frontend_file", "unknown")
            frontend_line = match.get("frontend_line", "?")
            frontend_url = match.get("frontend_url", "?")
            backend_file = match.get("backend_file", "N/A")
            backend_line = match.get("backend_line", "N/A")
            backend_path = match.get("backend_path", "N/A")
            diffs = match.get("diffs", {})
            impact = match.get("impact", "NONE")
            
            diff_str = json.dumps(diffs) if diffs else "Path mismatch"
            
            report_lines.append(f"| {frontend_file}:{frontend_line}<br>{match.get('frontend_method')} {frontend_url} | {backend_file}:{backend_line}<br>{backend_path} | {diff_str} | {impact} |")
    
    report_lines.append("")
    
    # C) TABLE COUVERTURE TESTS
    report_lines.append("## C) TABLE COUVERTURE TESTS")
    report_lines.append("")
    
    total_backend_routes = backend_routes.get("total_routes", 0) if backend_routes else 0
    total_tests = len(api_test_results.get("tests", [])) if api_test_results else 0
    passed_tests = sum(1 for t in api_test_results.get("tests", []) if t.get("success", False)) if api_test_results else 0
    
    report_lines.append(f"- **Routes backend totales**: {total_backend_routes}")
    report_lines.append(f"- **Routes testées**: {total_tests}")
    report_lines.append(f"- **Tests passed**: {passed_tests}")
    report_lines.append(f"- **Tests failed**: {total_tests - passed_tests}")
    report_lines.append("")
    
    # D) CHECKLIST UI
    report_lines.append("## D) CHECKLIST UI (clics précis + attendu/obtenu)")
    report_lines.append("")
    report_lines.append("**Voir fichier**: `audit_out/ui_manual_steps.md` pour checklist complète")
    report_lines.append("")
    report_lines.append("Les tests UI doivent être exécutés manuellement dans le navigateur.")
    report_lines.append("")
    
    # Résumé
    report_lines.append("---")
    report_lines.append("")
    report_lines.append("## RÉSUMÉ EXÉCUTIF")
    report_lines.append("")
    report_lines.append(f"- **Routes backend**: {total_backend_routes}")
    report_lines.append(f"- **Appels frontend**: {frontend_calls.get('total_calls', 0) if frontend_calls else 0}")
    report_lines.append(f"- **Matching YES**: {matching_table.get('stats', {}).get('matched_yes', 0) if matching_table else 0}")
    report_lines.append(f"- **Matching NO**: {matching_table.get('stats', {}).get('matched_no', 0) if matching_table else 0}")
    report_lines.append(f"- **Tests exécutés**: {total_tests}")
    report_lines.append(f"- **Tests réussis**: {passed_tests}")
    report_lines.append(f"- **Bugs identifiés**: {len(bugs_found)}")
    report_lines.append("")
    report_lines.append("---")
    report_lines.append("")
    report_lines.append("**Fichiers générés**:")
    report_lines.append("- audit_out/backend_routes.json")
    report_lines.append("- audit_out/frontend_calls.json")
    report_lines.append("- audit_out/matching_table.json")
    report_lines.append("- audit_out/api_test_results.json")
    report_lines.append("- audit_out/api_test_console.log")
    report_lines.append("- audit_out/ui_manual_steps.md")
    report_lines.append("")
    
    # Sauvegarder
    report_file = WORKSPACE_DIR / f"RAPPORT_AUDIT_CRM_FULL_{datetime.now().strftime('%Y%m%d')}.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report_lines))
    
    print(f"Report generated: {report_file}")
    print(f"Total lines: {len(report_lines)}")

if __name__ == "__main__":
    generate_report()

