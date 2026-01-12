import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { 
  Mail, Send, Search, Filter, Trash2, 
  Loader2, RefreshCw, Eye, Calendar, FileText, Inbox
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const EmailsPage = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('sent');
  const [emails, setEmails] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);

  const isRTL = i18n.language === 'he';

  useEffect(() => {
    if (activeTab === 'sent') {
      fetchEmailHistory();
    } else if (activeTab === 'templates') {
      fetchTemplates();
    } else {
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  const fetchEmailHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/crm/emails/history', {
        params: { search: searchTerm, limit: 100 }
      });
      
      // Handle different response formats
      let emailsData = [];
      if (response?.emails) {
        emailsData = response.emails;
      } else if (Array.isArray(response)) {
        emailsData = response;
      } else if (response?.data) {
        emailsData = response.data;
      }
      
      setEmails(emailsData);
    } catch (error) {
      console.error('Error fetching email history:', error);
      toast.error(t('admin.crm.emails.errors.load_failed') || 'Failed to load email history');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/crm/emails/templates');
      
      // Handle different response formats
      let templatesData = [];
      if (response?.templates) {
        templatesData = response.templates;
      } else if (Array.isArray(response)) {
        templatesData = response;
      } else if (response?.data) {
        templatesData = response.data;
      }
      
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error(t('admin.crm.emails.errors.templates_load_failed') || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (emailId) => {
    if (!window.confirm(t('admin.crm.emails.delete_confirm') || 'Delete this email record?')) return;
    try {
      await api.delete(`/api/crm/emails/${emailId}`);
      toast.success(t('admin.crm.emails.deleted') || 'Email record deleted');
      fetchEmailHistory();
    } catch (error) {
      console.error('Error deleting email:', error);
      toast.error(t('admin.crm.emails.errors.delete_failed') || 'Failed to delete email record');
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'sent') {
      fetchEmailHistory();
    } else if (activeTab === 'templates') {
      fetchTemplates();
    }
    toast.success(t('admin.crm.common.refreshed') || 'Data refreshed');
  };

  const getStatusColor = (status) => {
    const colors = {
      sent: 'bg-green-100 text-green-800',
      delivered: 'bg-blue-100 text-blue-800',
      opened: 'bg-purple-100 text-purple-800',
      clicked: 'bg-indigo-100 text-indigo-800',
      failed: 'bg-red-100 text-red-800',
      bounced: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString(i18n.language, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderTabButton = (tabId, icon, labelKey) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === tabId
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100 border'
      }`}
    >
      {icon}
      <span>{t(labelKey)}</span>
    </button>
  );

  const renderSentTab = () => (
    <>
      {/* Search */}
      <div className="py-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.crm.common.search') || 'Search emails...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">{t('admin.crm.common.loading') || 'Loading...'}</p>
          </div>
        </div>
      ) : emails.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('admin.crm.emails.empty_title') || 'No emails sent yet'}
          </h3>
          <p className="text-gray-600">
            {t('admin.crm.emails.empty_description') || 'Emails sent to leads will appear here'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  {t('admin.crm.emails.columns.recipient') || 'Recipient'}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  {t('admin.crm.emails.columns.subject') || 'Subject'}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  {t('admin.crm.emails.columns.date') || 'Date'}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  {t('admin.crm.emails.columns.status') || 'Status'}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  {t('admin.crm.emails.columns.sent_by') || 'Sent By'}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  {t('admin.crm.common.actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {emails.map((email) => (
                <tr 
                  key={email.id || email._id || email.email_id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedEmail(email)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                        {getInitials(email.to_name || email.to)}
                      </div>
                      <div>
                        <p className="font-medium">{email.to_name || email.to}</p>
                        {email.to_email && (
                          <p className="text-sm text-gray-500">{email.to_email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{email.subject}</p>
                    {email.preview && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">{email.preview}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(email.created_at || email.sent_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(email.status)}`}>
                      {t(`admin.crm.emails.status.${email.status}`) || email.status || 'sent'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {email.sent_by || email.from_name || '-'}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedEmail(email)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={t('admin.crm.common.view') || 'View'}
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(email.id || email._id || email.email_id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('admin.crm.common.delete') || 'Delete'}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const renderReceivedTab = () => (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {t('admin.crm.emails.received_title') || 'Received Emails'}
      </h3>
      <p className="text-gray-600">
        {t('admin.crm.emails.received_description') || 'Email reception is not yet implemented in this CRM'}
      </p>
    </div>
  );

  const renderTemplatesTab = () => (
    <>
      {/* Templates Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">
          {t('admin.crm.emails.templates_info') || 'These templates are available in English, French, and Hebrew. They can be used when composing new emails.'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">{t('admin.crm.common.loading') || 'Loading...'}</p>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('admin.crm.emails.no_templates') || 'No templates available'}
          </h3>
          <p className="text-gray-600">
            {t('admin.crm.emails.no_templates_description') || 'Email templates will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template, index) => (
            <div key={template.id || template._id || index} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-lg">{template.name || template.title}</h4>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {template.language ? template.language.toUpperCase() : 'MULTI'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{template.description || template.subject}</p>
                  
                  {/* Language versions - Show all available translations */}
                  {template.translations && Object.keys(template.translations).length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-500">
                        {t('admin.crm.emails.available_languages') || 'Available in:'}
                      </p>
                      <div className="grid gap-2">
                        {Object.entries(template.translations).map(([lang, trans]) => (
                          <div key={lang} className="flex items-start gap-2 p-2 bg-gray-50 rounded text-sm">
                            <span className="px-2 py-0.5 bg-white border rounded text-xs font-medium min-w-[40px] text-center">
                              {lang.toUpperCase()}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{trans.subject || trans.name || template.name}</p>
                              {trans.body && (
                                <p className="text-gray-500 text-xs mt-1 line-clamp-2">{trans.body}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedEmail({ ...template, isTemplate: true })}
                  className="px-3 py-1 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  {t('admin.crm.common.view') || 'View'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      <Helmet>
        <title>{t('admin.crm.emails.title') || 'Emails'} | IGV CRM</title>
        <html lang={i18n.language} dir={isRTL ? 'rtl' : 'ltr'} />
      </Helmet>

      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col gap-4">
              {/* Title */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Mail className="w-6 h-6 text-blue-600" />
                    {t('admin.crm.emails.title') || 'Emails'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {activeTab === 'sent' && `${emails.length} ${t('admin.crm.emails.sent_count') || 'emails sent'}`}
                    {activeTab === 'received' && t('admin.crm.emails.received_tab') || 'Inbox'}
                    {activeTab === 'templates' && `${templates.length} ${t('admin.crm.emails.templates_count') || 'templates available'}`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t('admin.crm.common.refresh') || 'Refresh'}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto">
                {renderTabButton('sent', <Send className="w-4 h-4" />, 'admin.crm.emails.tabs.sent')}
                {renderTabButton('received', <Inbox className="w-4 h-4" />, 'admin.crm.emails.tabs.received')}
                {renderTabButton('templates', <FileText className="w-4 h-4" />, 'admin.crm.emails.tabs.templates')}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 pb-6">
          {activeTab === 'sent' && renderSentTab()}
          {activeTab === 'received' && renderReceivedTab()}
          {activeTab === 'templates' && renderTemplatesTab()}
        </main>

        {/* Detail Modal */}
        {selectedEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-bold">
                  {selectedEmail.isTemplate 
                    ? (t('admin.crm.emails.template_detail') || 'Template Details')
                    : (t('admin.crm.emails.detail_title') || 'Email Details')}
                </h3>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {selectedEmail.isTemplate && selectedEmail.language && (
                    <div className="mb-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {selectedEmail.language.toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Subject/Title */}
                  <div>
                    <span className="text-sm text-gray-600">
                      {selectedEmail.isTemplate ? 'Name:' : t('admin.crm.emails.columns.subject') || 'Subject'}:
                    </span>
                    <p className="font-medium text-lg">{selectedEmail.subject || selectedEmail.name || selectedEmail.title}</p>
                  </div>
                  
                  {!selectedEmail.isTemplate && (
                    <>
                      {/* Recipient Info */}
                      <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-sm text-gray-600">{t('admin.crm.emails.columns.recipient') || 'To'}:</span>
                          <p className="font-medium">{selectedEmail.to_name || selectedEmail.to}</p>
                          {selectedEmail.to_email && <p className="text-sm text-gray-500">{selectedEmail.to_email}</p>}
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">{t('admin.crm.emails.columns.date') || 'Date'}:</span>
                          <p className="font-medium">{formatDate(selectedEmail.created_at || selectedEmail.sent_at)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">{t('admin.crm.emails.columns.status') || 'Status'}:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(selectedEmail.status)}`}>
                            {t(`admin.crm.emails.status.${selectedEmail.status}`) || selectedEmail.status || 'sent'}
                          </span>
                        </div>
                        {selectedEmail.sent_by && (
                          <div>
                            <span className="text-sm text-gray-600">{t('admin.crm.emails.columns.sent_by') || 'Sent By'}:</span>
                            <p className="font-medium">{selectedEmail.sent_by}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Email Body / Template Content */}
                  {selectedEmail.body && (
                    <div>
                      <span className="text-sm text-gray-600">Content:</span>
                      <div className="mt-2 p-4 bg-white border rounded-lg whitespace-pre-wrap text-sm">
                        {selectedEmail.body}
                      </div>
                    </div>
                  )}
                  
                  {/* Template Translations */}
                  {selectedEmail.translations && (
                    <div>
                      <span className="text-sm text-gray-600 mb-2 block">Translations:</span>
                      <div className="space-y-3">
                        {Object.entries(selectedEmail.translations).map(([lang, trans]) => (
                          <div key={lang} className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs font-medium text-gray-600 uppercase">{lang}</span>
                            <p className="mt-1 text-sm">{trans.subject || trans.name}</p>
                            {trans.body && (
                              <p className="mt-1 text-xs text-gray-500 truncate">{trans.body}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Reference */}
                  {selectedEmail.request_id && (
                    <div className="text-sm text-gray-500">
                      <span>{t('admin.crm.common.reference') || 'Reference'}:</span> {selectedEmail.request_id}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="flex justify-end p-4 border-t bg-gray-50">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  {t('admin.crm.common.close') || 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EmailsPage;
