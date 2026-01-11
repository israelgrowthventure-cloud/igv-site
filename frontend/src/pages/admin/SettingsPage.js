import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { 
  Settings, Users, Tag, Layers, Save, Loader2, Plus, Trash2, Edit2, X, Check
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [stages, setStages] = useState([]);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6' });
  const [editingTag, setEditingTag] = useState(null);
  const [editingStage, setEditingStage] = useState(null);
  const [newStage, setNewStage] = useState({ 
    id: '', 
    name: '', 
    order: 0, 
    color: '#3B82F6',
    probability: 0 
  });

  const isRTL = i18n.language === 'he';

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      const [usersRes, tagsRes, stagesRes] = await Promise.all([
        api.get('/api/crm/settings/users'),
        api.get('/api/crm/settings/tags'),
        api.get('/api/crm/settings/pipeline-stages')
      ]);
      
      setUsers(usersRes?.users || usersRes?.data?.users || []);
      setTags(tagsRes?.tags || tagsRes?.data?.tags || []);
      setStages(stagesRes?.stages || stagesRes?.data?.stages || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error(t('admin.crm.settings.errors.load_failed') || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Users
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/api/crm/settings/users/${userId}`, { 
        active: currentStatus === 'active' ? false : true 
      });
      toast.success(t('admin.crm.settings.users.updated') || 'User updated');
      fetchSettingsData();
    } catch (error) {
      toast.error(t('admin.crm.settings.users.errors.update_failed') || 'Failed to update user');
    }
  };

  // Tags
  const handleAddTag = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/crm/settings/tags', newTag);
      toast.success(t('admin.crm.settings.tags.created') || 'Tag created');
      setNewTag({ name: '', color: '#3B82F6' });
      fetchSettingsData();
    } catch (error) {
      toast.error(t('admin.crm.settings.tags.errors.create_failed') || 'Failed to create tag');
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm(t('admin.crm.settings.tags.delete_confirm') || 'Delete this tag?')) return;
    try {
      await api.delete(`/api/crm/settings/tags/${tagId}`);
      toast.success(t('admin.crm.settings.tags.deleted') || 'Tag deleted');
      fetchSettingsData();
    } catch (error) {
      toast.error(t('admin.crm.settings.tags.errors.delete_failed') || 'Failed to delete tag');
    }
  };

  // Stages
  const handleAddStage = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/crm/settings/pipeline-stages', newStage);
      toast.success(t('admin.crm.settings.stages.created') || 'Stage created');
      setNewStage({ id: '', name: '', order: stages.length, color: '#3B82F6', probability: 0 });
      fetchSettingsData();
    } catch (error) {
      toast.error(t('admin.crm.settings.stages.errors.create_failed') || 'Failed to create stage');
    }
  };

  const handleUpdateStage = async (stageId, data) => {
    try {
      await api.put(`/api/crm/settings/pipeline-stages/${stageId}`, data);
      toast.success(t('admin.crm.settings.stages.updated') || 'Stage updated');
      setEditingStage(null);
      fetchSettingsData();
    } catch (error) {
      toast.error(t('admin.crm.settings.stages.errors.update_failed') || 'Failed to update stage');
    }
  };

  const handleDeleteStage = async (stageId) => {
    if (!window.confirm(t('admin.crm.settings.stages.delete_confirm') || 'Delete this stage?')) return;
    try {
      await api.delete(`/api/crm/settings/pipeline-stages/${stageId}`);
      toast.success(t('admin.crm.settings.stages.deleted') || 'Stage deleted');
      fetchSettingsData();
    } catch (error) {
      toast.error(t('admin.crm.settings.stages.errors.delete_failed') || 'Failed to delete stage');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('admin.crm.settings.title') || 'Settings'} | IGV CRM</title>
        <html lang={i18n.language} dir={isRTL ? 'rtl' : 'ltr'} />
      </Helmet>

      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="w-6 h-6 text-gray-600" />
                {t('admin.crm.settings.title') || 'Settings'}
              </h1>
              <p className="text-sm text-gray-600">
                {t('admin.crm.settings.subtitle') || 'Manage users, tags, and pipeline stages'}
              </p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-4 overflow-x-auto">
              {[
                { id: 'users', icon: Users, label: t('admin.crm.settings.tabs.users') || 'Users' },
                { id: 'tags', icon: Tag, label: t('admin.crm.settings.tabs.tags') || 'Tags' },
                { id: 'stages', icon: Layers, label: t('admin.crm.settings.tabs.stages') || 'Pipeline Stages' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {t('admin.crm.settings.users.columns.name') || 'Name'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {t('admin.crm.settings.users.columns.email') || 'Email'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {t('admin.crm.settings.users.columns.role') || 'Role'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {t('admin.crm.settings.users.columns.status') || 'Status'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {t('admin.crm.settings.users.columns.created') || 'Created'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id || user.user_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-sm">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {user.status}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tags Tab */}
          {activeTab === 'tags' && (
            <div className="space-y-6">
              {/* Add Tag Form */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-4">{t('admin.crm.settings.tags.add') || 'Add Tag'}</h3>
                <form onSubmit={handleAddTag} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">
                      {t('admin.crm.settings.tags.columns.name') || 'Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newTag.name}
                      onChange={(e) => setNewTag({...newTag, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Tag name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      {t('admin.crm.settings.tags.columns.color') || 'Color'}
                    </label>
                    <input
                      type="color"
                      value={newTag.color}
                      onChange={(e) => setNewTag({...newTag, color: e.target.value})}
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('admin.crm.common.add') || 'Add'}
                  </button>
                </form>
              </div>

              {/* Tags List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        {t('admin.crm.settings.tags.columns.name') || 'Name'}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        {t('admin.crm.settings.tags.columns.color') || 'Color'}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        {t('admin.crm.settings.tags.columns.count') || 'Usage Count'}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                        {t('admin.crm.common.actions') || 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tags.map((tag) => (
                      <tr key={tag.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span 
                            className="inline-block w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="inline-block px-2 py-1 rounded text-xs font-mono"
                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                          >
                            {tag.color}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {tag.usage_count || 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            className="p-2 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stages Tab */}
          {activeTab === 'stages' && (
            <div className="space-y-6">
              {/* Add Stage Form */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-4">{t('admin.crm.settings.stages.add') || 'Add Stage'}</h3>
                <form onSubmit={handleAddStage} className="flex gap-4 items-end flex-wrap">
                  <div className="w-32">
                    <label className="block text-sm text-gray-600 mb-1">ID</label>
                    <input
                      type="text"
                      required
                      value={newStage.id}
                      onChange={(e) => setNewStage({...newStage, id: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                      className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                      placeholder="stage_id"
                    />
                  </div>
                  <div className="flex-1 min-w-48">
                    <label className="block text-sm text-gray-600 mb-1">
                      {t('admin.crm.settings.stages.columns.name') || 'Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newStage.name}
                      onChange={(e) => setNewStage({...newStage, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Stage name"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm text-gray-600 mb-1">Order</label>
                    <input
                      type="number"
                      value={newStage.order}
                      onChange={(e) => setNewStage({...newStage, order: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm text-gray-600 mb-1">Prob %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newStage.probability}
                      onChange={(e) => setNewStage({...newStage, probability: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Color</label>
                    <input
                      type="color"
                      value={newStage.color}
                      onChange={(e) => setNewStage({...newStage, color: e.target.value})}
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('admin.crm.common.add') || 'Add'}
                  </button>
                </form>
              </div>

              {/* Stages List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Order</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        {t('admin.crm.settings.stages.columns.name') || 'Name'}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Probability</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Color</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                        {t('admin.crm.common.actions') || 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[...stages].sort((a, b) => a.order - b.order).map((stage) => (
                      <tr key={stage.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">{stage.order}</td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-500">{stage.id}</td>
                        <td className="px-4 py-3 font-medium">
                          {editingStage === stage.id ? (
                            <input
                              type="text"
                              defaultValue={stage.name}
                              id={`stage-name-${stage.id}`}
                              className="w-full px-2 py-1 border rounded"
                            />
                          ) : (
                            <span 
                              className="inline-block w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: stage.color }}
                            />
                          )}
                          {editingStage === stage.id ? stage.id : stage.name}
                        </td>
                        <td className="px-4 py-3">
                          {editingStage === stage.id ? (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              defaultValue={stage.probability}
                              id={`stage-prob-${stage.id}`}
                              className="w-20 px-2 py-1 border rounded"
                            />
                          ) : (
                            `${stage.probability}%`
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="inline-block px-2 py-1 rounded text-xs font-mono"
                            style={{ backgroundColor: stage.color + '20', color: stage.color }}
                          >
                            {stage.color}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {editingStage === stage.id ? (
                              <>
                                <button
                                  onClick={() => {
                                    handleUpdateStage(stage.id, {
                                      name: document.getElementById(`stage-name-${stage.id}`).value,
                                      probability: parseInt(document.getElementById(`stage-prob-${stage.id}`).value)
                                    });
                                  }}
                                  className="p-2 hover:bg-green-50 rounded-lg"
                                >
                                  <Check className="w-4 h-4 text-green-600" />
                                </button>
                                <button
                                  onClick={() => setEditingStage(null)}
                                  className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                  <X className="w-4 h-4 text-gray-600" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingStage(stage.id)}
                                  className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStage(stage.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default SettingsPage;
