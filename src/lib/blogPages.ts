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

/** Quebra o texto do post em blocos (parágrafos, títulos "### ", listas "- " e numeradas) */
export type BlogBlock =
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'p'; text: string };

export function parseBlogContent(content: string): BlogBlock[] {
  return content
    .split(/\n\n+/)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((p): BlogBlock => {
      if (p.startsWith('### ')) return { type: 'h3', text: p.slice(4) };
      if (p.startsWith('- ')) return { type: 'ul', items: p.split('\n').map((i) => i.replace(/^- /, '')) };
      if (/^\d+\.\s/.test(p)) return { type: 'ol', items: p.split('\n').map((i) => i.replace(/^\d+\.\s*/, '')) };
      return { type: 'p', text: p };
    });
}
