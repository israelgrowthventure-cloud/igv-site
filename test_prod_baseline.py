#!/usr/bin/env python3
"""Test baseline PROD - État actuel avant sortie Rescue Mode"""
import requests
import json
from datetime import datetime, timezone

def test_endpoint(url, method="GET", headers=None):
    """Test un endpoint et retourne les détails"""
    try:
        response = requests.request(method, url, headers=headers, timeout=10)
        return {
            "url": url,
            "status": response.status_code,
            "ok": response.ok,
            "content_length": len(response.content),
            "headers": dict(response.headers),
            "body_preview": response.text[:500] if response.text else None
        }
    except Exception as e:
        return {
            "url": url,
            "error": str(e),
            "ok": False
        }

def main():
    print("=" * 80)
    print("TEST BASELINE PROD - État actuel")
    print(f"Date UTC: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 80)
    
    endpoints = [
        "https://israelgrowthventure.com",
        "https://igv-cms-backend.onrender.com/api/health",
        "https://igv-cms-backend.onrender.com/api/cms/pages",
        "https://igv-cms-backend.onrender.com/api/crm/leads",
        "https://igv-cms-backend.onrender.com/api/auth/status",
    ]
    
    results = []
    for url in endpoints:
        print(f"\nTestant: {url}")
        result = test_endpoint(url)
        results.append(result)
        
        if result.get("ok"):
            print(f"  ✓ Status: {result['status']}")
            print(f"  ✓ Content: {result['content_length']} bytes")
        else:
            if "error" in result:
                print(f"  ✗ Erreur: {result['error']}")
            else:
                print(f"  ✗ Status: {result.get('status', 'N/A')}")
    
    print("\n" + "=" * 80)
    print("RÉSUMÉ")
    print("=" * 80)
    
    for r in results:
        status_str = f"{r['status']}" if r.get("ok") is not None else "ERROR"
        symbol = "✓" if r.get("ok") else "✗"
        print(f"{symbol} {r['url']} → {status_str}")
    
    # Sauvegarde JSON
    with open("baseline_prod_results.json", "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "results": results
        }, f, indent=2, ensure_ascii=False)
    
    print("\n✓ Résultats sauvegardés dans baseline_prod_results.json")

if __name__ == "__main__":
    main()
