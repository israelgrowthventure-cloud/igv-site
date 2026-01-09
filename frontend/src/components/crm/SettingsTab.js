import React, { useState } from 'react';
import { Users, Tag, List, Plus, Trash2, Save, X, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const SettingsTab = ({ data, onRefresh, t }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [loadingAction, setLoadingAction] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      await api.post('/api/admin/users', formData);
      toast.success(t('admin.crm.settings.user_created'));
      setShowForm(false);
      setFormData({});
      await onRefresh();
    } catch (error) {
      toast.error(t('admin.crm.errors.user_create_failed'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t('admin.crm.settings.confirm_delete_user'))) return;
    try {
      setLoadingAction(true);
      await api.delete(`/api/admin/users/${userId}`);
      toast.success(t('admin.crm.settings.user_deleted'));
      await onRefresh();
    } catch (error) {
      toast.error(t('admin.crm.errors.user_delete_failed'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error(t('admin.crm.settings.password_mismatch'));
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error(t('admin.crm.settings.password_too_short'));
      return;
    }
    try {
      setLoadingAction(true);
      await api.post('/api/admin/users/change-password', {
        current_password: passwordForm.current,
        new_password: passwordForm.new
      });
      toast.success(t('admin.crm.settings.password_changed'));
      setShowPasswordForm(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || t('admin.crm.errors.password_change_failed'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      await api.post('/api/crm/settings/tags', { name: formData.tagName });
      toast.success(t('admin.crm.settings.tag_added'));
      setShowForm(false);
      setFormData({});
      await onRefresh();
    } catch (error) {
      toast.error(t('admin.crm.errors.tag_add_failed'));
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border-b">
        <nav className="flex gap-6">
          {[
            { id: 'profile', icon: Lock, label: t('admin.crm.settings.sections.profile') },
            { id: 'users', icon: Users, label: t('admin.crm.settings.sections.users') },
            { id: 'tags', icon: Tag, label: t('admin.crm.settings.sections.tags') },
            { id: 'stages', icon: List, label: t('admin.crm.settings.sections.stages') }
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

      {activeSection === 'profile' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold">{t('admin.crm.settings.change_password')}</h3>
            <p className="text-sm text-gray-600 mt-1">{t('admin.crm.settings.change_password_desc')}</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.crm.settings.current_password')}</label>
                <input 
                  type="password" 
                  value={passwordForm.current} 
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} 
                  required 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.crm.settings.new_password')}</label>
                <input 
                  type="password" 
                  value={passwordForm.new} 
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} 
                  required 
                  minLength={6} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.crm.settings.confirm_password')}</label>
                <input 
                  type="password" 
                  value={passwordForm.confirm} 
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} 
                  required 
                  minLength={6} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
              </div>
              <button 
                type="submit" 
                disabled={loadingAction} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('admin.crm.settings.save_password')}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeSection === 'users' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">{t('admin.crm.settings.crm_users')} ({data.users?.length || 0})</h3>
            <button onClick={() => { setShowForm(!showForm); setFormData({}); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              {t('admin.crm.settings.add_user')}
            </button>
          </div>

          {showForm && (
            <div className="p-6 border-b bg-gray-50">
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder={t('admin.crm.settings.user_name')} value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="px-3 py-2 border rounded-lg" />
                <input type="email" placeholder={t('admin.crm.settings.user_email')} value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="px-3 py-2 border rounded-lg" />
                <input type="password" placeholder={t('admin.crm.settings.user_password')} value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} className="px-3 py-2 border rounded-lg" />
                <select value={formData.role || 'sales'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="px-3 py-2 border rounded-lg">
                  <option value="admin">{t('admin.roles.admin')}</option>
                  <option value="sales">{t('admin.roles.sales')}</option>
                  <option value="viewer">{t('admin.roles.viewer')}</option>
                </select>
                <div className="flex gap-2 md:col-span-2">
                  <button type="submit" disabled={loadingAction} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t('admin.crm.common.save')}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                    {t('admin.crm.common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="p-6">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">{t('admin.crm.settings.columns.name')}</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">{t('admin.crm.settings.columns.email')}</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">{t('admin.crm.settings.columns.role')}</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">{t('admin.crm.settings.columns.status')}</th>
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
                        {user.is_active ? t('admin.crm.settings.active') : t('admin.crm.settings.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteUser(user.user_id)} disabled={loadingAction} className="text-red-600 hover:text-red-800 disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )) || (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">{t('admin.crm.common.no_users')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'tags' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">{t('admin.crm.settings.tags_title')} ({data.tags?.length || 0})</h3>
            <button onClick={() => { setShowForm(!showForm); setFormData({}); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              {t('admin.crm.settings.add_tag')}
            </button>
          </div>

          {showForm && (
            <div className="p-6 border-b bg-gray-50">
              <form onSubmit={handleAddTag} className="flex gap-4">
                <input type="text" placeholder={t('admin.crm.settings.tag_name')} value={formData.tagName || ''} onChange={(e) => setFormData({ ...formData, tagName: e.target.value })} required className="flex-1 px-3 py-2 border rounded-lg" />
                <button type="submit" disabled={loadingAction} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t('admin.crm.common.save')}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                  {t('admin.crm.common.cancel')}
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
              )) || <p className="text-gray-500">{t('admin.crm.common.no_tags')}</p>}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'stages' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold">{t('admin.crm.settings.pipeline_stages')}</h3>
            <p className="text-sm text-gray-600 mt-1">{t('admin.crm.settings.stages_description')}</p>
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
              )) || <p className="text-gray-500">{t('admin.crm.common.no_stages')}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
