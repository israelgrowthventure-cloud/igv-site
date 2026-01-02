import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, X, Save, Loader2, Shield, UserCheck, UserX, Search, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { SkeletonTable } from './Skeleton';

const UsersTab = ({ t }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'commercial',
    assigned_leads: []
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users');
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('admin.crm.errors.fetch_failed') || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name || !formData.password) {
      toast.error('Tous les champs obligatoires doivent être remplis');
      return;
    }

    try {
      setLoadingAction(true);
      await api.post('/api/admin/users', formData);
      toast.success('Utilisateur créé avec succès');
      setShowCreateModal(false);
      setFormData({ email: '', name: '', password: '', role: 'commercial', assigned_leads: [] });
      await fetchUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Erreur lors de la création';
      toast.error(errorMsg);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    try {
      setLoadingAction(true);
      const updateData = {
        name: formData.name,
        role: formData.role,
        is_active: formData.is_active,
        assigned_leads: formData.assigned_leads
      };
      
      await api.put(`/api/admin/users/${editingUser._id}`, updateData);
      toast.success('Utilisateur mis à jour avec succès');
      setShowEditModal(false);
      setEditingUser(null);
      setFormData({ email: '', name: '', password: '', role: 'commercial', assigned_leads: [] });
      await fetchUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Erreur lors de la mise à jour';
      toast.error(errorMsg);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ?')) {
      return;
    }

    try {
      setLoadingAction(true);
      await api.delete(`/api/admin/users/${userId}`);
      toast.success('Utilisateur désactivé avec succès');
      await fetchUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Erreur lors de la suppression';
      toast.error(errorMsg);
    } finally {
      setLoadingAction(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name || '',
      password: '', // Never pre-fill password
      role: user.role || 'commercial',
      is_active: user.is_active !== false,
      assigned_leads: user.assigned_leads || []
    });
    setShowEditModal(true);
  };

  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      commercial: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[role] || colors.viewer}`}>
        {role === 'admin' ? 'Admin' : role === 'commercial' ? 'Commercial' : 'Viewer'}
      </span>
    );
  };

  const UserModal = ({ isEdit, onSubmit, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="utilisateur@exemple.com"
              />
            </div>
          )}
          
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Jean Dupont"
            />
          </div>
          
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Minimum 6 caractères"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="commercial">Commercial</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.role === 'admin' && 'Accès complet au CRM et gestion des utilisateurs'}
              {formData.role === 'commercial' && 'Accès aux leads, contacts et opportunités'}
              {formData.role === 'viewer' && 'Accès en lecture seule'}
            </p>
          </div>
          
          {isEdit && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Compte actif
              </label>
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loadingAction}
              className="flex-1 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loadingAction ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button
          onClick={() => {
            setFormData({ email: '', name: '', password: '', role: 'commercial', assigned_leads: [] });
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active !== false ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <UserCheck className="w-4 h-4" />
                          <span className="text-sm font-medium">Actif</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <UserX className="w-4 h-4" />
                          <span className="text-sm font-medium">Inactif</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={loadingAction}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Désactiver"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.is_active !== false).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <UserModal 
          isEdit={false} 
          onSubmit={handleCreate} 
          onClose={() => setShowCreateModal(false)} 
        />
      )}

      {showEditModal && (
        <UserModal 
          isEdit={true} 
          onSubmit={handleEdit} 
          onClose={() => { setShowEditModal(false); setEditingUser(null); }} 
        />
      )}
    </div>
  );
};

export default UsersTab;
