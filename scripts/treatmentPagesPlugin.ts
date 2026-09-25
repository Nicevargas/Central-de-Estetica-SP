/**
 * Plugin do Vite que, ao final do build, gera:
 *  - dist/<slug>/index.html  → uma página estática por tratamento (conteúdo legível pelo Google sem JavaScript)
 *  - dist/sitemap.xml        → sitemap com a home e todas as páginas de tratamento
 *
 * O React carrega normalmente em cada página e abre o tratamento correspondente.
 */
import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';
import { TREATMENTS, DEFAULT_CONTACT_INFO, OPENING_HOURS, GOOGLE_MAPS_URL } from '../src/data';
import { SITE_URL, TREATMENT_PAGES, getTreatmentUrl } from '../src/lib/treatmentPages';
import type { Treatment } from '../src/types';

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

function renderBody(t: Treatment): string {
  const page = TREATMENT_PAGES[t.id];
  const contact = DEFAULT_CONTACT_INFO;
  const whatsapp = `https://wa.me/${contact.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Olá! Gostaria de agendar uma avaliação para ${t.name}.`,
  )}`;
  const others = TREATMENTS.filter((o) => o.id !== t.id && TREATMENT_PAGES[o.id])
    .map((o) => `<li><a href="/${TREATMENT_PAGES[o.id].slug}/">${escapeHtml(TREATMENT_PAGES[o.id].heading)}</a></li>`)
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

function renderPage(template: string, t: Treatment): string {
  const page = TREATMENT_PAGES[t.id];
  const url = getTreatmentUrl(t.id);
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
  html = html.replace('<div id="root"></div>', `<div id="root">${renderBody(t)}</div>`);
  return html;
}

function renderSitemap(): string {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
    ...TREATMENTS.filter((t) => TREATMENT_PAGES[t.id]).map((t) => ({
      loc: getTreatmentUrl(t.id),
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

export function treatmentPagesPlugin(): Plugin {
  let outDir = 'dist';
  return {
    name: 'central-treatment-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const template = fs.readFileSync(path.join(outDir, 'index.html'), 'utf-8');
      let count = 0;
      for (const t of TREATMENTS) {
        if (!TREATMENT_PAGES[t.id]) continue;
        const dir = path.join(outDir, TREATMENT_PAGES[t.id].slug);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), renderPage(template, t));
        count++;
      }
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), renderSitemap());
      this.info?.(`${count} páginas de tratamento geradas + sitemap.xml`);
    },
  };
}
