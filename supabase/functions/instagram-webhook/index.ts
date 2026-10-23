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

const keywordRegex = (words: string) => new RegExp(`\\b(?:${words.replace(/\s+/g, '\\s*')})\\b`, 'i');
const KEYWORD = keywordRegex(Deno.env.get('IG_KEYWORD') ?? 'eu quero');
const KEYWORD_AVALIACAO = keywordRegex(Deno.env.get('IG_KEYWORD_AVALIACAO') ?? 'avalia[cç][aã]o');

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

async function validSignature(req: Request, raw: string): Promise<boolean> {
  const header = req.headers.get('x-hub-signature-256') ?? '';
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env('IG_APP_SECRET')),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw)));
  const expected = 'sha256=' + Array.from(sig, (b) => b.toString(16).padStart(2, '0')).join('');
  return header.length === expected.length && header === expected;
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
  const { data: existing } = await db
    .from('leads')
    .select('id, codigo_indicacao')
    .eq('instagram_user_id', c.from!.id)
    .not('codigo_indicacao', 'is', null)
    .limit(1)
    .maybeSingle();
  if (existing) {
    if (Object.keys(extra).length) await db.from('leads').update(extra).eq('id', existing.id);
    return existing.codigo_indicacao as string;
  }
  const code = newCode();
  const { error } = await db.from('leads').insert({
    origem: 'instagram',
    instagram_user_id: c.from!.id,
    instagram_username: c.from!.username ?? null,
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

function avaliacaoText(username: string | null | undefined, code: string): string {
  const link = whatsappLink(`Olá! Vim pelo Instagram e quero minha avaliação gratuita. Cód. ${code}`);
  return (
    `Oi${username ? `, @${username}` : ''}! Obrigada por seguir a Central da Estética 💗\n\n` +
    `Sua avaliação é gratuita. Toque no link para falar com a nossa consultora no WhatsApp e agendar:\n${link}`
  );
}

async function handleEuQuero(c: CommentValue) {
  const code = await upsertIgLead(c);
  const link = whatsappLink(`Olá! Vim pelo Instagram e quero saber mais. Cód. ${code}`);
  const text =
    `Oi${c.from!.username ? `, @${c.from!.username}` : ''}! Que bom que você se interessou 💗\n\n` +
    `Toque no link para falar com a gente no WhatsApp e tirar suas dúvidas:\n${link}`;
  // Resposta privada ao comentário (Direct). Só é permitida uma por comentário.
  await igPost('/me/messages', { recipient: { comment_id: c.id }, message: { text } });
}

async function handleAvaliacao(c: CommentValue) {
  const follows = await followsClinic(c.from!.id);
  const code = await upsertIgLead(c, { campanha: CAMPANHA_AVALIACAO, aguardando_seguir: follows !== true });
  const text =
    follows === true
      ? avaliacaoText(c.from!.username, code)
      : `Oi${c.from!.username ? `, @${c.from!.username}` : ''}! Sua avaliação gratuita está quase garantida 💗\n\n` +
        `É só seguir a @centraldaesteticasp (${PERFIL_URL}) e me responder aqui com OK, ` +
        `que eu te mando o link para agendar com a nossa consultora.`;
  await igPost('/me/messages', { recipient: { comment_id: c.id }, message: { text } });
}

async function handleComment(accountId: string, c: CommentValue) {
  if (!c.from || c.from.id === accountId) return; // ignora comentários da própria clínica
  if (!c.text) return;
  if (KEYWORD_AVALIACAO.test(c.text)) await handleAvaliacao(c);
  else if (KEYWORD.test(c.text)) await handleEuQuero(c);
  else return;
  // Resposta pública curta, para outras pessoas verem que funciona.
  await igPost(`/${c.id}/replies`, { message: 'Te mandei no Direct! 💌' }).catch((e) =>
    console.warn('instagram-webhook: resposta pública falhou', e),
  );
}

/** Resposta no Direct de quem pediu a avaliação grátis e ainda não seguia. */
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
  if (!lead) return; // outras conversas do Direct ficam com a equipe

  const follows = await followsClinic(senderId);
  // Se a Meta não informar, manda o link mesmo assim: ninguém fica sem resposta.
  if (follows === false) {
    await igPost('/me/messages', {
      recipient: { id: senderId },
      message: {
        text: `Ainda não encontrei você entre as seguidoras 🙈 Siga a @centraldaesteticasp (${PERFIL_URL}) e me responda OK de novo.`,
      },
    });
    return;
  }
  await db.from('leads').update({ aguardando_seguir: false }).eq('id', lead.id);
  await igPost('/me/messages', {
    recipient: { id: senderId },
    message: { text: avaliacaoText(lead.instagram_username, lead.codigo_indicacao) },
  });
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
  if (!(await validSignature(req, raw))) return new Response('invalid signature', { status: 401 });

  const body = JSON.parse(raw);
  const jobs: Promise<void>[] = [];
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'comments') continue;
      jobs.push(handleComment(entry.id, change.value).catch((e) => console.error('instagram-webhook', e)));
    }
    for (const m of entry.messaging ?? []) {
      jobs.push(handleDirect(entry.id, m).catch((e) => console.error('instagram-webhook direct', e)));
    }
  }
  // @ts-ignore EdgeRuntime existe no runtime do Supabase
  EdgeRuntime.waitUntil(Promise.all(jobs));
  return new Response('ok');
});
