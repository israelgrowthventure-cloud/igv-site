"""
Tests de Production - Phase 6 ter
==================================

Tests renforcés pour vérifier que les pages publiques affichent bien
le design riche restauré (version Phase 4/5), et non une version simplifiée.

Ces tests utilisent des MARQUEURS SPÉCIFIQUES qui n'existent que dans la version riche
et sont absents de la version simplifiée.
"""

import requests
import sys
from datetime import datetime

# URLs à tester
FRONTEND_URL = "https://israelgrowthventure.com"
BACKEND_URL = "https://igv-cms-backend.onrender.com"

# Couleurs pour l'affichage
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_header(text):
    """Affiche un en-tête formaté"""
    print(f"\n{Colors.BLUE}{'=' * 70}{Colors.RESET}")
    print(f"{Colors.BLUE}{text.center(70)}{Colors.RESET}")
    print(f"{Colors.BLUE}{'=' * 70}{Colors.RESET}\n")

def print_test(name, passed, details=""):
    """Affiche le résultat d'un test"""
    status = f"{Colors.GREEN}✅ PASS{Colors.RESET}" if passed else f"{Colors.RED}❌ FAIL{Colors.RESET}"
    print(f"{status} - {name}")
    if details and not passed:
        print(f"     {Colors.YELLOW}{details}{Colors.RESET}")

class ProductionTester:
    def __init__(self):
        self.results = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'IGV-Test-Phase6ter/1.0'
        })
    
    def add_result(self, test_name, passed, details=""):
        """Enregistre le résultat d'un test"""
        self.results.append({
            'name': test_name,
            'passed': passed,
            'details': details
        })
        print_test(test_name, passed, details)
    
    def test_backend_health(self):
        """Test 1: Vérifier que le backend est opérationnel"""
        try:
            r = self.session.get(f"{BACKEND_URL}/api/health", timeout=10)
            passed = r.status_code == 200
            details = f"Status: {r.status_code}" if not passed else ""
            self.add_result("Backend Health Check", passed, details)
            return passed
        except Exception as e:
            self.add_result("Backend Health Check", False, str(e))
            return False
    
    def test_home_rich_content(self):
        """Test 2: Vérifier que le CMS contient le design RICHE pour la home"""
        try:
            # Tester l'API CMS directement (car le frontend est une SPA React)
            r = self.session.get(f"{BACKEND_URL}/api/pages/home", timeout=10)
            
            # Vérifications de base
            if r.status_code != 200:
                self.add_result("Home CMS - Design Riche", False, f"Status {r.status_code}")
                return False
            
            data = r.json()
            html = data.get('content_html', '').lower()
            
            # MARQUEURS SPÉCIFIQUES du design RICHE (absents de la version simplifiée)
            rich_markers = [
                "développez votre activité en israël",  # Titre hero riche
                "pourquoi choisir igv",  # Section absente de la version simple
                "expertise locale",  # Carte de la section "Pourquoi IGV"
                "accompagnement complet",  # Carte de la section "Pourquoi IGV"
                "réseau étendu",  # Carte de la section "Pourquoi IGV"
                "pack analyse",  # Pack détaillé (pas juste "stratégie d'implantation")
                "pack succursales",  # Pack détaillé
                "pack franchise",  # Pack détaillé
                "étude de marché détaillée",  # Point spécifique du Pack Analyse
                "prêt à vous lancer",  # Section CTA finale
                "découvrir nos packs",  # Bouton CTA hero
            ]
            
            # MARQUEURS de la version SIMPLIFIÉE (ne doivent PAS être présents seuls)
            # Note: "stratégie" peut apparaître dans "recommandations stratégiques"
            simple_markers_strict = [
                "réseau b2b",  # Carte simple (absente du design riche)
                "développement commercial",  # Carte simple (absente du design riche)
            ]
            
            missing_rich = [m for m in rich_markers if m not in html]
            present_simple = [m for m in simple_markers_strict if m in html]
            
            if missing_rich:
                details = f"Marqueurs RICHES manquants: {', '.join(missing_rich[:3])}"
                self.add_result("Home CMS - Design Riche", False, details)
                return False
            
            if present_simple:
                details = f"Marqueurs SIMPLIFIÉS détectés: {', '.join(present_simple)}"
                self.add_result("Home CMS - Design Riche", False, details)
                return False
            
            # Vérifier la longueur du contenu (version riche > 9000 chars)
            if len(html) < 9000:
                details = f"Contenu CMS trop court: {len(html)} chars (attendu > 9000)"
                self.add_result("Home CMS - Design Riche", False, details)
                return False
            
            self.add_result("Home CMS - Design Riche", True)
            return True
            
        except Exception as e:
            self.add_result("Home CMS - Design Riche", False, str(e))
            return False
    
    def test_page_accessibility(self, path, page_name, min_length=2000):
        """Test générique: Vérifier qu'une page est accessible et non vide"""
        try:
            r = self.session.get(f"{FRONTEND_URL}{path}", timeout=10)
            
            if r.status_code != 200:
                self.add_result(f"{page_name} - Accessibilité", False, f"Status {r.status_code}")
                return False
            
            if len(r.text) < min_length:
                self.add_result(f"{page_name} - Accessibilité", False, 
                              f"Contenu trop court: {len(r.text)} chars")
                return False
            
            self.add_result(f"{page_name} - Accessibilité", True)
            return True
            
        except Exception as e:
            self.add_result(f"{page_name} - Accessibilité", False, str(e))
            return False
    
    def test_monetico_endpoint(self):
        """Test: Vérifier que l'endpoint Monetico répond proprement (503 ou 200, jamais 500)"""
        try:
            payload = {
                "pack": "analyse",
                "amount": 3000.0,
                "currency": "EUR",
                "customer_email": "test@example.com",
                "customer_name": "Test User",
                "order_reference": "TEST-001"
            }
            
            r = self.session.post(f"{BACKEND_URL}/api/payments/monetico/init", 
                                 json=payload, timeout=10)
            
            # Accepter 503 (non configuré) ou 200 (configuré), mais PAS 500
            if r.status_code == 500:
                self.add_result("Monetico Endpoint - Pas de 500", False, 
                              "Erreur 500 détectée (devrait être 503 si non configuré)")
                return False
            
            if r.status_code not in [200, 503]:
                self.add_result("Monetico Endpoint - Pas de 500", False, 
                              f"Status inattendu: {r.status_code}")
                return False
            
            self.add_result("Monetico Endpoint - Pas de 500", True)
            return True
            
        except Exception as e:
            self.add_result("Monetico Endpoint - Pas de 500", False, str(e))
            return False
    
    def run_all_tests(self):
        """Exécute tous les tests"""
        print_header("TESTS DE PRODUCTION - PHASE 6 TER")
        print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}")
        print(f"Frontend: {FRONTEND_URL}")
        print(f"Backend: {BACKEND_URL}")
        
        # Tests backend
        print_header("1. BACKEND - Santé et Endpoints")
        self.test_backend_health()
        self.test_monetico_endpoint()
        
        # Tests pages publiques - Home avec vérification design riche
        print_header("2. PAGES PUBLIQUES - Design Riche Restauré")
        self.test_home_rich_content()
        
        # Tests pages publiques - Accessibilité autres pages
        print_header("3. PAGES PUBLIQUES - Accessibilité")
        self.test_page_accessibility("/qui-sommes-nous", "Qui Sommes-Nous")
        self.test_page_accessibility("/packs", "Packs")
        self.test_page_accessibility("/le-commerce-de-demain", "Commerce de Demain")
        self.test_page_accessibility("/contact", "Contact")
        self.test_page_accessibility("/etude-implantation-360", "Étude 360°")
        self.test_page_accessibility("/etude-implantation-360/merci", "Merci Étude 360°", min_length=1500)
        
        # Résumé
        self.print_summary()
    
    def print_summary(self):
        """Affiche le résumé des tests"""
        print_header("RÉSUMÉ DES TESTS")
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r['passed'])
        failed = total - passed
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"Total: {total} tests")
        print(f"{Colors.GREEN}Passed: {passed} ✅{Colors.RESET}")
        if failed > 0:
            print(f"{Colors.RED}Failed: {failed} ❌{Colors.RESET}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if failed > 0:
            print(f"\n{Colors.YELLOW}Tests échoués:{Colors.RESET}")
            for r in self.results:
                if not r['passed']:
                    print(f"  - {r['name']}")
                    if r['details']:
                        print(f"    {r['details']}")
        
        print("\n" + "=" * 70)
        
        success = success_rate == 100
        
        if success:
            print(f"{Colors.GREEN}🎉 TOUS LES TESTS SONT VERTS !{Colors.RESET}")
            print(f"{Colors.GREEN}Le design riche est bien restauré en production.{Colors.RESET}")
        else:
            print(f"{Colors.RED}⚠️  Certains tests ont échoué.{Colors.RESET}")
            print(f"{Colors.RED}Le déploiement nécessite des corrections.{Colors.RESET}")
        
        return success


def main():
    """Fonction principale"""
    tester = ProductionTester()
    all_passed = tester.run_all_tests()
    
    # Code de sortie: 0 si tous les tests passent, 1 sinon
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
