-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired');
CREATE TYPE subscription_duration AS ENUM ('7d', '30d', '45d', '60d', '90d', '6m', '1y', '2y', '3y', '4y', '5y');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'annual', 'biennial', 'triennial', 'one-time');

-- Create tables
CREATE TABLE currencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- ISO 4217 code
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration subscription_duration NOT NULL,
  billing_cycle billing_cycle NOT NULL,
  cost NUMERIC(12, 2) NOT NULL,
  currency_id UUID REFERENCES currencies(id),
  recurring BOOLEAN NOT NULL DEFAULT TRUE,
  status subscription_status NOT NULL DEFAULT 'active',
  date_canceled DATE,
  reminder_days INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Currencies are public
CREATE POLICY "Enable public read access for currencies" 
ON currencies FOR SELECT USING (true);

-- Categories are public
CREATE POLICY "Enable public read access for categories" 
ON categories FOR SELECT USING (true);

-- Users can only access their own subscriptions
CREATE POLICY "Enable individual access to subscriptions" 
ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Insert default currencies
INSERT INTO currencies (code, symbol, name) VALUES
('USD', '$', 'US Dollar'),
('EUR', '€', 'Euro'),
('GBP', '£', 'British Pound'),
('JPY', '¥', 'Japanese Yen');

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Work', 'Tools, business apps, domains, licenses'),
('Personal Growth', 'Courses, coaching, mindfulness, learning'),
('Study', 'School, university, study resources'),
('Wellness', 'Gym, yoga, health, medical'),
('Hobby', 'Photography, music, sports, DIY, pets'),
('Leisure', 'Streaming, gaming, books, entertainment'),
('Finance', 'Banking, accounting, insurance, trading'),
('Utilities', 'Electricity, water, gas, phone, internet, hosting'),
('Travel & Mobility', 'Transport, travel passes, car/bike sharing'),
('Software & Productivity', 'SaaS, automation, productivity apps'),
('Family & Kids', 'Subscriptions for children, family plans'),
('News & Information', 'Newspapers, magazines, digital info'),
('Shopping', 'Prime, membership, delivery, loyalty programs');