import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { 
  Mail, Send, Inbox, Search, Filter, Plus, Trash2, 
  Loader2, Edit2, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const EmailsPage = () => {
  const { t, i18n } = useTranslation();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);

  const isRTL = i18n.language === 'he';

  useEffect(() => {
    fetchEmails();
  }, [activeTab, searchTerm]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'sent' ? '/api/crm/emails/sent' : '/api/crm/emails/inbox';
      const response = await api.get(endpoint, {
        params: { search: searchTerm, limit: 50 }
      });
      setEmails(response?.emails || response || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error(t('admin.crm.emails.errors.load_failed') || 'Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (emailId) => {
    if (!window.confirm(t('admin.crm.emails.delete_confirm') || 'Delete this email?')) return;
    try {
      await api.delete(`/api/crm/emails/${emailId}`);
      toast.success(t('admin.crm.emails.deleted') || 'Email deleted');
      fetchEmails();
    } catch (error) {
      toast.error(t('admin.crm.emails.errors.delete_failed') || 'Failed to delete email');
    }
  };

  const handleRefresh = () => {
    fetchEmails();
    toast.success(t('admin.crm.emails.refreshed') || 'Emails refreshed');
  };

  const getStatusColor = (status) => {
    const colors = {
      read: 'bg-gray-100 text-gray-800',
      unread: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Mail className="w-6 h-6 text-blue-600" />
                  {t('admin.crm.emails.title') || 'Emails'}
                </h1>
                <p className="text-sm text-gray-600">
                  {emails.length} {t('admin.crm.emails.count') || 'emails'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('admin.crm.common.refresh') || 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'inbox' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
                }`}
              >
                <Inbox className="w-4 h-4" />
                {t('admin.crm.emails.inbox') || 'Inbox'}
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'sent' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
                }`}
              >
                <Send className="w-4 h-4" />
                {t('admin.crm.emails.sent') || 'Sent'}
              </button>
            </nav>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.crm.common.search') || 'Search emails...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full max-w-md"
            />
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : emails.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{t('admin.crm.emails.empty') || 'No emails yet'}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {t('admin.crm.emails.columns.from') || 'From'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {t('admin.crm.emails.columns.to') || 'To'}
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
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                      {t('admin.crm.common.actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {emails.map((email) => (
                    <tr 
                      key={email.id || email.email_id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedEmail(email)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{email.from_name || email.from}</p>
                        {email.from_email && <p className="text-sm text-gray-500">{email.from_email}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{email.to_name || email.to}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{email.subject}</p>
                        {email.preview && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">{email.preview}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {email.created_at || email.sent_at 
                          ? new Date(email.created_at || email.sent_at).toLocaleString() 
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(email.status)}`}>
                          {t(`admin.crm.emails.status.${email.status}`) || email.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(email.id || email.email_id)}
                            className="p-2 hover:bg-red-50 rounded-lg"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">{selectedEmail.subject}</h3>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="border-b pb-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t('admin.crm.emails.columns.from') || 'From'}:</span>
                    <p className="font-medium">{selectedEmail.from_name || selectedEmail.from}</p>
                    {selectedEmail.from_email && <p className="text-gray-500">{selectedEmail.from_email}</p>}
                  </div>
                  <div>
                    <span className="text-gray-600">{t('admin.crm.emails.columns.to') || 'To'}:</span>
                    <p className="font-medium">{selectedEmail.to_name || selectedEmail.to}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('admin.crm.emails.columns.date') || 'Date'}:</span>
                    <p className="font-medium">
                      {selectedEmail.created_at || selectedEmail.sent_at
                        ? new Date(selectedEmail.created_at || selectedEmail.sent_at).toLocaleString()
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedEmail.body || selectedEmail.html_content}</p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
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

// Helper components needed
const X = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default EmailsPage;
