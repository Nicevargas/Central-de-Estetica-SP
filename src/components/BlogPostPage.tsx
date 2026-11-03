import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Info,
  Link2,
  List,
  MessageCircle,
  Share2,
  Sparkles,
  Tag,
  User,
} from 'lucide-react';
import { BlogPost } from '../types';
import { getBlogPostUrl, parseBlogContent, parseInline } from '../lib/blogPages';
import { LAVIEEN_BLOG_SLUG, LAVIEEN_VIDEOS } from '../lib/lavieenVideos';

interface BlogPostPageProps {
  post: BlogPost;
  posts: BlogPost[];
  onClose: () => void;
  onBookClick: () => void;
  onSelectPost: (post: BlogPost) => void;
  whatsappNumber?: string;
}

const Inline: React.FC<{ text: string }> = ({ text }) => (
  <>
    {parseInline(text).map((part, i) =>
      part.bold ? (
        <strong key={i} className="font-bold text-stone-900 dark:text-stone-50 bg-rose-100/70 dark:bg-rose-900/30 px-0.5 rounded box-decoration-clone">
          {part.text}
        </strong>
      ) : (
        <React.Fragment key={i}>{part.text}</React.Fragment>
      ),
    )}
  </>
);

const anchorId = (text: string) =>
  'secao-' +
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

export const BlogPostPage: React.FC<BlogPostPageProps> = ({
  post,
  posts,
  onClose,
  onBookClick,
  onSelectPost,
  whatsappNumber = '5511985254584',
}) => {
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const blocks = useMemo(() => parseBlogContent(post.content), [post.content]);
  const headings = useMemo(
    () => blocks.filter((b): b is { type: 'h3'; text: string } => b.type === 'h3'),
    [blocks],
  );
  const related = useMemo(() => {
    const others = posts.filter((p) => p.id !== post.id);
    const sameCategory = others.filter((p) => p.category === post.category);
    return [...sameCategory, ...others.filter((p) => p.category !== post.category)].slice(0, 3);
  }, [posts, post]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [post.id]);

  const shareUrl = getBlogPostUrl(post);
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}`;
  const whatsappContactUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Olá! Li o artigo "${post.title}" e gostaria de agendar uma avaliação.`,
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard indisponível */
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url: shareUrl });
      } catch {
        /* compartilhamento cancelado */
      }
      return;
    }
    handleCopy();
  };

  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 z-50 bg-stone-100 dark:bg-stone-950 overflow-y-auto min-h-screen flex flex-col font-sans text-stone-800 dark:text-stone-100 animate-fade-in"
    >
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-stone-800 dark:text-stone-200 hover:text-rose-600 dark:hover:text-rose-400 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer group border border-stone-200 dark:border-stone-700"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform text-rose-600" />
          <span>Voltar para o Blog</span>
        </button>

        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
          <span className="text-rose-600 font-bold">Blog Central da Estética</span>
          <span>•</span>
          <span className="truncate max-w-xs">{post.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl transition-all cursor-pointer border border-stone-200 dark:border-stone-700"
            title="Compartilhar artigo"
          >
            <Share2 className="h-4 w-4 text-rose-600" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
          <button
            onClick={onBookClick}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Agendar Agora</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8">
        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="relative h-72 sm:h-96 md:h-[440px] w-full overflow-hidden bg-stone-950">
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-85"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/55 to-stone-950/10" />

            <div className="absolute top-5 left-5 right-5 z-10 flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider bg-rose-600 text-white rounded-full shadow-lg flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                {post.category}
              </span>
              {post.featured && (
                <span className="px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider bg-amber-400 text-stone-950 rounded-full shadow-lg flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 fill-current" />
                  Artigo em Destaque
                </span>
              )}
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10 text-white space-y-4">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-md max-w-4xl">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold">
                <span className="px-3.5 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-rose-400" />
                  {post.author}
                </span>
                <span className="px-3.5 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-rose-400" />
                  {post.date}
                </span>
                <span className="px-3.5 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-rose-400" />
                  {post.readTime}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-stone-100 dark:bg-stone-800/90 px-6 py-3 border-t border-stone-200 dark:border-stone-700/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300 font-bold">
              <Share2 className="h-4 w-4 text-rose-600" />
              <span>Compartilhar este artigo:</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#25D366] text-white hover:bg-[#20ba59] rounded-xl transition-all shadow-sm text-xs font-bold"
              >
                WhatsApp
              </a>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-600 rounded-xl border border-stone-200 dark:border-stone-600 transition-all shadow-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Link2 className="h-3.5 w-3.5" />}
                {copied ? 'Link copiado' : 'Copiar link'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
          {/* Artigo */}
          <article className="space-y-8 min-w-0">
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200 dark:border-stone-800 shadow-xl space-y-5">
              <p className="text-base sm:text-lg font-medium text-stone-900 dark:text-stone-100 border-l-4 border-rose-500 pl-4 py-2 bg-rose-50/60 dark:bg-rose-950/20 rounded-r-xl">
                {post.excerpt}
              </p>

              {blocks.map((block, i) => {
                if (block.type === 'h3') {
                  return (
                    <h2
                      key={i}
                      id={anchorId(block.text)}
                      className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 pt-6 scroll-mt-24 flex items-start gap-3"
                    >
                      <span className="mt-2 h-6 w-1.5 rounded-full bg-rose-600 shrink-0" />
                      <span>{block.text}</span>
                    </h2>
                  );
                }
                if (block.type === 'ul') {
                  return (
                    <ul key={i} className="space-y-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-5 border border-stone-200/70 dark:border-stone-700/60">
                      {block.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm sm:text-base text-stone-700 dark:text-stone-300">
                          <Check className="h-4 w-4 text-rose-600 mt-1 shrink-0" />
                          <span><Inline text={item} /></span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (block.type === 'ol') {
                  return (
                    <ol key={i} className="space-y-2.5">
                      {block.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm sm:text-base text-stone-700 dark:text-stone-300">
                          <span className="h-6 w-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {j + 1}
                          </span>
                          <span><Inline text={item} /></span>
                        </li>
                      ))}
                    </ol>
                  );
                }
                if (block.type === 'callout') {
                  return (
                    <div key={i} className="flex items-start gap-3 rounded-2xl p-5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
                      <Info className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                      <p className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 leading-relaxed">
                        <Inline text={block.text} />
                      </p>
                    </div>
                  );
                }
                return (
                  <p key={i} className="text-base sm:text-[17px] leading-8 text-stone-700 dark:text-stone-300">
                    <Inline text={block.text} />
                  </p>
                );
              })}
            </div>

            {post.slug === LAVIEEN_BLOG_SLUG && (
              <section className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6">
                <div className="border-b border-stone-100 dark:border-stone-800 pb-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200/50 block w-max mb-2">
                    Demonstração em Vídeo
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                    Veja o procedimento na Central da Estética
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">Vídeos do Lavieén realizado na clínica, em diferentes regiões do corpo.</p>
                </div>
                <div className="space-y-6">
                  {LAVIEEN_VIDEOS.map((v) => (
                    <figure key={v.src} className="space-y-2">
                      <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-800 bg-black">
                        <video src={v.src} poster={v.poster} controls preload="none" playsInline className="w-full h-full object-contain">
                          Seu navegador não suporta a tag de vídeo.
                        </video>
                      </div>
                      <figcaption>
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block">{v.title}</span>
                        <span className="text-xs text-stone-500 block">{v.description}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold">Gostou deste artigo?</h3>
                <p className="text-sm text-rose-50/90 mt-1">Agende uma avaliação e tire suas dúvidas de forma individualizada.</p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <button
                  onClick={onBookClick}
                  className="bg-white text-rose-700 hover:bg-rose-50 text-sm font-bold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Agendar Avaliação</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href={whatsappContactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-bold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </article>

          {/* Lateral */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            {headings.length > 1 && (
              <nav className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-lg">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-2 mb-3">
                  <List className="h-4 w-4" />
                  Neste artigo
                </h3>
                <ul className="space-y-1.5 max-h-72 overflow-y-auto">
                  {headings.map((h) => (
                    <li key={h.text}>
                      <a
                        href={`#${anchorId(h.text)}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollRef.current
                            ?.querySelector(`#${anchorId(h.text)}`)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="block text-xs text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 py-1 leading-snug"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-lg space-y-3">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Agende sua avaliação</h3>
              <p className="text-xs text-stone-500">Atendimento no Jardim Paulista, São Paulo.</p>
              <button
                onClick={onBookClick}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold px-4 py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Agendar Agora
              </button>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">Continue lendo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPost(p)}
                  className="group text-left bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-md hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="h-36 overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-4 space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600">{p.category}</span>
                    <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">{p.title}</h3>
                    <span className="text-xs text-stone-500 block">{p.readTime}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
