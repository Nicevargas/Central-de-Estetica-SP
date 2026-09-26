# Links rastreáveis — Central da Estética

Use estes links (e não o endereço "puro" do site) para saber no Google Analytics / Vercel Analytics
de onde vieram as visitas. Cada link tem parâmetros `utm_…` que identificam a origem.

## Google Meu Negócio (Perfil da Empresa)

| Onde colar | Link |
|---|---|
| Botão **Site** do perfil | `https://centraldaestetica.com.br/?utm_source=google&utm_medium=gbp&utm_campaign=site` |
| Botão **Agendar** (link de agendamento) | `https://centraldaestetica.com.br/?utm_source=google&utm_medium=gbp&utm_campaign=agendar` |

### Botão "Saiba mais" dos posts

| Post | Link |
|---|---|
| Secagem de Vasinhos | `https://centraldaestetica.com.br/secagem-de-vasinhos-sp/?utm_source=google&utm_medium=gbp&utm_campaign=post&utm_content=vasinhos` |
| Botox | `https://centraldaestetica.com.br/botox-jardins-sp/?utm_source=google&utm_medium=gbp&utm_campaign=post&utm_content=botox` |
| Ultraformer MPT | `https://centraldaestetica.com.br/ultraformer-mpt-sp/?utm_source=google&utm_medium=gbp&utm_campaign=post&utm_content=ultraformer` |
| Bioestimulador de Colágeno | `https://centraldaestetica.com.br/bioestimulador-de-colageno-sp/?utm_source=google&utm_medium=gbp&utm_campaign=post&utm_content=bioestimulador` |
| Gordura Localizada | `https://centraldaestetica.com.br/gordura-localizada-enzimas-sp/?utm_source=google&utm_medium=gbp&utm_campaign=post&utm_content=gordura` |
| Laser Lavieén | `https://centraldaestetica.com.br/laser-lavieen-sp/?utm_source=google&utm_medium=gbp&utm_campaign=post&utm_content=lavieen` |
| Drenagem Linfática | `https://centraldaestetica.com.br/drenagem-linfatica-sp/?utm_source=google&utm_medium=gbp&utm_campaign=post&utm_content=drenagem` |
| Oferta do mês / Black Friday | `https://centraldaestetica.com.br/?utm_source=google&utm_medium=gbp&utm_campaign=oferta&utm_content=MES-ANO` (troque `MES-ANO`, ex.: `outubro-2026`) |

## Outras origens

| Onde | Link |
|---|---|
| Bio do Instagram | `https://centraldaestetica.com.br/?utm_source=instagram&utm_medium=bio` |
| Stories do Instagram | `https://centraldaestetica.com.br/?utm_source=instagram&utm_medium=stories&utm_campaign=NOME` |
| Página do Facebook | `https://centraldaestetica.com.br/?utm_source=facebook&utm_medium=pagina` |
| Mensagens / status do WhatsApp | `https://centraldaestetica.com.br/?utm_source=whatsapp&utm_medium=mensagem` |
| Pedido de avaliação | `https://centraldaestetica.com.br/avaliar` (já leva direto à avaliação no Google) |

**Regra para criar novos links:** mantenha sempre `utm_source` = de onde veio (google, instagram,
facebook, whatsapp), `utm_medium` = tipo (gbp, bio, stories, post, mensagem) e `utm_campaign` = assunto.
Use letras minúsculas, sem acentos e sem espaços.

## O que o site mede

- **Visitas e origem** (Vercel Analytics e Google Analytics): quantas pessoas, de onde vieram, quais páginas viram.
- **Eventos de conversão** (Google Analytics):
  - `whatsapp_click` — clicou para falar no WhatsApp
  - `booking_request` — enviou o formulário de agendamento (com o tratamento escolhido)
  - `phone_click`, `email_click` — clicou no telefone / e-mail
  - `directions_click` — clicou em "Como chegar"
  - `review_click` — clicou em "Avaliar no Google"
  - `social_click` — clicou no Instagram/Facebook

No Google Analytics, marque `whatsapp_click` e `booking_request` como **eventos principais**
(Administrador → Eventos → marcar como evento principal) para acompanhar as conversões por origem.
