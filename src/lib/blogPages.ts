/**
 * Páginas dedicadas por post do blog, ex.: https://centraldaestetica.com.br/blog/beneficios-laser-lavieen/
 * O HTML estático dessas páginas é gerado no build a partir do Supabase (ver scripts/treatmentPagesPlugin.ts).
 */
import type { BlogPost } from '../types';
import { SITE_URL } from './treatmentPages';

type BlogRef = Pick<BlogPost, 'id' | 'slug'>;

export const BLOG_BASE_PATH = '/blog/';

const slugOf = (post: BlogRef) => (post.slug || post.id).toLowerCase();

/** Caminho público do post, ex.: "/blog/beneficios-laser-lavieen/" */
export function getBlogPostPath(post: BlogRef): string {
  return `${BLOG_BASE_PATH}${slugOf(post)}/`;
}

export function getBlogPostUrl(post: BlogRef): string {
  return `${SITE_URL}${getBlogPostPath(post)}`;
}

export function isBlogPostPath(pathname: string): boolean {
  return /^\/blog\/[^/]+\/?$/i.test(pathname);
}

export function findBlogPostByPath<T extends BlogRef>(pathname: string, posts: T[]): T | null {
  const match = pathname.match(/^\/blog\/([^/]+)\/?$/i);
  if (!match) return null;
  const slug = decodeURIComponent(match[1]).toLowerCase();
  return posts.find((p) => slugOf(p) === slug) || null;
}

/** Blocos do artigo: parágrafos, títulos "### ", listas "- ", numeradas e destaques "> " */
export type BlogBlock =
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'callout'; text: string }
  | { type: 'p'; text: string };

/** Parágrafos longos viram blocos de até ~2 frases, para leitura mais leve */
function splitLongParagraph(text: string, max = 300): string[] {
  if (text.length <= max) return [text];
  const sentences = text.match(/[^.!?]+[.!?]+(?:["”)]+)?\s*|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if (current && (current + sentence).length > max) {
      chunks.push(current.trim());
      current = '';
    }
    current += sentence;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export function parseBlogContent(content: string): BlogBlock[] {
  return content
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .flatMap((p): BlogBlock[] => {
      const lines = p.split('\n');
      if (p.startsWith('### ')) return [{ type: 'h3', text: p.slice(4) }];
      if (p.startsWith('> ')) return [{ type: 'callout', text: lines.map((l) => l.replace(/^>\s?/, '')).join(' ') }];
      if (p.startsWith('- ')) return [{ type: 'ul', items: lines.map((i) => i.replace(/^-\s*/, '')) }];
      if (/^\d+\.\s/.test(p)) return [{ type: 'ol', items: lines.map((i) => i.replace(/^\d+\.\s*/, '')) }];
      return splitLongParagraph(lines.join(' ')).map((text): BlogBlock => ({ type: 'p', text }));
    });
}

/** Trechos do texto, separando o que está entre **asteriscos duplos** (destaque em negrito) */
export function parseInline(text: string): { text: string; bold: boolean }[] {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) => ({ text: part, bold: i % 2 === 1 }))
    .filter((part) => part.text);
}
