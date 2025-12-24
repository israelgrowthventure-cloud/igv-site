"""
Test Suite - Post-Deployment Verification
Mission: Prouver que toutes les fonctionnalités marchent en prod
"""

import httpx
import asyncio
import json
from datetime import datetime

BACKEND_URL = "https://igv-cms-backend.onrender.com"

async def test_quota_handling():
    """
    TEST A: Quota Gemini - HTTP 429 + JSON multilang
    """
    print("\n" + "="*60)
    print("TEST A: QUOTA GEMINI HANDLING")
    print("="*60)
    
    # Note: This will work only if quota is actually exceeded
    # For testing, we'll verify the endpoint structure
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{BACKEND_URL}/api/mini-analysis",
                json={
                    "email": "quota-test@igv.com",
                    "nom_de_marque": "QuotaTestBrand",
                    "secteur": "Services",
                    "language": "fr"
                }
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Headers: {dict(response.headers)}")
            print(f"Response: {response.json()}")
            
            if response.status_code == 429:
                data = response.json()
                assert "error_code" in data
                assert data["error_code"] == "GEMINI_QUOTA_DAILY"
                assert "message" in data
                assert "fr" in data["message"]
                assert "en" in data["message"]
                assert "he" in data["message"]
                assert "Retry-After" in response.headers
                print("✅ Quota handling: PASS")
            elif response.status_code == 200:
                print("⚠️ Quota not exceeded - test skipped (normal if quota available)")
            else:
                print(f"❌ Unexpected status: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")


async def test_crm_health():
    """
    TEST B: CRM Health Check
    """
    print("\n" + "="*60)
    print("TEST B: CRM HEALTH CHECK")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(f"{BACKEND_URL}/api/health/crm")
            
            print(f"Status Code: {response.status_code}")
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            assert response.status_code == 200
            assert "status" in data
            assert data["status"] in ["ok", "degraded"]
            assert "db_connected" in data
            
            if data["status"] == "ok":
                print("✅ CRM Health: PASS")
            else:
                print("⚠️ CRM degraded but responding")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")


async def test_lead_creation():
    """
    TEST C: Lead Auto-Creation
    """
    print("\n" + "="*60)
    print("TEST C: LEAD AUTO-CREATION")
    print("="*60)
    
    test_email = f"lead-test-{datetime.now().strftime('%Y%m%d%H%M%S')}@igv.com"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Create mini-analysis request (triggers lead creation)
            response = await client.post(
                f"{BACKEND_URL}/api/mini-analysis",
                json={
                    "email": test_email,
                    "nom_de_marque": "LeadTestBrand",
                    "secteur": "Retail (hors food)",
                    "language": "en"
                }
            )
            
            print(f"Mini-Analysis Status: {response.status_code}")
            
            if response.status_code in [200, 409, 429]:
                # Check if lead was created
                await asyncio.sleep(2)  # Wait for lead to be saved
                
                leads_response = await client.get(
                    f"{BACKEND_URL}/api/admin/leads?limit=10"
                )
                
                print(f"Leads Status: {leads_response.status_code}")
                
                if leads_response.status_code == 200:
                    leads_data = leads_response.json()
                    print(f"Total leads: {leads_data.get('total', 0)}")
                    
                    # Check if our test lead exists
                    found = False
                    for lead in leads_data.get("leads", []):
                        if lead.get("email") == test_email:
                            found = True
                            print(f"✅ Lead found: {json.dumps(lead, indent=2)}")
                            break
                    
                    if found:
                        print("✅ Lead Creation: PASS")
                    else:
                        print("⚠️ Lead not found (may need more time)")
                else:
                    print("⚠️ Could not verify leads (admin endpoint)")
            else:
                print(f"❌ Mini-analysis failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")


async def test_visit_tracking():
    """
    TEST D: Visit Tracking
    """
    print("\n" + "="*60)
    print("TEST D: VISIT TRACKING")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # Test with consent
            response = await client.post(
                f"{BACKEND_URL}/api/track/visit",
                json={
                    "page": "/fr/mini-analyse",
                    "referrer": "https://google.com",
                    "language": "fr",
                    "utm_source": "test-script",
                    "utm_medium": "automation",
                    "utm_campaign": "post-deploy-test",
                    "consent_analytics": True
                }
            )
            
            print(f"Status Code: {response.status_code}")
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            assert response.status_code == 200
            assert data["status"] == "tracked"
            assert "visit_id" in data
            
            print("✅ Visit Tracking (with consent): PASS")
            
            # Test without consent
            response_no_consent = await client.post(
                f"{BACKEND_URL}/api/track/visit",
                json={
                    "page": "/fr/mini-analyse",
                    "consent_analytics": False
                }
            )
            
            data_no_consent = response_no_consent.json()
            print(f"Without consent: {json.dumps(data_no_consent, indent=2)}")
            
            assert data_no_consent["status"] == "skipped"
            assert data_no_consent["reason"] == "no_consent"
            
            print("✅ Visit Tracking (no consent): PASS")
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")


async def test_stats_endpoints():
    """
    TEST E: Stats Dashboard Endpoints
    """
    print("\n" + "="*60)
    print("TEST E: STATS DASHBOARD")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # Visit stats
            response_visits = await client.get(
                f"{BACKEND_URL}/api/admin/stats/visits?range=7d"
            )
            
            print(f"Visit Stats Status: {response_visits.status_code}")
            
            if response_visits.status_code == 200:
                visits_data = response_visits.json()
                print(f"Visit Stats: {json.dumps(visits_data, indent=2)}")
                
                assert "total_visits" in visits_data
                assert "total_analyses" in visits_data
                assert "conversion_rate" in visits_data
                
                print("✅ Visit Stats: PASS")
            
            # Lead stats
            response_leads = await client.get(
                f"{BACKEND_URL}/api/admin/stats/leads?range=7d"
            )
            
            print(f"\nLead Stats Status: {response_leads.status_code}")
            
            if response_leads.status_code == 200:
                leads_data = response_leads.json()
                print(f"Lead Stats: {json.dumps(leads_data, indent=2)}")
                
                assert "by_status" in leads_data
                assert "by_sector" in leads_data
                assert "by_language" in leads_data
                
                print("✅ Lead Stats: PASS")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")


async def main():
    """
    Run all tests
    """
    print("\n" + "="*60)
    print("POST-DEPLOYMENT TEST SUITE")
    print(f"Backend: {BACKEND_URL}")
    print(f"Time: {datetime.now().isoformat()}")
    print("="*60)
    
    await test_crm_health()
    await test_visit_tracking()
    await test_stats_endpoints()
    await test_lead_creation()
    await test_quota_handling()  # Last (may trigger quota)
    
    print("\n" + "="*60)
    print("TEST SUITE COMPLETED")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(main())
