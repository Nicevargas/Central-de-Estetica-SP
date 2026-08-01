-- Migration: Create site_settings table for Contact Info & Social Media Links
-- Created: 2026-08-01

-- 1. Site Settings Table (Contatos & Redes Sociais)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    phone_primary TEXT NOT NULL DEFAULT '(11) 3051-2433 / (11) 3052-1400',
    whatsapp_number TEXT NOT NULL DEFAULT '551130512433',
    email TEXT NOT NULL DEFAULT 'contatocentraldaestetica@gmail.com',
    address_line1 TEXT NOT NULL DEFAULT 'Rua Artur Frazão, 33',
    address_line2 TEXT NOT NULL DEFAULT 'Jardim Paulista, São Paulo - SP',
    cep TEXT NOT NULL DEFAULT '01423-030',
    instagram_url TEXT NOT NULL DEFAULT 'https://instagram.com/centraldaesteticasp',
    facebook_url TEXT NOT NULL DEFAULT 'https://facebook.com/CENTRALDAESTETICASP',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trigger for site_settings updated_at
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow public read access to site settings
DROP POLICY IF EXISTS "Allow public read site_settings" ON public.site_settings;
CREATE POLICY "Allow public read site_settings"
    ON public.site_settings FOR SELECT
    USING (true);

-- Allow authenticated users full access
DROP POLICY IF EXISTS "Allow authenticated full access site_settings" ON public.site_settings;
CREATE POLICY "Allow authenticated full access site_settings"
    ON public.site_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow public / anon full access (for client-side admin without auth tokens)
DROP POLICY IF EXISTS "Allow public write site_settings" ON public.site_settings;
CREATE POLICY "Allow public write site_settings"
    ON public.site_settings FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Seed initial default row if missing
INSERT INTO public.site_settings (
    id,
    phone_primary,
    whatsapp_number,
    email,
    address_line1,
    address_line2,
    cep,
    instagram_url,
    facebook_url
) VALUES (
    'default',
    '(11) 3051-2433 / (11) 3052-1400',
    '551130512433',
    'contatocentraldaestetica@gmail.com',
    'Rua Artur Frazão, 33',
    'Jardim Paulista, São Paulo - SP',
    '01423-030',
    'https://instagram.com/centraldaesteticasp',
    'https://facebook.com/CENTRALDAESTETICASP'
) ON CONFLICT (id) DO NOTHING;
