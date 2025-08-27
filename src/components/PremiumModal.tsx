import React, { useState } from 'react';
import { X, Crown, Check, Loader2, Star, Zap } from 'lucide-react';
import { createCheckoutSession } from '../lib/stripe';
import { STRIPE_PRODUCTS } from '../stripe-config';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, isDark }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePurchase = async (productKey: string, mode: 'payment' | 'subscription') => {
    const product = STRIPE_PRODUCTS[productKey as keyof typeof STRIPE_PRODUCTS];
    setLoading(product.priceId);
    setError('');

    try {
      await createCheckoutSession(product.priceId, mode, { 
        product_type: productKey,
        product_id: product.id
      });
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
                Premium & Karma
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Premium Subscription */}
            <div className={`${isDark ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'} rounded-2xl p-6 border-2`}>
              <div className="flex items-center space-x-3 mb-4">
                <Crown className="w-8 h-8 text-yellow-500" />
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {STRIPE_PRODUCTS.premium.name}
                  </h3>
                  <p className="text-yellow-600 font-medium">Premium Mitgliedschaft</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline space-x-2">
                  <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {STRIPE_PRODUCTS.premium.price}
                  </span>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {STRIPE_PRODUCTS.premium.period}
                  </span>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-green-50 border border-yellow-200 rounded-xl p-3 mt-3">
                  <div className="flex items-center space-x-4 text-sm">
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    Normal: 9.8% Provision
                  </span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Premium: nur 5% Provision
                  </span>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {STRIPE_PRODUCTS.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase('premium', 'subscription')}
                disabled={loading === STRIPE_PRODUCTS.premium.priceId}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {loading === STRIPE_PRODUCTS.premium.priceId ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Wird geladen...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>Premium Zugang erhalten</span>
                  </>
                )}
              </button>
            </div>

            {/* Karma Package */}
            <div className={`${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-6 border`}>
              <div className="flex items-center space-x-3 mb-4">
                <Star className="w-8 h-8 text-purple-500" />
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {STRIPE_PRODUCTS.karma_1000.name}
                  </h3>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {STRIPE_PRODUCTS.karma_1000.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6 text-purple-500" />
                  <span className={`text-xl font-bold text-purple-500`}>
                    {STRIPE_PRODUCTS.karma_1000.karma} Karma Punkte
                  </span>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {STRIPE_PRODUCTS.karma_1000.price}
                  </div>
                  <div className="text-sm text-purple-500">Einmalige Zahlung</div>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {STRIPE_PRODUCTS.karma_1000.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase('karma_1000', 'payment')}
                disabled={loading === STRIPE_PRODUCTS.karma_1000.priceId}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {loading === STRIPE_PRODUCTS.karma_1000.priceId ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Wird geladen...</span>
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5" />
                    <span>Karma kaufen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center`}>
              Sichere Zahlung über Stripe • SSL-verschlüsselt • Sofort verfügbar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;