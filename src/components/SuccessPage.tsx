import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Star, Crown, Gift } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getProductByPriceId } from '../stripe-config';

interface SuccessPageProps {
  isDark: boolean;
  onContinue: () => void;
}

interface UserSubscription {
  subscription_status: string;
  price_id: string | null;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ isDark, onContinue }) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const { data: subscriptionData } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (subscriptionData) {
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuccessContent = () => {
    if (!subscription?.price_id) {
      return {
        icon: Gift,
        title: 'Zahlung erfolgreich!',
        subtitle: 'Vielen Dank für Ihren Kauf',
        description: 'Ihre Bestellung wurde erfolgreich verarbeitet.',
        color: 'from-green-500 to-green-600'
      };
    }

    const product = getProductByPriceId(subscription.price_id);
    
    if (product?.mode === 'subscription') {
      return {
        icon: Crown,
        title: 'Willkommen bei Premium!',
        subtitle: 'Ihr Upgrade war erfolgreich',
        description: 'Sie haben jetzt Zugang zu allen Premium-Features und können sofort loslegen.',
        color: 'from-yellow-500 to-orange-500'
      };
    } else {
      return {
        icon: Star,
        title: 'Karma-Punkte erhalten!',
        subtitle: '1000 Karma-Punkte wurden gutgeschrieben',
        description: 'Ihre Karma-Punkte stehen Ihnen jetzt zur Verfügung und können sofort verwendet werden.',
        color: 'from-purple-500 to-purple-600'
      };
    }
  };

  const successContent = getSuccessContent();
  const SuccessIcon = successContent.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl text-center">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className={`w-24 h-24 bg-gradient-to-br ${successContent.color} rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shadow-lg shadow-green-500/30`}>
            <SuccessIcon className="w-12 h-12 text-white" />
          </div>
          
          {/* Animated rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-32 h-32 border-4 border-green-500/30 rounded-full animate-ping`}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-40 h-40 border-2 border-green-500/20 rounded-full animate-pulse`}></div>
          </div>
        </div>

        {/* Success Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {successContent.title}
          </h1>
          <p className="text-xl text-green-300 mb-4">
            {successContent.subtitle}
          </p>
          <p className="text-white/80 leading-relaxed">
            {successContent.description}
          </p>
        </div>

        {/* Features for Premium */}
        {subscription?.price_id && getProductByPriceId(subscription.price_id)?.mode === 'subscription' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              Ihre Premium-Vorteile:
            </h3>
            <div className="space-y-2 text-left">
              {[
                'Weniger Provision (5 %)',
                'Keine Auszahlungsgebühr',
                'Zugang zu Level 5 Jobs',
                'Priority Support'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  </div>
                  <span className="text-white/90 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className={`w-full bg-gradient-to-r ${successContent.color} text-white py-4 rounded-2xl font-semibold hover:scale-[1.02] transition-all duration-300 shadow-lg flex items-center justify-center space-x-2`}
        >
          <span>Zur App zurückkehren</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Additional Info */}
        <p className="text-white/60 text-sm mt-6">
          Eine Bestätigungs-E-Mail wurde an Ihre E-Mail-Adresse gesendet.
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;