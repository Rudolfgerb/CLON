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

// Lesson management endpoints
app.post('/api/lessons', async (req, res) => {
  try {
    const { title, description, content, creator_id, is_published = true, difficulty_level, estimated_duration } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO lessons (title, description, content, creator_id, is_published, difficulty_level, estimated_duration)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, description, content, creator_id, is_published, difficulty_level, estimated_duration],
    );
    res.json(rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, is_published, difficulty_level, estimated_duration, user_id } = req.body;
    const { rows: creator } = await pool.query('SELECT creator_id FROM lessons WHERE id=$1', [id]);
    if (!creator[0] || creator[0].creator_id !== user_id) return res.status(403).json({ error: 'Forbidden' });
    const { rows } = await pool.query(
      `UPDATE lessons SET title=$1, description=$2, content=$3, is_published=$4, difficulty_level=$5, estimated_duration=$6, updated_at=NOW() WHERE id=$7 RETURNING *`,
      [title, description, content, is_published, difficulty_level, estimated_duration, id],
    );
    res.json(rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const { rows: creator } = await pool.query('SELECT creator_id FROM lessons WHERE id=$1', [id]);
    if (!creator[0] || creator[0].creator_id !== user_id) return res.status(403).json({ error: 'Forbidden' });
    await pool.query('DELETE FROM lessons WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/lessons', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT l.*, COALESCE(c.count,0) AS completions, COALESCE(r.avg_rating,0) AS avg_rating
      FROM lessons l
      LEFT JOIN (
        SELECT lesson_id, COUNT(*) AS count FROM lesson_completions GROUP BY lesson_id
      ) c ON c.lesson_id = l.id
      LEFT JOIN (
        SELECT lesson_id, AVG(rating)::float AS avg_rating FROM lesson_ratings GROUP BY lesson_id
      ) r ON r.lesson_id = l.id
      WHERE l.is_published = true
      ORDER BY l.created_at DESC
    `);
    res.json(rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT l.*, COALESCE(c.count,0) AS completions, COALESCE(r.avg_rating,0) AS avg_rating
       FROM lessons l
       LEFT JOIN (
         SELECT lesson_id, COUNT(*) AS count FROM lesson_completions GROUP BY lesson_id
       ) c ON c.lesson_id = l.id
       LEFT JOIN (
         SELECT lesson_id, AVG(rating)::float AS avg_rating FROM lesson_ratings GROUP BY lesson_id
       ) r ON r.lesson_id = l.id
       WHERE l.id=$1`,
      [id],
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/lessons/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, score } = req.body;
    const { rows: existing } = await pool.query('SELECT 1 FROM lesson_completions WHERE lesson_id=$1 AND user_id=$2', [id, user_id]);
    if (existing[0]) return res.status(400).json({ error: 'Already completed' });
    await pool.query('INSERT INTO lesson_completions (lesson_id, user_id, score) VALUES ($1,$2,$3)', [id, user_id, score]);
    const { rows: creator } = await pool.query('SELECT creator_id FROM lessons WHERE id=$1', [id]);
    if (creator[0]) {
      await pool.query('UPDATE users SET karma = COALESCE(karma,0) + 10 WHERE id=$1', [creator[0].creator_id]);
    }
    await pool.query('UPDATE users SET karma = COALESCE(karma,0) + 5 WHERE id=$1', [user_id]);
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/lessons/:id/completion-stats', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT COUNT(*) AS completions, AVG(score)::float AS average_score FROM lesson_completions WHERE lesson_id=$1',
      [id],
    );
    res.json(rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/lessons/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, rating, review } = req.body;
    await pool.query(
      `INSERT INTO lesson_ratings (lesson_id, user_id, rating, review)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (lesson_id, user_id) DO UPDATE SET rating=$3, review=$4, created_at=NOW()`,
      [id, user_id, rating, review],
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

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

app.post('/api/karma/exchange', async (req, res) => {
  try {
    const { userId, type, amount } = req.body as { userId: string; type: 'karma_to_money' | 'money_to_karma'; amount: number };
    const exchangeRate = 1000; // 1000 karma = 1 euro
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (type === 'karma_to_money') {
        const { rows: userRows } = await client.query('SELECT karma FROM users WHERE id=$1', [userId]);
        const currentKarma = Number(userRows[0]?.karma || 0);
        if (currentKarma < amount) throw new Error('Nicht genug Karma');
        const euros = amount / exchangeRate;
        await client.query('UPDATE users SET karma = karma - $1 WHERE id=$2', [amount, userId]);
        await client.query('UPDATE user_wallets SET balance_euros = balance_euros + $1 WHERE user_id=$2', [euros, userId]);
        await client.query(
          `INSERT INTO karma_transactions (user_id, transaction_type, karma_amount, money_amount, exchange_rate, status, description, completed_at) VALUES ($1,'karma_to_money',$2,$3,$4,'completed','Karma zu Geld',now())`,
          [userId, amount, euros, exchangeRate]
        );
      } else if (type === 'money_to_karma') {
        const euros = amount;
        const karma = amount * exchangeRate;
        const { rows: walletRows } = await client.query('SELECT balance_euros FROM user_wallets WHERE user_id=$1', [userId]);
        const balance = Number(walletRows[0]?.balance_euros || 0);
        if (balance < euros) throw new Error('Nicht genug Guthaben');
        await client.query('UPDATE user_wallets SET balance_euros = balance_euros - $1 WHERE user_id=$2', [euros, userId]);
        await client.query('UPDATE users SET karma = karma + $1 WHERE id=$2', [karma, userId]);
        await client.query(
          `INSERT INTO karma_transactions (user_id, transaction_type, karma_amount, money_amount, exchange_rate, status, description, completed_at) VALUES ($1,'money_to_karma',$2,$3,$4,'completed','Geld zu Karma',now())`,
          [userId, karma, euros, exchangeRate]
        );
      } else {
        throw new Error('Ungültiger Typ');
      }
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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
