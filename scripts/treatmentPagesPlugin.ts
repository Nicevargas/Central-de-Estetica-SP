/**
 * Plugin do Vite que, ao final do build, lê os tratamentos e o contato do Supabase e gera:
 *  - dist/<slug>/index.html  → uma página estática por tratamento (conteúdo legível pelo Google sem JavaScript)
 *  - dist/sitemap.xml        → sitemap com a home e todas as páginas de tratamento
 *
 * Os dados são os mesmos exibidos no site. O React carrega normalmente em cada página e abre o tratamento
 * correspondente. Alterações feitas no painel admin entram nas páginas estáticas no próximo deploy.
 */
import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';
import { DEFAULT_CONTACT_INFO, OPENING_HOURS, GOOGLE_MAPS_URL } from '../src/data';
import { SITE_URL, getTreatmentSeo, getTreatmentPath, getTreatmentUrl } from '../src/lib/treatmentPages';
import { mapTreatmentRow, mapContactInfoRow } from '../src/lib/supabaseMappers';
import type { ContactInfo, Treatment } from '../src/types';

interface SupabaseEnv {
  url?: string;
  anonKey?: string;
}

async function fetchRows(env: Required<SupabaseEnv>, query: string): Promise<any[]> {
  const res = await fetch(`${env.url.replace(/\/+$/, '')}/rest/v1/${query}`, {
    headers: { apikey: env.anonKey, Authorization: `Bearer ${env.anonKey}` },
  });
  if (!res.ok) throw new Error(`Supabase respondeu ${res.status} para ${query}: ${await res.text()}`);
  return res.json();
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Evita que "</script>" dentro do JSON feche a tag antes da hora
const jsonLd = (data: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

function setMeta(html: string, attr: 'name' | 'property', key: string, content: string): string {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
  return html.replace(re, `$1${escapeHtml(content)}$2`);
}

function renderSpecs(t: Treatment): string {
  const specs = t.technicalSpecs;
  if (!specs) return '';
  const rows: [string, string | undefined][] = [
    ['Duração da sessão', specs.duration],
    ['Número de sessões', specs.sessionsRequired],
    ['Indicado para', specs.indicatedFor],
    ['Conforto e anestesia', specs.anesthesia],
    ['Recuperação', specs.recovery],
    ['Resultados', specs.resultsIn],
  ];
  const items = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v!)}</dd>`)
    .join('');
  return items ? `<h2>Como funciona</h2><dl>${items}</dl>` : '';
}

function renderList(title: string, items?: string[]): string {
  if (!items?.length) return '';
  return `<h2>${escapeHtml(title)}</h2><ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
}

function renderBody(t: Treatment, all: Treatment[], contact: ContactInfo): string {
  const page = getTreatmentSeo(t);
  const whatsapp = `https://wa.me/${contact.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Olá! Gostaria de agendar uma avaliação para ${t.name}.`,
  )}`;
  const others = all
    .filter((o) => o.id !== t.id)
    .map((o) => `<li><a href="${getTreatmentPath(o)}">${escapeHtml(o.name)}</a></li>`)
    .join('');

  return `<main style="max-width:760px;margin:0 auto;padding:24px 16px;font-family:system-ui,sans-serif;line-height:1.6;color:#1c1b1f">
<nav aria-label="Breadcrumb"><a href="/">Início</a> › ${escapeHtml(t.name)}</nav>
<article>
<h1>${escapeHtml(page.heading)}</h1>
<p>${escapeHtml(t.description)}</p>
${t.price ? `<p><strong>Investimento:</strong> ${escapeHtml(t.price)}</p>` : ''}
${t.duration ? `<p><strong>Duração:</strong> ${escapeHtml(t.duration)}</p>` : ''}
${renderList('Benefícios', t.benefits)}
${renderSpecs(t)}
${renderList('Cuidados após o procedimento', t.postCareTips)}
<h2>Agende sua avaliação no Jardim Paulista</h2>
<p>Central da Estética — ${escapeHtml(contact.addressLine1)}, ${escapeHtml(contact.addressLine2)}, CEP ${escapeHtml(contact.cep)}.<br>
Telefone: ${escapeHtml(contact.phonePrimary)}. Horários: ${escapeHtml(OPENING_HOURS.join(' · '))}.</p>
<p><a href="${escapeHtml(whatsapp)}">Agendar pelo WhatsApp</a> · <a href="${escapeHtml(GOOGLE_MAPS_URL)}">Como chegar (Google Maps)</a></p>
</article>
<h2>Outros tratamentos em São Paulo</h2>
<ul>${others}</ul>
</main>`;
}

function renderPage(template: string, t: Treatment, all: Treatment[], contact: ContactInfo): string {
  const page = getTreatmentSeo(t);
  const url = getTreatmentUrl(t);
  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = setMeta(html, 'name', 'title', page.title);
  html = setMeta(html, 'name', 'description', page.description);
  html = setMeta(html, 'property', 'og:type', 'article');
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:title', page.title);
  html = setMeta(html, 'property', 'og:description', page.description);
  html = setMeta(html, 'name', 'twitter:url', url);
  html = setMeta(html, 'name', 'twitter:title', page.title);
  html = setMeta(html, 'name', 'twitter:description', page.description);
  if (t.image?.startsWith('http')) {
    html = setMeta(html, 'property', 'og:image', t.image);
    html = setMeta(html, 'name', 'twitter:image', t.image);
  }
  html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`);

  const structuredData = jsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: t.name,
        serviceType: page.heading,
        description: t.description,
        url,
        image: t.image?.startsWith('http') ? t.image : undefined,
        areaServed: { '@type': 'City', name: 'São Paulo' },
        provider: { '@id': `${SITE_URL}/#clinic` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: t.name, item: url },
        ],
      },
    ],
  });

  html = html.replace('</head>', `    ${structuredData}\n  </head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${renderBody(t, all, contact)}</div>`);
  return html;
}

function renderSitemap(treatments: Treatment[]): string {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
    ...treatments.map((t) => ({
      loc: getTreatmentUrl(t),
      priority: '0.9',
      changefreq: 'monthly',
    })),
  ];
  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function treatmentPagesPlugin(env: SupabaseEnv): Plugin {
  let outDir = 'dist';
  return {
    name: 'central-treatment-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      let treatments: Treatment[] = [];
      let contact: ContactInfo = DEFAULT_CONTACT_INFO;

      if (env.url && env.anonKey) {
        // Se o banco falhar, o build falha: melhor manter o deploy anterior no ar do que publicar sem as páginas
        const creds = { url: env.url, anonKey: env.anonKey };
        treatments = (await fetchRows(creds, 'treatments?select=*&order=name')).map(mapTreatmentRow);
        const settings = await fetchRows(creds, 'site_settings?select=*&id=eq.default').catch(() => []);
        if (settings[0]) contact = { ...DEFAULT_CONTACT_INFO, ...mapContactInfoRow(settings[0]) };
      } else {
        this.warn('VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY ausentes: páginas de tratamento não foram geradas.');
      }

      // Dois tratamentos com o mesmo endereço: só o primeiro ganha página
      const seen = new Set<string>();
      const withPages = treatments.filter((t) => {
        const slug = getTreatmentSeo(t).slug;
        if (seen.has(slug)) return false;
        seen.add(slug);
        return true;
      });

      const template = fs.readFileSync(path.join(outDir, 'index.html'), 'utf-8');
      for (const t of withPages) {
        const dir = path.join(outDir, getTreatmentSeo(t).slug);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), renderPage(template, t, withPages, contact));
      }
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), renderSitemap(withPages));
      this.info?.(`${withPages.length} páginas de tratamento geradas a partir do Supabase + sitemap.xml`);
    },
  };
}
