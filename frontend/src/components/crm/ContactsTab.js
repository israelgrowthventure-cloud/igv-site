import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mail, Phone, Building, MapPin, X, Loader2, Plus, Users, Edit, Trash2, Save, Send, StickyNote, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { SkeletonTable } from './Skeleton';
import EmailModal from './EmailModal';
import { useTranslation } from 'react-i18next';

const ContactsTab = ({ data, loading, selectedItem, setSelectedItem, onRefresh, searchTerm, setSearchTerm, t }) => {
  const { i18n } = useTranslation();
  const [loadingAction, setLoadingAction] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailContact, setEmailContact] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', position: '', language: 'fr' });
  const navigate = useNavigate();
  
  // Notes state
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  
  // Helper function for translations with fallback
  const tt = (key, fallback) => {
    const translation = t(key);
    // If translation returns the key itself (missing translation), return fallback
    if (translation === key || !translation) {
      return fallback || key;
    }
    return translation;
  };

  // Fetch notes when selectedItem changes
  useEffect(() => {
    if (selectedItem?._id || selectedItem?.contact_id) {
      fetchNotes(selectedItem._id || selectedItem.contact_id);
    } else {
      setNotes([]);
    }
  }, [selectedItem]);

  const fetchNotes = async (contactId) => {
    try {
      setLoadingNotes(true);
      const response = await api.get(`/api/crm/contacts/${contactId}/notes`);
      // Handle both response formats: {notes: [...]} or direct response
      const notesData = response.notes || response.data?.notes || response.data || [];
      setNotes(Array.isArray(notesData) ? notesData : []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const contactId = selectedItem._id || selectedItem.contact_id;
    
    try {
      setLoadingAction(true);
      await api.post(`/api/crm/contacts/${contactId}/notes`, { content: newNote.trim() });
      toast.success('Note ajoutée avec succès');
      setNewNote('');
      setShowNoteInput(false);
      await fetchNotes(contactId);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la note');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;
    const contactId = selectedItem._id || selectedItem.contact_id;
    
    try {
      setLoadingAction(true);
      await api.delete(`/api/crm/contacts/${contactId}/notes/${noteId}`);
      toast.success('Note supprimée avec succès');
      await fetchNotes(contactId);
    } catch (error) {
      toast.error('Erreur lors de la suppression de la note');
    } finally {
      setLoadingAction(false);
    }
  };

  // Filter contacts by search term
  const filteredContacts = useMemo(() => {
    if (!data?.contacts) return [];
    if (!searchTerm?.trim()) return data.contacts;
    
    const term = searchTerm.toLowerCase().trim();
    return data.contacts.filter(contact => 
      contact.name?.toLowerCase().includes(term) ||
      contact.email?.toLowerCase().includes(term) ||
      contact.phone?.includes(term) ||
      contact.position?.toLowerCase().includes(term)
    );
  }, [data?.contacts, searchTerm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      await api.post('/api/crm/contacts', formData);
      toast.success('Contact créé avec succès');
      setShowCreateModal(false);
      setFormData({ name: '', email: '', phone: '', position: '', language: 'fr' });
      await onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la création du contact');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      await api.put(`/api/crm/contacts/${editingContact._id || editingContact.contact_id}`, formData);
      toast.success('Contact modifié avec succès');
      setShowEditModal(false);
      setEditingContact(null);
      setFormData({ name: '', email: '', phone: '', position: '', language: 'fr' });
      await onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la modification du contact');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return;
    try {
      setLoadingAction(true);
      await api.delete(`/api/crm/contacts/${contactId}`);
      toast.success('Contact supprimé avec succès');
      await onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la suppression du contact');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCreateOpportunity = async (contactId) => {
    try {
      setLoadingAction(true);
      const contact = selectedItem;
      const response = await api.post('/api/crm/opportunities', {
        contact_id: contactId,
        name: `Opportunité - ${contact.name || contact.email}`,
        stage: 'qualification',
        value: 0,
        probability: 25,
        expected_close_date: new Date(Date.now() + 30*24*60*60*1000).toISOString()
      });
      
      toast.success('Opportunité créée avec succès !', {
        duration: 5000,
        action: {
          label: "Voir l'opportunité",
          onClick: () => {
            // Use navigate for proper routing
            navigate('/admin/crm/opportunities');
          }
        }
      });
      await onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la création de l\'opportunité');
    } finally {
      setLoadingAction(false);
    }
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      position: contact.position || '',
      language: contact.language || 'fr'
    });
    setShowEditModal(true);
  };

  const ContactModal = ({ isEdit, onSubmit, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="contact-modal">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isEdit ? 'Modifier le contact' : 'Nouveau contact'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded" data-testid="btn-close-modal">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4" data-testid="form-contact">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="input-contact-name"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              data-testid="input-contact-email"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fonction
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loadingAction}
              data-testid="btn-save-contact"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </button>
            <button
              type="button"
              onClick={onClose}
              data-testid="btn-cancel-contact"
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search and Create */}
      <div className="bg-white p-4 rounded-lg shadow border flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={() => { setFormData({ name: '', email: '', phone: '', position: '', language: 'fr' }); setShowCreateModal(true); }}
          data-testid="btn-new-contact"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nouveau contact
        </button>
      </div>

      {loading ? (
        <SkeletonTable rows={6} columns={6} />
      ) : !selectedItem ? (
        <div className="bg-white rounded-lg shadow border overflow-hidden" data-testid="contacts-list">
          <table className="w-full" data-testid="contacts-table">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Téléphone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tags</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Créé le</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length > 0 ? filteredContacts.map(contact => (
                <tr key={contact._id || contact.contact_id} data-testid={`contact-row-${contact._id || contact.contact_id}`} data-contact-name={contact.name} className="border-b hover:bg-gray-50">
                  <td 
                    className="px-4 py-3 cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/admin/crm/contacts/${contact._id || contact.contact_id}`)}
                    data-testid="contact-name"
                  >
                    {contact.name}
                  </td>
                  <td className="px-4 py-3" data-testid="contact-email">{contact.email}</td>
                  <td className="px-4 py-3">{contact.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">{tag}</span>
                      ))}
                      {contact.tags?.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">+{contact.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(contact.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEmailContact(contact); setShowEmailModal(true); }}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                        title="Envoyer un email"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(contact); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-xs">Modifier</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(contact._id || contact.contact_id); }}
                        disabled={loadingAction}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 flex items-center gap-1"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs">Supprimer</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-4 py-12 text-center">
                  <div className="text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Aucun contact trouvé</p>
                    <p className="text-sm mt-1">Créez votre premier contact pour commencer</p>
                    <button
                      onClick={() => { setFormData({ name: '', email: '', phone: '', position: '', language: 'fr' }); setShowCreateModal(true); }}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Nouveau contact
                    </button>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
              <p className="text-gray-600">{selectedItem.company_name || selectedItem.position}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleCreateOpportunity(selectedItem._id || selectedItem.contact_id)} 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                disabled={loadingAction}
              >
                <Plus className="w-5 h-5" />
                Nouvelle opportunité
              </button>
              <button onClick={() => openEditModal(selectedItem)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600">
                <Edit className="w-5 h-5" />
              </button>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedItem.email}</p>
                </div>
              </div>
              {selectedItem.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium">{selectedItem.phone}</p>
                  </div>
                </div>
              )}
              {selectedItem.position && (
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Fonction</p>
                    <p className="font-medium">{selectedItem.position}</p>
                  </div>
                </div>
              )}
              {selectedItem.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Localisation</p>
                    <p className="font-medium">{selectedItem.location}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedItem.converted_from_lead_id && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-semibold text-green-900">Converti depuis un prospect</p>
              <p className="text-sm text-green-800 mt-1">ID: {selectedItem.converted_from_lead_id}</p>
            </div>
          )}

          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold mb-4">Activités récentes</h3>
            <div className="space-y-2">
              {selectedItem.activities?.slice(0, 5).map((activity, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">{activity.type}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(activity.created_at).toLocaleString()}</p>
                </div>
              )) || <p className="text-gray-500 text-sm">Aucune activité</p>}
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-yellow-500" />
                Notes
              </h3>
              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm"
              >
                <Plus className="w-4 h-4" />
                Ajouter une note
              </button>
            </div>

            {/* Add Note Form */}
            {showNoteInput && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Écrivez votre note ici..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 resize-none"
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleAddNote}
                    disabled={loadingAction || !newNote.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                  >
                    {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer
                  </button>
                  <button
                    onClick={() => { setShowNoteInput(false); setNewNote(''); }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Notes List */}
            <div className="space-y-3">
              {loadingNotes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : notes.length > 0 ? (
                notes.map((note) => (
                  <div key={note._id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(note.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Aucune note pour ce contact</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <ContactModal 
          isEdit={false} 
          onSubmit={handleCreate} 
          onClose={() => setShowCreateModal(false)} 
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <ContactModal 
          isEdit={true} 
          onSubmit={handleEdit} 
          onClose={() => { setShowEditModal(false); setEditingContact(null); }} 
        />
      )}

      {/* Email Modal */}
      {showEmailModal && emailContact && (
        <EmailModal 
          contact={emailContact}
          onClose={() => { setShowEmailModal(false); setEmailContact(null); }}
          t={(key, fallback) => {
            const translation = t(key);
            return translation === key || !translation ? (fallback || key) : translation;
          }}
          language={i18n?.language || 'fr'}
        />
      )}
    </div>
  );
};

export default ContactsTab;
