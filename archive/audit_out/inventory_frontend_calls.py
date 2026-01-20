"""
Script d'inventaire des appels API frontend
Génère audit_out/frontend_calls.json
"""
import re
import json
import os
from pathlib import Path
from typing import List, Dict

WORKSPACE_DIR = Path(__file__).parent.parent
FRONTEND_DIR = WORKSPACE_DIR / "frontend" / "src"
OUTPUT_FILE = Path(__file__).parent / "frontend_calls.json"

calls = []

def extract_api_calls_from_file(file_path: Path) -> List[Dict]:
    """Extrait tous les appels API d'un fichier JavaScript/JSX/TS/TSX"""
    file_calls = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return []
    
    # Pattern pour axios.get/post/put/delete
    axios_pattern = r'(?:axios|api)\.(get|post|put|delete|patch)\(["\']([^"\']+)["\']'
    
    # Pattern pour fetch
    fetch_pattern = r'fetch\(["\']([^"\']+)["\']'
    
    # Pattern pour api.get/post/put/delete (méthode indirecte)
    api_method_pattern = r'(?:api|axios)\.(get|post|put|delete|patch)\(`([^`]+)`'
    
    relative_path = file_path.relative_to(FRONTEND_DIR.parent)
    
    for line_num, line in enumerate(lines, 1):
        # Chercher axios calls
        for match in re.finditer(axios_pattern, line):
            method = match.group(1).upper()
            url = match.group(2)
            file_calls.append({
                "file": str(relative_path),
                "line": line_num,
                "method": method,
                "url_template": url,
                "call_type": "axios",
                "module": extract_module_from_path(relative_path)
            })
        
        # Chercher fetch calls
        for match in re.finditer(fetch_pattern, line):
            url = match.group(1)
            # Déduire la méthode (par défaut GET, mais peut être dans les options)
            method = "GET"
            # Chercher method dans les options (ligne suivante possible)
            if line_num < len(lines):
                method_match = re.search(r'method\s*:\s*["\'](\w+)["\']', lines[line_num-1:min(line_num+5, len(lines))])
                if method_match:
                    method = method_match.group(1).upper()
            
            file_calls.append({
                "file": str(relative_path),
                "line": line_num,
                "method": method,
                "url_template": url,
                "call_type": "fetch",
                "module": extract_module_from_path(relative_path)
            })
        
        # Chercher template literals (backticks)
        for match in re.finditer(api_method_pattern, line):
            method = match.group(1).upper()
            url = match.group(2)
            file_calls.append({
                "file": str(relative_path),
                "line": line_num,
                "method": method,
                "url_template": url,
                "call_type": "axios_template",
                "module": extract_module_from_path(relative_path)
            })
    
    return file_calls

def extract_module_from_path(path: Path) -> str:
    """Déduit le module/écran depuis le chemin du fichier"""
    parts = path.parts
    if "pages" in parts:
        page_idx = parts.index("pages")
        if page_idx + 1 < len(parts):
            return f"Pages/{parts[page_idx + 1]}"
    elif "components" in parts:
        comp_idx = parts.index("components")
        if comp_idx + 1 < len(parts):
            return f"Components/{parts[comp_idx + 1]}"
    elif "utils" in parts:
        return "Utils/API"
    elif "hooks" in parts:
        return "Hooks"
    return "Other"

def main():
    if not FRONTEND_DIR.exists():
        print(f"Error: {FRONTEND_DIR} does not exist")
        return
    
    # Fichiers JS/JSX/TS/TSX dans frontend/src/
    extensions = ["*.js", "*.jsx", "*.ts", "*.tsx"]
    source_files = []
    for ext in extensions:
        source_files.extend(list(FRONTEND_DIR.rglob(ext)))
    
    print(f"Scanning {len(source_files)} source files in frontend/src/...")
    
    for src_file in source_files:
        file_calls = extract_api_calls_from_file(src_file)
        calls.extend(file_calls)
        if file_calls:
            print(f"  {src_file.relative_to(FRONTEND_DIR.parent)}: {len(file_calls)} calls")
    
    # Trier par fichier et ligne
    calls.sort(key=lambda x: (x["file"], x["line"]))
    
    # Générer JSON
    output = {
        "total_calls": len(calls),
        "calls": calls,
        "stats_by_method": {},
        "stats_by_module": {}
    }
    
    # Stats par méthode
    for call in calls:
        method = call["method"]
        output["stats_by_method"][method] = output["stats_by_method"].get(method, 0) + 1
    
    # Stats par module
    for call in calls:
        module = call["module"]
        output["stats_by_module"][module] = output["stats_by_module"].get(module, 0) + 1
    
    # Sauvegarder
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\nTotal API calls found: {len(calls)}")
    print(f"Output saved to: {OUTPUT_FILE}")
    print(f"\nStats by method:")
    for method, count in sorted(output["stats_by_method"].items()):
        print(f"  {method}: {count}")

if __name__ == "__main__":
    main()

