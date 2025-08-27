import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key');
}

export const stripe = loadStripe(stripePublishableKey);

// Product configurations
export const STRIPE_PRODUCTS = {
  premium_monthly: {
    priceId: 'price_premium_monthly',
    name: 'Premium Monatlich',
    price: '€9.99/Monat',
    features: [
      'Unbegrenzte Job-Bewerbungen',
      'Premium Kurse',
      'Prioritäts-Support',
      'Erweiterte Analytics'
    ]
  },
  premium_yearly: {
    priceId: 'price_premium_yearly',
    name: 'Premium Jährlich',
    price: '€99.99/Jahr',
    features: [
      'Alle Premium Features',
      '2 Monate kostenlos',
      'Exklusive Workshops',
      'Persönlicher Mentor'
    ]
  }
};

export const createCheckoutSession = async (priceId: string, mode: 'payment' | 'subscription' = 'subscription') => {
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
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/cancel`,
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

import { supabase } from './supabase';