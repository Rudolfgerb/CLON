import React, { useState } from 'react';
import { X, CreditCard, Loader2, Euro } from 'lucide-react';
import { createCheckoutSession } from '../lib/stripe';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  job: any;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, isDark, job, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !job) return null;

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create a one-time payment session
      await createCheckoutSession('price_job_payment', 'payment');
      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Fehler beim Erstellen der Zahlung');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = job.fixed_amount || (job.hourly_rate * job.estimated_hours);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl w-full max-w-md border shadow-2xl`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Job bezahlen
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
          </div>

          <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-xl p-4 mb-6`}>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              {job.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Gesamtbetrag:
              </span>
              <span className="text-2xl font-bold text-green-500">
                €{totalAmount}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Wird geladen...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Mit Stripe bezahlen</span>
              </>
            )}
          </button>

          <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center`}>
              Sichere Zahlung über Stripe • SSL-verschlüsselt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;