"""
Gera as páginas de destino dos anúncios do Google Ads em public/lp/<slug>/index.html.

Por que existem: o Google Ads reprova anúncios cuja página de destino cita medicamentos
de venda controlada (ex.: Botox, Dysport). O site principal cita esses nomes no menu,
no rodapé e na descrição de todas as páginas, então os anúncios apontam para estas
páginas enxutas: um procedimento, fotos reais, avaliações e os botões de WhatsApp e ligação.

Regras ao editar:
- Nunca cite nomes de medicamentos (Botox, Dysport, toxina botulínica etc.). O teste
  no fim do script falha se algum aparecer.
- Mantenha preços e promessas iguais aos dos anúncios.

Uso: python scripts/landing-pages/gerar.py
"""
import html
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SAIDA = RAIZ / "public" / "lp"

WHATSAPP = "5511985254584"
TEL_EXIBICAO = "(11) 3151-2433"
TEL_LINK = "+551131512433"
ADS_ID = "AW-18571950133"
WHATSAPP_CONVERSION = "AW-18571950133/yLiICO3tuLcdELXw5ZdF"
GA_ID = "G-F6JB9Z88VY"

PROIBIDOS = ["botox", "dysport", "toxina", "botulin", "xeomin", "botulift", "prosigne"]

AVALIACOES = [
    ("Me senti em casa.", "Marília"),
    ("Fui recebida com muito carinho.", "Maryorith"),
    ("Esclareceu todas as dúvidas.", "Marcelo"),
    ("Fiquei bem à vontade.", "Christiane"),
]

PAGINAS = [
    {
        "slug": "secagem-de-vasinhos",
        "titulo": "Secagem de Vasinhos em SP | Laser + PEIM | Central da Estética",
        "descricao": "Secagem de vasinhos nas pernas com laser e PEIM no Jardim Paulista, SP, a partir de R$ 289. Sem cirurgia e sem repouso.",
        "kicker": "Vasinhos nas pernas",
        "h1": "Secagem de vasinhos com laser + PEIM",
        "sub": "Para vasinhos e microvarizes nas pernas e coxas. Sem cirurgia e sem repouso: você volta à rotina no mesmo dia.",
        "oferta": "Pacote com laser e aplicações (PEIM) a partir de <strong>R$ 289</strong>",
        "foto": "/clinica/tratamento-maca.jpg",
        "foto_alt": "Sala de procedimentos da Central da Estética",
        "beneficios": [
            ("Duas técnicas juntas", "O laser trata os vasinhos mais finos e o PEIM (aplicações) seca os maiores."),
            ("Sem cirurgia e sem repouso", "Sai da sessão e segue o dia normalmente."),
            ("Resultado desde as primeiras sessões", "As pernas ficam mais uniformes a cada etapa do tratamento."),
            ("Plano feito para você", "Na avaliação a especialista vê seus vasinhos e indica o número de sessões."),
        ],
        "procedimento": "secagem de vasinhos",
    },
    {
        "slug": "laser-lavieen",
        "titulo": "Laser Lavieen em SP | Manchas e Melasma | Central da Estética",
        "descricao": "Laser Lavieen para manchas, melasma e viço da pele no Jardim Paulista, SP. Pacote com 3 sessões em 6x de R$ 233.",
        "kicker": "Manchas e melasma",
        "h1": "Laser Lavieen para manchas e melasma",
        "sub": "Clareia manchas, fecha os poros e devolve o viço da pele, com efeito BB Laser. Primeiros efeitos em 3 a 7 dias.",
        "oferta": "Pacote com 3 sessões de Laser Lavieen e ativos para melasma em <strong>6x de R$ 233</strong>",
        "foto": "/clinica/avaliacao-facial.jpg",
        "foto_alt": "Avaliação facial na Central da Estética",
        "beneficios": [
            ("Pele uniforme", "Atua nas manchas de sol, melasma e marcas, deixando o tom mais homogêneo."),
            ("Poros menores e mais viço", "A textura da pele melhora e o rosto fica com aspecto descansado."),
            ("Recuperação rápida", "Uma leve vermelhidão que passa em pouco tempo."),
            ("Cuidado em casa incluso", "Ativos para melasma que potencializam o resultado das sessões."),
        ],
        "procedimento": "Laser Lavieen",
    },
    {
        "slug": "ultraformer-mpt",
        "titulo": "Ultraformer MPT em SP | Lifting sem Cortes | Central da Estética",
        "descricao": "Ultraformer MPT para flacidez, papada e contorno do rosto no Jardim Paulista, SP, a partir de R$ 499. Sem cortes e sem afastamento.",
        "kicker": "Flacidez e papada",
        "h1": "Ultraformer MPT: lifting sem cortes",
        "sub": "Define o contorno do rosto e afina a papada com ultrassom microfocado. Sem agulhas, sem cirurgia e sem afastamento da rotina.",
        "oferta": "Ultraformer MPT a partir de <strong>R$ 499</strong>",
        "foto": "/clinica/consultorio.jpg",
        "foto_alt": "Consultório da Central da Estética",
        "beneficios": [
            ("Contorno mais definido", "Firma a linha da mandíbula e reduz a papada."),
            ("Rosto e corpo", "Também trata flacidez em regiões como abdômen, braços e coxas."),
            ("Sem cortes e sem agulhas", "Tecnologia de ultrassom que age nas camadas profundas da pele."),
            ("Volta à rotina na hora", "Não precisa de repouso depois da sessão."),
        ],
        "procedimento": "Ultraformer MPT",
    },
    {
        "slug": "bioestimulador-de-colageno",
        "titulo": "Bioestimulador de Colágeno em SP | Radiesse ou Sculptra | Central da Estética",
        "descricao": "Bioestimulador de colágeno (Radiesse ou Sculptra) para firmeza e flacidez no Jardim Paulista, SP. Condição em 6x de R$ 365.",
        "kicker": "Firmeza e colágeno",
        "h1": "Bioestimulador de colágeno: Radiesse ou Sculptra",
        "sub": "Estimula o seu próprio colágeno para devolver firmeza ao rosto, pescoço, colo e braços. Resultado progressivo e duradouro.",
        "oferta": "Condição especial em <strong>6x de R$ 365</strong>",
        "foto": "/radiesse-sculptra.jpeg",
        "foto_alt": "Tratamento com bioestimulador de colágeno",
        "beneficios": [
            ("Menos flacidez, mais firmeza", "O colágeno novo sustenta a pele de dentro para fora."),
            ("Resultado natural", "A melhora aparece aos poucos, sem mudar seus traços."),
            ("Efeito duradouro", "O resultado pode durar até 2 anos, conforme o organismo de cada pessoa."),
            ("Indicação personalizada", "Na avaliação definimos o produto e as regiões ideais para você."),
        ],
        "procedimento": "bioestimulador de colágeno",
    },
    {
        "slug": "harmonizacao-glutea",
        "titulo": "Harmonização Glútea em SP | Glúteo Max | Central da Estética",
        "descricao": "Glúteo Max: harmonização glútea para levantar e arredondar o bumbum, sem cirurgia e sem prótese, no Jardim Paulista, SP.",
        "kicker": "Harmonização glútea",
        "h1": "Glúteo Max: levanta e arredonda o bumbum",
        "sub": "Protocolo com bioestimulador, preenchimento e ativos. Efeito imediato, sem cirurgia e sem prótese, e firmeza que melhora em 30 a 60 dias.",
        "oferta": "Protocolo <strong>Glúteo Max</strong> com avaliação personalizada",
        "foto": "/clinica/atendimento-conversa.jpg",
        "foto_alt": "Atendimento na Central da Estética",
        "beneficios": [
            ("Mais volume e contorno", "Bumbum mais empinado e com formato definido."),
            ("Sem cirurgia e sem prótese", "Procedimento no consultório, sem cortes."),
            ("Firmeza que continua melhorando", "O estímulo de colágeno age nas semanas seguintes."),
            ("Plano sob medida", "A quantidade e as regiões são definidas na avaliação."),
        ],
        "procedimento": "harmonização glútea (Glúteo Max)",
    },
    {
        "slug": "drenagem-linfatica",
        "titulo": "Drenagem Linfática e Massagens em SP | Central da Estética",
        "descricao": "Drenagem linfática, massagem modeladora e relaxante com aromaterapia no Jardim Paulista, SP. Avulsa ou em pacotes.",
        "kicker": "Drenagem e massagens",
        "h1": "Drenagem linfática e massagens",
        "sub": "Drenagem linfática, massagem modeladora e relaxante com aromaterapia. Reduz o inchaço e a retenção de líquidos e alivia o estresse.",
        "oferta": "Sessões <strong>avulsas ou em pacotes</strong>",
        "foto": "/drenagemlinfatica.jpg",
        "foto_alt": "Drenagem linfática na Central da Estética",
        "beneficios": [
            ("Desincha já na 1ª sessão", "Sensação de leveza nas pernas e no corpo."),
            ("Modeladora", "Ajuda a definir o contorno e melhora o aspecto da pele."),
            ("Relaxante com aromaterapia", "Um momento para aliviar o estresse e a tensão muscular."),
            ("Do seu jeito", "Sessão avulsa ou pacote, no horário que encaixa na sua rotina."),
        ],
        "procedimento": "drenagem linfática / massagem",
    },
]

CSS = """
:root{--rosa:#b5197a;--roxo:#6f2e7c;--claro:#fdf3f9;--texto:#2b2230;--cinza:#6b6170}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:var(--texto);background:#fff;line-height:1.55}
a{color:inherit}
.wrap{max-width:1040px;margin:0 auto;padding:0 20px}
header{border-bottom:1px solid #f0e4ec;background:#fff;position:sticky;top:0;z-index:5}
header .wrap{display:flex;align-items:center;justify-content:space-between;height:64px}
header img{height:40px;width:auto}
header a.tel{font-weight:700;color:var(--roxo);text-decoration:none;font-size:15px}
.hero{background:var(--claro)}
.hero .wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center;padding-top:48px;padding-bottom:48px}
.kicker{color:var(--rosa);font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:13px}
h1{font-family:'Playfair Display',Georgia,serif;font-size:42px;line-height:1.12;margin:10px 0 14px;color:var(--roxo)}
.sub{font-size:17px;color:var(--cinza)}
.oferta{margin:22px 0;padding:14px 18px;border-left:4px solid var(--rosa);background:#fff;border-radius:8px;font-size:16px}
.ctas{display:flex;flex-wrap:wrap;gap:12px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:14px 22px;border-radius:999px;font-weight:700;text-decoration:none;font-size:16px}
.btn.wa{background:#1fa855;color:#fff}
.btn.ligar{border:2px solid var(--roxo);color:var(--roxo);background:#fff}
.nota{margin-top:16px;font-size:14px;color:var(--cinza)}
.nota b{color:#e8a400}
.hero img.foto{width:100%;height:420px;object-fit:cover;border-radius:20px;box-shadow:0 20px 40px rgba(111,46,124,.18)}
section{padding:56px 0}
h2{font-family:'Playfair Display',Georgia,serif;font-size:30px;color:var(--roxo);margin-bottom:24px}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
.card{border:1px solid #f0e4ec;border-radius:16px;padding:20px}
.card h3{font-size:17px;margin-bottom:6px}
.card p{color:var(--cinza);font-size:15px}
.avs{background:var(--roxo);color:#fff}
.avs h2{color:#fff}
.avs .grid{grid-template-columns:repeat(4,1fr)}
.av{background:rgba(255,255,255,.08);border-radius:16px;padding:18px}
.av q{font-family:'Playfair Display',Georgia,serif;font-size:18px;display:block;margin-bottom:8px}
.av span{color:#fed6ff;font-size:14px}
.local .wrap{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center}
.local img{width:100%;height:280px;object-fit:cover;border-radius:16px}
.local p{margin-bottom:8px}
.final{background:var(--claro);text-align:center}
.final p{color:var(--cinza);margin-bottom:20px}
.final .ctas{justify-content:center}
footer{font-size:13px;color:var(--cinza);padding:24px 0;border-top:1px solid #f0e4ec}
footer .wrap{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between}
.cookie{position:fixed;left:16px;right:16px;bottom:16px;max-width:640px;margin:0 auto;background:#fff;border:1px solid #eadbe4;border-radius:20px;padding:16px 18px;box-shadow:0 12px 30px rgba(0,0,0,.15);display:none;gap:12px;align-items:center;font-size:14px;z-index:10}
.cookie.on{display:flex}
.cookie button{border:0;border-radius:999px;padding:9px 16px;font-weight:700;cursor:pointer;font-size:14px}
.cookie .ok{background:var(--rosa);color:#fff}
.cookie .no{background:#f3e9f0;color:var(--roxo)}
.wa-float{position:fixed;right:18px;bottom:18px;width:58px;height:58px;border-radius:50%;background:#1fa855;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(0,0,0,.25);z-index:9}
@media (max-width:820px){
 .hero .wrap,.local .wrap{grid-template-columns:1fr}
 h1{font-size:32px}
 .hero img.foto{height:260px}
 .grid,.avs .grid{grid-template-columns:1fr}
 .cookie{flex-direction:column;align-items:stretch}
}
"""

ICONE_WA = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7c1.7.9 3.7 1.4 5.6 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.3zM12 21.7c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 0 1-1.5-5.2C2.1 6.5 6.5 2.1 12 2.1c2.6 0 5.1 1 7 2.9a9.8 9.8 0 0 1 2.9 7c0 5.4-4.4 9.7-9.9 9.7zm5.4-7.3c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.5.2-.7.2-1.4.2-1.5-.1-.1-.3-.2-.6-.3z"/></svg>'

JS = """
(function(){
  var KEY='central_cookie_consent_v2';
  function lido(){try{var v=localStorage.getItem(KEY);return v==='granted'||v==='denied'?v:null}catch(e){return null}}
  function estado(c){var g=c==='granted'?'granted':'denied';return{analytics_storage:g,ad_storage:g,ad_user_data:g,ad_personalization:'denied'}}
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){dataLayer.push(arguments)};
  gtag('consent','default',estado(lido()));
  gtag('js',new Date());
  gtag('config','%(GA)s');
  gtag('config','%(ADS)s');
  var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=%(GA)s';document.head.appendChild(s);
  var aviso=document.getElementById('cookie');
  if(!lido())aviso.classList.add('on');
  function escolher(c){try{localStorage.setItem(KEY,c)}catch(e){}gtag('consent','update',estado(c));aviso.classList.remove('on')}
  document.getElementById('ck-ok').onclick=function(){escolher('granted')};
  document.getElementById('ck-no').onclick=function(){escolher('denied')};
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
    var pagina=document.body.getAttribute('data-lp');
    if(/wa\\.me\\/\\d/.test(a.href)){
      gtag('event','whatsapp_click',{link_text:(a.getAttribute('data-local')||'')+' '+pagina});
      gtag('event','conversion',{send_to:'%(CONV)s'});
    }else if(a.href.indexOf('tel:')===0){
      gtag('event','phone_click',{link_text:pagina});
    }
  },true);
})();
""" % {"GA": GA_ID, "ADS": ADS_ID, "CONV": WHATSAPP_CONVERSION}


def e(texto: str) -> str:
    return html.escape(texto, quote=True)


def link_whatsapp(procedimento: str) -> str:
    from urllib.parse import quote
    msg = f"Olá! Vi o anúncio e quero agendar uma avaliação de {procedimento}."
    return f"https://wa.me/{WHATSAPP}?text={quote(msg)}"


def pagina(p: dict) -> str:
    wa = link_whatsapp(p["procedimento"])
    url = f"https://centraldaestetica.com.br/lp/{p['slug']}/"
    beneficios = "".join(f'<div class="card"><h3>{e(t)}</h3><p>{e(d)}</p></div>' for t, d in p["beneficios"])
    avaliacoes = "".join(f'<div class="av"><q>{e(t)}</q><span>{e(n)}, no Google</span></div>' for t, n in AVALIACOES)
    ld = {
        "@context": "https://schema.org",
        "@type": "BeautySalon",
        "name": "Central da Estética",
        "url": "https://centraldaestetica.com.br/",
        "telephone": "+55-11-3151-2433",
        "address": {"@type": "PostalAddress", "streetAddress": "Rua Artur Frazão, 33", "addressLocality": "São Paulo",
                    "addressRegion": "SP", "postalCode": "01423-030", "addressCountry": "BR"},
        "aggregateRating": {"@type": "AggregateRating", "ratingValue": "4.6", "reviewCount": "569"},
    }
    return f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{e(p['titulo'])}</title>
<meta name="description" content="{e(p['descricao'])}" />
<meta name="robots" content="noindex, follow" />
<link rel="canonical" href="{url}" />
<meta name="theme-color" content="#b5197a" />
<link rel="icon" type="image/png" href="https://qzcrregtdhjumvfigwxj.supabase.co/storage/v1/object/public/imagens/favicon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
<style>{CSS}</style>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body data-lp="{p['slug']}">
<header><div class="wrap">
  <img src="/logo.png" alt="Central da Estética" />
  <a class="tel" href="tel:{TEL_LINK}">Ligue: {TEL_EXIBICAO}</a>
</div></header>

<main>
<div class="hero"><div class="wrap">
  <div>
    <div class="kicker">{e(p['kicker'])} · Jardim Paulista, SP</div>
    <h1>{e(p['h1'])}</h1>
    <p class="sub">{e(p['sub'])}</p>
    <div class="oferta">{p['oferta']}<br /><small>Valores e condições confirmados na avaliação.</small></div>
    <div class="ctas">
      <a class="btn wa" data-local="topo" href="{wa}" target="_blank" rel="noopener">{ICONE_WA} Agendar avaliação no WhatsApp</a>
      <a class="btn ligar" href="tel:{TEL_LINK}">Ligar agora</a>
    </div>
    <p class="nota"><b>★★★★★</b> Nota 4,6 no Google com 569 avaliações</p>
  </div>
  <img class="foto" src="{p['foto']}" alt="{e(p['foto_alt'])}" />
</div></div>

<section><div class="wrap">
  <h2>Por que fazer na Central da Estética</h2>
  <div class="grid">{beneficios}</div>
</div></section>

<section class="avs"><div class="wrap">
  <h2>O que dizem as nossas clientes</h2>
  <div class="grid">{avaliacoes}</div>
</div></section>

<section class="local"><div class="wrap">
  <img src="/clinica/fachada.jpg" alt="Fachada da Central da Estética" />
  <div>
    <h2>Onde estamos</h2>
    <p><strong>Rua Artur Frazão, 33 — Jardim Paulista, São Paulo</strong></p>
    <p>Perto da Av. Paulista. CEP 01423-030.</p>
    <p>Segunda a sexta, das 8h às 20h. Sábado, das 8h às 16h.</p>
    <p><a href="https://www.google.com/maps/search/?api=1&query=Central+da+Est%C3%A9tica+Rua+Artur+Fraz%C3%A3o+33+S%C3%A3o+Paulo" target="_blank" rel="noopener">Ver no mapa</a></p>
  </div>
</div></section>

<section class="final"><div class="wrap">
  <h2>Agende a sua avaliação</h2>
  <p>A especialista avalia o seu caso, tira as suas dúvidas e indica o melhor plano para você.</p>
  <div class="ctas">
    <a class="btn wa" data-local="final" href="{wa}" target="_blank" rel="noopener">{ICONE_WA} Falar no WhatsApp</a>
    <a class="btn ligar" href="tel:{TEL_LINK}">{TEL_EXIBICAO}</a>
  </div>
</div></section>
</main>

<footer><div class="wrap">
  <span>Central da Estética · Rua Artur Frazão, 33, Jardim Paulista, São Paulo - SP</span>
  <a href="/politica-de-privacidade/">Política de privacidade</a>
</div></footer>

<a class="wa-float" data-local="flutuante" href="{wa}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp" style="color:#fff">{ICONE_WA}</a>

<div class="cookie" id="cookie" role="dialog" aria-label="Aviso de cookies">
  <span>Usamos cookies do Google para entender o uso do site e medir os resultados dos nossos anúncios. Não fazemos anúncios personalizados com seus dados. <a href="/politica-de-privacidade/">Saiba mais</a>.</span>
  <button class="ok" id="ck-ok">Aceitar</button><button class="no" id="ck-no">Recusar</button>
</div>
<script>{JS}</script>
</body>
</html>
"""


def main() -> None:
    for p in PAGINAS:
        destino = SAIDA / p["slug"] / "index.html"
        destino.parent.mkdir(parents=True, exist_ok=True)
        conteudo = pagina(p)
        achados = [w for w in PROIBIDOS if re.search(w, conteudo, re.I)]
        if achados:
            raise SystemExit(f"{p['slug']}: termo proibido pelo Google Ads encontrado: {achados}")
        destino.write_text(conteudo, encoding="utf-8")
        print(f"ok  /lp/{p['slug']}/")


if __name__ == "__main__":
    main()
