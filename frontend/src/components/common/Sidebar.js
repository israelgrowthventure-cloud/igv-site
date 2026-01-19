import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Target,
  BarChart3,
  Activity,
  Mail,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  Palette
} from 'lucide-react';
import CmsAdminButton from '../CmsAdminButton';

/**
 * Sidebar - Navigation principale du CRM
 * Design: HubSpot/Salesforce style
 * 
 * Features:
 * - Navigation avec icônes + labels
 * - Active state highlighting
 * - Collapse/expand
 * - Responsive (auto-collapse sur mobile)
 */
const Sidebar = ({ collapsed, onToggle }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'dashboard', path: '/admin/crm/dashboard', icon: LayoutDashboard, label: t('crm.nav.dashboard', 'Tableau de bord') },
    { id: 'leads', path: '/admin/crm/leads', icon: Users, label: t('crm.nav.leads', 'Prospects') },
    { id: 'contacts', path: '/admin/crm/contacts', icon: UserCheck, label: t('crm.nav.contacts', 'Contacts') },
    { id: 'opportunities', path: '/admin/crm/opportunities', icon: Target, label: t('crm.nav.opportunities', 'Opportunités') },
    { id: 'pipeline', path: '/admin/crm/pipeline', icon: BarChart3, label: t('crm.nav.pipeline', 'Pipeline') },
    { id: 'activities', path: '/admin/crm/activities', icon: Activity, label: t('crm.nav.activities', 'Activités') },
    { id: 'emails', path: '/admin/crm/emails', icon: Mail, label: t('crm.nav.emails', 'Emails') },
    { id: 'users', path: '/admin/crm/users', icon: UserCog, label: t('crm.nav.users', 'Utilisateurs'), adminOnly: true },
    { id: 'settings', path: '/admin/crm/settings', icon: Settings, label: t('crm.nav.settings', 'Paramètres') }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div 
      className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo + Company Name */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <img 
              src="/igv-logo.png" 
              alt="IGV Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="font-semibold text-sm">Israel Growth Venture</span>
          </div>
        )}
        {collapsed && (
          <img 
            src="/igv-logo.png" 
            alt="IGV" 
            className="w-10 h-10 object-contain mx-auto"
          />
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.id}>
                <button
                  data-testid={`nav-${item.id}`}
                  data-nav-item={item.id}
                  onClick={() => {
                    // Force navigation even if already on the same path
                    // This triggers useEffect in LeadsPage to reset selectedItem
                    if (location.pathname === item.path) {
                      // Dispatch custom event for pages to listen
                      window.dispatchEvent(new CustomEvent('resetLeadView'));
                      navigate(item.path, { replace: true });
                    } else {
                      navigate(item.path);
                    }
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors
                    ${active 
                      ? 'bg-blue-600 text-white border-l-4 border-blue-400' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  title={collapsed ? item.label : ''}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* CMS Admin Button - Wix-style embeddable */}
      <div className="px-2 pb-2">
        <CmsAdminButton collapsed={collapsed} />
      </div>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
          title={collapsed ? t('crm.sidebar.expand', 'Développer') : t('crm.sidebar.collapse', 'Réduire')}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">{t('crm.sidebar.collapse', 'Réduire')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
