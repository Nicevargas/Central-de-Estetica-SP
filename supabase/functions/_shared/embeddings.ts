// Embeddings com o modelo gte-small embutido no runtime das Edge Functions
// (sem chave de API extra). Gera vetores de 384 dimensões, normalizados.
declare const Supabase: {
  ai: { Session: new (model: string) => { run(input: string, opts: Record<string, unknown>): Promise<number[]> } };
};

const session = new Supabase.ai.Session('gte-small');

export async function embed(text: string): Promise<number[]> {
  return await session.run(text.slice(0, 2000), { mean_pool: true, normalize: true });
}
