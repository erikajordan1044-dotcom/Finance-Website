-- ================================================================
-- BudgetWise — Supabase Database Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- 1. Profiles (extends auth.users — auto-created on signup)
CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email                 TEXT,
  stripe_customer_id    TEXT,
  subscription_status   TEXT DEFAULT 'inactive',  -- 'inactive' | 'active' | 'canceled' | 'past_due'
  subscription_plan     TEXT,                      -- 'monthly' | 'annual'
  subscription_end_date TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Budgets (one per user per month)
CREATE TABLE IF NOT EXISTS budgets (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  month      INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year       INTEGER NOT NULL,
  income     NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- 3. Budget categories
CREATE TABLE IF NOT EXISTS budget_categories (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id        UUID REFERENCES budgets ON DELETE CASCADE NOT NULL,
  user_id          UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name             TEXT NOT NULL,
  budgeted_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  color            TEXT DEFAULT '#6366f1',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES budget_categories ON DELETE SET NULL,
  amount      NUMERIC(12,2) NOT NULL,
  description TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  type        TEXT DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ───────────────────────────────────────────
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions       ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Budgets
CREATE POLICY "own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);

-- Budget categories
CREATE POLICY "own categories" ON budget_categories FOR ALL USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- ── Auto-create profile on signup ───────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- STRIPE WEBHOOK SETUP (for production)
-- ================================================================
-- 1. In Stripe Dashboard → Developers → Webhooks → Add Endpoint
-- 2. Set endpoint URL to your Supabase Edge Function URL:
--    https://<your-project>.supabase.co/functions/v1/stripe-webhook
-- 3. Listen for events: customer.subscription.created,
--    customer.subscription.updated, customer.subscription.deleted,
--    checkout.session.completed
--
-- The Edge Function code is at: supabase/functions/stripe-webhook/index.ts
--
-- PAYMENT LINKS SETUP:
-- 1. Create a Product in Stripe Dashboard
-- 2. Add two Prices: monthly ($9.99/mo) and annual ($79.99/yr)
-- 3. Create Payment Links for each price
-- 4. Set the success URL to: https://your-app.com/?payment_success=true
-- 5. Add to .env.local:
--    VITE_STRIPE_MONTHLY_LINK=https://buy.stripe.com/xxx
--    VITE_STRIPE_ANNUAL_LINK=https://buy.stripe.com/yyy
-- ================================================================
