-- ==============================================================================
-- Campanha "avaliação grátis para seguidores" do Instagram.
-- campanha: oferta que o lead ganhou (ex.: 'avaliacao_gratis'); a IA do WhatsApp
--           e o aviso da consultora usam esse campo.
-- aguardando_seguir: comentou a palavra da campanha mas ainda não seguia a
--           @centraldaesteticasp; ao responder no Direct, a função confere de novo.
-- ==============================================================================

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS campanha TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS aguardando_seguir BOOLEAN NOT NULL DEFAULT false;
