// Webhook do Instagram (campo "comments" do app Meta 1315858633192552).
// Comentário com "EU QUERO" → resposta privada no Direct com o link do WhatsApp,
// que leva um código para o bot ligar a cliente do Instagram à conversa do WhatsApp.
import { db, env, normalizePhone } from '../_shared/supabase.ts';

const GRAPH = 'https://graph.instagram.com/v23.0';
const KEYWORD = new RegExp(`\\b${(Deno.env.get('IG_KEYWORD') ?? 'eu quero').replace(/\s+/g, '\\s*')}\\b`, 'i');

type CommentValue = {
  id: string;
  text?: string;
  from?: { id: string; username?: string };
  media?: { id: string };
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

async function handleComment(accountId: string, c: CommentValue) {
  if (!c.from || c.from.id === accountId) return; // ignora comentários da própria clínica
  if (!c.text || !KEYWORD.test(c.text)) return;

  // Reaproveita o código se a mesma pessoa já comentou antes.
  const { data: existing } = await db
    .from('leads')
    .select('codigo_indicacao')
    .eq('instagram_user_id', c.from.id)
    .not('codigo_indicacao', 'is', null)
    .limit(1)
    .maybeSingle();
  let code = existing?.codigo_indicacao as string | undefined;
  if (!code) {
    code = newCode();
    const { error } = await db.from('leads').insert({
      origem: 'instagram',
      instagram_user_id: c.from.id,
      instagram_username: c.from.username ?? null,
      codigo_indicacao: code,
      tratamento_interesse: await mediaTopic(c.media?.id),
    });
    if (error) throw error;
  }

  const phone = normalizePhone(env('CLINICA_WHATSAPP'));
  const prefilled = `Olá! Vim pelo Instagram e quero saber mais. Cód. ${code}`;
  const link = `https://wa.me/${phone}?text=${encodeURIComponent(prefilled)}`;
  const text =
    `Oi${c.from.username ? `, @${c.from.username}` : ''}! Que bom que você se interessou 💗\n\n` +
    `Toque no link para falar com a gente no WhatsApp e tirar suas dúvidas:\n${link}`;

  // Resposta privada ao comentário (Direct). Só é permitida uma por comentário.
  await igPost('/me/messages', { recipient: { comment_id: c.id }, message: { text } });
  // Resposta pública curta, para outras pessoas verem que funciona.
  await igPost(`/${c.id}/replies`, { message: 'Te mandei no Direct! 💌' }).catch((e) =>
    console.warn('instagram-webhook: resposta pública falhou', e),
  );
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
  }
  // @ts-ignore EdgeRuntime existe no runtime do Supabase
  EdgeRuntime.waitUntil(Promise.all(jobs));
  return new Response('ok');
});
