-- Diagnóstico do instagram-webhook: uma linha por chamada da Meta (sem dados pessoais).
-- Somente service role: RLS ligado e nenhuma política.
CREATE TABLE IF NOT EXISTS public.ig_webhook_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    assinatura_ok BOOLEAN NOT NULL,
    campos TEXT,          -- ex.: "comments" ou "messaging:1"
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.ig_webhook_log ENABLE ROW LEVEL SECURITY;
