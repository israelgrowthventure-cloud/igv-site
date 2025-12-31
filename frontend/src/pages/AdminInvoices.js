import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Send, FileText, Check, X, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const AdminInvoices = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'https://igv-cms-backend.onrender.com'}/api/invoices/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load invoices');
      
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async (invoiceId) => {
    try {
      setPdfLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'https://igv-cms-backend.onrender.com'}/api/invoices/${invoiceId}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const data = await response.json();
      
      // Download PDF
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${data.pdf_base64}`;
      link.download = `Invoice_${data.invoice_number}.pdf`;
      link.click();
      
      toast.success('PDF generated successfully!');
      loadInvoices();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSendEmail = async (invoiceId) => {
    try {
      setSendLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'https://igv-cms-backend.onrender.com'}/api/invoices/${invoiceId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to send email');
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Invoice sent successfully!');
        loadInvoices();
      } else {
        toast.error(data.error || 'Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setSendLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'DRAFT': 'bg-gray-200 text-gray-800',
      'SENT': 'bg-blue-200 text-blue-800',
      'PAID': 'bg-green-200 text-green-800',
      'OVERDUE': 'bg-red-200 text-red-800',
      'CANCELED': 'bg-gray-400 text-white'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || colors.DRAFT}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{invoice.client_name}</div>
                  <div className="text-sm text-gray-500">{invoice.client_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {invoice.total_amount?.toFixed(2)} {invoice.currency}
                  </div>
                  <div className="text-xs text-gray-500">
                    TVA 18%: {invoice.tax_amount?.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => handleGeneratePDF(invoice._id)}
                    disabled={pdfLoading}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                    title="Generate PDF"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={() => handleSendEmail(invoice._id)}
                    disabled={sendLoading || invoice.status === 'CANCELED'}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                    title="Send by Email"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                  {invoice.email_sent && (
                    <span className="text-green-600" title="Email sent">
                      <Check className="w-4 h-4 inline" />
                    </span>
                  )}
                  {invoice.email_error && (
                    <span className="text-red-600" title={invoice.email_error}>
                      <X className="w-4 h-4 inline" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {invoices.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No invoices yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInvoices;
