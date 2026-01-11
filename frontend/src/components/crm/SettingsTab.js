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

  // Helper function for translations with fallback
  const tt = (key, fallback) => {
    const translation = t(key);
    if (translation === key || !translation) {
      return fallback || key;
    }
    return translation;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      await api.post('/api/crm/settings/users', formData);
      toast.success('Utilisateur créé avec succès');
      setShowForm(false);
      setFormData({});
      await onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la création de l\'utilisateur');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      setLoadingAction(true);
      await api.delete(`/api/crm/settings/users/${userId}`);
      toast.success('Utilisateur supprimé avec succès');
      await onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    try {
      setLoadingAction(true);
      await api.post('/api/crm/settings/users/change-password', {
        current_password: passwordForm.current,
        new_password: passwordForm.new
      });
      toast.success('Mot de passe modifié avec succès');
      setShowPasswordForm(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la modification du mot de passe');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      await api.post('/api/crm/settings/tags', { name: formData.tagName });
      toast.success('Tag ajouté avec succès');
      setShowForm(false);
      setFormData({});
      await onRefresh();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du tag');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border-b">
        <nav className="flex gap-6">
          {[
            { id: 'profile', icon: Lock, label: 'Profil' },
            { id: 'users', icon: Users, label: 'Utilisateurs' },
            { id: 'tags', icon: Tag, label: 'Tags' },
            { id: 'stages', icon: List, label: 'Étapes' }
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
            <h3 className="font-semibold">Changer le mot de passe</h3>
            <p className="text-sm text-gray-600 mt-1">Modifiez votre mot de passe pour sécuriser votre compte</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                <input 
                  type="password" 
                  value={passwordForm.current} 
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} 
                  required 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
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
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}

      {activeSection === 'users' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Utilisateurs CRM ({data.users?.length || 0})</h3>
            <button onClick={() => { setShowForm(!showForm); setFormData({}); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Ajouter un utilisateur
            </button>
          </div>

          {showForm && (
            <div className="p-6 border-b bg-gray-50">
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nom complet" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="px-3 py-2 border rounded-lg" />
                <input type="email" placeholder="Email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="px-3 py-2 border rounded-lg" />
                <input type="password" placeholder="Mot de passe" value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} className="px-3 py-2 border rounded-lg" />
                <select value={formData.role || 'commercial'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="px-3 py-2 border rounded-lg">
                  <option value="admin">Admin</option>
                  <option value="commercial">Commercial</option>
                  <option value="support">Support</option>
                </select>
                <div className="flex gap-2 md:col-span-2">
                  <button type="submit" disabled={loadingAction} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="p-6">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Nom</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Rôle</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Statut</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {data.users && data.users.length > 0 ? data.users.map(user => (
                  <tr key={user._id || user.id} className="border-b">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3"><span className="capitalize">{user.role}</span></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteUser(user._id || user.id)} disabled={loadingAction} className="text-red-600 hover:text-red-800 disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Aucun utilisateur trouvé</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'tags' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Tags disponibles ({data.tags?.length || 0})</h3>
            <button onClick={() => { setShowForm(!showForm); setFormData({}); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Ajouter un tag
            </button>
          </div>

          {showForm && (
            <div className="p-6 border-b bg-gray-50">
              <form onSubmit={handleAddTag} className="flex gap-4">
                <input type="text" placeholder="Nom du tag" value={formData.tagName || ''} onChange={(e) => setFormData({ ...formData, tagName: e.target.value })} required className="flex-1 px-3 py-2 border rounded-lg" />
                <button type="submit" disabled={loadingAction} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                  Annuler
                </button>
              </form>
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {data.tags && data.tags.length > 0 ? data.tags.map(tag => (
                <span key={tag} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full flex items-center gap-2">
                  {tag}
                </span>
              )) : <p className="text-gray-500">Aucun tag disponible</p>}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'stages' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold">Étapes du pipeline</h3>
            <p className="text-sm text-gray-600 mt-1">Les différentes étapes de votre pipeline de ventes</p>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {data.stages && data.stages.length > 0 ? data.stages.map((stage, idx) => (
                <div key={stage.key || idx} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-400">{idx + 1}</span>
                    <span className="font-medium">{stage.label_fr || stage.display_name || stage.key}</span>
                  </div>
                  <span className="text-sm text-gray-500">{stage.description || ''}</span>
                </div>
              )) : <p className="text-gray-500">Aucune étape configurée</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
