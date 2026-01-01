#!/usr/bin/env python3
"""
Test complet du CRM IGV - Validation finale
Teste toutes les fonctionnalités du CRM en live sur israelgrowthventure.com
"""

import requests
import json
import time
from typing import Dict, Optional

class IGVCRMTester:
    def __init__(self, base_url: str = "https://igv-cms-backend.onrender.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str = ""):
        """Log un résultat de test"""
        status = "✅ PASSED" if success else "❌ FAILED"
        result = f"{status} - {test_name}"
        if message:
            result += f" : {message}"
        print(result)
        self.test_results.append({"test": test_name, "success": success, "message": message})
        
    def test_health(self) -> bool:
        """Test de santé du backend"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            self.log_test("Backend Health Check", success, 
                         f"Status: {data.get('status', 'unknown')}, Service: {data.get('service', 'unknown')}")
            return success
        except Exception as e:
            self.log_test("Backend Health Check", False, str(e))
            return False
            
    def test_admin_login(self, email: str = "admin@igv.com", password: str = "admin123") -> bool:
        """Test de connexion admin"""
        try:
            response = self.session.post(f"{self.base_url}/api/admin/login", 
                                       json={"email": email, "password": password},
                                       timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                self.log_test("Admin Login", True, f"Token received: {self.auth_token[:20]}...")
            else:
                self.log_test("Admin Login", False, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Admin Login", False, str(e))
            return False
    
    def test_crm_routes(self) -> Dict[str, bool]:
        """Test toutes les routes CRM principales"""
        routes_to_test = [
            ("/api/crm/dashboard/stats", "GET", "Dashboard Stats"),
            ("/api/crm/leads", "GET", "Get Leads"),
            ("/api/crm/contacts", "GET", "Get Contacts"),
            ("/api/crm/pipeline", "GET", "Get Pipeline"),
            ("/api/crm/settings/users", "GET", "Get CRM Users"),
            ("/api/crm/settings/tags", "GET", "Get Tags"),
            ("/api/crm/settings/pipeline-stages", "GET", "Get Pipeline Stages"),
        ]
        
        results = {}
        for route, method, name in routes_to_test:
            try:
                if method == "GET":
                    response = self.session.get(f"{self.base_url}{route}", timeout=10)
                else:
                    response = self.session.post(f"{self.base_url}{route}", timeout=10)
                    
                success = response.status_code in [200, 201]
                results[name] = success
                
                if success:
                    try:
                        data = response.json()
                        count = len(data) if isinstance(data, list) else len(data.get('data', [])) if 'data' in data else 'N/A'
                        self.log_test(f"CRM Route - {name}", True, f"Response received, items: {count}")
                    except:
                        self.log_test(f"CRM Route - {name}", True, "Response received")
                else:
                    self.log_test(f"CRM Route - {name}", False, f"Status: {response.status_code}")
                    
            except Exception as e:
                results[name] = False
                self.log_test(f"CRM Route - {name}", False, str(e))
                
        return results
    
    def test_lead_creation(self) -> bool:
        """Test de création d'un lead"""
        test_lead = {
            "email": "test@crm-validation.com",
            "name": "Test CRM Validation",
            "brand": "Test Brand CRM",
            "sector": "Test",
            "status": "NEW",
            "priority": "B",
            "phone": "+33123456789",
            "notes": "Lead créé automatiquement pour validation CRM"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/api/crm/leads", 
                                       json=test_lead, timeout=10)
            success = response.status_code in [200, 201]
            if success:
                data = response.json()
                lead_id = data.get('id') or data.get('_id')
                self.log_test("Lead Creation", True, f"Created with ID: {lead_id}")
                return True
            else:
                self.log_test("Lead Creation", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Lead Creation", False, str(e))
            return False
    
    def test_frontend_availability(self) -> bool:
        """Test de disponibilité du frontend"""
        try:
            response = requests.get("https://israelgrowthventure.com", timeout=10)
            success = response.status_code == 200
            self.log_test("Frontend Availability", success, 
                         f"israelgrowthventure.com accessible: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Frontend Availability", False, str(e))
            return False
    
    def test_crm_frontend(self) -> bool:
        """Test de la page CRM frontend"""
        try:
            response = requests.get("https://israelgrowthventure.com/admin/crm", timeout=10)
            success = response.status_code == 200
            self.log_test("CRM Frontend Page", success, 
                         f"CRM page accessible: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("CRM Frontend Page", False, str(e))
            return False
            
    def run_complete_test(self) -> Dict[str, bool]:
        """Exécute tous les tests CRM"""
        print("🚀 DÉBUT DES TESTS CRM IGV")
        print("="*50)
        
        # Tests de base
        health_ok = self.test_health()
        frontend_ok = self.test_frontend_availability()
        crm_page_ok = self.test_crm_frontend()
        
        if not health_ok:
            print("❌ Backend non disponible - arrêt des tests")
            return self.get_summary()
        
        # Test d'authentification
        login_ok = self.test_admin_login()
        if not login_ok:
            print("❌ Authentification échouée - arrêt des tests CRM")
            return self.get_summary()
        
        # Tests CRM complets
        crm_routes = self.test_crm_routes()
        lead_creation = self.test_lead_creation()
        
        print("\n" + "="*50)
        print("📊 RÉSUMÉ DES TESTS")
        
        return self.get_summary()
    
    def get_summary(self) -> Dict[str, bool]:
        """Retourne un résumé des tests"""
        summary = {}
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total: {total_tests} tests")
        print(f"✅ Réussis: {passed_tests}")
        print(f"❌ Échoués: {failed_tests}")
        
        if failed_tests == 0:
            print("\n🎉 TOUS LES TESTS ONT RÉUSSI !")
            print("✅ OK — tout fonctionne en live")
        else:
            print(f"\n⚠️  {failed_tests} test(s) ont échoué")
            
        return {"total": total_tests, "passed": passed_tests, "failed": failed_tests}

def main():
    """Point d'entrée principal"""
    tester = IGVCRMTester()
    results = tester.run_complete_test()
    
    # Code de sortie basé sur les résultats
    exit_code = 0 if results.get("failed", 0) == 0 else 1
    exit(exit_code)

if __name__ == "__main__":
    main()