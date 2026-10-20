#!/usr/bin/env node
/**
 * Publicação automática no Instagram (@centraldaesteticasp)
 * via "Instagram API with Instagram Login" (graph.instagram.com).
 *
 * Variáveis de ambiente (nunca commitar o token):
 *   INSTAGRAM_ACCESS_TOKEN  token IGAA... gerado em developers.facebook.com
 *                           → app 1315858633192552 → Instagram → API Setup
 *   INSTAGRAM_USER_ID       opcional; descoberto via /me se ausente
 *   INSTAGRAM_API_VERSION   opcional; padrão v23.0
 *
 * Uso:
 *   node scripts/instagram/publish.mjs check
 *   node scripts/instagram/publish.mjs post --caption "Legenda" img1.jpg [img2.jpg ...]
 *   node scripts/instagram/publish.mjs post --caption "Legenda" --dry-run https://site/foto.jpg
 *   node scripts/instagram/publish.mjs refresh   (renova o token de 60 dias)
 *
 * Imagens: URL pública (https://...) ou arquivo local JPEG. Arquivos locais
 * são enviados ao catbox.moe para gerar uma URL pública, pois a API do
 * Instagram só aceita imagens por URL. 1 imagem = post simples; 2–10 = carrossel.
 */
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

try {
  process.loadEnvFile();
} catch {
  // sem .env local: usa apenas as variáveis de ambiente
}

const VERSION = process.env.INSTAGRAM_API_VERSION || 'v23.0';
const BASE = `https://graph.instagram.com/${VERSION}`;
const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

function fail(msg) {
  console.error(`ERRO: ${msg}`);
  process.exit(1);
}

async function api(method, path, params = {}) {
  const url = new URL(path.startsWith('http') ? path : `${BASE}${path}`);
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  let res;
  if (method === 'GET') {
    body.forEach((v, k) => url.searchParams.set(k, v));
    res = await fetch(url);
  } else {
    res = await fetch(url, { method, body });
  }
  const data = await res.json();
  if (data.error) {
    throw new Error(`${data.error.type || 'Erro'} #${data.error.code}: ${data.error.message}`);
  }
  return data;
}

async function getUser() {
  return api('GET', '/me', { fields: 'user_id,username,name,account_type' });
}

async function toPublicUrl(src) {
  if (/^https:\/\//.test(src)) return src;
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', new Blob([await readFile(src)]), basename(src));
  const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
  const url = (await res.text()).trim();
  if (!url.startsWith('https://')) throw new Error(`Falha ao hospedar ${src}: ${url}`);
  console.log(`  hospedada: ${url}`);
  return url;
}

async function waitReady(containerId) {
  for (let i = 0; i < 24; i++) {
    const { status_code } = await api('GET', `/${containerId}`, { fields: 'status_code' });
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR' || status_code === 'EXPIRED') {
      throw new Error(`Container ${containerId} com status ${status_code}`);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error(`Timeout aguardando o container ${containerId}`);
}

async function post(images, caption, dryRun) {
  if (images.length < 1 || images.length > 10) fail('Informe de 1 a 10 imagens.');
  for (const img of images) {
    if (/^https:\/\//.test(img)) continue;
    if (!/\.jpe?g$/i.test(img)) fail(`${img}: o Instagram só aceita imagens JPEG (.jpg).`);
    if (!existsSync(img)) fail(`${img}: arquivo não encontrado.`);
  }
  const me = await getUser();
  const igId = process.env.INSTAGRAM_USER_ID || me.user_id;
  console.log(`Conta: @${me.username} (${igId}) — ${images.length} imagem(ns)`);
  if (dryRun) {
    console.log('[dry-run] Token e conta OK. Nada foi publicado.');
    return;
  }

  const urls = [];
  for (const img of images) urls.push(await toPublicUrl(img));

  let creationId;
  if (urls.length === 1) {
    ({ id: creationId } = await api('POST', `/${igId}/media`, { image_url: urls[0], caption }));
  } else {
    const children = [];
    for (const image_url of urls) {
      const { id } = await api('POST', `/${igId}/media`, { image_url, is_carousel_item: 'true' });
      await waitReady(id);
      children.push(id);
    }
    ({ id: creationId } = await api('POST', `/${igId}/media`, {
      media_type: 'CAROUSEL',
      children: children.join(','),
      caption,
    }));
  }
  await waitReady(creationId);
  const { id: mediaId } = await api('POST', `/${igId}/media_publish`, { creation_id: creationId });
  const { permalink } = await api('GET', `/${mediaId}`, { fields: 'permalink' });
  console.log(`Publicado! ${permalink}`);
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!TOKEN) fail('INSTAGRAM_ACCESS_TOKEN não definido.');

  if (cmd === 'check') {
    const me = await getUser();
    console.log(`Conectado: @${me.username} | ${me.name || ''} | tipo ${me.account_type} | id ${me.user_id}`);
    return;
  }
  if (cmd === 'refresh') {
    const d = await api('GET', 'https://graph.instagram.com/refresh_access_token', {
      grant_type: 'ig_refresh_token',
    });
    console.log(`Novo token válido por ${Math.round(d.expires_in / 86400)} dias. Atualize INSTAGRAM_ACCESS_TOKEN:`);
    console.log(d.access_token);
    return;
  }
  if (cmd === 'post') {
    let caption = '';
    let dryRun = false;
    const images = [];
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === '--caption') caption = rest[++i] ?? '';
      else if (rest[i] === '--dry-run') dryRun = true;
      else images.push(rest[i]);
    }
    await post(images, caption, dryRun);
    return;
  }
  fail('Comando desconhecido. Use: check | post | refresh');
}

main().catch((e) => fail(e.message));
