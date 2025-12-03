import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pagesAPI, packsAPI, ordersAPI } from 'utils/api';
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
      const [pagesRes, packsRes, ordersRes] = await Promise.all([
        pagesAPI.getAll(),
        packsAPI.getAll(),
        ordersAPI.getAll(),
      ]);
      setStats({
        pages: pagesRes.data.length,
        packs: packsRes.data.length,
        orders: ordersRes.data.length,
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
    { icon: <FileText size={24} />, title: 'Pages', description: 'Manage website pages', link: '/admin/pages', count: stats.pages },
    { icon: <Package size={24} />, title: 'Packs', description: 'Manage packs and offers', link: '/admin/packs', count: stats.packs },
    { icon: <DollarSign size={24} />, title: 'Pricing', description: 'Manage pricing rules', link: '/admin/pricing' },
    { icon: <Settings size={24} />, title: 'Translations', description: 'Manage translations', link: '/admin/translations' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0052CC] to-[#0065FF] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">IGV</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CMS Admin</h1>
              <p className="text-sm text-gray-500">Israel Growth Venture</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#0052CC] transition-colors"
            data-testid="logout-button"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Manage your website content and settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-[#0052CC]"
              data-testid={`menu-item-${index}`}
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-[#0052CC] mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              {item.count !== undefined && (
                <div className="text-2xl font-bold text-[#0052CC]">{item.count}</div>
              )}
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/pages"
              className="px-6 py-4 bg-[#0052CC] text-white rounded-lg font-semibold hover:bg-[#003D99] transition-all duration-300 text-center"
              data-testid="quick-action-create-page"
            >
              Create New Page
            </Link>
            <Link
              to="/admin/packs"
              className="px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 text-center"
              data-testid="quick-action-create-pack"
            >
              Add New Pack
            </Link>
            <Link
              to="/"
              target="_blank"
              className="px-6 py-4 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300 text-center"
              data-testid="quick-action-view-site"
            >
              View Live Site
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

