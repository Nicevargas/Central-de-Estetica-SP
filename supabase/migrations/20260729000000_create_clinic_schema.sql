-- Supabase Migration: Initial Schema for Clínica de Estética
-- Created: 2026-07-29

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Helper function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Treatments Table (Tratamentos)
CREATE TABLE IF NOT EXISTS public.treatments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('facial', 'corporal', 'bem-estar')),
    popular BOOLEAN DEFAULT FALSE,
    highlight BOOLEAN DEFAULT FALSE,
    duration TEXT,
    price TEXT,
    image TEXT NOT NULL,
    benefits TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for treatments updated_at
CREATE TRIGGER update_treatments_updated_at
    BEFORE UPDATE ON public.treatments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Promotions Table (Promoções)
CREATE TABLE IF NOT EXISTS public.promotions (
    id TEXT PRIMARY KEY,
    badge TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    discount TEXT NOT NULL,
    original_price TEXT NOT NULL,
    promo_price TEXT NOT NULL,
    coupon_code TEXT NOT NULL,
    expires_in_days INTEGER NOT NULL DEFAULT 7,
    treatment_id TEXT REFERENCES public.treatments(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for promotions updated_at
CREATE TRIGGER update_promotions_updated_at
    BEFORE UPDATE ON public.promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Testimonials Table (Depoimentos)
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    stars INTEGER NOT NULL DEFAULT 5 CHECK (stars >= 1 AND stars <= 5),
    avatar_bg TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FAQs Table (Perguntas Frequentes)
CREATE TABLE IF NOT EXISTS public.faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Blog Posts Table (Artigos do Blog)
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    author TEXT NOT NULL,
    date TEXT NOT NULL,
    read_time TEXT NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    image TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for blog_posts updated_at
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Bookings Table (Agendamentos)
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    treatment_id TEXT REFERENCES public.treatments(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for bookings updated_at
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. INDEXES for Optimization
CREATE INDEX IF NOT EXISTS idx_treatments_category ON public.treatments(category);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions(active);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Treatments RLS
CREATE POLICY "Allow public read treatments"
    ON public.treatments FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated full access treatments"
    ON public.treatments FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Promotions RLS
CREATE POLICY "Allow public read promotions"
    ON public.promotions FOR SELECT
    USING (active = true OR auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access promotions"
    ON public.promotions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Testimonials RLS
CREATE POLICY "Allow public read testimonials"
    ON public.testimonials FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated full access testimonials"
    ON public.testimonials FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- FAQs RLS
CREATE POLICY "Allow public read faqs"
    ON public.faqs FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated full access faqs"
    ON public.faqs FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Blog Posts RLS
CREATE POLICY "Allow public read blog_posts"
    ON public.blog_posts FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated full access blog_posts"
    ON public.blog_posts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Bookings RLS
CREATE POLICY "Allow public insert bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated full access bookings"
    ON public.bookings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
