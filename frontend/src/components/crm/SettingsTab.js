import React, { useState } from 'react';
import { Users, Tag, List, Plus, Trash2, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const SettingsTab = ({ data, onRefresh, t }) => {
  const [activeSection, setActiveSection] = useState('users');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [loadingAction, setLoadingAction] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      await api.post('/api/crm/settings/users', formData);
      toast.success(t('admin.crm.settings.user_created') || 'User created successfully');
      setShowForm(false);
      setFormData({});
      await onRefresh();
    } catch (error) {
      toast.error(t('admin.crm.errors.user_create_failed') || 'Failed to create user');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t('admin.crm.settings.confirm_delete_user') || 'Delete this user?')) return;
    try {
      setLoadingAction(true);
      await api.delete(`/api/crm/settings/users/${userId}`);
      toast.success(t('admin.crm.settings.user_deleted') || 'User deleted');
      await onRefresh();
    } catch (error) {
      toast.error(t('admin.crm.errors.user_delete_failed') || 'Failed to delete user');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      await api.post('/api/crm/settings/tags', { name: formData.tagName });
      toast.success(t('admin.crm.settings.tag_added') || 'Tag added');
      setShowForm(false);
      setFormData({});
      await onRefresh();
    } catch (error) {
      toast.error(t('admin.crm.errors.tag_add_failed') || 'Failed to add tag');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border-b">
        <nav className="flex gap-6">
          {[
            { id: 'users', icon: Users, label: t('admin.crm.settings.sections.users') || 'Users' },
            { id: 'tags', icon: Tag, label: t('admin.crm.settings.sections.tags') || 'Tags' },
            { id: 'stages', icon: List, label: t('admin.crm.settings.sections.stages') || 'Pipeline Stages' }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => { setActiveSection(section.id); setShowForm(false); }}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 ${activeSection === section.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {activeSection === 'users' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">{t('admin.crm.settings.crm_users') || 'CRM Users'} ({data.users?.length || 0})</h3>
            <button onClick={() => { setShowForm(!showForm); setFormData({}); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              {t('admin.crm.settings.add_user') || 'Add User'}
            </button>
          </div>

          {showForm && (
            <div className="p-6 border-b bg-gray-50">
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder={t('admin.crm.settings.user_name') || 'Name'} value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="px-3 py-2 border rounded-lg" />
                <input type="email" placeholder={t('admin.crm.settings.user_email') || 'Email'} value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="px-3 py-2 border rounded-lg" />
                <select value={formData.role || 'sales'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="px-3 py-2 border rounded-lg">
                  <option value="admin">{t('admin.roles.admin') || 'Admin'}</option>
                  <option value="sales">{t('admin.roles.sales') || 'Sales'}</option>
                  <option value="viewer">{t('admin.roles.viewer') || 'Viewer'}</option>
                </select>
                <div className="flex gap-2 md:col-span-3">
                  <button type="submit" disabled={loadingAction} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t('admin.crm.common.save') || 'Save'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                    {t('admin.crm.common.cancel') || 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="p-6">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">{t('admin.crm.settings.columns.name') || 'Name'}</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">{t('admin.crm.settings.columns.email') || 'Email'}</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">{t('admin.crm.settings.columns.role') || 'Role'}</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">{t('admin.crm.settings.columns.status') || 'Status'}</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {data.users?.map(user => (
                  <tr key={user.user_id} className="border-b">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3"><span className="capitalize">{user.role}</span></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.is_active ? (t('admin.crm.settings.active') || 'Active') : (t('admin.crm.settings.inactive') || 'Inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteUser(user.user_id)} disabled={loadingAction} className="text-red-600 hover:text-red-800 disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )) || (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">{t('admin.crm.common.no_users') || 'No users yet'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'tags' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">{t('admin.crm.settings.tags_title') || 'Tags'} ({data.tags?.length || 0})</h3>
            <button onClick={() => { setShowForm(!showForm); setFormData({}); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              {t('admin.crm.settings.add_tag') || 'Add Tag'}
            </button>
          </div>

          {showForm && (
            <div className="p-6 border-b bg-gray-50">
              <form onSubmit={handleAddTag} className="flex gap-4">
                <input type="text" placeholder={t('admin.crm.settings.tag_name') || 'Tag name'} value={formData.tagName || ''} onChange={(e) => setFormData({ ...formData, tagName: e.target.value })} required className="flex-1 px-3 py-2 border rounded-lg" />
                <button type="submit" disabled={loadingAction} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t('admin.crm.common.save') || 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                  {t('admin.crm.common.cancel') || 'Cancel'}
                </button>
              </form>
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {data.tags?.map(tag => (
                <span key={tag} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full flex items-center gap-2">
                  {tag}
                </span>
              )) || <p className="text-gray-500">{t('admin.crm.common.no_tags') || 'No tags yet'}</p>}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'stages' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold">{t('admin.crm.settings.pipeline_stages') || 'Pipeline Stages'}</h3>
            <p className="text-sm text-gray-600 mt-1">{t('admin.crm.settings.stages_description') || 'Configure your sales pipeline stages'}</p>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {data.stages?.map((stage, idx) => (
                <div key={stage.stage_name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-400">{idx + 1}</span>
                    <span className="font-medium">{stage.display_name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{stage.description}</span>
                </div>
              )) || <p className="text-gray-500">{t('admin.crm.common.no_stages') || 'No stages configured'}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
