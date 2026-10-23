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
6. A IA volta sozinha quando a cliente escreve e a consultora está há 10 minutos sem mandar mensagem naquela conversa (mude com o secret `CONSULTORA_PAUSA_MINUTOS`). Depois de uma transferência feita pela IA, ela só volta depois que a consultora tiver respondido pelo menos uma vez.
7. Para devolver a conversa à IA na hora, a consultora envia `#bot` na conversa da cliente.

**Avaliação grátis para seguidores:** começa quando a pessoa comenta "AVALIAÇÃO" num post (recebe também a resposta pública "Te mandei no Direct!") ou manda "AVALIAÇÃO" no Direct. A palavra é comparada sem acento nem maiúsculas e aceita variações (avaliacao, avaliar, avalia, aval…); mude com `IG_KEYWORD_AVALIACAO`. No Direct:
- se já segue a @centraldaesteticasp: mensagem com o botão **Agendar no WhatsApp**, que abre a conversa com "quero minha avaliação gratuita… Cód. XXXXXX";
- se não segue: mensagem com o botão **Seguir a clínica**, pedindo para responder "OK". Quando ela responde, a função confere de novo (`is_user_follow_business`) e manda o botão do WhatsApp; se ainda não segue, lembra de seguir.
- se a Meta não informa se ela segue, ou o comentário chega sem autor: manda o botão do WhatsApp, para ninguém ficar sem resposta.

As respostas usam o botão do Instagram (button template); se a Meta recusar, vão como texto com o link. O lead fica com `campanha = avaliacao_gratis` (migração `20261022000000_leads_campanha_avaliacao_gratis.sql`): a IA do WhatsApp confirma que a avaliação é gratuita e o aviso da consultora mostra a oferta. O Instagram não avisa quando alguém passa a seguir, por isso a campanha sempre começa por um comentário ou uma mensagem.

**Diagnóstico:** cada chamada da Meta à `instagram-webhook` grava uma linha em `ig_webhook_log` (migração `20261023000000_ig_webhook_log.sql`): se a assinatura passou, os campos do evento e, se o processamento falhar, a mensagem de erro. Sem nenhuma linha, a Meta não está enviando o evento. Comentários só chegam se o token da conta tiver sido gerado com `instagram_business_manage_comments`; para clientes sem função no app, as permissões precisam de acesso avançado (análise do app).

**Instagram:** quem comenta "EU QUERO" (configurável em `IG_KEYWORD`) recebe no Direct o link do WhatsApp com a mensagem pronta "Vim pelo Instagram… Cód. XXXXXX". Quando a cliente envia essa mensagem, o bot junta o cadastro do Instagram ao do WhatsApp (e já sabe de qual post ela veio).

## Instalação

### 1. Banco
Rode a migração no SQL Editor do Supabase (ou `supabase db push`). Ela ativa a extensão `vector`.

### 2. Secrets das funções
No painel do Supabase → Edge Functions → Secrets (ou `supabase secrets set NOME=valor`):

| Secret | Valor |
|---|---|
| `OPENAI_API_KEY` | chave da API da OpenAI (platform.openai.com → API keys) |
| `OPENAI_MODEL` | opcional; padrão `gpt-4.1-mini` |
| `EVOLUTION_API_URL` | URL da sua Evolution API, ex.: `https://evolution.seudominio.com` |
| `EVOLUTION_API_KEY` | apikey da Evolution |
| `EVOLUTION_INSTANCE` | nome da instância conectada ao (11) 98525-4584 |
| `EVOLUTION_WEBHOOK_TOKEN` | um texto aleatório longo, usado na URL do webhook |
| `CONSULTORA_WHATSAPP` | WhatsApp da consultora (`5511985254584`, o mesmo atendido pela IA): recebe os avisos de transferência e é o número do link do "EU QUERO" no Instagram e do WhatsApp do site. O número da clínica, (11) 94680-3765, aparece só como telefone no site. |
| `INSTAGRAM_ACCESS_TOKEN` | o mesmo token IGAA… usado na publicação |
| `IG_APP_SECRET` | "Chave secreta do app" do Instagram (painel Meta → Instagram → Configuração da API) |
| `IG_VERIFY_TOKEN` | um texto aleatório, repetido no cadastro do webhook na Meta |
| `KB_SYNC_TOKEN` | um texto aleatório, para proteger o kb-sync |
| `IG_KEYWORD` | opcional; padrão `eu quero` |
| `IG_KEYWORD_AVALIACAO` | opcional; expressão da palavra da avaliação grátis, padrão `avalia[cç][aã]o` |
| `CONSULTORA_PAUSA_MINUTOS` | opcional; minutos sem resposta da consultora para a IA voltar (padrão `10`) |

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
Cada chamada gera no máximo 3 embeddings (limite de CPU das Edge Functions; mude com `?lote=N`) e pula documentos que não mudaram. Repita até a resposta trazer `"pendentes": 0`. No PowerShell:
```powershell
do { $r = Invoke-RestMethod -Method Post -Uri https://<projeto>.supabase.co/functions/v1/kb-sync -Headers @{ 'x-sync-token' = '<KB_SYNC_TOKEN>' }; $r } while ($r.pendentes -gt 0)
```
Rode de novo sempre que mudar tratamentos, preços, promoções, FAQs ou `kb-sync/conhecimento.ts`.

### 5. Webhook da Evolution
Na instância, configure o webhook:
- URL: `https://<projeto>.supabase.co/functions/v1/whatsapp-webhook?token=<EVOLUTION_WEBHOOK_TOKEN>`
- Evento: `MESSAGES_UPSERT` (os outros podem ficar desligados)

### 6. Webhook do Instagram ("EU QUERO")
No painel Meta (app centraldaesteticasp 2193346618194502) → Instagram → Configuração da API → **Configurar webhooks**:
- URL de callback: `https://<projeto>.supabase.co/functions/v1/instagram-webhook`
- Token de verificação: o valor de `IG_VERIFY_TOKEN`
- Assine os campos **comments** e **messages** (o Direct é usado pela avaliação grátis). Confira também a assinatura da conta: `GET https://graph.instagram.com/v23.0/me/subscribed_apps` deve listar `comments, messages`; se faltar, `POST /me/subscribed_apps?subscribed_fields=comments,messages`.

Permissões necessárias no token: `instagram_business_basic`, `instagram_business_manage_comments` e `instagram_business_manage_messages`. Gere o token de novo depois de adicioná-las.

> ⚠️ Com o app em modo **Desenvolvimento**, a Meta só entrega webhooks de contas com função no app. Para receber comentários de qualquer pessoa, o app precisa estar **Ao vivo** e com acesso avançado a essas permissões (Análise do app), o que pede política de privacidade publicada.

## Custos e modelo
A IA usa a API da OpenAI (Chat Completions com function calling), modelo `gpt-4.1-mini` por padrão (troque com o secret `OPENAI_MODEL`). O prompt de sistema é fixo para aproveitar o cache automático de prompt da OpenAI. Embeddings usam o gte-small embutido no Supabase, sem custo extra de API.
