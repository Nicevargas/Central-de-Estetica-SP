import React, { useState, useMemo } from 'react';
import { Search, Tag, Calendar, Clock, User, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogPageProps {
  posts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
  onBookClick: () => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ posts, onSelectPost, onBookClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => set.add(p.category));
    return ['todos', ...Array.from(set)];
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = selectedCategory === 'todos' || post.category === selectedCategory;
      const matchesQuery =
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [posts, selectedCategory, searchQuery]);

  // Featured Hero Post
  const featuredPost = posts.find((p) => p.featured) || posts[0];

  return (
    <div className="py-10 max-w-7xl mx-auto px-6 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Blog Estética Avançada</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          Conteúdo Educativo & Cuidados de Pele
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
          Artigos escritos por dermatologistas e especialistas para esclarecer dúvidas sobre os procedimentos estéticos mais modernos.
        </p>
      </div>

      {/* Featured Banner Post (If available) */}
      {featuredPost && searchQuery === '' && selectedCategory === 'todos' && (
        <div
          onClick={() => onSelectPost(featuredPost)}
          className="relative overflow-hidden rounded-3xl bg-stone-900 text-white shadow-xl border border-stone-800 cursor-pointer group hover:border-rose-500/50 transition-all duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
            <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between z-10 relative bg-gradient-to-r from-stone-950 via-stone-900 to-stone-900/90">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    Artigo em Destaque
                  </span>
                  <span className="text-xs text-stone-400 bg-stone-800 px-2.5 py-1 rounded-full border border-stone-700/50">
                    {featuredPost.category}
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white group-hover:text-rose-400 transition-colors leading-tight">
                  {featuredPost.title}
                </h2>

                <p className="text-stone-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="pt-6 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-rose-500" />
                    {featuredPost.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-rose-500" />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-rose-500" />
                    {featuredPost.readTime}
                  </span>
                </div>

                <span className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md">
                  Ler Artigo Completo
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full overflow-hidden">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-stone-950 via-stone-950/20 to-transparent" />
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat === 'todos' ? 'Todos os Artigos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
          <p className="text-stone-500 font-medium text-sm">Nenhum artigo encontrado com estes termos de busca.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('todos');
            }}
            className="text-xs text-rose-600 font-bold hover:underline"
          >
            Limpar filtros de busca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="group bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-200/80 dark:border-stone-800 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
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

              <div className="px-5 py-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 font-medium">
                  <User className="h-3.5 w-3.5 text-rose-500" />
                  {post.author}
                </span>

                <span className="text-rose-600 dark:text-rose-400 font-bold group-hover:underline flex items-center gap-1">
                  Ler Artigo
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
