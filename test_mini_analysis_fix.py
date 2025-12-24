"""Test mini-analysis endpoint post-fix"""
import requests
import json
import time

BACKEND_URL = "https://igv-cms-backend.onrender.com"

def test_mini_analysis():
    """Test /api/mini-analysis with unique brand"""
    
    timestamp = int(time.time())
    brand = f"TestFix{timestamp}"
    
    payload = {
        "email": "test@example.com",
        "nom_de_marque": brand,
        "secteur": "Retail non-food",
        "pays_origine": "France",
        "language": "fr"
    }
    
    print(f"Testing /api/mini-analysis with brand: {brand}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print("\nSending request...")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/mini-analysis",
            json=payload,
            timeout=60
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Headers:")
        for key, value in response.headers.items():
            if 'igv' in key.lower() or 'lang' in key.lower():
                print(f"  {key}: {value}")
        
        print(f"\nResponse Body:")
        try:
            data = response.json()
            print(json.dumps(data, indent=2, ensure_ascii=False)[:1000])
        except:
            print(response.text[:1000])
        
        if response.status_code == 200:
            print("\n✅ SUCCESS - Mini-analysis generated")
            return True
        else:
            print(f"\n❌ FAILED - Status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_mini_analysis()
