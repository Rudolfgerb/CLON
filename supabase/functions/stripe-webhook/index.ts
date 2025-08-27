import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!, 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error) {
      const err = error as { message?: string };
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook signature verification failed`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));
    return Response.json({ received: true });

  } catch (error) {
    const err = error as { message?: string };
    console.error('Webhook error:', error);
    return Response.json({ error: err.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(stripeData as Stripe.Checkout.Session);
      break;
    
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionChange(stripeData as Stripe.Subscription);
      break;
    
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(stripeData as Stripe.PaymentIntent);
      break;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { customer, mode, metadata, amount_total } = session;
  
  if (!customer || typeof customer !== 'string') return;

  // Get user from customer mapping
  const { data: customerData } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customer)
    .single();

  if (!customerData) return;

  if (mode === 'subscription') {
    // Handle premium subscription
    await supabase
      .from('profiles')
      .update({ 
        premium: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerData.user_id);
      
  } else if (mode === 'payment' && metadata?.product_type === 'karma_1000') {
    // Handle karma purchase
    await supabase.rpc('process_karma_purchase', {
      user_id: customerData.user_id,
      karma_amount: 1000,
      payment_amount: (amount_total || 0) / 100
    });
  }

  // Record the order
  await supabase.from('stripe_orders').insert({
    checkout_session_id: session.id,
    customer_id: customer,
    amount_total: amount_total,
    payment_status: session.payment_status,
    status: 'completed',
    product_type: metadata?.product_type || 'unknown',
    metadata: metadata || {}
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const { customer, status } = subscription;
  
  if (typeof customer !== 'string') return;

  const { data: customerData } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customer)
    .single();

  if (!customerData) return;

  const isActive = status === 'active';
  
  await supabase
    .from('profiles')
    .update({ 
      premium: isActive,
      premium_expires_at: isActive ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', customerData.user_id);
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Handle successful payments for job commissions
  console.log('Payment succeeded:', paymentIntent.id);
}