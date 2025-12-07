import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pagesAPI } from '../../utils/api';
import { FileText, Edit, Trash2, Plus, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const PagesList = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const response = await pagesAPI.getAll();
      setPages(response.data);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Erreur lors du chargement des pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la page "${slug}" ?`)) {
      return;
    }

    try {
      await pagesAPI.delete(slug);
      toast.success('Page supprimée avec succès');
      loadPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const togglePublish = async (page) => {
    try {
      await pagesAPI.update(page.slug, { published: !page.published });
      toast.success(page.published ? 'Page dépubliée' : 'Page publiée');
      loadPages();
    } catch (error) {
      console.error('Error updating page:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pages du Site</h1>
                <p className="text-sm text-gray-500">Gérer le contenu de vos pages</p>
              </div>
            </div>
            <Link
              to="/admin/pages/new"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={20} />
              <span>Nouvelle Page</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pages.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune page</h3>
            <p className="text-gray-600 mb-6">Commencez par créer votre première page</p>
            <Link
              to="/admin/pages/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Créer une Page</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {page.title?.fr || page.slug}
                      </h3>
                      <p className="text-blue-100 text-sm font-mono">/{page.slug}</p>
                    </div>
                    <button
                      onClick={() => togglePublish(page)}
                      className={`p-2 rounded-lg transition-colors ${
                        page.published
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                      title={page.published ? 'Publié' : 'Brouillon'}
                    >
                      {page.published ? (
                        <Eye size={18} className="text-white" />
                      ) : (
                        <EyeOff size={18} className="text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Traductions:</span>
                      <div className="flex space-x-1">
                        {['fr', 'en', 'he'].map((lang) => (
                          <span
                            key={lang}
                            className={`px-2 py-1 rounded-md text-xs font-medium ${
                              page.title?.[lang]
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {lang.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Statut:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          page.published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {page.published ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/pages/${page.slug}`}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Edit size={16} />
                      <span>Modifier</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(page.slug)}
                      className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PagesList;
