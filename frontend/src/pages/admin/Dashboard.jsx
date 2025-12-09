import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pagesAPI, packsAPI, ordersAPI } from '../../utils/api';
import { FileText, Package, DollarSign, Settings, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pages: 0,
    packs: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('igv_token');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadStats = async () => {
    try {
      // Use Promise.allSettled to prevent 403 errors from breaking stats
      const results = await Promise.allSettled([
        pagesAPI.getAll(),
        packsAPI.getAll(),
        ordersAPI.getAll(),
      ]);
      
      // Extract successful results
      const pagesRes = results[0].status === 'fulfilled' ? results[0].value : { data: [] };
      const packsRes = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
      const ordersRes = results[2].status === 'fulfilled' ? results[2].value : { data: [] };
      
      setStats({
        pages: pagesRes.data?.length || 0,
        packs: packsRes.data?.length || 0,
        orders: ordersRes.data?.length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('igv_token');
    localStorage.removeItem('igv_user');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: <FileText size={24} />, title: 'Pages', description: 'Gérer les pages du site', link: '/admin/pages', count: stats.pages },
    { icon: <Package size={24} />, title: 'Packs', description: 'Gérer les packs et offres', link: '/admin/packs', count: stats.packs },
    { icon: <DollarSign size={24} />, title: 'Pricing', description: 'Gérer les règles de prix', link: '/admin/pricing' },
    { icon: <Settings size={24} />, title: 'Translations', description: 'Gérer les traductions', link: '/admin/translations' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">IGV</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CMS Admin</h1>
              <p className="text-sm text-gray-500">Israel Growth Venture</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-5 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 rounded-xl font-medium"
            data-testid="logout-button"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Tableau de Bord</h2>
          <p className="text-lg text-gray-600">Gérez votre site et votre contenu</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-300 transform hover:scale-105 group"
              data-testid={`menu-item-${index}`}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform shadow-lg">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              {item.count !== undefined && (
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {item.count}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Actions Rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/admin/pages/new"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:scale-105"
              data-testid="quick-action-create-page"
            >
              Créer une Page
            </Link>
            <Link
              to="/admin/packs"
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:scale-105"
              data-testid="quick-action-create-pack"
            >
              Gérer les Packs
            </Link>
            <Link
              to="/admin/leads/etude-implantation-360"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:scale-105"
              data-testid="quick-action-leads"
            >
              Leads Étude 360°
            </Link>
            <a
              href="https://israelgrowthventure.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-semibold hover:from-gray-800 hover:to-gray-900 transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:scale-105"
              data-testid="quick-action-view-site"
            >
              Voir le Site
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

