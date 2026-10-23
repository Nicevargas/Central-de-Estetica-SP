// Webhook da Evolution API (evento MESSAGES_UPSERT).
// Configure na Evolution: URL = <função>/whatsapp-webhook?token=<EVOLUTION_WEBHOOK_TOKEN>
import { db, env, normalizePhone, type Lead } from '../_shared/supabase.ts';
import { sendWhatsAppText } from '../_shared/evolution.ts';
import { runAgent } from './agent.ts';

const REATIVAR_BOT = '#bot'; // a consultora envia isso na conversa para devolver à IA
// Depois que a consultora responde à mão, a IA só volta se ela ficar esse tempo sem escrever na conversa.
const PAUSA_CONSULTORA_MS = Number(Deno.env.get('CONSULTORA_PAUSA_MINUTOS') || 10) * 60_000;
const CODIGO_INSTAGRAM = /c[oó]d(?:igo)?\.?\s*:?\s*([A-Z0-9]{6})/i;

type EvolutionMessage = {
  key: { remoteJid: string; fromMe: boolean; id: string };
  pushName?: string;
  message?: {
    conversation?: string;
    extendedTextMessage?: { text?: string };
    imageMessage?: { caption?: string };
    videoMessage?: { caption?: string };
  };
};

function extractText(m: EvolutionMessage): string | null {
  const msg = m.message ?? {};
  return (
    msg.conversation ??
    msg.extendedTextMessage?.text ??
    msg.imageMessage?.caption ??
    msg.videoMessage?.caption ??
    null
  )?.trim() || null;
}

async function findOrCreateLead(whatsapp: string, pushName?: string): Promise<Lead> {
  const { data: existing, error } = await db.from('leads').select('*').eq('whatsapp', whatsapp).maybeSingle();
  if (error) throw error;
  if (existing) return existing as Lead;
  const { data, error: insertError } = await db
    .from('leads')
    .insert({ whatsapp, nome: pushName ?? null, origem: 'whatsapp' })
    .select('*')
    .single();
  if (insertError) throw insertError;
  return data as Lead;
}

/** Junta o lead criado pelo "EU QUERO" do Instagram ao lead do WhatsApp. */
async function linkInstagramLead(lead: Lead, text: string): Promise<Lead> {
  const code = text.match(CODIGO_INSTAGRAM)?.[1]?.toUpperCase();
  if (!code || lead.codigo_indicacao === code) return lead;
  const { data: igLead } = await db
    .from('leads')
    .select('*')
    .eq('codigo_indicacao', code)
    .is('whatsapp', null)
    .maybeSingle();
  if (!igLead) return lead;
  const merged = {
    origem: 'instagram',
    instagram_username: igLead.instagram_username,
    instagram_user_id: igLead.instagram_user_id,
    tratamento_interesse: lead.tratamento_interesse ?? igLead.tratamento_interesse,
    campanha: lead.campanha ?? igLead.campanha,
  };
  await db.from('leads').delete().eq('id', igLead.id);
  await db.from('leads').update({ ...merged, codigo_indicacao: code }).eq('id', lead.id);
  return { ...lead, ...merged, codigo_indicacao: code };
}

async function notifyConsultora(lead: Lead, transfer: { motivo: string; resumo: string }) {
  const target = Deno.env.get('CONSULTORA_WHATSAPP');
  if (!target) return;
  const text =
    `🔔 *Novo atendimento para você*\n` +
    `Cliente: ${lead.nome ?? 'sem nome'} (wa.me/${lead.whatsapp})\n` +
    `Interesse: ${lead.tratamento_interesse ?? '-'}\n` +
    `Melhor horário: ${lead.melhor_horario ?? '-'}\n` +
    (lead.instagram_username ? `Instagram: @${lead.instagram_username}\n` : '') +
    (lead.campanha === 'avaliacao_gratis' ? `Oferta: avaliação gratuita (seguidora do Instagram)\n` : '') +
    `Motivo: ${transfer.motivo}\n\n${transfer.resumo}\n\n` +
    `A IA parou de responder esta cliente. Para devolver à IA, envie ${REATIVAR_BOT} na conversa dela.`;
  await sendWhatsAppText(normalizePhone(target), text);
}

/** True se a consultora já respondeu nesta conversa e está há PAUSA_CONSULTORA_MS sem escrever. */
async function consultoraEmStandby(leadId: string): Promise<boolean> {
  const { data } = await db
    .from('wa_messages')
    .select('created_at')
    .eq('lead_id', leadId)
    .eq('autor', 'consultora')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  // Transferida pela IA e a consultora ainda não respondeu: continua aguardando por ela.
  if (!data) return false;
  return Date.now() - new Date(data.created_at).getTime() >= PAUSA_CONSULTORA_MS;
}

async function handleMessage(m: EvolutionMessage) {
  const jid = m.key.remoteJid;
  if (!jid.endsWith('@s.whatsapp.net')) return; // ignora grupos, status e canais
  const text = extractText(m);
  if (!text) return;

  const whatsapp = jid.split('@')[0];
  let lead = await findOrCreateLead(whatsapp, m.pushName);

  if (m.key.fromMe) {
    // Eco das mensagens que o próprio bot enviou: já gravadas no envio.
    // O eco pode chegar antes de o id ser gravado, então confere também pelo texto recente.
    const since = new Date(Date.now() - 2 * 60_000).toISOString();
    const ownQuery = () => db.from('wa_messages').select('id').eq('lead_id', lead.id).eq('autor', 'bot').limit(1);
    const { data: byId } = await ownQuery().eq('wa_message_id', m.key.id);
    const { data: byText } = byId?.length ? { data: byId } : await ownQuery().eq('texto', text).gte('created_at', since);
    if (byText?.length) return;
    // Mensagem digitada por uma pessoa no número da clínica: a consultora assumiu.
    if (text.toLowerCase() === REATIVAR_BOT) {
      await db.from('leads').update({ status: 'bot' }).eq('id', lead.id);
      return;
    }
    await db.from('wa_messages').insert({ lead_id: lead.id, wa_message_id: m.key.id, autor: 'consultora', texto: text });
    if (lead.status === 'bot') {
      await db.from('leads').update({ status: 'consultora', transferido_em: new Date().toISOString() }).eq('id', lead.id);
    }
    return;
  }

  const { error: dupError } = await db
    .from('wa_messages')
    .insert({ lead_id: lead.id, wa_message_id: m.key.id, autor: 'cliente', texto: text });
  if (dupError?.code === '23505') return; // a Evolution reenviou o mesmo evento

  lead = await linkInstagramLead(lead, text);
  if (lead.status === 'consultora' && (await consultoraEmStandby(lead.id))) {
    await db.from('leads').update({ status: 'bot' }).eq('id', lead.id);
    lead.status = 'bot';
  }
  if (lead.status !== 'bot') return; // consultora atendendo: IA em silêncio

  const { reply, transfer } = await runAgent(lead, text);

  if (reply) {
    // Grava antes de enviar para o eco (fromMe) ser reconhecido como do bot.
    const { data: row } = await db
      .from('wa_messages')
      .insert({ lead_id: lead.id, autor: 'bot', texto: reply })
      .select('id')
      .single();
    const sentId = await sendWhatsAppText(whatsapp, reply);
    if (row && sentId) await db.from('wa_messages').update({ wa_message_id: sentId }).eq('id', row.id);
  }
  if (transfer) {
    await db
      .from('leads')
      .update({ status: 'consultora', resumo_transferencia: transfer.resumo, transferido_em: new Date().toISOString() })
      .eq('id', lead.id);
    await notifyConsultora(lead, transfer);
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (req.method !== 'POST' || url.searchParams.get('token') !== env('EVOLUTION_WEBHOOK_TOKEN')) {
    return new Response('forbidden', { status: 403 });
  }
  const body = await req.json().catch(() => null);
  if (body?.event !== 'messages.upsert' || !body.data) return new Response('ignored');

  const messages: EvolutionMessage[] = Array.isArray(body.data) ? body.data : [body.data];
  // Responde já à Evolution e processa em segundo plano (a IA leva alguns segundos).
  const work = Promise.all(
    messages.map((m) => handleMessage(m).catch((e) => console.error('whatsapp-webhook', m?.key?.id, e))),
  );
  // @ts-ignore EdgeRuntime existe no runtime do Supabase
  EdgeRuntime.waitUntil(work);
  return new Response('ok');
});
