import { createClient } from 'npm:@supabase/supabase-js@2.111.0';

export function env(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

/** Cliente com service role: ignora RLS. Usar só dentro das Edge Functions. */
export const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false },
});

export type Lead = {
  id: string;
  whatsapp: string | null;
  nome: string | null;
  email: string | null;
  tratamento_interesse: string | null;
  melhor_horario: string | null;
  observacoes: string | null;
  origem: string;
  instagram_username: string | null;
  codigo_indicacao: string | null;
  campanha: string | null;
  status: 'bot' | 'consultora' | 'encerrado';
};

/** Só dígitos, com DDI 55 quando vier sem. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.length <= 11 ? `55${digits}` : digits;
}
