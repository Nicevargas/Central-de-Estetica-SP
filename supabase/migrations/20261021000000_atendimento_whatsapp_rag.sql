-- ==============================================================================
-- ATENDIMENTO AUTOMÁTICO: leads, conversas do WhatsApp e base de conhecimento (RAG)
-- Usado pelas Edge Functions whatsapp-webhook, instagram-webhook e kb-sync.
--
-- Segurança: RLS ligado e SEM políticas públicas. Só as Edge Functions (service
-- role) leem e gravam. Dados de clientes nunca ficam acessíveis pela chave anon.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 1. Leads (um por cliente, identificado pelo WhatsApp)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp TEXT UNIQUE,                 -- só dígitos, ex.: 5511999998888
    nome TEXT,
    email TEXT,
    tratamento_interesse TEXT,
    melhor_horario TEXT,
    observacoes TEXT,
    origem TEXT NOT NULL DEFAULT 'whatsapp', -- whatsapp | instagram
    instagram_username TEXT,
    instagram_user_id TEXT,
    codigo_indicacao TEXT UNIQUE,         -- código que liga o "EU QUERO" do Instagram ao WhatsApp
    -- bot: IA responde | consultora: atendimento humano, IA em silêncio
    status TEXT NOT NULL DEFAULT 'bot' CHECK (status IN ('bot', 'consultora', 'encerrado')),
    resumo_transferencia TEXT,
    transferido_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Mensagens do WhatsApp (histórico usado como contexto da IA)
CREATE TABLE IF NOT EXISTS public.wa_messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    wa_message_id TEXT UNIQUE,            -- id da Evolution, evita processar duas vezes
    -- cliente | bot | consultora
    autor TEXT NOT NULL CHECK (autor IN ('cliente', 'bot', 'consultora')),
    texto TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS wa_messages_lead_created_idx ON public.wa_messages (lead_id, created_at);

-- 3. Base de conhecimento (RAG) — embeddings gte-small (384 dimensões)
CREATE TABLE IF NOT EXISTS public.kb_documents (
    id TEXT PRIMARY KEY,                  -- ex.: treatment:ultraformer, faq:faq-1, extra:horarios
    fonte TEXT NOT NULL,                  -- treatments | promotions | faqs | extra
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    embedding extensions.vector(384) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS kb_documents_embedding_idx
    ON public.kb_documents USING hnsw (embedding extensions.vector_cosine_ops);

CREATE OR REPLACE FUNCTION public.match_kb_documents(
    query_embedding extensions.vector(384),
    match_count INT DEFAULT 5,
    min_similarity FLOAT DEFAULT 0.2
)
RETURNS TABLE (id TEXT, titulo TEXT, conteudo TEXT, similarity FLOAT)
LANGUAGE sql STABLE
SET search_path = public, extensions
AS $$
    SELECT d.id, d.titulo, d.conteudo, 1 - (d.embedding <=> query_embedding) AS similarity
    FROM public.kb_documents d
    WHERE 1 - (d.embedding <=> query_embedding) >= min_similarity
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Somente service role: RLS ligado e nenhuma política para anon/authenticated.
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_documents ENABLE ROW LEVEL SECURITY;
REVOKE EXECUTE ON FUNCTION public.match_kb_documents FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_kb_documents TO service_role;
