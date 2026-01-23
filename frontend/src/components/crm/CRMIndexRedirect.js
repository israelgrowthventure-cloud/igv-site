import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * CRMIndexRedirect - Handles legacy ?tab= URLs and redirects to new routes
 * 
 * Legacy URLs:
 * - /admin/crm?tab=leads → /admin/crm/leads
 * - /admin/crm?tab=contacts → /admin/crm/contacts
 * - /admin/crm?tab=pipeline → /admin/crm/pipeline
 * - /admin/crm?tab=opportunities → /admin/crm/opportunities
 * - /admin/crm?tab=emails → /admin/crm/emails
 * - /admin/crm?tab=activities → /admin/crm/activities
 * - /admin/crm?tab=users → /admin/crm/users
 * - /admin/crm?tab=settings → /admin/crm/settings
 * - /admin/crm?tab=dashboard → /admin/crm/dashboard
 * - /admin/crm (no tab) → /admin/crm/dashboard
 */
export default function CRMIndexRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    
    const validTabs = [
      'dashboard', 'leads', 'contacts', 'users', 
      'opportunities', 'pipeline', 'emails', 'activities', 'settings'
    ];
    
    if (tab && validTabs.includes(tab)) {
      navigate(`/admin/crm/${tab}`, { replace: true });
    } else {
      navigate('/admin/crm/dashboard', { replace: true });
    }
  }, [navigate, location.search]);

  return null;
}
