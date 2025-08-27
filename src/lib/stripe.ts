import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';
import { STRIPE_PRODUCTS, COMMISSION_RATES } from '../stripe-config';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key');
}

export const stripe = loadStripe(stripePublishableKey);

// Re-export for convenience
export { STRIPE_PRODUCTS, COMMISSION_RATES };

export const createCheckoutSession = async (
  priceId: string, 
  mode: 'payment' | 'subscription',
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