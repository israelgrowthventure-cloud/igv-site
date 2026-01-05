/**
 * EmailsTab - Gestion des templates email
 * Design system: HubSpot/Salesforce Lightning  
 * Templates avec variables dynamiques
 */

import React, { useState, useEffect } from 'react';
import { Mail, Plus, Eye, Edit, Trash2, Copy, Send, X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const EmailsTab = ({ t }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    language: 'fr'
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/crm/emails/templates');
      setTemplates(response.templates || response.data.templates || []);
    } catch (error) {
      console.error('Erreur chargement templates:', error);
      toast.error('Erreur lors du chargement des templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      await api.post('/api/crm/emails/templates', formData);
      toast.success('Template créé avec succès');
      setShowCreateModal(false);
      setFormData({ name: '', subject: '', body: '', language: 'fr' });
      await loadTemplates();
    } catch (error) {
      console.error('Erreur création template:', error);
      toast.error('Erreur lors de la création');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le template "${templateName}" ?`)) {
      return;
    }
    try {
      setLoadingAction(true);
      await api.delete(`/api/crm/emails/templates/${templateId}`);
      toast.success('Template supprimé avec succès');
      await loadTemplates();
    } catch (error) {
      console.error('Erreur suppression template:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoadingAction(false);
    }
  };

  const previewData = {
    name: 'Jean Dupont',
    company: 'Exemple SA',
    email: 'jean.dupont@exemple.fr',
    sender_name: 'David Cohen'
  };

  const renderPreview = (text) => {
    let result = text;
    Object.entries(previewData).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return result;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Templates Email</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gérez vos modèles d'emails
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-5 h-5" />
            Nouveau template
          </button>
        </div>
      </div>

      {/* Templates grid */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Mail className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucun template email</p>
            <p className="text-sm">Créez votre premier template pour commencer</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {templates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition cursor-pointer"
              onClick={() => {
                setSelectedTemplate(template);
                setShowPreview(true);
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <span className="text-xs text-gray-500">{template.category}</span>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Objet:</p>
                <p className="text-sm text-gray-600">{template.subject}</p>
              </div>

              {/* Preview */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 line-clamp-3">{template.body}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTemplate(template);
                    setShowPreview(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition"
                >
                  <Eye className="w-4 h-4" />
                  Prévisualiser
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(template.body);
                    toast.success('Template copié');
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition"
                  title="Copier"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTemplate(template.id || template._id, template.name);
                  }}
                  disabled={loadingAction}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition disabled:opacity-50"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
              {/* Modal header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-4">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objet
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {renderPreview(selectedTemplate.subject)}
                  </div>
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu (avec données exemple)
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap">
                    {renderPreview(selectedTemplate.body)}
                  </div>
                </div>

                {/* Variables */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variables disponibles
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['{name}', '{company}', '{email}', '{phone}', '{sender_name}'].map(variable => (
                      <span
                        key={variable}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded-md"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="p-6 border-t border-gray-200 flex items-center gap-3">
                <button
                  onClick={() => toast.info('Envoi de test - à venir')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Send className="w-4 h-4" />
                  Envoyer un test
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Nouveau template email</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom du template</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Bienvenue Lead"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Objet de l'email</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Bienvenue chez Israel Growth Venture"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Corps du message</label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    required
                    rows={8}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Bonjour {name},\n\nMerci pour votre intérêt..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="he">עברית</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Créer le template
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailsTab;
