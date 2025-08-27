import React, { useState } from 'react';
import { X, Crown, Check, Loader2 } from 'lucide-react';
import { STRIPE_PRODUCTS, createCheckoutSession } from '../lib/stripe';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, isDark }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUpgrade = async (priceId: string) => {
    setLoading(priceId);
    setError('');

    try {
      await createCheckoutSession(priceId, 'subscription');
    } catch (error: any) {
      setError(error.message || 'Fehler beim Erstellen der Checkout-Session');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border shadow-2xl`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Premium Upgrade
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
          </div>

          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-8 text-center`}>
            Schalte erweiterte Features frei und maximiere dein Potenzial auf Mutuus
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="grid gap-6">
            {Object.entries(STRIPE_PRODUCTS).map(([key, product]) => (
              <div
                key={key}
                className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-6 border ${
                  key === 'premium_yearly' ? 'ring-2 ring-yellow-500/50' : ''
                }`}
              >
                {key === 'premium_yearly' && (
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                    BELIEBTESTE WAHL
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {product.name}
                  </h3>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {product.price}
                    </div>
                    {key === 'premium_yearly' && (
                      <div className="text-sm text-green-500 font-medium">2 Monate gratis</div>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(product.priceId)}
                  disabled={loading === product.priceId}
                  className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all ${
                    key === 'premium_yearly'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:scale-105'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105'
                  } disabled:opacity-50 disabled:scale-100`}
                >
                  {loading === product.priceId ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Wird geladen...</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-5 h-5" />
                      <span>Jetzt upgraden</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center`}>
              Sichere Zahlung über Stripe • Jederzeit kündbar • 30 Tage Geld-zurück-Garantie
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;