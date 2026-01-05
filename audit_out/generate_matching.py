"""
Génère le matching entre appels frontend et routes backend
Génère audit_out/matching_table.json
"""
import json
import re
from pathlib import Path
from urllib.parse import urlparse

WORKSPACE_DIR = Path(__file__).parent.parent
BACKEND_ROUTES_FILE = Path(__file__).parent / "backend_routes.json"
FRONTEND_CALLS_FILE = Path(__file__).parent / "frontend_calls.json"
OUTPUT_FILE = Path(__file__).parent / "matching_table.json"

def normalize_path(path: str) -> str:
    """Normalise un path pour comparaison"""
    # Enlever les query params
    path = path.split('?')[0]
    # Enlever les fragments
    path = path.split('#')[0]
    return path.rstrip('/')

def match_paths(frontend_url: str, backend_path: str) -> tuple:
    """
    Compare un URL frontend avec un path backend
    Retourne (match_type, diffs)
    match_type: YES, PARTIAL, NO
    """
    # Normaliser
    frontend_norm = normalize_path(frontend_url)
    backend_norm = normalize_path(backend_path)
    
    # Exact match
    if frontend_norm == backend_norm:
        return ("YES", {})
    
    # Chercher variables dans backend (ex: {user_id})
    backend_pattern = backend_norm
    # Remplacer {var} par .+ pour regex
    backend_regex = re.sub(r'\{[^}]+\}', r'[^/]+', backend_pattern)
    
    if re.match(f'^{backend_regex}$', frontend_norm):
        return ("YES", {"path_variables": "matched"})
    
    # Vérifier si c'est un préfixe
    if frontend_norm.startswith(backend_norm.split('{')[0]):
        return ("PARTIAL", {"frontend": frontend_norm, "backend": backend_norm})
    
    return ("NO", {"frontend": frontend_norm, "backend": backend_norm})

def main():
    # Charger routes backend
    with open(BACKEND_ROUTES_FILE, 'r', encoding='utf-8') as f:
        backend_data = json.load(f)
    
    # Charger appels frontend
    with open(FRONTEND_CALLS_FILE, 'r', encoding='utf-8') as f:
        frontend_data = json.load(f)
    
    matching_table = []
    
    for call_idx, call in enumerate(frontend_data["calls"]):
        frontend_url = call["url_template"]
        frontend_method = call["method"]
        
        # Chercher correspondance backend
        best_match = None
        best_match_type = "NO"
        best_diffs = {}
        
        for route in backend_data["routes"]:
            backend_path = route["path"]
            backend_method = route["method"]
            
            # Méthode doit correspondre
            if frontend_method != backend_method:
                continue
            
            match_type, diffs = match_paths(frontend_url, backend_path)
            
            if match_type == "YES":
                best_match = route
                best_match_type = "YES"
                best_diffs = diffs
                break  # Exact match trouvé
            elif match_type == "PARTIAL" and best_match_type != "YES":
                if best_match is None:
                    best_match = route
                    best_match_type = "PARTIAL"
                    best_diffs = diffs
        
        # Déterminer impact
        impact = "NONE"
        if best_match_type == "NO":
            impact = "BUG_P1 - Route backend manquante"
        elif best_match_type == "PARTIAL":
            impact = "WARNING - Path partiel match"
        
        matching_entry = {
            "frontend_call_id": call_idx,
            "frontend_file": call["file"],
            "frontend_line": call["line"],
            "frontend_method": frontend_method,
            "frontend_url": frontend_url,
            "backend_route_id": backend_data["routes"].index(best_match) if best_match else None,
            "backend_file": best_match["file"] if best_match else None,
            "backend_line": best_match["line"] if best_match else None,
            "backend_path": best_match["path"] if best_match else None,
            "match": best_match_type,
            "diffs": best_diffs,
            "impact": impact
        }
        
        matching_table.append(matching_entry)
    
    # Générer stats
    stats = {
        "total_frontend_calls": len(matching_table),
        "matched_yes": sum(1 for m in matching_table if m["match"] == "YES"),
        "matched_partial": sum(1 for m in matching_table if m["match"] == "PARTIAL"),
        "matched_no": sum(1 for m in matching_table if m["match"] == "NO")
    }
    
    output = {
        "stats": stats,
        "matching_table": matching_table
    }
    
    # Sauvegarder
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"Matching generated: {OUTPUT_FILE}")
    print(f"Stats:")
    print(f"  Total calls: {stats['total_frontend_calls']}")
    print(f"  Matched YES: {stats['matched_yes']}")
    print(f"  Matched PARTIAL: {stats['matched_partial']}")
    print(f"  Matched NO: {stats['matched_no']}")

if __name__ == "__main__":
    main()

