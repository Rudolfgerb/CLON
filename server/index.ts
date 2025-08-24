import express from 'express';
import Stripe from 'stripe';
import { Pool } from 'pg';
import cron from 'node-cron';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PREMIUM_PRICE_ID = 'price_1RzfLwFUBYwTdlMckPbqoeBD';
const KARMA_PRICE_ID = 'price_1RzfFSFUBYwTdlMcL1q2vDFu';
const STANDARD_COMMISSION = 0.098;
const PREMIUM_COMMISSION = 0.05;

const app = express();
app.use(express.json());

async function ensureCustomer(userId: string, email?: string): Promise<string> {
  const { rows } = await pool.query('SELECT stripe_customer_id FROM users WHERE id=$1', [userId]);
  let customerId = rows[0]?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { userId } });
    customerId = customer.id;
    await pool.query('UPDATE users SET stripe_customer_id=$1 WHERE id=$2', [customerId, userId]);
  }
  return customerId;
}

app.post('/api/premium/create-checkout-session', async (req, res) => {
  try {
    const { userId, success_url, cancel_url } = req.body;
    const { rows } = await pool.query('SELECT email FROM users WHERE id=$1', [userId]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    const customerId = await ensureCustomer(userId, rows[0].email);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
      success_url,
      cancel_url,
    });
    res.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/karma/create-checkout-session', async (req, res) => {
  try {
    const { userId, success_url, cancel_url } = req.body;
    const { rows } = await pool.query('SELECT email FROM users WHERE id=$1', [userId]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    const customerId = await ensureCustomer(userId, rows[0].email);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{ price: KARMA_PRICE_ID, quantity: 1 }],
      success_url,
      cancel_url,
    });
    res.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object as any;
  const customerId = session.customer as string;
  const { rows } = await pool.query('SELECT id FROM users WHERE stripe_customer_id=$1', [customerId]);
  const userId = rows[0]?.id;

  switch (event.type) {
    case 'checkout.session.completed':
      if (session.mode === 'subscription' && userId) {
        const subscriptionId = session.subscription as string;
        const premiumSince = new Date();
        const premiumUntil = new Date();
        premiumUntil.setMonth(premiumUntil.getMonth() + 1);
        await pool.query(
          'UPDATE users SET is_premium=true, premium_since=$1, premium_until=$2, stripe_subscription_id=$3 WHERE id=$4',
          [premiumSince, premiumUntil, subscriptionId, userId],
        );
      }
      if (session.mode === 'payment' && userId) {
        await pool.query(
          'INSERT INTO karma_purchases (user_id, stripe_price_id, amount, karma_points, status) VALUES ($1,$2,$3,$4,$5)',
          [userId, KARMA_PRICE_ID, 2.99, 1000, 'completed'],
        );
        await pool.query('UPDATE users SET karma = COALESCE(karma,0) + 1000 WHERE id=$1', [userId]);
      }
      break;
    case 'customer.subscription.updated':
      if (userId) {
        const { current_period_end, cancel_at_period_end, status } = session as any;
        await pool.query(
          'UPDATE users SET premium_until=to_timestamp($1), auto_renew=NOT $2, is_premium=$3 WHERE id=$4',
          [current_period_end, cancel_at_period_end, status === 'active', userId],
        );
      }
      break;
    case 'customer.subscription.deleted':
      if (userId) {
        await pool.query(
          'UPDATE users SET is_premium=false, premium_until=NOW(), auto_renew=false WHERE id=$1',
          [userId],
        );
      }
      break;
    case 'invoice.payment_failed':
      if (userId) {
        await pool.query('UPDATE users SET is_premium=false WHERE id=$1', [userId]);
      }
      break;
    default:
      break;
  }
  res.json({ received: true });
});

app.get('/api/premium/status', async (req, res) => {
  const { userId } = req.query as { userId: string };
  const { rows } = await pool.query(
    'SELECT is_premium, premium_since, premium_until, auto_renew FROM users WHERE id=$1',
    [userId],
  );
  res.json(rows[0] || {});
});

app.post('/api/premium/cancel', async (req, res) => {
  const { userId } = req.body;
  const { rows } = await pool.query('SELECT stripe_subscription_id FROM users WHERE id=$1', [userId]);
  const subId = rows[0]?.stripe_subscription_id;
  if (!subId) return res.status(400).json({ error: 'No subscription' });
  await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
  await pool.query('UPDATE users SET auto_renew=false WHERE id=$1', [userId]);
  res.json({ success: true });
});

// Calculate commission for a completed job
app.post('/api/commission/calculate', async (req, res) => {
  try {
    const { jobId, employerId, workerId, jobAmount } = req.body;
    const { rows } = await pool.query('SELECT is_premium FROM users WHERE id=$1', [employerId]);
    const isPremium = rows[0]?.is_premium;
    const percentage = isPremium ? PREMIUM_COMMISSION : STANDARD_COMMISSION;
    const commission = Number(jobAmount) * percentage;
    await pool.query(
      'INSERT INTO job_transactions (job_id, employer_id, worker_id, job_amount, commission_percentage, commission_amount) VALUES ($1,$2,$3,$4,$5,$6)',
      [jobId, employerId, workerId, jobAmount, percentage * 100, commission],
    );
    res.json({ commission });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get commission overview for a user
app.get('/api/commission/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { rows } = await pool.query('SELECT * FROM job_transactions WHERE employer_id=$1', [userId]);
  res.json(rows);
});

// List invoices for all users or a specific user via query
app.get('/api/invoices', async (req, res) => {
  const { userId } = req.query as { userId?: string };
  const sql = userId
    ? 'SELECT * FROM user_commissions WHERE user_id=$1'
    : 'SELECT * FROM user_commissions';
  const params = userId ? [userId] : [];
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

// Manually pay a Stripe invoice
app.post('/api/invoices/pay', async (req, res) => {
  const { invoiceId } = req.body;
  try {
    const invoice = await stripe.invoices.pay(invoiceId);
    res.json(invoice);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Cron job: run monthly commission aggregation on 1st day of month at midnight
cron.schedule('0 0 1 * *', async () => {
  const prevMonth = new Date();
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const monthKey = prevMonth.toISOString().slice(0, 7);
  const { rows } = await pool.query(
    "SELECT employer_id, SUM(commission_amount) AS total, COUNT(*) AS jobs FROM job_transactions WHERE status='pending' AND to_char(created_at,'YYYY-MM')=$1 GROUP BY employer_id",
    [monthKey],
  );
  for (const row of rows) {
    const userId = row.employer_id;
    const total = Number(row.total);
    const jobs = Number(row.jobs);
    const customerId = await ensureCustomer(userId);
    await stripe.invoiceItems.create({
      customer: customerId,
      amount: Math.round(total * 100),
      currency: 'eur',
      description: `Commission for ${monthKey}`,
    });
    const invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: true,
      description: `Commission ${monthKey}`,
    });
    await pool.query(
      'INSERT INTO user_commissions (user_id, month_year, total_commission, total_jobs, payment_status, stripe_invoice_id, due_date) VALUES ($1,$2,$3,$4,$5,$6,to_timestamp($7))',
      [
        userId,
        monthKey,
        total,
        jobs,
        'processing',
        invoice.id,
        Math.floor(invoice.due_date || Date.now() / 1000),
      ],
    );
    await pool.query('UPDATE job_transactions SET status=$1 WHERE employer_id=$2 AND to_char(created_at,\'YYYY-MM\')=$3', ['collected', userId, monthKey]);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
