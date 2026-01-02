/**
 * EmailsTab - Gestion des templates email
 * Design system: HubSpot/Salesforce Lightning  
 * Templates avec variables dynamiques
 */

import React, { useState } from 'react';
import { Mail, Plus, Eye, Edit, Trash2, Copy, Send } from 'lucide-react';
import { toast } from 'sonner';

const EmailsTab = ({ t }) => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Bienvenue Lead',
      subject: 'Bienvenue chez Israel Growth Venture',
      body: 'Bonjour {name},\n\nMerci pour votre intérêt pour {company}.\n\nNous sommes ravis de vous accompagner dans votre projet d\'expansion.\n\nÀ très bientôt,\nL\'équipe IGV',
      category: 'lead',
      language: 'fr'
    },
    {
      id: 2,
      name: 'Relance Lead',
      subject: 'Votre projet d\'expansion - Suivi',
      body: 'Bonjour {name},\n\nJe me permets de revenir vers vous concernant votre projet.\n\nAvez-vous pu consulter notre proposition ?\n\nCordialement,\n{sender_name}',
      category: 'lead',
      language: 'fr'
    }
  ]);
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

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
            onClick={() => toast.info('Création de template - à venir')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-5 h-5" />
            Nouveau template
          </button>
        </div>
      </div>

      {/* Templates grid */}
      <div className="flex-1 overflow-auto p-6">
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
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

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
      </div>
    </div>
  );
};

export default EmailsTab;
