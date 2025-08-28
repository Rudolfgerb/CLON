import React, { useState, useEffect, useCallback } from 'react';
import {
  Euro, TrendingUp, DollarSign, CreditCard,
  Download, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminPaymentsProps {
  isDark: boolean;
}

interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AdminPayments: React.FC<AdminPaymentsProps> = ({ isDark }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    // Implementation for updating job status
    console.log('Update job status:', jobId, newStatus);
  };

  const deleteJob = async (jobId: string) => {
    // Implementation for deleting job
    console.log('Delete job:', jobId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-600';
      case 'pending': return 'bg-yellow-500/20 text-yellow-600';
      case 'failed': return 'bg-red-500/20 text-red-600';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  const loadTransactions = useCallback(async () => {
    try {
      let query = supabase
        .from('commission_transactions')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // Add date filter
      if (dateRange === '7d') {
        query = query.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      } else if (dateRange === '30d') {
        query = query.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.commission_amount || 0), 0);
  const totalPayouts = transactions.reduce((sum, t) => sum + (t.net_amount || 0), 0);
  const avgCommission = transactions.length ? (totalRevenue / transactions.length) : 0;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'job_commission': return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'payout': return <ArrowDownRight className="w-4 h-4 text-blue-500" />;
      case 'refund': return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      default: return <Euro className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-600';
      case 'pending': return 'bg-yellow-500/20 text-yellow-600';
      case 'failed': return 'bg-red-500/20 text-red-600';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Zahlungen werden geladen...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                €{totalRevenue.toFixed(2)}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Provision Einnahmen
              </p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Euro className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                €{totalPayouts.toFixed(2)}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Ausgezahlt
              </p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                €{avgCommission.toFixed(2)}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Ø Provision
              </p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {transactions.length}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Transaktionen
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            >
              <option value="7d">Letzte 7 Tage</option>
              <option value="30d">Letzte 30 Tage</option>
              <option value="90d">Letzte 90 Tage</option>
              <option value="1y">Dieses Jahr</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:scale-105 transition-transform">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Transaktion
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Benutzer
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Betrag
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Provision
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Datum
                </th>
              </tr>
            </thead>
            <tbody className={`${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className={`border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.transaction_type)}
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {transaction.transaction_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {transaction.profiles?.full_name || 'Unbekannt'}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {transaction.profiles?.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      €{transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-green-600 font-medium">
                        €{(transaction.commission_amount || 0).toFixed(2)}
                      </span>
                      <div className="text-xs text-gray-500">
                        {((transaction.commission_rate || 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(transaction.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {transactions.length === 0 && (
          <div className="py-12 text-center">
            <Euro className={`w-12 h-12 ${isDark ? 'text-gray-400' : 'text-gray-400'} mx-auto mb-4`} />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Keine Transaktionen gefunden
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;