import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Globe,
  Menu
} from 'lucide-react';

/**
 * Topbar - Barre supérieure du dashboard CRM
 * Design: HubSpot/Salesforce style
 * 
 * Features:
 * - Breadcrumb dynamique
 * - Recherche globale
 * - Sélecteur de langue
 * - Avatar utilisateur + menu dropdown
 * - Notifications
 */
const Topbar = ({ onToggleSidebar }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Récupérer les infos utilisateur depuis localStorage ou API
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getBreadcrumb = () => {
    const path = location.pathname;
    const segments = [];
    
    segments.push({ label: t('crm.breadcrumb.home', 'Accueil'), path: '/admin/crm/dashboard' });
    
    if (path.includes('/leads')) {
      segments.push({ label: t('crm.nav.leads', 'Prospects'), path: '/admin/crm/leads' });
    } else if (path.includes('/contacts')) {
      segments.push({ label: t('crm.nav.contacts', 'Contacts'), path: '/admin/crm/contacts' });
    } else if (path.includes('/opportunities')) {
      segments.push({ label: t('crm.nav.opportunities', 'Opportunités'), path: '/admin/crm/opportunities' });
    } else if (path.includes('/pipeline')) {
      segments.push({ label: t('crm.nav.pipeline', 'Pipeline'), path: '/admin/crm/pipeline' });
    } else if (path.includes('/activities')) {
      segments.push({ label: t('crm.nav.activities', 'Activités'), path: '/admin/crm/activities' });
    } else if (path.includes('/emails')) {
      segments.push({ label: t('crm.nav.emails', 'Emails'), path: '/admin/crm/emails' });
    } else if (path.includes('/users')) {
      segments.push({ label: t('crm.nav.users', 'Utilisateurs'), path: '/admin/crm/users' });
    } else if (path.includes('/settings')) {
      segments.push({ label: t('crm.nav.settings', 'Paramètres'), path: '/admin/crm/settings' });
    }
    
    return segments;
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLangMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const breadcrumb = getBreadcrumb();
  const currentLang = i18n.language || 'fr';

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
      {/* Left: Breadcrumb */}
      <div className="flex items-center space-x-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center space-x-2 text-sm">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={item.path}>
              {index > 0 && (
                <span className="text-gray-400">/</span>
              )}
              <button
                onClick={() => navigate(item.path)}
                className={`
                  ${index === breadcrumb.length - 1
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Global Search */}
      <div className="hidden lg:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('crm.search.placeholder', 'Rechercher...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-4">
        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center space-x-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 uppercase">{currentLang}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => changeLanguage('fr')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Français</span>
                {currentLang === 'fr' && <span className="text-blue-600">✓</span>}
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
              >
                <span>English</span>
                {currentLang === 'en' && <span className="text-blue-600">✓</span>}
              </button>
              <button
                onClick={() => changeLanguage('he')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
              >
                <span>עברית</span>
                {currentLang === 'he' && <span className="text-blue-600">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900">
                {user?.name || t('crm.user.admin', 'Administrateur')}
              </div>
              <div className="text-xs text-gray-500">
                {user?.role === 'admin' ? t('crm.role.admin', 'Admin') : t('crm.role.commercial', 'Commercial')}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('crm.user.logout', 'Déconnexion')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
