import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { 
  Mail, Send, Search, Filter, Trash2, 
  Loader2, RefreshCw, Eye, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const EmailsPage = () => {
  const { t, i18n } = useTranslation();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);

  const isRTL = i18n.language === 'he';

  useEffect(() => {
    fetchEmailHistory();
  }, [searchTerm]);

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
    fetchEmailHistory();
    toast.success(t('admin.crm.emails.refreshed') || 'Email history refreshed');
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

  return (
    <>
      <Helmet>
        <title>{t('admin.crm.emails.history_title') || 'Email History'} | IGV CRM</title>
        <html lang={i18n.language} dir={isRTL ? 'rtl' : 'ltr'} />
      </Helmet>

      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Mail className="w-6 h-6 text-blue-600" />
                  {t('admin.crm.emails.history_title') || 'Email History'}
                </h1>
                <p className="text-sm text-gray-600">
                  {emails.length} {t('admin.crm.emails.sent_count') || 'emails sent'}
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
          </div>
        </header>

        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 py-4">
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
        <main className="max-w-7xl mx-auto px-4 pb-6">
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
        </main>

        {/* Email Detail Modal */}
        {selectedEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-bold">{t('admin.crm.emails.detail_title') || 'Email Details'}</h3>
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
                  {/* Subject */}
                  <div>
                    <span className="text-sm text-gray-600">{t('admin.crm.emails.columns.subject') || 'Subject'}:</span>
                    <p className="font-medium text-lg">{selectedEmail.subject}</p>
                  </div>
                  
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
                  
                  {/* Email Body */}
                  {selectedEmail.body && (
                    <div>
                      <span className="text-sm text-gray-600">Content:</span>
                      <div className="mt-2 p-4 bg-white border rounded-lg whitespace-pre-wrap text-sm">
                        {selectedEmail.body}
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
