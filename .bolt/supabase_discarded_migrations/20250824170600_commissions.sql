-- Track job-level commission records
CREATE TABLE IF NOT EXISTS job_transactions (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES users(id),
  worker_id UUID REFERENCES users(id),
  job_amount NUMERIC(10,2) NOT NULL,
  commission_percentage NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Monthly aggregated commissions per user
CREATE TABLE IF NOT EXISTS user_commissions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  month_year TEXT NOT NULL,
  total_commission NUMERIC(10,2) DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid',
  stripe_invoice_id TEXT,
  due_date TIMESTAMPTZ
);
