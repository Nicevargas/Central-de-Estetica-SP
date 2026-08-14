-- ==============================================================================
-- MIGRAÇÃO COMPLETA: CENTRAL DA ESTÉTICA - BANCO DE DADOS SUPABASE
-- Execute este script no SQL Editor do Supabase para garantir todas as tabelas,
-- colunas (incluindo imagens dos banners) e permissões RLS públicas.
-- ==============================================================================

-- 1. Função utilitária para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. TABELA DE TRATAMENTOS / SERVIÇOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.treatments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    popular BOOLEAN DEFAULT FALSE,
    highlight BOOLEAN DEFAULT FALSE,
    duration TEXT,
    price TEXT,
    image TEXT,
    benefits TEXT[] DEFAULT '{}'::text[],
    before_after_images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    technical_specs JSONB DEFAULT '{}'::jsonb,
    post_care_tips TEXT[] DEFAULT '{}'::text[],
    specialist JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir colunas adicionais em treatments caso a tabela já exista
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT FALSE;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS highlight BOOLEAN DEFAULT FALSE;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS before_after_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS technical_specs JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS post_care_tips TEXT[] DEFAULT '{}'::text[];
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS specialist JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS update_treatments_updated_at ON public.treatments;
CREATE TRIGGER update_treatments_updated_at
    BEFORE UPDATE ON public.treatments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 3. TABELA DE PROMOÇÕES / BANNERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.promotions (
    id TEXT PRIMARY KEY,
    badge TEXT DEFAULT 'PROMOÇÃO ESPECIAL',
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    discount TEXT DEFAULT '',
    original_price TEXT DEFAULT '',
    promo_price TEXT DEFAULT '',
    coupon_code TEXT DEFAULT '',
    expires_in_days INTEGER DEFAULT 7,
    treatment_id TEXT,
    image TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir colunas adicionais em promotions caso a tabela já exista
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT 'PROMOÇÃO ESPECIAL';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT '';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS discount TEXT DEFAULT '';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS original_price TEXT DEFAULT '';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS promo_price TEXT DEFAULT '';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT '';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS expires_in_days INTEGER DEFAULT 7;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS treatment_id TEXT;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Remover restrições rígidas de NOT NULL para evitar falhas de gravação
ALTER TABLE public.promotions ALTER COLUMN badge DROP NOT NULL;
ALTER TABLE public.promotions ALTER COLUMN subtitle DROP NOT NULL;
ALTER TABLE public.promotions ALTER COLUMN discount DROP NOT NULL;
ALTER TABLE public.promotions ALTER COLUMN original_price DROP NOT NULL;
ALTER TABLE public.promotions ALTER COLUMN promo_price DROP NOT NULL;
ALTER TABLE public.promotions ALTER COLUMN coupon_code DROP NOT NULL;

DROP TRIGGER IF EXISTS update_promotions_updated_at ON public.promotions;
CREATE TRIGGER update_promotions_updated_at
    BEFORE UPDATE ON public.promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 4. TABELA DE DEPOIMENTOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    stars INTEGER NOT NULL DEFAULT 5,
    avatar_bg TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS avatar_bg TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 5. TABELA DE BLOG POSTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    date TEXT NOT NULL,
    read_time TEXT NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 6. TABELA DE AGENDAMENTOS (BOOKINGS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    treatment_id TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 7. TABELA DE CONFIGURAÇÕES DE CONTATO E REDES SOCIAIS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    phone_primary TEXT NOT NULL DEFAULT '(11) 3151-2433 / (11) 9468-3765',
    whatsapp_number TEXT NOT NULL DEFAULT '551194683765',
    email TEXT NOT NULL DEFAULT 'contatocentraldaestetica@gmail.com',
    address_line1 TEXT NOT NULL DEFAULT 'Rua Artur Frazão, 33',
    address_line2 TEXT NOT NULL DEFAULT 'Jardim Paulista, São Paulo - SP',
    cep TEXT NOT NULL DEFAULT '01423-030',
    instagram_url TEXT NOT NULL DEFAULT 'https://instagram.com/centraldaesteticasp',
    facebook_url TEXT NOT NULL DEFAULT 'https://facebook.com/CENTRALDAESTETICASP',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.site_settings (id, phone_primary, whatsapp_number, email, address_line1, address_line2, cep, instagram_url, facebook_url)
VALUES ('default', '(11) 3151-2433 / (11) 9468-3765', '551194683765', 'contatocentraldaestetica@gmail.com', 'Rua Artur Frazão, 33', 'Jardim Paulista, São Paulo - SP', '01423-030', 'https://instagram.com/centraldaesteticasp', 'https://facebook.com/CENTRALDAESTETICASP')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 8. POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS) PARA ACESSO ANÔNIMO / PÚBLICO
-- Permite leitura, gravação, edição e exclusão pelo frontend com chave anônima
-- ==============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Treatments Policies
DROP POLICY IF EXISTS "Allow public read treatments" ON public.treatments;
DROP POLICY IF EXISTS "Allow public all treatments" ON public.treatments;
CREATE POLICY "Allow public all treatments" ON public.treatments FOR ALL USING (true) WITH CHECK (true);

-- Promotions Policies
DROP POLICY IF EXISTS "Allow public read promotions" ON public.promotions;
DROP POLICY IF EXISTS "Allow authenticated full access promotions" ON public.promotions;
DROP POLICY IF EXISTS "Allow public all promotions" ON public.promotions;
CREATE POLICY "Allow public all promotions" ON public.promotions FOR ALL USING (true) WITH CHECK (true);

-- Testimonials Policies
DROP POLICY IF EXISTS "Allow public read testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow authenticated full access testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public all testimonials" ON public.testimonials;
CREATE POLICY "Allow public all testimonials" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

-- Blog Posts Policies
DROP POLICY IF EXISTS "Allow public read blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow authenticated full access blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow public all blog_posts" ON public.blog_posts;
CREATE POLICY "Allow public all blog_posts" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);

-- Bookings Policies
DROP POLICY IF EXISTS "Allow public insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow authenticated full access bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public all bookings" ON public.bookings;
CREATE POLICY "Allow public all bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

-- Site Settings Policies
DROP POLICY IF EXISTS "Allow public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow authenticated full access site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public write site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public all site_settings" ON public.site_settings;
CREATE POLICY "Allow public all site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
