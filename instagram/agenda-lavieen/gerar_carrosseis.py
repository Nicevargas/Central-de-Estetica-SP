"""Gera os 4 carrosséis do Lavieén (HTML -> JPG 1080x1350).
Saída em carrosseis/<nome>/slide-N.jpg. NÃO fica em instagram/publicar (nada é publicado daqui)."""
import asyncio
import pathlib
from playwright.async_api import async_playwright

BASE = pathlib.Path(__file__).parent.resolve()
LOGO = (BASE / '../../public/logo.png').resolve().as_uri()
RES = "O resultado varia de pessoa para pessoa."

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Outfit:wght@300;400;500&display=swap');
:root{--bg:#FBF5F2;--ink:#1E1B1B;--rose:#C8304A;--blush:#F3D3CF;--soft:#5A5050}
*{box-sizing:border-box;margin:0;padding:0}
.slide{width:1080px;height:1350px;position:relative;overflow:hidden;background:var(--bg);font-family:'Outfit',sans-serif;color:var(--ink)}
.ph{position:absolute;overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
.logo{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);width:200px}
h1{font-family:'Playfair Display',serif;font-weight:500;line-height:1.05;letter-spacing:-1.5px}
em{font-family:'Playfair Display',serif;font-style:italic;color:var(--rose)}
p{font-weight:300;line-height:1.35}
.num{font-family:'Playfair Display',serif;font-style:italic;color:var(--rose);font-size:130px;line-height:1}
.pill{position:absolute;border:2px solid var(--rose);border-radius:40px;padding:10px 32px;font-size:28px;color:var(--rose);letter-spacing:2px;background:rgba(251,245,242,.92)}
.swipe{position:absolute;right:84px;bottom:76px;font-size:32px;color:var(--rose);letter-spacing:2px}
.blob{position:absolute;border-radius:50%;background:var(--blush);opacity:.7}
.cta{display:inline-block;background:var(--rose);color:#fff;border-radius:60px;padding:28px 56px;font-size:44px;font-weight:500}
.note{position:absolute;left:84px;right:84px;font-size:26px;color:var(--soft);font-weight:300}
.dots{position:absolute;top:60px;right:84px;display:flex;gap:10px;z-index:5}
.dots i{width:14px;height:14px;border-radius:50%;background:var(--blush)}
.dots i.on{background:var(--rose)}
"""


def dots(i, n=5):
    return '<div class="dots">' + ''.join(
        f'<i class="{"on" if k == i else ""}"></i>' for k in range(n)) + '</div>'


def cover(photo, kicker, title_html, sub):
    return f"""<section class="slide">
<div class="ph" style="left:0;top:0;width:1080px;height:800px;border-bottom-left-radius:260px"><img src="{photo}" style="object-position:50% 25%"></div>
<div class="pill" style="left:84px;top:56px">✦ {kicker}</div>
<div style="position:absolute;left:84px;right:84px;top:840px"><h1 style="font-size:80px">{title_html}</h1>
<p style="font-size:36px;margin-top:22px">{sub}</p></div>
<div class="swipe">ARRASTE →</div><img class="logo" src="{LOGO}" style="left:84px;transform:none;bottom:60px;width:170px"></section>"""


def split(i, photo, num, title_html, text, side='right', pos='50% 30%'):
    left = side == 'left'
    radius = 'border-top-right-radius:300px' if left else 'border-top-left-radius:300px'
    photo_css = f"{'left' if left else 'right'}:0;bottom:0;width:470px;height:880px;{radius}"
    txt = f"left:{520 if left else 84}px;right:{84 if left else 520}px"
    blob_side = 'right' if left else 'left'
    logo_pos = 'left:auto;right:84px' if left else 'left:84px'
    return f"""<section class="slide">{dots(i)}
<div class="blob" style="width:420px;height:420px;{blob_side}:-140px;top:-120px"></div>
<div class="ph" style="{photo_css};box-shadow:0 18px 50px rgba(200,48,74,.15)"><img src="{photo}" style="object-position:{pos}"></div>
<div style="position:absolute;{txt};top:360px"><div class="num">{num}</div>
<h1 style="font-size:70px;margin:14px 0 26px">{title_html}</h1><p style="font-size:38px">{text}</p></div>
<img class="logo" src="{LOGO}" style="{logo_pos};transform:none;bottom:50px;width:170px"></section>"""


def full(i, photo, num, title_html, text, pos='50% 30%'):
    return f"""<section class="slide">{dots(i)}
<div class="ph" style="left:84px;right:84px;top:130px;height:640px;border-radius:44px;box-shadow:0 18px 50px rgba(200,48,74,.15)"><img src="{photo}" style="object-position:{pos}"></div>
<div style="position:absolute;left:84px;right:84px;top:810px"><div class="num" style="font-size:90px;margin-bottom:6px">{num}</div><h1 style="font-size:72px">{title_html}</h1><p style="font-size:40px;margin-top:24px">{text}</p></div>
<img class="logo" src="{LOGO}"></section>"""


def final(photo, pos='50% 25%'):
    return f"""<section class="slide">
<div class="blob" style="width:520px;height:520px;right:-180px;top:-160px"></div>
<div class="ph" style="left:330px;top:90px;width:420px;height:420px;border-radius:50%;border:8px solid #fff;box-shadow:0 18px 50px rgba(200,48,74,.18)"><img src="{photo}" style="object-position:{pos}"></div>
<div style="position:absolute;left:84px;right:84px;top:560px;text-align:center">
<h1 style="font-size:86px">Quer saber se é <em>para você?</em></h1>
<p style="font-size:42px;margin:26px 0 44px">Comente e receba o link da sua avaliação no Direct.</p>
<div class="cta">Comente AVALIAÇÃO</div></div>
<div class="note" style="bottom:200px;text-align:center">{RES}</div><img class="logo" src="{LOGO}"></section>"""


# ---------- Layout B: foto cheia com texto sobre degradê (perguntas e respostas) ----------
GRAD = 'linear-gradient(to top, rgba(45,18,30,.94) 0%, rgba(45,18,30,.6) 42%, rgba(45,18,30,0) 78%)'
CHIP = f'<div style="position:absolute;left:84px;top:60px;background:#fff;border-radius:22px;padding:10px 18px"><img src="{LOGO}" style="width:120px;display:block"></div>'
PINK = '#F3A5B3'


def b_cover(photo, kicker, title_html, sub, pos='50% 30%'):
    return f"""<section class="slide" style="background:#2D121E">
<div class="ph" style="inset:0"><img src="{photo}" style="object-position:{pos}"></div>
<div style="position:absolute;inset:0;background:{GRAD}"></div>{CHIP}
<div style="position:absolute;left:84px;right:84px;bottom:150px;color:#fff">
<div style="font-size:30px;letter-spacing:3px;color:#F3D3CF;margin-bottom:22px">{kicker.upper()}</div>
<h1 style="font-size:104px;color:#fff">{title_html}</h1><p style="font-size:40px;margin-top:24px;color:#F3E6E3">{sub}</p></div>
<div style="position:absolute;right:84px;bottom:60px;font-size:32px;color:#F3D3CF;letter-spacing:2px">ARRASTE →</div></section>"""


def b_slide(i, photo, label, title_html, text, pos='50% 30%'):
    return f"""<section class="slide" style="background:#2D121E">
<div class="ph" style="inset:0"><img src="{photo}" style="object-position:{pos}"></div>
<div style="position:absolute;inset:0;background:{GRAD}"></div>
<div style="position:absolute;left:84px;top:70px;font-size:28px;letter-spacing:3px;color:#fff;background:rgba(200,48,74,.92);border-radius:40px;padding:10px 30px">{label}</div>
<div style="position:absolute;left:84px;right:84px;bottom:110px;color:#fff">
<h1 style="font-size:88px;color:#fff">{title_html}</h1><p style="font-size:42px;margin-top:24px;color:#F3E6E3">{text}</p></div>
<div style="position:absolute;right:84px;top:80px;font-size:28px;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.55)">{i + 1}/5</div></section>"""


def b_final(photo, pos='50% 25%'):
    return f"""<section class="slide" style="background:#2D121E">
<div class="ph" style="left:0;top:0;width:1080px;height:640px;border-bottom-left-radius:260px;border-bottom-right-radius:260px"><img src="{photo}" style="object-position:{pos}"></div>
<div style="position:absolute;left:84px;right:84px;top:700px;text-align:center;color:#fff">
<h1 style="font-size:84px;color:#fff">Quer saber se o seu caso <em style="color:{PINK}">dá para tratar?</em></h1>
<p style="font-size:42px;margin:24px 0 40px;color:#F3E6E3">Comente e receba o link da avaliação no Direct.</p>
<div class="cta">Comente AVALIAÇÃO</div></div>
<div class="note" style="bottom:70px;text-align:center;color:#C9B3BA">{RES}</div></section>"""


# ---------- Layout C: dicas em cartões (checklist) ----------
def c_cover(photo, kicker, title_html, sub, pos='50% 30%'):
    return f"""<section class="slide" style="background:#F6E6E2">
<div class="blob" style="width:700px;height:700px;left:-250px;bottom:-200px;background:#fff;opacity:.55"></div>
<div class="ph" style="left:190px;top:90px;width:700px;height:700px;border-radius:50%;border:12px solid #fff;box-shadow:0 22px 60px rgba(200,48,74,.2)"><img src="{photo}" style="object-position:{pos}"></div>
<div style="position:absolute;left:84px;right:84px;top:840px;text-align:center">
<div style="display:inline-block;background:var(--rose);color:#fff;border-radius:40px;padding:10px 34px;font-size:28px;letter-spacing:3px;margin-bottom:26px">{kicker.upper()}</div>
<h1 style="font-size:92px">{title_html}</h1><p style="font-size:38px;margin-top:20px">{sub}</p></div>
<div class="swipe" style="left:0;right:0;text-align:center;bottom:44px">ARRASTE →</div></section>"""


def c_tip(i, photo, title_html, text, pos='50% 30%'):
    return f"""<section class="slide" style="background:#F6E6E2">
<div class="ph" style="left:84px;right:84px;top:90px;height:520px;border-radius:44px 44px 120px 44px"><img src="{photo}" style="object-position:{pos}"></div>
<div style="position:absolute;left:84px;right:84px;top:560px;background:#fff;border-radius:44px;padding:60px 56px 56px;box-shadow:0 20px 56px rgba(200,48,74,.14);min-height:520px">
<div style="position:absolute;left:56px;top:-52px;width:104px;height:104px;border-radius:50%;background:var(--rose);color:#fff;font-size:60px;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(200,48,74,.35)">✓</div>
<div style="margin-top:46px;font-size:28px;letter-spacing:3px;color:var(--rose)">DICA {i}</div>
<h1 style="font-size:74px;margin:10px 0 24px">{title_html}</h1><p style="font-size:42px">{text}</p></div>
<img class="logo" src="{LOGO}" style="width:150px;bottom:34px"></section>"""


def c_final(photo, pos='50% 25%'):
    return final(photo, pos).replace('<section class="slide">', '<section class="slide" style="background:#F6E6E2">')


# ---------- Layout D: mosaico e polaroid ----------
def d_cover(photos, kicker, title_html, sub):
    p1, p2, p3 = photos
    return f"""<section class="slide">
<div class="ph" style="left:84px;top:90px;width:540px;height:700px;border-radius:44px"><img src="{p1}"></div>
<div class="ph" style="left:650px;top:90px;width:346px;height:336px;border-radius:44px 44px 44px 140px"><img src="{p2}"></div>
<div class="ph" style="left:650px;top:454px;width:346px;height:336px;border-radius:140px 44px 44px 44px"><img src="{p3}"></div>
<div style="position:absolute;left:84px;right:84px;top:850px"><div style="font-size:28px;letter-spacing:3px;color:var(--rose);margin-bottom:18px">✦ {kicker.upper()}</div>
<h1 style="font-size:92px">{title_html}</h1><p style="font-size:38px;margin-top:22px">{sub}</p></div>
<div class="swipe">ARRASTE →</div><img class="logo" src="{LOGO}" style="left:84px;transform:none;bottom:50px;width:160px"></section>"""


def d_slide(i, photo, label, title_html, text, tilt=-3, pos='50% 30%'):
    return f"""<section class="slide">{dots(i)}
<div class="blob" style="width:600px;height:600px;right:-200px;bottom:-200px"></div>
<div style="position:absolute;left:150px;top:130px;width:780px;background:#fff;padding:26px 26px 90px;border-radius:12px;transform:rotate({tilt}deg);box-shadow:0 24px 60px rgba(60,20,30,.2)">
<div style="height:620px;overflow:hidden;border-radius:6px"><img src="{photo}" style="width:100%;height:100%;object-fit:cover;object-position:{pos};display:block"></div>
<div style="position:absolute;left:0;right:0;bottom:22px;text-align:center;font-family:'Playfair Display',serif;font-style:italic;font-size:44px;color:var(--rose)">{label}</div></div>
<div style="position:absolute;left:84px;right:84px;top:930px"><h1 style="font-size:78px">{title_html}</h1><p style="font-size:40px;margin-top:20px">{text}</p></div>
<img class="logo" src="{LOGO}" style="left:auto;right:84px;transform:none;bottom:44px;width:150px"></section>"""


def d_final(photo, pos='50% 25%'):
    return final(photo, pos)


def IA(nome):
    return (BASE / f'ia/{nome}-1.jpg').as_uri()


def F(n):
    return (BASE / f'fotos/{n}.jpg').as_uri()


CARROSSEIS = {
    # Layout A (arcos, rosé): benefícios
    '03-beneficios-laser': [
        cover(IA('laser-aparelho'), 'Laser Lavieén', 'O que o Laser Lavieén faz pela <em>sua pele</em>', 'Entenda como funciona e para quem é indicado.'),
        split(1, IA('sol-protetor'), '01', 'Manchas de sol no <em>rosto</em>', 'Trata a melanose solar, as manchas causadas pelo sol.', 'right'),
        full(2, IA('maos-profissional'), '02', 'Sessão <em>relativamente rápida</em>', 'Pode incomodar um pouquinho, mas é um procedimento prático.'),
        split(3, IA('agenda-sessoes'), '03', 'De 3 a 6 <em>sessões</em>', 'Em média, dependendo de cada caso. Na avaliação a especialista indica o seu plano.', 'left', '40% 30%'),
        final(IA('cabine')),
    ],
    # Layout B (foto cheia escura, pergunta e resposta): estrias
    '05-estrias': [
        b_cover(IA('pernas-maca'), 'Lavieén nas estrias', f'Estria tem <em style="color:{PINK}">tratamento?</em>', 'O que esperar do Lavieén.'),
        b_slide(1, IA('maos-profissional'), 'VERDADE', f'Estria é uma <em style="color:{PINK}">cicatriz</em>', 'E o tratamento é feito aos poucos, sessão por sessão.', '55% 30%'),
        b_slide(2, IA('tatuagem-antebraco'), 'DÚVIDA COMUM', f'Dá para tratar <em style="color:{PINK}">sobre tatuagem?</em>', 'Dá. E serve para qualquer tipo de estria.', '50% 25%'),
        b_slide(3, IA('maos-creme'), 'NA PRÁTICA', f'De 3 a 6 <em style="color:{PINK}">sessões</em>', 'Em média. Muita gente já vê diferença depois da primeira. No pós, hidrate bastante.', '40% 25%'),
        b_final(IA('bancada')),
    ],
    # Layout C (cartões de dicas, rosado): pós-Lavieén
    '08-pos-lavieen': [
        c_cover(IA('hidratante-filtro'), 'Pós-Lavieén', 'O que fazer e o que <em>evitar</em>', 'Os cuidados nos primeiros dias.'),
        c_tip(1, IA('maos-creme'), '<em>Hidrate</em> bem a região', 'Principalmente no primeiro dia depois da sessão.', '30% 40%'),
        c_tip(2, IA('maquiagem'), 'Evite produto <em>com cor</em>', 'Maquiagem e filtro solar com cor, nos primeiros dias.'),
        c_tip(3, IA('mao-protetor'), 'Use filtro solar <em>sem cor</em>', 'É o cuidado que mantém a pele protegida.', '50% 30%'),
        c_final(IA('cabine')),
    ],
    # Layout D (mosaico e polaroid): mãos e pernas
    '11-maos-e-pernas': [
        d_cover((IA('maos'), IA('tatuagem-antebraco'), IA('pernas-maca')), 'Lavieén', 'Vai além do rosto: <em>mãos e pernas</em>', 'Veja o que dá para tratar.'),
        d_slide(1, IA('maos-creme'), 'Nas mãos', 'Colágeno e <em>renovação</em>', 'Estímulo de colágeno e renovação da pele das mãos.', -3, '55% 30%'),
        d_slide(2, IA('tatuagem-antebraco'), 'Sobre tatuagem', 'Dá para tratar <em>até sobre tatuagem</em>', 'A gente trata a região com calma.', 3, '40% 45%'),
        d_slide(3, IA('pernas-maca'), 'Nas pernas', 'Região <em>por região</em>', 'Cada caso é um caso.', -2, '50% 30%'),
        d_final(IA('bancada')),
    ],
}


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for nome, slides in CARROSSEIS.items():
            out = BASE / 'carrosseis' / nome
            out.mkdir(parents=True, exist_ok=True)
            html = f"<!doctype html><meta charset=utf-8><style>{CSS}</style>" + ''.join(slides)
            (out / 'slides.html').write_text(html, encoding='utf-8')
            pg = await b.new_page(viewport={'width': 1080, 'height': 1350})
            await pg.goto((out / 'slides.html').as_uri())
            await pg.wait_for_timeout(1500)
            for k, el in enumerate(await pg.query_selector_all('.slide'), 1):
                await el.screenshot(path=str(out / f'slide-{k}.jpg'), type='jpeg', quality=90)
        await b.close()


asyncio.run(main())
