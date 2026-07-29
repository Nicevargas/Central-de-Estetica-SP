import React from 'react';
import { BookOpen, Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogSectionProps {
  posts: BlogPost[];
  onReadPost: (post: BlogPost) => void;
  onViewAllPosts: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ posts, onReadPost, onViewAllPosts }) => {
  // Show featured posts first or top 3 posts
  const displayPosts = posts.filter(p => p.featured).slice(0, 3);
  const fallbackPosts = posts.slice(0, 3);
  const finalPosts = displayPosts.length > 0 ? displayPosts : fallbackPosts;

  if (finalPosts.length === 0) return null;

  return (
    <section className="py-16 bg-stone-50/50 dark:bg-stone-900/30 border-y border-stone-200/60 dark:border-stone-800/60">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Blog & Conteúdo Educativo</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Dicas de Saúde Estética & Bem-Estar
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-sm max-w-xl">
              Artigos criados pela nossa equipe médica para ajudar você a cuidar da sua pele com informação embasada e segura.
            </p>
          </div>

          <button
            onClick={onViewAllPosts}
            className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm hover:gap-3 transition-all cursor-pointer group"
          >
            <span>Ver Todos os Artigos</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Grid of Blog Post Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {finalPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onReadPost(post)}
              className="group bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-200/80 dark:border-stone-800 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="relative h-48 overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                    {post.category}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-rose-500" />
                      {post.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-rose-500" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 font-medium">
                  <User className="h-3.5 w-3.5 text-rose-500" />
                  {post.author}
                </span>

                <span className="text-rose-600 dark:text-rose-400 font-bold group-hover:underline flex items-center gap-1">
                  Ler Mais
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
