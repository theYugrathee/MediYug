-- =============================================
-- MediTrip Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS table (mirrors auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  reports_remaining INTEGER DEFAULT 0,
  regenerations_remaining INTEGER DEFAULT 0,
  dodo_customer_id TEXT,
  dodo_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SEARCHES table
-- =============================================
CREATE TABLE IF NOT EXISTS public.searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  condition TEXT NOT NULL,
  budget TEXT NOT NULL,
  destination TEXT NOT NULL,
  home_country TEXT,
  form_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_searches_user_id ON public.searches(user_id);
CREATE INDEX idx_searches_created_at ON public.searches(created_at DESC);

-- =============================================
-- REPORTS table
-- =============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_id UUID NOT NULL REFERENCES public.searches(id) ON DELETE CASCADE,
  parent_report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  ai_report_json JSONB NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_search_id ON public.reports(search_id);
CREATE INDEX idx_reports_is_paid ON public.reports(is_paid);

-- =============================================
-- HOSPITALS table
-- =============================================
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  rating DECIMAL(3,1),
  total_ratings INTEGER,
  cost_estimate TEXT,
  place_id TEXT,
  specializations TEXT[],
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hospitals_report_id ON public.hospitals(report_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- Users: can read/update their own profile
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Searches: users can manage their own; anon searches allowed
CREATE POLICY "Users can read own searches"
  ON public.searches FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anyone can insert searches"
  ON public.searches FOR INSERT
  WITH CHECK (true);

-- Reports: readable if search belongs to user
CREATE POLICY "Reports readable by search owner"
  ON public.reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.searches
      WHERE searches.id = reports.search_id
        AND (searches.user_id = auth.uid() OR searches.user_id IS NULL)
    )
  );

CREATE POLICY "Service can insert reports"
  ON public.reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update reports"
  ON public.reports FOR UPDATE
  USING (true);

-- Hospitals: readable if report is accessible
CREATE POLICY "Hospitals readable with report"
  ON public.hospitals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports r
      JOIN public.searches s ON r.search_id = s.id
      WHERE r.id = hospitals.report_id
        AND (s.user_id = auth.uid() OR s.user_id IS NULL)
    )
  );

CREATE POLICY "Service can insert hospitals"
  ON public.hospitals FOR INSERT
  WITH CHECK (true);

-- =============================================
-- GRANT permissions
-- =============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
