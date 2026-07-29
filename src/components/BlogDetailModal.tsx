import React from 'react';
import { X, Calendar, Clock, User, Tag, Share2, ArrowRight } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogDetailModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onBookClick?: () => void;
}

export const BlogDetailModal: React.FC<BlogDetailModalProps> = ({ post, onClose, onBookClick }) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className="relative bg-white dark:bg-stone-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-stone-800 my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image & Close button */}
        <div className="relative h-64 sm:h-80 w-full shrink-0">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 backdrop-blur-md"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Category Badge & Meta */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <span className="inline-block px-3 py-1 bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md">
              {post.category}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-white drop-shadow-md">
              {post.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-700 dark:text-stone-300">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="h-4 w-4 text-rose-500" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-rose-500" />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-rose-500" />
                {post.readTime}
              </span>
            </div>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.title, text: post.excerpt, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link do artigo copiado para a área de transferência!');
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Compartilhar</span>
            </button>
          </div>

          {/* Excerpt Lead Paragraph */}
          <p className="text-base sm:text-lg font-medium text-stone-900 dark:text-stone-100 italic border-l-4 border-rose-500 pl-4 py-1 bg-rose-50/50 dark:bg-rose-950/20 rounded-r-lg">
            "{post.excerpt}"
          </p>

          {/* Rendered Article Markdown/Formatted Body */}
          <div className="prose prose-stone dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 leading-relaxed text-sm sm:text-base space-y-4">
            {post.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 pt-3">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <ul key={index} className="list-disc pl-5 space-y-1">
                    {paragraph.split('\n').map((item, i) => (
                      <li key={i}>{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.match(/^\d+\./)) {
                return (
                  <ol key={index} className="list-decimal pl-5 space-y-1">
                    {paragraph.split('\n').map((item, i) => (
                      <li key={i}>{item.replace(/^\d+\.\s*/, '')}</li>
                    ))}
                  </ol>
                );
              }
              return <p key={index}>{paragraph}</p>;
            })}
          </div>

          {/* Bottom Call to Action */}
          {onBookClick && (
            <div className="pt-6 mt-6 border-t border-stone-200 dark:border-stone-800 bg-rose-50/60 dark:bg-stone-800/60 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">Gostou deste artigo?</h4>
                <p className="text-xs text-stone-600 dark:text-stone-400">Agende uma consulta estética e tire suas dúvidas de forma individualizada.</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onBookClick();
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
              >
                <span>Agendar Avaliação</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
