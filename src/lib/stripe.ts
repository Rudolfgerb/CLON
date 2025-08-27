import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key');
}

export const stripe = loadStripe(stripePublishableKey);

// Product configurations
export const STRIPE_PRODUCTS = {
  premium: {
    priceId: 'price_premium_monthly_1999',
    name: 'Premium Mitgliedschaft',
    price: '€19.99',
    period: '/Monat',
    features: [
      'Nur 5% Gebühren statt 9.8%',
      'Unbegrenzte Job-Bewerbungen',
      'Premium Kurse',
      'Prioritäts-Support',
      'Erweiterte Analytics'
    ]
  },
  karma_1000: {
    priceId: 'price_karma_1000_299',
    name: '1000 Karma Punkte',
    price: '€2.99',
    karma: 1000,
    features: [
      '1000 Karma Punkte',
      'Sofort verfügbar',
      'Für Community Jobs verwenden'
    ]
  }
};

export const COMMISSION_RATES = {
  regular: 0.098, // 9.8%
  premium: 0.05   // 5%
};

export const createCheckoutSession = async (
  priceId: string, 
  mode: 'payment' | 'subscription' = 'payment',
  metadata?: Record<string, string>
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_id: priceId,
        mode,
        success_url: `${window.location.origin}?success=true`,
        cancel_url: `${window.location.origin}?canceled=true`,
        metadata
      }),
    });

    const { sessionId, url, error } = await response.json();

    if (error) {
      throw new Error(error);
    }

    if (url) {
      window.location.href = url;
    }

    return { sessionId, url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const calculateJobCommission = (amount: number, isPremium: boolean) => {
  const rate = isPremium ? COMMISSION_RATES.premium : COMMISSION_RATES.regular;
  const commission = amount * rate;
  const netAmount = amount - commission;
  
  return {
    grossAmount: amount,
    commission,
    netAmount,
    commissionRate: rate * 100
  };
};