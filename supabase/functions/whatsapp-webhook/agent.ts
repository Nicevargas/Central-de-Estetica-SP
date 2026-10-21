import { db, env, type Lead } from '../_shared/supabase.ts';
import { embed } from '../_shared/embeddings.ts';

// OpenAI Chat Completions com function calling. O modelo pode ser trocado pelo secret OPENAI_MODEL.
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4.1-mini';
const HISTORY_LIMIT = 30;

type ChatMessage =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: ToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string };
type ToolCall = { id: string; type: 'function'; function: { name: string; arguments: string } };

// Fixo e sem dados variáveis, para o cache automático de prompt da OpenAI funcionar entre conversas.
const SYSTEM_PROMPT = `Você é a assistente virtual da Central da Estética, clínica de estética no Jardim Paulista, São Paulo, e atende clientes pelo WhatsApp.

Seu objetivo é acolher a cliente, tirar dúvidas iniciais sobre os tratamentos e encaminhar para a consultora, que é quem agenda a avaliação e fala de valores fechados.

Como responder:
- Português do Brasil, tom acolhedor e profissional, frases curtas, como numa conversa de WhatsApp. No máximo um emoji por mensagem.
- Use apenas as informações do bloco <base_de_conhecimento> e da conversa. Se a resposta não estiver lá, diga que a consultora vai confirmar; nunca invente tratamento, preço, prazo, promoção ou horário.
- Não faça diagnóstico, não prometa resultado e não indique tratamento como certo para o caso dela: quem define o plano é a avaliação. Quando falar de resultados, deixe claro que variam de pessoa para pessoa.
- Ao longo da conversa, sem parecer formulário, descubra: o nome da cliente, o tratamento ou a queixa de interesse e o melhor dia/horário para a avaliação. Pergunte uma coisa por vez.
- Sempre que a cliente informar um desses dados (ou e-mail), chame a ferramenta salvar_dados_cliente com o que ela disse.

Quando chamar transferir_para_consultora:
- a cliente quer agendar, remarcar ou fechar um pacote, e você já sabe pelo menos o nome e o interesse dela;
- ela pede para falar com uma pessoa;
- reclamação, problema com procedimento já feito, dúvida de saúde (gestação, doenças, medicamentos, alergias) ou qualquer assunto sensível;
- você não conseguiu ajudar depois de duas tentativas.
Depois de transferir, avise a cliente com uma mensagem curta que a consultora vai continuar o atendimento por aqui em instantes. Não continue a conversa depois disso.`;

const tools = [
  {
    type: 'function',
    function: {
      name: 'salvar_dados_cliente',
      description:
        'Salva no cadastro da cliente os dados que ela informou na conversa. Envie só os campos que ela disse agora; os demais ficam como estão.',
      parameters: {
        type: 'object',
        properties: {
          nome: { type: 'string', description: 'Nome como a cliente se apresentou.' },
          email: { type: 'string', description: 'E-mail informado pela cliente.' },
          tratamento_interesse: {
            type: 'string',
            description: 'Tratamento ou queixa de interesse, ex.: "Ultraformer para papada", "manchas no rosto".',
          },
          melhor_horario: {
            type: 'string',
            description: 'Preferência de dia/horário para a avaliação, com as palavras da cliente.',
          },
          observacoes: { type: 'string', description: 'Outra informação útil para a consultora.' },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'transferir_para_consultora',
      description:
        'Passa o atendimento para a consultora humana. A partir daí a IA para de responder esta cliente.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          motivo: {
            type: 'string',
            enum: ['agendamento', 'pediu_atendente', 'assunto_sensivel', 'sem_resposta'],
          },
          resumo: {
            type: 'string',
            description: 'Resumo em 2 a 4 linhas para a consultora: quem é, o que quer e o que já foi conversado.',
          },
        },
        required: ['motivo', 'resumo'],
        additionalProperties: false,
      },
    },
  },
];

export type AgentResult = {
  reply: string | null;
  transfer: { motivo: string; resumo: string } | null;
};

async function buildKnowledgeContext(question: string): Promise<string> {
  const { data, error } = await db.rpc('match_kb_documents', {
    query_embedding: await embed(question),
    match_count: 6,
  });
  if (error) throw error;
  if (!data?.length) return 'Nenhuma informação encontrada para esta pergunta.';
  return data.map((d: { titulo: string; conteudo: string }) => `## ${d.titulo}\n${d.conteudo}`).join('\n\n');
}

async function loadHistory(leadId: string): Promise<ChatMessage[]> {
  const { data, error } = await db
    .from('wa_messages')
    .select('autor, texto')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT);
  if (error) throw error;
  const history: ChatMessage[] = (data ?? []).reverse().map((m) => ({
    role: m.autor === 'cliente' ? ('user' as const) : ('assistant' as const),
    content: m.autor === 'consultora' ? `[Consultora] ${m.texto}` : m.texto,
  }));
  return history;
}

function leadSnapshot(lead: Lead): string {
  const fields = {
    nome: lead.nome,
    tratamento_interesse: lead.tratamento_interesse,
    melhor_horario: lead.melhor_horario,
    email: lead.email,
    origem: lead.instagram_username ? `Instagram (@${lead.instagram_username})` : lead.origem,
  };
  return Object.entries(fields)
    .map(([k, v]) => `${k}: ${v ?? '(não informado)'}`)
    .join('\n');
}

/**
 * Responde a última mensagem da cliente. O histórico (já com essa mensagem)
 * vem do banco; o contexto do RAG entra como bloco extra antes da pergunta.
 */
export async function runAgent(lead: Lead, latestText: string): Promise<AgentResult> {
  const history = await loadHistory(lead.id);
  const knowledge = await buildKnowledgeContext(latestText);
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const context = `<base_de_conhecimento>\n${knowledge}\n</base_de_conhecimento>\n\n<cadastro_cliente>\n${leadSnapshot(lead)}\n</cadastro_cliente>\n\nData e hora atuais: ${now}.`;
  const last = history.pop();
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: `${context}\n\n${typeof last?.content === 'string' ? last.content : latestText}` },
  ];

  let transfer: AgentResult['transfer'] = null;
  const replyParts: string[] = [];

  for (let turn = 0; turn < 4; turn++) {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env('OPENAI_API_KEY')}` },
      body: JSON.stringify({ model: MODEL, max_completion_tokens: 1500, tools, messages }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    const choice = (await res.json()).choices[0];
    const msg = choice.message as { content: string | null; refusal?: string | null; tool_calls?: ToolCall[] };

    if (msg.content?.trim()) replyParts.push(msg.content.trim());

    if (msg.refusal) {
      transfer ??= { motivo: 'assunto_sensivel', resumo: 'A IA não pôde responder esta mensagem.' };
      break;
    }
    if (!msg.tool_calls?.length) break;

    messages.push({ role: 'assistant', content: msg.content, tool_calls: msg.tool_calls });
    for (const call of msg.tool_calls) {
      let input: Record<string, string> = {};
      try {
        input = JSON.parse(call.function.arguments || '{}');
      } catch {
        messages.push({ role: 'tool', tool_call_id: call.id, content: 'Argumentos inválidos.' });
        continue;
      }
      if (call.function.name === 'salvar_dados_cliente') {
        const update = Object.fromEntries(Object.entries(input).filter(([, v]) => typeof v === 'string' && v.trim()));
        const { error } = await db.from('leads').update(update).eq('id', lead.id);
        Object.assign(lead, update);
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: error ? `Erro ao salvar: ${error.message}` : 'Dados salvos.',
        });
      } else if (call.function.name === 'transferir_para_consultora') {
        transfer = { motivo: input.motivo, resumo: input.resumo };
        messages.push({ role: 'tool', tool_call_id: call.id, content: 'Transferência registrada.' });
      } else {
        messages.push({ role: 'tool', tool_call_id: call.id, content: 'Ferramenta desconhecida.' });
      }
    }
  }

  return { reply: replyParts.join('\n\n') || null, transfer };
}
