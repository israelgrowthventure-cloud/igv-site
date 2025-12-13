import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const CMSDashboard = () => {
    const navigate = useNavigate();
    const { getAuthHeader, isAuthenticated } = useAuth();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/admin/login');
            return;
        }
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const response = await axios.get(
                `${BACKEND_URL}/cms/pages`,
                { headers: getAuthHeader() }
            );
            setPages(response.data.data || []);
        } catch (error) {
            console.error('Error fetching pages:', error);
            toast.error('Failed to load pages');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublish = async (page) => {
        try {
            const endpoint = page.published ? 'unpublish' : 'publish';
            await axios.post(
                `${BACKEND_URL}/cms/pages/${page.id}/${endpoint}`,
                {},
                { headers: getAuthHeader() }
            );
            toast.success(`Page ${page.published ? 'unpublished' : 'published'}`);
            fetchPages();
        } catch (error) {
            toast.error('Failed to toggle publish status');
        }
    };

    const handleDelete = async (pageId) => {
        if (!confirm('Are you sure you want to delete this page?')) return;

        try {
            await axios.delete(
                `${BACKEND_URL}/cms/pages/${pageId}`,
                { headers: getAuthHeader() }
            );
            toast.success('Page deleted');
            fetchPages();
        } catch (error) {
            toast.error('Failed to delete page');
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen pt-20 bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">CMS Dashboard</h1>
                    <button
                        onClick={() => navigate('/admin/cms/editor/new/fr')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        New Page
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : pages.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500 mb-4">No pages yet</p>
                        <button
                            onClick={() => navigate('/admin/cms/editor/new/fr')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus size={20} />
                            Create First Page
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pages.map((page) => (
                                    <tr key={page.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {page.page_slug}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {page.language.toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${page.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {page.published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            v{page.version || 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(page.updated_at || page.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/cms/editor/${page.page_slug}/${page.language}`)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleTogglePublish(page)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                    title={page.published ? 'Unpublish' : 'Publish'}
                                                >
                                                    {page.published ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(page.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CMSDashboard;
