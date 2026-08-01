-- Migration: Updates for Treatments table, CRUD support, and Security Policies
-- Created: 2026-08-01

-- 1. Ensure columns exist on treatments table for detailed procedures
ALTER TABLE public.treatments
  ADD COLUMN IF NOT EXISTS before_after_images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS technical_specs JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS post_care_tips TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS specialist JSONB DEFAULT '{}'::jsonb;

-- 2. Ensure RLS is enabled on public.treatments
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Allow public read treatments" ON public.treatments;
DROP POLICY IF EXISTS "Allow public insert treatments" ON public.treatments;
DROP POLICY IF EXISTS "Allow public update treatments" ON public.treatments;
DROP POLICY IF EXISTS "Allow public delete treatments" ON public.treatments;
DROP POLICY IF EXISTS "Allow authenticated full access treatments" ON public.treatments;

-- 4. Create comprehensive RLS Policies for CRUD
-- Public Read Access
CREATE POLICY "Allow public read treatments"
  ON public.treatments FOR SELECT
  USING (true);

-- Public/Admin Insert Access
CREATE POLICY "Allow public insert treatments"
  ON public.treatments FOR INSERT
  WITH CHECK (true);

-- Public/Admin Update Access
CREATE POLICY "Allow public update treatments"
  ON public.treatments FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Public/Admin Delete Access
CREATE POLICY "Allow public delete treatments"
  ON public.treatments FOR DELETE
  USING (true);

-- Authenticated Full Access
CREATE POLICY "Allow authenticated full access treatments"
  ON public.treatments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
