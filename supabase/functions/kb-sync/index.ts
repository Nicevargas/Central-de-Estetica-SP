// Monta a base de conhecimento do atendente a partir das tabelas do site
// (treatments, promotions ativas, faqs) e de conhecimento.ts.
// Rodar depois de mudar tratamentos, preços, promoções ou FAQs, repetindo até pendentes = 0:
//   curl -X POST <função>/kb-sync -H "x-sync-token: <KB_SYNC_TOKEN>"
import { db, env } from '../_shared/supabase.ts';
import { embed } from '../_shared/embeddings.ts';
import { CONHECIMENTO } from './conhecimento.ts';

type Doc = { id: string; fonte: string; titulo: string; conteudo: string };

const list = (items?: string[] | null) => (items?.length ? items.map((i) => `- ${i}`).join('\n') : '');

async function collectDocs(): Promise<Doc[]> {
  const docs: Doc[] = [];

  const { data: treatments, error: tErr } = await db
    .from('treatments')
    .select('id, name, description, category, duration, price, benefits, post_care_tips');
  if (tErr) throw tErr;
  for (const t of treatments ?? []) {
    docs.push({
      id: `treatment:${t.id}`,
      fonte: 'treatments',
      titulo: `Tratamento: ${t.name}`,
      conteudo: [
        `${t.name} (${t.category}). ${t.description}`,
        t.duration && `Duração da sessão: ${t.duration}.`,
        t.price && `Preço: ${t.price}.`,
        t.benefits?.length && `Benefícios:\n${list(t.benefits)}`,
        t.post_care_tips?.length && `Cuidados depois:\n${list(t.post_care_tips)}`,
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  const { data: promos, error: pErr } = await db
    .from('promotions')
    .select('id, title, subtitle, discount, original_price, promo_price, coupon_code')
    .eq('active', true);
  if (pErr) throw pErr;
  for (const p of promos ?? []) {
    docs.push({
      id: `promotion:${p.id}`,
      fonte: 'promotions',
      titulo: `Promoção: ${p.title}`,
      conteudo: [
        `${p.title}. ${p.subtitle ?? ''}`,
        p.discount && `Desconto: ${p.discount}.`,
        p.promo_price && `De ${p.original_price || '-'} por ${p.promo_price}.`,
        p.coupon_code && `Cupom: ${p.coupon_code}.`,
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  const { data: faqs, error: fErr } = await db.from('faqs').select('id, question, answer');
  if (fErr) throw fErr;
  for (const f of faqs ?? []) {
    docs.push({ id: `faq:${f.id}`, fonte: 'faqs', titulo: f.question, conteudo: `${f.question}\n${f.answer}` });
  }

  for (const section of CONHECIMENTO.split(/^# /m).filter((s) => s.trim())) {
    const [titulo, ...rest] = section.split('\n');
    const slug = titulo.trim().toLowerCase().normalize('NFD').replace(/[^\w]+/g, '-');
    docs.push({ id: `extra:${slug}`, fonte: 'extra', titulo: titulo.trim(), conteudo: rest.join('\n').trim() });
  }
  return docs;
}

// Gerar embeddings gasta CPU, e o limite por chamada é baixo: cada chamada processa
// no máximo `lote` documentos novos ou alterados. Repita até `pendentes` ser 0.
Deno.serve(async (req) => {
  if (req.method !== 'POST' || req.headers.get('x-sync-token') !== env('KB_SYNC_TOKEN')) {
    return new Response('forbidden', { status: 403 });
  }
  const lote = Math.max(1, Number(new URL(req.url).searchParams.get('lote')) || 3);
  const docs = await collectDocs();

  const { data: existing, error: exError } = await db.from('kb_documents').select('id, titulo, conteudo');
  if (exError) return Response.json({ error: exError.message }, { status: 500 });
  const saved = new Map((existing ?? []).map((e) => [e.id, `${e.titulo}\n${e.conteudo}`]));
  const changed = docs.filter((d) => saved.get(d.id) !== `${d.titulo}\n${d.conteudo}`);

  const rows = [];
  for (const d of changed.slice(0, lote)) {
    rows.push({ ...d, embedding: await embed(`${d.titulo}\n${d.conteudo}`), updated_at: new Date().toISOString() });
  }
  if (rows.length) {
    const { error } = await db.from('kb_documents').upsert(rows);
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }
  const pendentes = changed.length - rows.length;
  if (pendentes > 0) {
    return Response.json({ documentos: docs.length, atualizados: rows.length, pendentes });
  }

  // Remove documentos que não existem mais (tratamento apagado, promoção desativada).
  const ids = docs.map((d) => d.id);
  const { error: delError } = await db
    .from('kb_documents')
    .delete()
    .not('id', 'in', `(${ids.map((id) => `"${id}"`).join(',')})`);
  if (delError) return Response.json({ error: delError.message }, { status: 500 });

  return Response.json({ documentos: docs.length, atualizados: rows.length, pendentes: 0 });
});
