// Webhook do Instagram (app Meta centraldaesteticasp 2193346618194502; campos "comments" e "messages").
//
// "EU QUERO" → resposta privada no Direct com o link do WhatsApp, que leva um código
// para o bot ligar a cliente do Instagram à conversa do WhatsApp.
//
// "AVALIAÇÃO" → avaliação grátis para quem segue a @centraldaesteticasp:
//   - segue: Direct com o link do WhatsApp e a oferta;
//   - não segue (ou a Meta não informa): Direct pedindo para seguir e responder "OK";
//     quando ela responde no Direct, confere de novo e manda o link.
import { db, env, normalizePhone } from '../_shared/supabase.ts';

const GRAPH = 'https://graph.instagram.com/v23.0';
const PERFIL_URL = 'https://instagram.com/centraldaesteticasp';
const CAMPANHA_AVALIACAO = 'avaliacao_gratis';

// Compara sem acento e sem maiúsculas: "Avaliação", "AVALIACAO", "avaliaçao" e "avaliar" valem igual.
const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const fromEnv = (name: string, fallback: RegExp) => {
  const value = Deno.env.get(name);
  return value ? new RegExp(value) : fallback;
};
const KEYWORD = fromEnv('IG_KEYWORD', /\beu\s*quero\b/);
// avaliação, avaliacao, avaliaçao, avaliações, avaliar, avalia, avaliaçâo, avalicao, avaliasao, aval
const KEYWORD_AVALIACAO = fromEnv('IG_KEYWORD_AVALIACAO', /\b(?:avalia\w*|avali[cs]ao|avaliasao|aval)\b/);

type CommentValue = {
  id: string;
  text?: string;
  from?: { id: string; username?: string };
  media?: { id: string };
};

type MessagingEvent = {
  sender?: { id: string };
  recipient?: { id: string };
  message?: { text?: string; is_echo?: boolean };
};

// O app creatIApp atende várias contas e o roteador (creatiapp-webhook) repassa o
// lote inteiro, assinado: só as entradas desta conta são tratadas aqui.
// IG_ACCOUNT_ID aceita mais de um id, separados por vírgula (user_id e o id do app).
const IG_ACCOUNT_IDS = (Deno.env.get('IG_ACCOUNT_ID') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
// O @ da conta, para reconhecer os comentários dela mesma (entry.id e from.id
// são espaços de ID diferentes e nunca batem).
const IG_USERNAME = Deno.env.get('IG_USERNAME')?.toLowerCase();

async function signedWith(secret: string, raw: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw)));
  return 'sha256=' + Array.from(sig, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Aceita a chave do app da conta (IG_APP_SECRET) ou a do creatIApp (IG_APP_SECRET_CREATIAPP). */
async function validSignature(req: Request, raw: string): Promise<boolean> {
  const header = req.headers.get('x-hub-signature-256') ?? '';
  const secrets = [env('IG_APP_SECRET'), Deno.env.get('IG_APP_SECRET_CREATIAPP')].filter(Boolean) as string[];
  for (const secret of secrets) {
    const expected = await signedWith(secret, raw);
    if (header.length === expected.length && header === expected) return true;
  }
  return false;
}

function newCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => alphabet[b % alphabet.length]).join('');
}

async function igPost(path: string, body: unknown) {
  const res = await fetch(`${GRAPH}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env('INSTAGRAM_ACCESS_TOKEN')}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Instagram ${path} ${res.status}: ${await res.text()}`);
}

async function mediaTopic(mediaId?: string): Promise<string | null> {
  if (!mediaId) return null;
  const res = await fetch(`${GRAPH}/${mediaId}?fields=caption&access_token=${env('INSTAGRAM_ACCESS_TOKEN')}`);
  const caption: string | undefined = (await res.json().catch(() => ({})))?.caption;
  return caption?.split('\n')[0]?.slice(0, 120) || null;
}

/** true/false se a pessoa segue a clínica; null quando a Meta não informa. */
async function followsClinic(igUserId: string): Promise<boolean | null> {
  const res = await fetch(
    `${GRAPH}/${igUserId}?fields=is_user_follow_business&access_token=${env('INSTAGRAM_ACCESS_TOKEN')}`,
  );
  if (!res.ok) {
    console.warn('instagram-webhook: is_user_follow_business indisponível', res.status, await res.text());
    return null;
  }
  const value = (await res.json().catch(() => ({})))?.is_user_follow_business;
  return typeof value === 'boolean' ? value : null;
}

/** Lead do Instagram desta pessoa (reaproveita o código se ela já comentou antes). */
async function upsertIgLead(c: CommentValue, extra: Record<string, unknown> = {}): Promise<string> {
  const { data: existing } = c.from
    ? await db
        .from('leads')
        .select('id, codigo_indicacao')
        .eq('instagram_user_id', c.from.id)
        .not('codigo_indicacao', 'is', null)
        .limit(1)
        .maybeSingle()
    : { data: null };
  if (existing) {
    if (Object.keys(extra).length) await db.from('leads').update(extra).eq('id', existing.id);
    return existing.codigo_indicacao as string;
  }
  const code = newCode();
  const { error } = await db.from('leads').insert({
    origem: 'instagram',
    instagram_user_id: c.from?.id ?? null,
    instagram_username: c.from?.username ?? null,
    codigo_indicacao: code,
    tratamento_interesse: await mediaTopic(c.media?.id),
    ...extra,
  });
  if (error) throw error;
  return code;
}

function whatsappLink(prefilled: string): string {
  const phone = normalizePhone(env('CONSULTORA_WHATSAPP')); // o mesmo número atendido pela IA
  return `https://wa.me/${phone}?text=${encodeURIComponent(prefilled)}`;
}

type Recipient = { id: string } | { comment_id: string };

/**
 * Mensagem com botão de link (o endereço e o código ficam escondidos no botão).
 * Se a Meta recusar o botão, manda o texto com o link, para ninguém ficar sem resposta.
 */
async function sendButton(recipient: Recipient, text: string, title: string, url: string) {
  try {
    await igPost('/me/messages', {
      recipient,
      message: {
        attachment: {
          type: 'template',
          payload: { template_type: 'button', text, buttons: [{ type: 'web_url', url, title }] },
        },
      },
    });
  } catch (e) {
    console.warn('instagram-webhook: botão recusado, enviando link em texto', e);
    await igPost('/me/messages', { recipient, message: { text: `${text}\n${url}` } });
  }
}

async function sendAvaliacao(recipient: Recipient, username: string | null | undefined, code: string) {
  await sendButton(
    recipient,
    `Oi${username ? `, @${username}` : ''}! Obrigada por seguir a Central da Estética 💗\n\n` +
      `Sua avaliação é gratuita. Toque no botão para falar com a nossa consultora no WhatsApp e agendar.`,
    'Agendar no WhatsApp',
    whatsappLink(`Olá! Vim pelo Instagram e quero minha avaliação gratuita. Cód. ${code}`),
  );
}

async function sendPedidoSeguir(recipient: Recipient, username: string | null | undefined) {
  await sendButton(
    recipient,
    `Oi${username ? `, @${username}` : ''}! Sua avaliação gratuita está quase garantida 💗\n\n` +
      `É só seguir a @centraldaesteticasp e me responder aqui com OK, que eu te mando o botão para agendar com a nossa consultora.`,
    'Seguir a clínica',
    PERFIL_URL,
  );
}

async function handleEuQuero(c: CommentValue) {
  const code = await upsertIgLead(c);
  // Resposta privada ao comentário (Direct). Só é permitida uma por comentário.
  await sendButton(
    { comment_id: c.id },
    `Oi${c.from?.username ? `, @${c.from.username}` : ''}! Que bom que você se interessou 💗\n\n` +
      `Toque no botão para falar com a gente no WhatsApp e tirar suas dúvidas.`,
    'Falar no WhatsApp',
    whatsappLink(`Olá! Vim pelo Instagram e quero saber mais. Cód. ${code}`),
  );
}

async function handleAvaliacao(c: CommentValue) {
  // Sem os dados de quem comentou não dá para conferir nem acompanhar no Direct: manda o link.
  if (!c.from) {
    const code = await upsertIgLead(c, { campanha: CAMPANHA_AVALIACAO });
    await sendAvaliacao({ comment_id: c.id }, null, code);
    return;
  }
  const follows = await followsClinic(c.from.id);
  const code = await upsertIgLead(c, { campanha: CAMPANHA_AVALIACAO, aguardando_seguir: follows !== true });
  if (follows === true) await sendAvaliacao({ comment_id: c.id }, c.from.username, code);
  else await sendPedidoSeguir({ comment_id: c.id }, c.from.username);
}

async function handleComment(accountId: string, c: CommentValue) {
  // ignora comentários da própria clínica
  if (c.from?.id === accountId || (IG_USERNAME && c.from?.username?.toLowerCase() === IG_USERNAME)) return;
  if (!c.text) return;
  const text = normalize(c.text);
  console.log('instagram-webhook: comentário', c.id, c.from ? 'com autor' : 'sem autor', JSON.stringify(c.text));
  if (KEYWORD_AVALIACAO.test(text)) await handleAvaliacao(c);
  else if (KEYWORD.test(text)) await handleEuQuero(c);
  else return;
  // Resposta pública curta, para outras pessoas verem que funciona.
  await igPost(`/${c.id}/replies`, { message: 'Te mandei no Direct! 💌' }).catch((e) =>
    console.warn('instagram-webhook: resposta pública falhou', e),
  );
}

async function igUsername(igUserId: string): Promise<string | null> {
  const res = await fetch(`${GRAPH}/${igUserId}?fields=username&access_token=${env('INSTAGRAM_ACCESS_TOKEN')}`);
  return res.ok ? ((await res.json().catch(() => ({})))?.username ?? null) : null;
}

/** "AVALIAÇÃO" mandado direto no Direct: mesma campanha do comentário, respondida na conversa. */
async function handleAvaliacaoDirect(senderId: string) {
  const follows = await followsClinic(senderId);
  const username = await igUsername(senderId);
  const code = await upsertIgLead(
    { id: '', from: { id: senderId, username: username ?? undefined } },
    { campanha: CAMPANHA_AVALIACAO, aguardando_seguir: follows === false },
  );
  // Se a Meta não informar, manda o botão do WhatsApp: ninguém fica sem resposta.
  if (follows === false) await sendPedidoSeguir({ id: senderId }, username);
  else await sendAvaliacao({ id: senderId }, username, code);
}

/**
 * Direct: "AVALIAÇÃO" inicia a campanha; qualquer resposta de quem estava aguardando
 * seguir confere de novo. As demais conversas ficam com a equipe.
 */
async function handleDirect(accountId: string, m: MessagingEvent) {
  const senderId = m.sender?.id;
  if (!senderId || senderId === accountId || m.message?.is_echo || !m.message?.text) return;

  const { data: lead } = await db
    .from('leads')
    .select('id, instagram_username, codigo_indicacao')
    .eq('instagram_user_id', senderId)
    .eq('aguardando_seguir', true)
    .limit(1)
    .maybeSingle();
  if (!lead) {
    if (KEYWORD_AVALIACAO.test(normalize(m.message.text))) await handleAvaliacaoDirect(senderId);
    return;
  }

  const follows = await followsClinic(senderId);
  // Se a Meta não informar, manda o link mesmo assim: ninguém fica sem resposta.
  if (follows === false) {
    await sendButton(
      { id: senderId },
      'Ainda não encontrei você entre as seguidoras 🙈 Siga a @centraldaesteticasp e me responda OK de novo.',
      'Seguir a clínica',
      PERFIL_URL,
    );
    return;
  }
  await db.from('leads').update({ aguardando_seguir: false }).eq('id', lead.id);
  await sendAvaliacao({ id: senderId }, lead.instagram_username, lead.codigo_indicacao);
}

/** Registra a falha no log da função e na tabela de diagnóstico. */
async function logError(campo: string, e: unknown) {
  console.error('instagram-webhook', campo, e);
  const msg = e instanceof Error ? e.message : JSON.stringify(e);
  await db.from('ig_webhook_log').insert({ assinatura_ok: true, campos: `erro ${campo}: ${msg}`.slice(0, 1000) });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // Verificação do webhook pela Meta
  if (req.method === 'GET') {
    const ok =
      url.searchParams.get('hub.mode') === 'subscribe' &&
      url.searchParams.get('hub.verify_token') === env('IG_VERIFY_TOKEN');
    return ok ? new Response(url.searchParams.get('hub.challenge')) : new Response('forbidden', { status: 403 });
  }

  const raw = await req.text();
  const signed = await validSignature(req, raw);
  const body = signed ? JSON.parse(raw) : null;
  const campos = (body?.entry ?? [])
    .flatMap((e: { changes?: { field: string }[]; messaging?: unknown[] }) => [
      ...(e.changes ?? []).map((c) => c.field),
      ...(e.messaging?.length ? [`messaging:${e.messaging.length}`] : []),
    ])
    .join(',');
  await db.from('ig_webhook_log').insert({ assinatura_ok: signed, campos: campos || null });
  if (!signed) return new Response('invalid signature', { status: 401 });

  console.log('instagram-webhook: evento', body.object, JSON.stringify((body.entry ?? []).map((e: { changes?: { field: string }[]; messaging?: unknown[] }) => ({ changes: e.changes?.map((c) => c.field), messaging: e.messaging?.length ?? 0 }))));
  const jobs: Promise<void>[] = [];
  for (const entry of body.entry ?? []) {
    if (IG_ACCOUNT_IDS.length && !IG_ACCOUNT_IDS.includes(String(entry.id))) {
      console.log('instagram-webhook: entrada de outra conta ignorada', entry.id);
      continue;
    }
    for (const change of entry.changes ?? []) {
      if (change.field !== 'comments') continue;
      jobs.push(handleComment(entry.id, change.value).catch((e) => logError('comments', e)));
    }
    for (const m of entry.messaging ?? []) {
      jobs.push(handleDirect(entry.id, m).catch((e) => logError('messaging', e)));
    }
  }
  // @ts-ignore EdgeRuntime existe no runtime do Supabase
  EdgeRuntime.waitUntil(Promise.all(jobs));
  return new Response('ok');
});
