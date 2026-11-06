"""Gera imagens de ambiente com fal.ai (FLUX) a partir de prompts.

Uso:
  python gerar_fal.py <nome> "<prompt>" [--n 2]
  python gerar_fal.py --lote            # gera todos os prompts de LOTE abaixo

A chave vem da variável de ambiente FAL_KEY (nunca fica no código).
Saída: ia/<nome>-<n>.jpg em 1080x1350 (4:5).
"""
import argparse
import json
import os
import pathlib
import sys
import urllib.request

BASE = pathlib.Path(__file__).parent.resolve()
OUT = BASE / 'ia'
MODEL = 'fal-ai/flux/dev'  # ~US$0,025 por megapixel (cerca de US$0,03 por imagem aqui)

ESTILO = ("Premium aesthetic clinic photography, soft natural window light, warm cream, blush pink and beige palette, "
          "shallow depth of field, clean minimalist composition, high-end editorial look, realistic, "
          "no text, no logos, no watermark, no people's faces.")

LOTE = {
    'cabine': "Minimalist treatment room of a modern aesthetic clinic, white bed with a folded cream towel, soft warm lights, small green plant, laser device in the background out of focus, calm and clean atmosphere.",
    'bancada': "Marble counter with skincare products in neutral unbranded bottles, folded white towels, a small vase with white flowers, soft morning light, spa-like atmosphere.",
    'hidratante-filtro': "Flat lay of a moisturizer jar and a sunscreen tube with plain unbranded packaging on a cream linen cloth with a dried flower, soft shadows, top view, empty space at the top for text.",
    'maos': "Close-up of a woman's hands resting on a cream linen towel, natural nails, soft light, realistic skin, minimal background.",
    'laser-aparelho': "Modern laser device in a bright clinic room, white and silver design with no brand or text, soft reflections, clean and warm look, shallow depth of field, a folded towel nearby.",
    'sol-protetor': "Bright airy flat lay with sunscreen tube, straw hat and sunglasses on a sand-colored background, soft shadows, top view, empty space for text.",
    'maos-profissional': "Gloved hands of an aesthetic professional holding a treatment handpiece above a towel-covered surface, close-up, no face, soft clinical lighting, neutral tones.",
    'agenda-sessoes': "Flat lay of an open planner with a pen and a small white flower on a cream linen cloth, soft natural light, minimal, empty pages, no readable text.",
    'pernas-maca': "Woman's legs relaxing on a white treatment bed covered with a cream towel, side view cropped at the waist, face not visible, spa atmosphere, neutral colors.",
    'tatuagem-antebraco': "Close-up of a forearm with a small delicate fine-line tattoo, natural skin, soft side light, neutral cream background, face not visible.",
    'maos-creme': "Close-up of hands gently applying moisturizing cream, warm light, cream and blush tones, calm and caring mood, no face.",
    'maquiagem': "Flat lay of makeup products, foundation bottle and a brush on a marble surface, soft shadows, unbranded, top view, pastel tones.",
    'mao-protetor': "Close-up of a hand applying a white sunscreen dollop on the back of the other hand, soft natural light, realistic skin, neutral background, no face.",
    'fundo-suave': "Abstract soft background with blush pink and cream gradient, subtle organic curved shapes, paper texture, large empty area for text, no objects.",
}


def chave():
    k = os.environ.get('FAL_KEY')
    if not k and sys.platform == 'win32':
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, 'Environment') as r:
            k = winreg.QueryValueEx(r, 'FAL_KEY')[0]
    if not k:
        sys.exit('FAL_KEY não definida. Rode: setx FAL_KEY sua-chave')
    return k


def post(url, payload, key):
    req = urllib.request.Request(url, data=json.dumps(payload).encode(),
                                 headers={'Authorization': f'Key {key}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.load(r)


def gerar(nome, prompt, n=1):
    from PIL import Image
    import io
    key = chave()
    OUT.mkdir(exist_ok=True)
    res = post(f'https://fal.run/{MODEL}',
               {'prompt': f'{prompt} {ESTILO}', 'image_size': {'width': 1024, 'height': 1280},
                'num_images': n, 'enable_safety_checker': True}, key)
    for i, img in enumerate(res['images'], 1):
        data = urllib.request.urlopen(img['url'], timeout=120).read()
        im = Image.open(io.BytesIO(data)).convert('RGB').resize((1080, 1350))
        dest = OUT / f'{nome}-{i}.jpg'
        im.save(dest, quality=90)
        print('ok', dest)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('nome', nargs='?')
    ap.add_argument('prompt', nargs='?')
    ap.add_argument('--n', type=int, default=1)
    ap.add_argument('--lote', action='store_true')
    a = ap.parse_args()
    if a.lote:
        for nome, p in LOTE.items():
            if (OUT / f'{nome}-1.jpg').exists():
                continue  # nao gasta de novo com o que ja existe
            gerar(nome, p, a.n)
    elif a.nome and a.prompt:
        gerar(a.nome, a.prompt, a.n)
    else:
        ap.print_help()
