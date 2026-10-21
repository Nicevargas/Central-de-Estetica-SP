import { env } from './supabase.ts';

/**
 * Envia texto pelo WhatsApp via Evolution API (v2).
 * Retorna o id da mensagem enviada, usado para reconhecer o eco no webhook.
 */
export async function sendWhatsAppText(number: string, text: string): Promise<string | null> {
  const base = env('EVOLUTION_API_URL').replace(/\/$/, '');
  const instance = encodeURIComponent(env('EVOLUTION_INSTANCE'));
  const res = await fetch(`${base}/message/sendText/${instance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: env('EVOLUTION_API_KEY') },
    body: JSON.stringify({ number, text }),
  });
  if (!res.ok) {
    throw new Error(`Evolution sendText ${res.status}: ${await res.text()}`);
  }
  const data = await res.json().catch(() => ({}));
  return data?.key?.id ?? null;
}
