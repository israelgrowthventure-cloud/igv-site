import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Check, X, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const AdminPayments = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'https://igv-cms-backend.onrender.com'}/api/monetico/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load payments');
      
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'INITIATED': 'bg-yellow-200 text-yellow-800',
      'PENDING': 'bg-blue-200 text-blue-800',
      'PAID': 'bg-green-200 text-green-800',
      'FAILED': 'bg-red-200 text-red-800',
      'REFUNDED': 'bg-purple-200 text-purple-800',
      'CANCELED': 'bg-gray-400 text-white'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || colors.PENDING}`}>
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
        <h1 className="text-2xl font-bold">Payments</h1>
        <div className="text-sm text-gray-600">
          Total: {payments.length} payment{payments.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">{payment.payment_id}</div>
                  {payment.monetico_reference && (
                    <div className="text-xs text-gray-500">Ref: {payment.monetico_reference}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{payment.client_name}</div>
                  <div className="text-sm text-gray-500">{payment.client_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {payment.amount?.toFixed(2)} {payment.currency}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(payment.status)}
                  {payment.error_message && (
                    <div className="text-xs text-red-600 mt-1" title={payment.error_message}>
                      {payment.error_code || 'Error'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {payment.payment_method || 'Monetico'}
                    </span>
                  </div>
                  {payment.card_last4 && (
                    <div className="text-xs text-gray-500">···· {payment.card_last4}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(payment.initiated_at || payment.created_at).toLocaleDateString()}
                  {payment.paid_at && (
                    <div className="text-xs text-green-600">
                      Paid: {new Date(payment.paid_at).toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {payment.invoice_id ? (
                    <a
                      href={`/admin/invoices/${payment.invoice_id}`}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      View Invoice
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {payments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No payments yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
