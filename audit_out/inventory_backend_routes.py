"""
Script d'inventaire des routes FastAPI backend
Génère audit_out/backend_routes.json
"""
import re
import json
import os
from pathlib import Path
from typing import List, Dict

import requests

# Déterminer le chemin absolu du workspace
WORKSPACE_DIR = Path(__file__).parent.parent
BACKEND_DIR = WORKSPACE_DIR / "backend"
OUTPUT_FILE = Path(__file__).parent / "backend_routes.json"
DEFAULT_BACKEND_BASE = os.getenv("BACKEND_BASE_URL", "https://igv-cms-backend.onrender.com")

def extract_routes_from_file(file_path: Path) -> List[Dict]:
    """Extrait toutes les routes d'un fichier Python"""
    file_routes = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return []
    
    # Détecter le prefix du router
    router_prefix = None
    router_name = None
    
    # Chercher APIRouter
    router_match = re.search(r'router\s*=\s*APIRouter\([^)]*prefix\s*=\s*["\']([^"\']+)["\']', content)
    if router_match:
        router_prefix = router_match.group(1)
        router_name = "router"
    else:
        # Chercher autre nom de router
        router_match = re.search(r'(\w+)\s*=\s*APIRouter\(', content)
        if router_match:
            router_name = router_match.group(1)
            router_prefix_match = re.search(rf'{re.escape(router_name)}\s*=\s*APIRouter\([^)]*prefix\s*=\s*["\']([^"\']+)["\']', content)
            if router_prefix_match:
                router_prefix = router_prefix_match.group(1)
    
    # Chercher les décorateurs de routes
    # Pattern: @router.get/post/put/delete/patch("path", ...)
    pattern = r'@(\w+)\.(get|post|put|delete|patch)\(["\']([^"\']+)["\']'
    
    for line_num, line in enumerate(lines, 1):
        match = re.search(pattern, line)
        if match:
            router_var = match.group(1)
            method = match.group(2).upper()
            path = match.group(3)
            
            # Chercher la fonction suivante
            func_name = None
            auth_deps = []
            
            # Chercher la définition de fonction (dans les prochaines lignes)
            for next_line_num in range(line_num, min(line_num + 10, len(lines))):
                func_match = re.search(r'async\s+def\s+(\w+)', lines[next_line_num])
                if func_match:
                    func_name = func_match.group(1)
                    # Chercher les dépendances dans la signature
                    sig_match = re.search(r'async\s+def\s+\w+\([^)]*\)', lines[next_line_num])
                    if sig_match:
                        sig = sig_match.group(0)
                        # Chercher Depends(...)
                        deps = re.findall(r'Depends\(([^)]+)\)', sig)
                        auth_deps = deps
                    break
            
            # Construire le path complet
            full_path = path
            if router_prefix and not path.startswith(router_prefix):
                full_path = router_prefix + path
            
            route_info = {
                "file": f"backend/{file_path.name}",
                "line": line_num,
                "method": method,
                "path": full_path,
                "function": func_name or "unknown",
                "auth": auth_deps,
                "router_var": router_var
            }
            file_routes.append(route_info)
    
    return file_routes


def extract_routes_local() -> List[Dict]:
    """Fallback: parse local backend files when OpenAPI is unavailable."""
    collected: List[Dict] = []
    backend_path = BACKEND_DIR.resolve()
    if not backend_path.exists():
        print(f"Error: {backend_path} does not exist")
        return collected

    python_files = list(backend_path.glob("*.py"))
    print(f"Scanning {len(python_files)} Python files in backend/... (fallback mode)")

    for py_file in python_files:
        if py_file.name == "__init__.py":
            continue
        file_routes = extract_routes_from_file(py_file)
        collected.extend(file_routes)
        print(f"  {py_file.name}: {len(file_routes)} routes")
    return collected


def fetch_routes_from_openapi(base_url: str) -> List[Dict]:
    """Prefer OpenAPI introspection from the running backend service."""
    openapi_url = f"{base_url.rstrip('/')}/openapi.json"
    print(f"Fetching OpenAPI from {openapi_url} ...")
    resp = requests.get(openapi_url, timeout=20)
    resp.raise_for_status()
    data = resp.json()
    collected: List[Dict] = []

    for path, methods in data.get("paths", {}).items():
        for method, meta in methods.items():
            method_upper = method.upper()
            if method_upper not in ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]:
                continue
            collected.append({
                "file": "openapi",
                "line": 0,
                "method": method_upper,
                "path": path,
                "function": meta.get("operationId", "unknown"),
                "auth": meta.get("security", []),
                "router_var": "openapi"
            })
    print(f"OpenAPI routes collected: {len(collected)}")
    return collected


def main(base_url: str = None):
    backend_base = (base_url or os.getenv("BACKEND_BASE_URL") or DEFAULT_BACKEND_BASE).rstrip("/")

    try:
        routes = fetch_routes_from_openapi(backend_base)
    except Exception as e:
        print(f"OpenAPI fetch failed ({type(e).__name__}: {e}). Falling back to local parsing.")
        routes = extract_routes_local()

    routes.sort(key=lambda x: (x["file"], x["line"]))

    output = {
        "total_routes": len(routes),
        "routes": routes,
        "stats_by_method": {},
        "stats_by_file": {}
    }

    for route in routes:
        method = route["method"]
        output["stats_by_method"][method] = output["stats_by_method"].get(method, 0) + 1

    for route in routes:
        file = route["file"]
        output["stats_by_file"][file] = output["stats_by_file"].get(file, 0) + 1

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\nTotal routes found: {len(routes)}")
    print(f"Output saved to: {OUTPUT_FILE}")
    print(f"\nStats by method:")
    for method, count in sorted(output["stats_by_method"].items()):
        print(f"  {method}: {count}")

if __name__ == "__main__":
    main()

