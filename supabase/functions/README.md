# Atendimento automático: WhatsApp (Evolution) + Instagram "EU QUERO"

```
Instagram: comentário "EU QUERO"
   └─ instagram-webhook ─► cria lead (origem instagram, código) ─► Direct com link wa.me + código
WhatsApp (11) 98525-4584 via Evolution
   └─ whatsapp-webhook ─► salva lead e mensagens no Supabase
                       ─► RAG (kb_documents) + Claude ─► resposta pela Evolution
                       ─► quando é hora: transfere para a consultora (IA para de responder)
kb-sync ─► gera a base de conhecimento a partir de treatments, promotions, faqs e conhecimento.ts
```

## Tabelas (migração `20261021000000_atendimento_whatsapp_rag.sql`)

| Tabela | O que guarda |
|---|---|
| `leads` | Cadastro de cada cliente: WhatsApp, nome, e-mail, tratamento de interesse, melhor horário, origem (WhatsApp/Instagram), status (`bot`, `consultora`, `encerrado`) e resumo da transferência |
| `wa_messages` | Histórico da conversa (cliente, bot e consultora) |
| `kb_documents` | Base de conhecimento com embeddings (gte-small, 384 dimensões) |

As três têm RLS ligado e **nenhuma** política pública: só as Edge Functions (service role) acessam. Para ver os leads, use o Table Editor do Supabase.

## Como o atendimento funciona

1. A cliente manda mensagem → é gravada em `wa_messages` e o lead é criado/atualizado.
2. Se o lead está com `status = bot`, a IA busca os trechos mais parecidos na base (`match_kb_documents`) e responde.
3. Durante a conversa, a IA grava nome, interesse, melhor horário e e-mail no lead (ferramenta `salvar_dados_cliente`).
4. A IA transfere para a consultora (`transferir_para_consultora`) quando a cliente quer agendar, pede uma pessoa, traz assunto sensível (saúde, reclamação) ou a IA não consegue ajudar. O lead vai para `status = consultora`, a IA para de responder e a consultora recebe no WhatsApp (`CONSULTORA_WHATSAPP`) um resumo com o link da cliente.
5. Se alguém da clínica responder manualmente pelo número (celular ou WhatsApp Web), a IA entende que a consultora assumiu e também para.
6. Para devolver a conversa à IA, a consultora envia `#bot` na conversa da cliente.

**Instagram:** quem comenta "EU QUERO" (configurável em `IG_KEYWORD`) recebe no Direct o link do WhatsApp com a mensagem pronta "Vim pelo Instagram… Cód. XXXXXX". Quando a cliente envia essa mensagem, o bot junta o cadastro do Instagram ao do WhatsApp (e já sabe de qual post ela veio).

## Instalação

### 1. Banco
Rode a migração no SQL Editor do Supabase (ou `supabase db push`). Ela ativa a extensão `vector`.

### 2. Secrets das funções
No painel do Supabase → Edge Functions → Secrets (ou `supabase secrets set NOME=valor`):

| Secret | Valor |
|---|---|
| `ANTHROPIC_API_KEY` | chave da API da Anthropic (console.anthropic.com) |
| `EVOLUTION_API_URL` | URL da sua Evolution API, ex.: `https://evolution.seudominio.com` |
| `EVOLUTION_API_KEY` | apikey da Evolution |
| `EVOLUTION_INSTANCE` | nome da instância conectada ao (11) 98525-4584 |
| `EVOLUTION_WEBHOOK_TOKEN` | um texto aleatório longo, usado na URL do webhook |
| `CONSULTORA_WHATSAPP` | WhatsApp pessoal da consultora, para receber os avisos de transferência |
| `CLINICA_WHATSAPP` | `5511985254584` |
| `INSTAGRAM_ACCESS_TOKEN` | o mesmo token IGAA… usado na publicação |
| `IG_APP_SECRET` | "Chave secreta do app" do Instagram (painel Meta → Instagram → Configuração da API) |
| `IG_VERIFY_TOKEN` | um texto aleatório, repetido no cadastro do webhook na Meta |
| `KB_SYNC_TOKEN` | um texto aleatório, para proteger o kb-sync |
| `IG_KEYWORD` | opcional; padrão `eu quero` |

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já existem automaticamente nas funções.

### 3. Deploy
```bash
supabase functions deploy whatsapp-webhook --no-verify-jwt
supabase functions deploy instagram-webhook --no-verify-jwt
supabase functions deploy kb-sync --no-verify-jwt
```
(`--no-verify-jwt` porque quem chama são a Evolution e a Meta; cada função tem sua própria proteção por token/assinatura.)

### 4. Base de conhecimento
```bash
curl -X POST https://<projeto>.supabase.co/functions/v1/kb-sync -H "x-sync-token: <KB_SYNC_TOKEN>"
```
Rode de novo sempre que mudar tratamentos, preços, promoções, FAQs ou `kb-sync/conhecimento.ts`.

### 5. Webhook da Evolution
Na instância, configure o webhook:
- URL: `https://<projeto>.supabase.co/functions/v1/whatsapp-webhook?token=<EVOLUTION_WEBHOOK_TOKEN>`
- Evento: `MESSAGES_UPSERT` (os outros podem ficar desligados)

### 6. Webhook do Instagram ("EU QUERO")
No painel Meta (app 1315858633192552) → Instagram → Configuração da API → **Configurar webhooks**:
- URL de callback: `https://<projeto>.supabase.co/functions/v1/instagram-webhook`
- Token de verificação: o valor de `IG_VERIFY_TOKEN`
- Assine o campo **comments**.

Permissões necessárias no token: `instagram_business_basic`, `instagram_business_manage_comments` e `instagram_business_manage_messages`. Gere o token de novo depois de adicioná-las.

> ⚠️ Com o app em modo **Desenvolvimento**, a Meta só entrega webhooks de contas com função no app. Para receber comentários de qualquer pessoa, o app precisa estar **Ao vivo** e com acesso avançado a essas permissões (Análise do app), o que pede política de privacidade publicada.

## Custos e modelo
A IA usa `claude-opus-5-5` com esforço `low` (respostas curtas de chat) e cache do prompt de sistema. Embeddings usam o gte-small embutido no Supabase, sem custo extra de API.
