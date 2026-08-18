import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Sparkles,
  Tag,
  MessageSquare,
  BookOpen,
  Calendar,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
  User,
  LogOut,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
  Globe,
  Share2,
  Database,
  Copy,
  ExternalLink,
  ShieldCheck,
  Server,
  Terminal,
  Search,
  Filter,
} from 'lucide-react';
import { Treatment, Promotion, Testimonial, BlogPost, BookingRequest, ContactInfo } from '../types';
import {
  getSanitizedTreatmentDisplay,
  sanitizeTreatmentObject,
  isPriceLike,
  formatGoogleDriveImageUrl,
  getGoogleDriveThumbnailUrl,
  formatVideoEmbedUrl,
  extractGoogleDriveId,
} from '../lib/treatmentUtils';
import {
  isSupabaseConfigured,
  testSupabaseDatabaseTables,
  TableDiagnosticResult,
  SUPABASE_FULL_MIGRATION_SQL,
} from '../lib/supabase';

interface AdminAreaProps {
  treatments: Treatment[];
  onSaveTreatments: (data: Treatment[]) => void;

  promotions: Promotion[];
  onSavePromotions: (data: Promotion[]) => void;

  testimonials: Testimonial[];
  onSaveTestimonials: (data: Testimonial[]) => void;

  blogPosts: BlogPost[];
  onSaveBlogPosts: (data: BlogPost[]) => void;

  bookings: BookingRequest[];
  onSaveBookings: (data: BookingRequest[]) => void;

  contactInfo: ContactInfo;
  onSaveContactInfo: (data: ContactInfo) => void;

  onClose: () => void;
  /** Chamado logo após um login bem-sucedido no admin. Deve repuxar os dados
   * mais recentes do Supabase, pra nunca editar/salvar um estado local
   * desatualizado por cima de mudanças feitas direto no banco. */
  onAdminLogin?: () => void;
}

export const AdminArea: React.FC<AdminAreaProps> = ({
  treatments,
  onSaveTreatments,
  promotions,
  onSavePromotions,
  testimonials,
  onSaveTestimonials,
  blogPosts,
  onSaveBlogPosts,
  bookings,
  onSaveBookings,
  contactInfo,
  onSaveContactInfo,
  onClose,
  onAdminLogin,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('admin_session_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'treatments' | 'promotions' | 'testimonials' | 'blog' | 'bookings' | 'contact' | 'database' | 'seo'>('treatments');
  const [notification, setNotification] = useState<string | null>(null);

  // Database Diagnostic States
  const [dbDiagnostics, setDbDiagnostics] = useState<TableDiagnosticResult[] | null>(null);
  const [isTestingDb, setIsTestingDb] = useState<boolean>(false);
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);

  // Form Editing States
  const [editingTreatment, setEditingTreatment] = useState<Partial<Treatment> | null>(null);
  const [editingPromo, setEditingPromo] = useState<Partial<Promotion> | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [treatmentImageStatus, setTreatmentImageStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  // Treatment Quick Search & Filter States
  const [treatmentSearchQuery, setTreatmentSearchQuery] = useState<string>('');
  const [treatmentCategoryFilter, setTreatmentCategoryFilter] = useState<string>('all');
  const [treatmentBadgeFilter, setTreatmentBadgeFilter] = useState<'all' | 'popular' | 'highlight' | 'beforeAfter' | 'video'>('all');

  // Filtered Treatments for Admin Quick Search
  const filteredTreatments = treatments.filter((t) => {
    // 1. Search Query
    if (treatmentSearchQuery.trim()) {
      const q = treatmentSearchQuery.toLowerCase().trim();
      const matchName = (t.name || '').toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchCat = (t.category || '').toLowerCase().includes(q);
      const matchBenefits = Array.isArray(t.benefits) && t.benefits.some((b) => (b || '').toLowerCase().includes(q));
      const matchSpecialist = (t.specialist?.name || '').toLowerCase().includes(q);
      const matchPrice = (t.price || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat && !matchBenefits && !matchSpecialist && !matchPrice) {
        return false;
      }
    }

    // 2. Category Filter
    if (treatmentCategoryFilter !== 'all' && t.category !== treatmentCategoryFilter) {
      return false;
    }

    // 3. Badge Filter
    if (treatmentBadgeFilter === 'popular' && !t.popular) return false;
    if (treatmentBadgeFilter === 'highlight' && !t.highlight) return false;
    if (treatmentBadgeFilter === 'beforeAfter') {
      const hasBA = t.beforeAfterImages && t.beforeAfterImages.length > 0 && t.beforeAfterImages[0]?.before;
      if (!hasBA) return false;
    }
    if (treatmentBadgeFilter === 'video') {
      if (!t.videoUrl) return false;
    }

    return true;
  });

  const facialCount = treatments.filter((t) => t.category === 'facial').length;
  const corporalCount = treatments.filter((t) => t.category === 'corporal').length;
  const capilarCount = treatments.filter((t) => t.category === 'capilar').length;
  const bemEstarCount = treatments.filter((t) => t.category === 'bem-estar').length;
  const popularCount = treatments.filter((t) => t.popular).length;
  const highlightCount = treatments.filter((t) => t.highlight).length;
  const beforeAfterCount = treatments.filter((t) => t.beforeAfterImages && t.beforeAfterImages.length > 0 && t.beforeAfterImages[0]?.before).length;
  const videoCount = treatments.filter((t) => !!t.videoUrl).length;

  const isFilteringTreatments =
    Boolean(treatmentSearchQuery.trim()) ||
    treatmentCategoryFilter !== 'all' ||
    treatmentBadgeFilter !== 'all';

  const resetTreatmentFilters = () => {
    setTreatmentSearchQuery('');
    setTreatmentCategoryFilter('all');
    setTreatmentBadgeFilter('all');
  };

  // Contact Info Form State
  const [contactForm, setContactForm] = useState<ContactInfo>(contactInfo);

  // Se o admin já estava logado de uma sessão anterior (persistida no
  // localStorage), atualiza a partir do Supabase ao abrir também, não só no login.
  useEffect(() => {
    if (isAuthenticated) {
      onAdminLogin?.();
    }
    // Só roda uma vez, quando o painel abre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (contactInfo) {
      setContactForm(contactInfo);
    }
  }, [contactInfo]);

  const handleSaveContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveContactInfo(contactForm);
    notify('Informações de contato e redes sociais salvas com sucesso!');
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Default credentials check
    if (
      (cleanUser === 'admin' || cleanUser === 'admin@clinica.com' || cleanUser === 'gestor') &&
      (cleanPass === 'admin123' || cleanPass === '1234' || cleanPass === '123456' || cleanPass === 'admin')
    ) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem('admin_session_auth', 'true');
      } catch (e) {
        console.error(e);
      }
      setLoginError(null);
      // Puxa os dados mais recentes do Supabase agora, pra nenhuma edição
      // feita direto no banco ser sobrescrita por uma cópia local desatualizada.
      onAdminLogin?.();
    } else {
      setLoginError('Usuário ou senha incorretos.');
    }
  };

  const fillDefaultCredentials = () => {
    setUsername('admin');
    setPassword('admin123');
    setLoginError(null);
  };

  // --- TREATMENT HANDLERS ---
  const handleSaveTreatmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTreatment?.name || !editingTreatment?.description) return;

    if (editingTreatment.id) {
      // Update
      const cleaned = sanitizeTreatmentObject(editingTreatment as Treatment);
      const updated = treatments.map((t) => (t.id === editingTreatment.id ? cleaned : t));
      onSaveTreatments(updated);
      notify('Serviço/Tratamento atualizado com sucesso!');
    } else {
      // Create
      const newTreatment: Treatment = sanitizeTreatmentObject({
        id: `treatment-${Date.now()}`,
        name: editingTreatment.name || 'Novo Tratamento',
        description: editingTreatment.description || '',
        category: editingTreatment.category || 'facial',
        price: editingTreatment.price || '',
        duration: editingTreatment.duration || '45 min',
        image: editingTreatment.image || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        benefits: editingTreatment.benefits || ['Qualidade garantida', 'Atendimento personalizado'],
        popular: editingTreatment.popular || false,
      });
      onSaveTreatments([newTreatment, ...treatments]);
      notify('Novo Serviço/Tratamento criado com sucesso!');
    }
    setEditingTreatment(null);
  };

  const handleDeleteTreatment = (id: string) => {
    onSaveTreatments(treatments.filter((t) => t.id !== id));
    notify('Tratamento/Serviço removido com sucesso.');
  };

  const handleTogglePopular = (id: string) => {
    const updated = treatments.map((t) => (t.id === id ? { ...t, popular: !t.popular } : t));
    onSaveTreatments(updated);
    notify('Status de "Mais Procurado" (Popular) alterado!');
  };

  const handleToggleHighlight = (id: string) => {
    const updated = treatments.map((t) => (t.id === id ? { ...t, highlight: !t.highlight } : t));
    onSaveTreatments(updated);
    notify('Status de Destaque na grade alterado!');
  };

  // --- PROMOTIONS HANDLERS ---
  const handleSavePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo?.title || !editingPromo?.title.trim()) {
      notify('Por favor, informe o título da promoção.');
      return;
    }

    if (editingPromo.id) {
      const updated = promotions.map((p) => (p.id === editingPromo.id ? ({ ...p, ...editingPromo } as Promotion) : p));
      onSavePromotions(updated);
      notify('Banner Promocional atualizado com sucesso!');
    } else {
      const newPromo: Promotion = {
        id: `promo-${Date.now()}`,
        badge: editingPromo.badge || 'PROMOÇÃO ESPECIAL',
        title: editingPromo.title.trim(),
        subtitle: editingPromo.subtitle || '',
        discount: editingPromo.discount || '',
        originalPrice: editingPromo.originalPrice || '',
        promoPrice: editingPromo.promoPrice || '',
        couponCode: editingPromo.couponCode || '',
        expiresInDays: editingPromo.expiresInDays || 7,
        treatmentId: editingPromo.treatmentId || '',
        image: editingPromo.image || undefined,
        active: editingPromo.active !== false,
      };
      onSavePromotions([newPromo, ...promotions]);
      notify('Novo Banner Promocional criado com sucesso!');
    }
    setEditingPromo(null);
  };

  const handleTogglePromoActive = (id: string) => {
    const updated = promotions.map((p) =>
      p.id === id ? { ...p, active: p.active === false ? true : false } : p
    );
    onSavePromotions(updated);
    notify('Status de exibição do banner alterado!');
  };

  const handleDeletePromo = (id: string) => {
    onSavePromotions(promotions.filter((p) => p.id !== id));
    notify('Banner promocional removido com sucesso.');
  };

  // --- DATABASE DIAGNOSTIC HANDLERS ---
  const handleTestDatabase = async () => {
    setIsTestingDb(true);
    try {
      const results = await testSupabaseDatabaseTables();
      setDbDiagnostics(results);
      const hasErrors = results.some((r) => r.status === 'error');
      if (hasErrors) {
        notify('Atenção: Verifique as mensagens de diagnóstico do Supabase abaixo.');
      } else {
        notify('Conexão e tabelas do Supabase verificadas com sucesso!');
      }
    } catch (err) {
      console.error(err);
      notify('Erro ao testar conexão com o banco.');
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleCopySqlScript = () => {
    try {
      navigator.clipboard.writeText(SUPABASE_FULL_MIGRATION_SQL);
      setSqlCopied(true);
      notify('Script SQL copiado com sucesso! Cole no SQL Editor do Supabase.');
      setTimeout(() => setSqlCopied(false), 4000);
    } catch (err) {
      notify('Erro ao copiar. Selecione o código manualmente abaixo.');
    }
  };

  // --- TESTIMONIALS HANDLERS ---
  const handleSaveTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial?.name || !editingTestimonial?.text) return;

    if (editingTestimonial.id) {
      const updated = testimonials.map((t) => (t.id === editingTestimonial.id ? ({ ...t, ...editingTestimonial } as Testimonial) : t));
      onSaveTestimonials(updated);
      notify('Depoimento atualizado!');
    } else {
      const newTestimonial: Testimonial = {
        id: `test-${Date.now()}`,
        name: editingTestimonial.name || 'Cliente Satisfeito',
        role: editingTestimonial.role || 'Cliente recente',
        text: editingTestimonial.text || '',
        stars: editingTestimonial.stars || 5,
      };
      onSaveTestimonials([newTestimonial, ...testimonials]);
      notify('Novo depoimento adicionado!');
    }
    setEditingTestimonial(null);
  };

  const handleDeleteTestimonial = (id: string) => {
    onSaveTestimonials(testimonials.filter((t) => t.id !== id));
    notify('Depoimento removido com sucesso.');
  };

  // --- BLOG POSTS HANDLERS ---
  const handleSaveBlogPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost?.title || !editingPost?.excerpt) return;

    if (editingPost.id) {
      const updated = blogPosts.map((p) => (p.id === editingPost.id ? ({ ...p, ...editingPost } as BlogPost) : p));
      onSaveBlogPosts(updated);
      notify('Artigo do blog atualizado!');
    } else {
      const newPost: BlogPost = {
        id: `post-${Date.now()}`,
        title: editingPost.title || 'Título do Artigo',
        slug: editingPost.slug || `post-${Date.now()}`,
        category: editingPost.category || 'Estética Geral',
        author: editingPost.author || 'Equipe Médica',
        date: editingPost.date || 'Hoje',
        readTime: editingPost.readTime || '4 min de leitura',
        featured: editingPost.featured || false,
        image: editingPost.image || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        excerpt: editingPost.excerpt || '',
        content: editingPost.content || '',
      };
      onSaveBlogPosts([newPost, ...blogPosts]);
      notify('Novo artigo publicado com sucesso!');
    }
    setEditingPost(null);
  };

  const handleDeleteBlogPost = (id: string) => {
    onSaveBlogPosts(blogPosts.filter((p) => p.id !== id));
    notify('Artigo removido do blog.');
  };

  // --- BOOKINGS HANDLERS ---
  const handleToggleBookingStatus = (id: string) => {
    const updated = bookings.map((b) =>
      b.id === id ? { ...b, status: (b.status === 'confirmed' ? 'pending' : 'confirmed') as 'pending' | 'confirmed' } : b
    );
    onSaveBookings(updated);
    notify('Status do agendamento atualizado.');
  };

  const handleDeleteBooking = (id: string) => {
    onSaveBookings(bookings.filter((b) => b.id !== id));
    notify('Agendamento excluído da lista com sucesso.');
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 text-center space-y-6 relative overflow-hidden">
          {/* Close button on login modal */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="w-14 h-14 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="h-7 w-7" />
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">Painel do Gestor</h2>
            <p className="text-stone-500 text-xs mt-1">Insira seu usuário e senha para acessar as configurações da clínica</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Usuário / E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-xs text-rose-500 font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Entrar no Painel
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold text-sm rounded-xl cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-stone-900 w-full max-w-6xl rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 my-4 max-h-[92vh] flex flex-col overflow-hidden text-stone-800 dark:text-stone-200">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg">Painel Administrativo da Clínica</h2>
              <p className="text-[11px] text-stone-400">Gerencie Serviços, Banners, Depoimentos, Blog e Agendamentos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notification && (
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1 rounded-full animate-fade-in">
                <Check className="h-3.5 w-3.5" />
                {notification}
              </span>
            )}
            <button
              onClick={() => {
                setIsAuthenticated(false);
                try {
                  localStorage.removeItem('admin_session_auth');
                } catch (e) {
                  console.error(e);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 border border-stone-700"
              title="Sair do Painel"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
              title="Fechar Painel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-6 py-3 bg-stone-100 dark:bg-stone-950/50 border-b border-stone-200 dark:border-stone-800 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('treatments')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'treatments'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Serviços / Tratamentos ({treatments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('promotions')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'promotions'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Tag className="h-4 w-4" />
            <span>Banners Promocionais ({promotions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('testimonials')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'testimonials'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Depoimentos ({testimonials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('blog')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'blog'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Artigos do Blog ({blogPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Agendamentos Recebidos ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'contact'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Phone className="h-4 w-4" />
            <span>Contatos & Redes Sociais</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'database'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Banco de Dados (Supabase)</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'seo'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Search className="h-4 w-4 text-emerald-500" />
            <span>SEO & Google</span>
          </button>
        </div>

        {/* Tab Contents Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ================= TREATMENTS TAB ================= */}
          {activeTab === 'treatments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold">Catálogo de Serviços & Tratamentos</h3>
                  <p className="text-xs text-stone-500">Adicione ou edite os tratamentos exibidos no site</p>
                </div>
                <button
                  onClick={() =>
                    setEditingTreatment({
                      category: 'facial',
                      benefits: ['Inovador', 'Seguro'],
                      popular: false,
                    })
                  }
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Tratamento</span>
                </button>
              </div>

              {/* Edit/Create Form Modal if active */}
              {editingTreatment && (
                <form
                  onSubmit={handleSaveTreatmentSubmit}
                  className="p-5 bg-rose-50/50 dark:bg-stone-800/80 rounded-2xl border border-rose-200 dark:border-stone-700 space-y-4"
                >
                  <h4 className="font-bold text-sm text-rose-700 dark:text-rose-400">
                    {editingTreatment.id ? 'Editar Tratamento' : 'Criar Novo Tratamento'}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Nome do Tratamento</label>
                      <input
                        type="text"
                        required
                        value={editingTreatment.name || ''}
                        onChange={(e) => setEditingTreatment({ ...editingTreatment, name: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Categoria</label>
                      <select
                        value={editingTreatment.category || 'facial'}
                        onChange={(e) =>
                          setEditingTreatment({ ...editingTreatment, category: e.target.value as any })
                        }
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      >
                        <option value="facial">Facial</option>
                        <option value="corporal">Corporal</option>
                        <option value="capilar">Terapia Capilar</option>
                        <option value="bem-estar">Bem-Estar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Preço / Condição (Ex: 6x de R$ 399,00 ou R$ 850,00)</label>
                      <input
                        type="text"
                        value={editingTreatment.price || ''}
                        onChange={(e) => setEditingTreatment({ ...editingTreatment, price: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        placeholder="Ex: 6x de R$ 399,00 ou R$ 850,00"
                      />
                      <span className="text-[10px] text-stone-400 block mt-0.5">Insira o valor ou parcelamento. Deixe em branco para "Sob Consulta".</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Duração do Atendimento (Ex: 45 min)</label>
                      <input
                        type="text"
                        value={editingTreatment.duration || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          // If user mistakenly types price/installment in duration, handle seamlessly
                          if (isPriceLike(val) && (!editingTreatment.price || editingTreatment.price === 'R$ 0,00')) {
                            setEditingTreatment({ ...editingTreatment, price: val, duration: '45 min' });
                          } else {
                            setEditingTreatment({ ...editingTreatment, duration: val });
                          }
                        }}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        placeholder="Ex: 45 min, 1 hora"
                      />
                      <span className="text-[10px] text-stone-400 block mt-0.5">Tempo da sessão (minutos ou horas).</span>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold">
                          Imagem Principal do Tratamento (Google Drive ID ou Link)
                        </label>
                        {extractGoogleDriveId(editingTreatment.image) && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50">
                            ✓ Padrão Google Drive Ativo (ID: {extractGoogleDriveId(editingTreatment.image)})
                          </span>
                        )}
                      </div>
                      
                      <div className="relative">
                        <input
                          type="text"
                          value={editingTreatment.image || ''}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const formatted = formatGoogleDriveImageUrl(raw);
                            setEditingTreatment({ ...editingTreatment, image: formatted });
                            setTreatmentImageStatus('idle');
                          }}
                          placeholder="Cole o ID (ex: 1ABCxyz123) ou link do Google Drive / link direto de imagem"
                          className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-900/60 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-rose-600">💡 Google Drive:</span>
                          <span>Basta colar o <strong>ID</strong> ou o link de compartilhamento. Formato gerado: <code className="text-[10px] bg-white dark:bg-stone-800 px-1 py-0.5 rounded font-mono">https://drive.google.com/uc?export=view&id=ID</code></span>
                        </div>
                      </div>

                      {editingTreatment.image && (
                        <div className="mt-2 flex items-center gap-3 p-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                          <img
                            key={editingTreatment.image}
                            src={editingTreatment.image}
                            alt="Pré-visualização"
                            referrerPolicy="no-referrer"
                            className="h-16 w-16 object-cover rounded-lg border border-stone-200 dark:border-stone-700 shadow-xs"
                            onLoad={() => setTreatmentImageStatus('ok')}
                            onError={() => setTreatmentImageStatus('error')}
                          />
                          <div className="flex-1 text-xs">
                            {treatmentImageStatus === 'ok' && (
                              <span className="font-semibold text-emerald-600 block">✓ Imagem carregada com sucesso.</span>
                            )}
                            {treatmentImageStatus === 'error' && (
                              <span className="font-semibold text-amber-600 block">
                                Se a foto do Google Drive não carregar, certifique-se de que o compartilhamento do arquivo está como "Qualquer pessoa com o link".
                              </span>
                            )}
                            <span className="text-[10px] text-stone-400 break-all block mt-0.5">{editingTreatment.image}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">Descrição</label>
                      <textarea
                        rows={2}
                        required
                        value={editingTreatment.description || ''}
                        onChange={(e) => setEditingTreatment({ ...editingTreatment, description: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">Benefícios (separados por vírgula)</label>
                      <input
                        type="text"
                        value={editingTreatment.benefits?.join(', ') || ''}
                        onChange={(e) =>
                          setEditingTreatment({
                            ...editingTreatment,
                            benefits: e.target.value.split(',').map((b) => b.trim()),
                          })
                        }
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        placeholder="Ex: Rejuvenescimento, Estímulo de colágeno, Sem tempo de repouso"
                      />
                    </div>

                    {/* Toggles de Destaque e Popularidade */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-rose-100/50 dark:bg-stone-800/80 rounded-xl border border-rose-200 dark:border-stone-700">
                      <label className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingTreatment.popular || false}
                          onChange={(e) => setEditingTreatment({ ...editingTreatment, popular: e.target.checked })}
                          className="w-4 h-4 rounded accent-rose-600"
                        />
                        <span>🔥 Marcar como "Mais Procurado" (Selo Popular)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingTreatment.highlight || false}
                          onChange={(e) => setEditingTreatment({ ...editingTreatment, highlight: e.target.checked })}
                          className="w-4 h-4 rounded accent-rose-600"
                        />
                        <span>⭐ Destaque Duplo / Banner Especial na Grade</span>
                      </label>
                    </div>

                    {/* Vídeo do Procedimento */}
                    <div className="md:col-span-2 pt-2 border-t border-rose-200 dark:border-stone-700 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-rose-700 dark:text-rose-400">
                          Vídeo do Procedimento (Google Drive ID, YouTube ou Link de Vídeo)
                        </label>
                        {extractGoogleDriveId(editingTreatment.videoUrl) ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50">
                            ✓ Vídeo Google Drive Ativo (ID: {extractGoogleDriveId(editingTreatment.videoUrl)})
                          </span>
                        ) : editingTreatment.videoUrl ? (
                          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-200/50">
                            ✓ Vídeo Incorporado
                          </span>
                        ) : null}
                      </div>
                      <input
                        type="text"
                        value={editingTreatment.videoUrl || ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const formatted = formatVideoEmbedUrl(raw);
                          setEditingTreatment({ ...editingTreatment, videoUrl: formatted });
                        }}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        placeholder="Cole o ID do Drive (ex: 1ABCxyz123) ou link do YouTube/Drive"
                      />
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                        💡 Para vídeos do Google Drive, cole apenas o <strong>ID</strong> ou link de compartilhamento. O sistema gera automaticamente o preview compatível.
                      </span>
                    </div>

                    {/* Fotos Antes e Depois */}
                    <div className="md:col-span-2 pt-2 border-t border-rose-200 dark:border-stone-700">
                      <div className="flex items-center justify-between mb-1">
                        <span className="block text-xs font-bold text-rose-700 dark:text-rose-400">
                          Fotos Antes e Depois (Google Drive ID ou Link)
                        </span>
                        <span className="text-[10px] text-stone-400">Aceita ID do Google Drive ou link direto</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-semibold">URL / ID Imagem ANTES</label>
                            {extractGoogleDriveId(editingTreatment.beforeAfterImages?.[0]?.before) && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <Check className="h-3 w-3" /> Drive ID detectado
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={editingTreatment.beforeAfterImages?.[0]?.before || ''}
                            onChange={(e) => {
                              const existing = [...(editingTreatment.beforeAfterImages || [])];
                              if (!existing[0]) existing[0] = { before: '', after: '' };
                              existing[0].before = formatGoogleDriveImageUrl(e.target.value);
                              setEditingTreatment({ ...editingTreatment, beforeAfterImages: existing });
                            }}
                            className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                            placeholder="ID do Drive (ex: 1ABCxyz123) ou link"
                          />
                          {editingTreatment.beforeAfterImages?.[0]?.before && (
                            <div className="relative h-28 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 mt-1">
                              <img
                                src={formatGoogleDriveImageUrl(editingTreatment.beforeAfterImages[0].before)}
                                alt="Preview Antes"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  const thumb = getGoogleDriveThumbnailUrl(editingTreatment.beforeAfterImages?.[0]?.before);
                                  if (thumb && target.src !== thumb) target.src = thumb;
                                }}
                              />
                              <span className="absolute bottom-1.5 left-1.5 bg-stone-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                ANTES (Preview)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-semibold">URL / ID Imagem DEPOIS</label>
                            {extractGoogleDriveId(editingTreatment.beforeAfterImages?.[0]?.after) && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <Check className="h-3 w-3" /> Drive ID detectado
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={editingTreatment.beforeAfterImages?.[0]?.after || ''}
                            onChange={(e) => {
                              const existing = [...(editingTreatment.beforeAfterImages || [])];
                              if (!existing[0]) existing[0] = { before: '', after: '' };
                              existing[0].after = formatGoogleDriveImageUrl(e.target.value);
                              setEditingTreatment({ ...editingTreatment, beforeAfterImages: existing });
                            }}
                            className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                            placeholder="ID do Drive (ex: 1ABCxyz123) ou link"
                          />
                          {editingTreatment.beforeAfterImages?.[0]?.after && (
                            <div className="relative h-28 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 mt-1">
                              <img
                                src={formatGoogleDriveImageUrl(editingTreatment.beforeAfterImages[0].after)}
                                alt="Preview Depois"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  const thumb = getGoogleDriveThumbnailUrl(editingTreatment.beforeAfterImages?.[0]?.after);
                                  if (thumb && target.src !== thumb) target.src = thumb;
                                }}
                              />
                              <span className="absolute bottom-1.5 left-1.5 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                DEPOIS (Preview)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ficha Técnica */}
                    <div className="md:col-span-2 pt-2 border-t border-rose-200 dark:border-stone-700 space-y-3">
                      <span className="block text-xs font-bold text-rose-700 dark:text-rose-400">
                        Ficha Técnica & Detalhes Médicos
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Anestesia</label>
                          <input
                            type="text"
                            value={editingTreatment.technicalSpecs?.anesthesia || ''}
                            onChange={(e) =>
                              setEditingTreatment({
                                ...editingTreatment,
                                technicalSpecs: { ...(editingTreatment.technicalSpecs || {}), anesthesia: e.target.value },
                              })
                            }
                            className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                            placeholder="Ex: Anestésico Tópico em creme"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Tempo de Recuperação</label>
                          <input
                            type="text"
                            value={editingTreatment.technicalSpecs?.recovery || ''}
                            onChange={(e) =>
                              setEditingTreatment({
                                ...editingTreatment,
                                technicalSpecs: { ...(editingTreatment.technicalSpecs || {}), recovery: e.target.value },
                              })
                            }
                            className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                            placeholder="Ex: Imediata (sem tempo de inatividade)"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Visibilidade de Resultados</label>
                          <input
                            type="text"
                            value={editingTreatment.technicalSpecs?.resultsIn || ''}
                            onChange={(e) =>
                              setEditingTreatment({
                                ...editingTreatment,
                                technicalSpecs: { ...(editingTreatment.technicalSpecs || {}), resultsIn: e.target.value },
                              })
                            }
                            className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                            placeholder="Ex: Em 3 a 7 dias"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Sessões Recomendadas</label>
                          <input
                            type="text"
                            value={editingTreatment.technicalSpecs?.sessionsRequired || ''}
                            onChange={(e) =>
                              setEditingTreatment({
                                ...editingTreatment,
                                technicalSpecs: { ...(editingTreatment.technicalSpecs || {}), sessionsRequired: e.target.value },
                              })
                            }
                            className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                            placeholder="Ex: 3 a 5 sessões"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-[11px] font-semibold mb-1">Indicado Para</label>
                          <input
                            type="text"
                            value={editingTreatment.technicalSpecs?.indicatedFor || ''}
                            onChange={(e) =>
                              setEditingTreatment({
                                ...editingTreatment,
                                technicalSpecs: { ...(editingTreatment.technicalSpecs || {}), indicatedFor: e.target.value },
                              })
                            }
                            className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                            placeholder="Ex: Rugas na testa, pés de galinha e rejuvenescimento facial"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dicas de Pós-Uso */}
                    <div className="md:col-span-2 pt-2 border-t border-rose-200 dark:border-stone-700">
                      <label className="block text-xs font-bold mb-1 text-rose-700 dark:text-rose-400">
                        Dicas de Pós-Uso / Cuidados Pós-Procedimento (1 por linha ou sep. por ponto e vírgula)
                      </label>
                      <textarea
                        rows={2}
                        value={editingTreatment.postCareTips?.join('\n') || ''}
                        onChange={(e) =>
                          setEditingTreatment({
                            ...editingTreatment,
                            postCareTips: e.target.value.split('\n').filter((t) => t.trim().length > 0),
                          })
                        }
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        placeholder="Não massagear a área nas 48h;&#10;Usar protetor solar FPS 50+;&#10;Ingerir bastante água."
                      />
                    </div>

                    {/* Profissional Executante */}
                    <div className="md:col-span-2 pt-2 border-t border-rose-200 dark:border-stone-700 space-y-3">
                      <span className="block text-xs font-bold text-rose-700 dark:text-rose-400">
                        Detalhes do Profissional que Executa
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Nome do Profissional</label>
                          <input
                            type="text"
                            value={editingTreatment.specialist?.name || ''}
                            onChange={(e) =>
                              setEditingTreatment({
                                ...editingTreatment,
                                specialist: { ...(editingTreatment.specialist || { name: '', role: '' }), name: e.target.value },
                              })
                            }
                            className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                            placeholder="Ex: Dra. Amanda Rodrigues"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Cargo / Especialidade</label>
                          <input
                            type="text"
                            value={editingTreatment.specialist?.role || ''}
                            onChange={(e) =>
                              setEditingTreatment({
                                ...editingTreatment,
                                specialist: { ...(editingTreatment.specialist || { name: '', role: '' }), role: e.target.value },
                              })
                            }
                            className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                            placeholder="Ex: Biomédica Esteta"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Registro Profissional</label>
                          <input
                            type="text"
                            value={editingTreatment.specialist?.registration || ''}
                            onChange={(e) =>
                              setEditingTreatment({
                                ...editingTreatment,
                                specialist: { ...(editingTreatment.specialist || { name: '', role: '' }), registration: e.target.value },
                              })
                            }
                            className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                            placeholder="Ex: CRBM 34.892-SP"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-[11px] font-semibold mb-1">Foto do Profissional (URL)</label>
                          <input
                            type="text"
                            value={editingTreatment.specialist?.avatar || ''}
                            onChange={(e) =>
                              setEditingTreatment({
                                ...editingTreatment,
                                specialist: { ...(editingTreatment.specialist || { name: '', role: '' }), avatar: e.target.value },
                              })
                            }
                            className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingTreatment(null)}
                      className="px-4 py-2 text-xs font-bold bg-stone-200 dark:bg-stone-700 rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Salvar Tratamento</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Quick Search & Filters Bar */}
              <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                {/* Search Input Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={treatmentSearchQuery}
                      onChange={(e) => setTreatmentSearchQuery(e.target.value)}
                      placeholder="Buscar rápido por nome, benefício, categoria, especialista..."
                      className="w-full pl-9.5 pr-9 py-2.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all placeholder:text-stone-400"
                    />
                    {treatmentSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTreatmentSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
                        title="Limpar texto da busca"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {isFilteringTreatments && (
                    <button
                      type="button"
                      onClick={resetTreatmentFilters}
                      className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all border border-rose-200 dark:border-rose-900/50 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Limpar Filtros</span>
                    </button>
                  )}
                </div>

                {/* Filter Chips Row: Categories and Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-[11px] font-semibold text-stone-400 flex items-center gap-1 mr-1">
                    <Filter className="h-3 w-3" /> Categorias:
                  </span>

                  <button
                    type="button"
                    onClick={() => setTreatmentCategoryFilter('all')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      treatmentCategoryFilter === 'all'
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-xs font-bold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>Todos</span>
                    <span className="text-[10px] opacity-75 font-mono">({treatments.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTreatmentCategoryFilter('facial')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      treatmentCategoryFilter === 'facial'
                        ? 'bg-rose-600 text-white shadow-xs font-bold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>Facial</span>
                    <span className="text-[10px] opacity-75 font-mono">({facialCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTreatmentCategoryFilter('corporal')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      treatmentCategoryFilter === 'corporal'
                        ? 'bg-rose-600 text-white shadow-xs font-bold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>Corporal</span>
                    <span className="text-[10px] opacity-75 font-mono">({corporalCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTreatmentCategoryFilter('capilar')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      treatmentCategoryFilter === 'capilar'
                        ? 'bg-rose-600 text-white shadow-xs font-bold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>Capilar</span>
                    <span className="text-[10px] opacity-75 font-mono">({capilarCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTreatmentCategoryFilter('bem-estar')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      treatmentCategoryFilter === 'bem-estar'
                        ? 'bg-rose-600 text-white shadow-xs font-bold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>Bem-Estar</span>
                    <span className="text-[10px] opacity-75 font-mono">({bemEstarCount})</span>
                  </button>

                  {/* Badges / Extras Divider */}
                  <div className="h-4 w-px bg-stone-200 dark:bg-stone-700 mx-1 hidden sm:block" />

                  <span className="text-[11px] font-semibold text-stone-400 flex items-center gap-1 mr-1 sm:ml-1">
                    Filtros:
                  </span>

                  <button
                    type="button"
                    onClick={() => setTreatmentBadgeFilter(treatmentBadgeFilter === 'popular' ? 'all' : 'popular')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      treatmentBadgeFilter === 'popular'
                        ? 'bg-amber-400 text-stone-900 font-bold shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>🔥 Populares</span>
                    <span className="text-[10px] opacity-80 font-mono">({popularCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTreatmentBadgeFilter(treatmentBadgeFilter === 'highlight' ? 'all' : 'highlight')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      treatmentBadgeFilter === 'highlight'
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>⭐ Destaques</span>
                    <span className="text-[10px] opacity-80 font-mono">({highlightCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTreatmentBadgeFilter(treatmentBadgeFilter === 'beforeAfter' ? 'all' : 'beforeAfter')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      treatmentBadgeFilter === 'beforeAfter'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>📷 Antes & Depois</span>
                    <span className="text-[10px] opacity-80 font-mono">({beforeAfterCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTreatmentBadgeFilter(treatmentBadgeFilter === 'video' ? 'all' : 'video')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      treatmentBadgeFilter === 'video'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>🎥 Com Vídeo</span>
                    <span className="text-[10px] opacity-80 font-mono">({videoCount})</span>
                  </button>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-0.5">
                  <div>
                    {isFilteringTreatments ? (
                      <span>
                        Exibindo <strong>{filteredTreatments.length}</strong> de <strong>{treatments.length}</strong> procedimentos encontrados
                        {treatmentSearchQuery && (
                          <span className="ml-1 text-rose-600 dark:text-rose-400">
                            para "<strong>{treatmentSearchQuery}</strong>"
                          </span>
                        )}
                      </span>
                    ) : (
                      <span>
                        Total de <strong>{treatments.length}</strong> procedimentos cadastrados
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Treatments List Grid or Empty State */}
              {filteredTreatments.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                    <Search className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">
                    Nenhum procedimento encontrado
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    {treatmentSearchQuery
                      ? `Não encontramos resultados correspondentes a "${treatmentSearchQuery}". Tente usar outro termo ou limpar os filtros.`
                      : 'Nenhum procedimento corresponde aos filtros selecionados.'}
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {isFilteringTreatments && (
                      <button
                        type="button"
                        onClick={resetTreatmentFilters}
                        className="px-4 py-2 text-xs font-bold bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 rounded-xl transition-colors cursor-pointer"
                      >
                        Limpar Busca e Filtros
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setEditingTreatment({
                          category: 'facial',
                          benefits: ['Inovador', 'Seguro'],
                          popular: false,
                        })
                      }
                      className="px-4 py-2 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Cadastrar Novo</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTreatments.map((t) => {
                    const display = getSanitizedTreatmentDisplay(t);
                    return (
                      <div
                        key={t.id}
                        className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <img src={t.image} alt={t.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md">
                                  {t.category}
                                </span>
                                {t.popular && (
                                  <span className="text-[10px] font-bold bg-amber-400 text-stone-900 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                    🔥 Popular
                                  </span>
                                )}
                                {t.highlight && (
                                  <span className="text-[10px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded-md">
                                    ⭐ Destaque
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-sm line-clamp-1">{t.name}</h4>
                              <p className="text-xs text-rose-600 font-extrabold">{display.hasPrice ? display.price : 'Sob Consulta'}</p>
                              {display.hasDuration && <p className="text-[11px] text-stone-500">Duração: {display.duration}</p>}
                            </div>
                          </div>

                          {/* Display Badges of Extra Options */}
                          <div className="flex flex-wrap gap-1 text-[10px]">
                            {t.videoUrl && (
                              <span className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-md font-medium">
                                🎥 Com Vídeo
                              </span>
                            )}
                            {t.beforeAfterImages && t.beforeAfterImages.length > 0 && t.beforeAfterImages[0]?.before && (
                              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md font-medium">
                                📷 Antes e Depois
                              </span>
                            )}
                            {t.technicalSpecs && Object.keys(t.technicalSpecs).length > 0 && (
                              <span className="bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-md font-medium">
                                🩺 Ficha Técnica
                              </span>
                            )}
                            {t.specialist?.name && (
                              <span className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded-md font-medium">
                                👤 {t.specialist.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleTogglePopular(t.id)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                                t.popular
                                  ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-200'
                                  : 'bg-stone-100 border-stone-200 text-stone-400 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700'
                              }`}
                              title="Alternar Destaque Popular"
                            >
                              {t.popular ? '🔥 Popular: Sim' : '+ Popular'}
                            </button>
                            <button
                              onClick={() => handleToggleHighlight(t.id)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                                t.highlight
                                  ? 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-950 dark:border-purple-700 dark:text-purple-200'
                                  : 'bg-stone-100 border-stone-200 text-stone-400 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700'
                              }`}
                              title="Alternar Destaque Duplo"
                            >
                              {t.highlight ? '⭐ Destaque: Sim' : '+ Destaque'}
                            </button>
                          </div>

                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => setEditingTreatment(t)}
                              className="p-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Editar Tratamento"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTreatment(t.id)}
                              className="p-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Remover Tratamento"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= PROMOTIONS TAB ================= */}
          {activeTab === 'promotions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl font-bold">Banners de Promoção (Carrossel Hero)</h3>
                    {isSupabaseConfigured() ? (
                      <button
                        onClick={() => setActiveTab('database')}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 cursor-pointer hover:bg-emerald-200 transition-colors"
                        title="Verificar configuração do banco de dados Supabase"
                      >
                        <Database className="h-3 w-3" />
                        <span>Supabase Conectado</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                        <span>Armazenamento Local</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">Altere ofertas, cupons de desconto, valores abertos (inteiros ou de/por), vinculação a tratamentos e visibilidade no site</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('database')}
                    className="px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-300 dark:border-stone-700"
                  >
                    <Database className="h-3.5 w-3.5 text-rose-500" />
                    <span>Ver Banco / SQL</span>
                  </button>
                  <button
                    onClick={() =>
                      setEditingPromo({
                        badge: 'OFERTA DESTAQUE DO MÊS',
                        title: 'Nova Promoção de Estética',
                        subtitle: 'Agende hoje mesmo e garanta descontos exclusivos em nossa clínica.',
                        discount: '25% OFF',
                        originalPrice: 'R$ 800',
                        promoPrice: 'R$ 600',
                        couponCode: 'ESTETICA25',
                        expiresInDays: 7,
                        treatmentId: treatments.length > 0 ? treatments[0].id : '',
                        active: true,
                      })
                    }
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Novo Banner</span>
                  </button>
                </div>
              </div>

              {editingPromo && (
                <form
                  onSubmit={handleSavePromoSubmit}
                  className="p-5 bg-rose-50/70 dark:bg-stone-800/90 rounded-2xl border border-rose-200 dark:border-stone-700 space-y-4 shadow-lg animate-fade-in"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-rose-200 dark:border-stone-700">
                    <h4 className="font-bold text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {editingPromo.id ? 'Editar Banner Promocional' : 'Criar Novo Banner Promocional'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingPromo(null)}
                      className="p-1 rounded-lg hover:bg-rose-200 dark:hover:bg-stone-700 text-stone-500 text-xs"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Selo / Badge (Ex: OFERTA DO MÊS)</label>
                      <input
                        type="text"
                        placeholder="Ex: PROMOÇÃO ESPECIAL"
                        value={editingPromo.badge || ''}
                        onChange={(e) => setEditingPromo({ ...editingPromo, badge: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Desconto em Destaque</label>
                      <input
                        type="text"
                        placeholder="Ex: 30% OFF ou R$ 300 OFF (Opcional)"
                        value={editingPromo.discount || ''}
                        onChange={(e) => setEditingPromo({ ...editingPromo, discount: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-medium"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">Título da Promoção *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Combo Brilho & Rejuvenescimento"
                        value={editingPromo.title || ''}
                        onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-semibold"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">Subtítulo / Descrição da Oferta</label>
                      <input
                        type="text"
                        placeholder="Ex: Botox 3 áreas + Peeling de Diamante para uma pele renovada."
                        value={editingPromo.subtitle || ''}
                        onChange={(e) => setEditingPromo({ ...editingPromo, subtitle: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Preço Original (De) - Opcional</label>
                      <input
                        type="text"
                        placeholder="Ex: R$ 450 (ou deixe em branco se não houver)"
                        value={editingPromo.originalPrice || ''}
                        onChange={(e) => setEditingPromo({ ...editingPromo, originalPrice: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Preço / Valor Promocional (Por)</label>
                      <input
                        type="text"
                        placeholder="Ex: R$ 289, De R$ 450 por R$ 289, 6x de R$ 49, A partir de R$ 199, etc."
                        value={editingPromo.promoPrice || ''}
                        onChange={(e) => setEditingPromo({ ...editingPromo, promoPrice: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-rose-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Código do Cupom</label>
                      <input
                        type="text"
                        placeholder="ESTETICA30"
                        value={editingPromo.couponCode || ''}
                        onChange={(e) => setEditingPromo({ ...editingPromo, couponCode: e.target.value.toUpperCase() })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl uppercase font-mono tracking-wider font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Validade (em dias)</label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={editingPromo.expiresInDays || 7}
                        onChange={(e) => setEditingPromo({ ...editingPromo, expiresInDays: parseInt(e.target.value) || 1 })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Vincular ao Tratamento do Catálogo</label>
                      <select
                        value={editingPromo.treatmentId || ''}
                        onChange={(e) => setEditingPromo({ ...editingPromo, treatmentId: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      >
                        <option value="">Nenhum (Agendamento Geral)</option>
                        {treatments.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">
                        URL da Imagem do Banner (Opcional - por padrão utiliza a imagem do tratamento vinculado)
                      </label>
                      <input
                        type="text"
                        placeholder="https://... (Deixe em branco para usar a foto do procedimento)"
                        value={editingPromo.image || ''}
                        onChange={(e) => setEditingPromo({ ...editingPromo, image: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPromo.active !== false}
                          onChange={(e) => setEditingPromo({ ...editingPromo, active: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-stone-600 peer-checked:bg-rose-600"></div>
                      </label>
                      <span className="text-xs font-bold">
                        {editingPromo.active !== false ? 'Banner Ativo no Carrossel Hero' : 'Banner Oculto / Rascunho'}
                      </span>
                    </div>
                  </div>

                  {/* Card Preview */}
                  <div className="pt-2 border-t border-rose-200 dark:border-stone-700">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-2">Pré-visualização do Banner:</span>
                    <div className="p-4 bg-gradient-to-r from-rose-100/80 via-amber-50 to-white rounded-2xl border border-rose-300/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300 shadow-2xs">
                          <img
                            src={
                              editingPromo.image ||
                              treatments.find((t) => t.id === editingPromo.treatmentId)?.image ||
                              'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
                            }
                            alt="Prévia da foto do banner"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80';
                            }}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                              {editingPromo.badge || 'PROMOÇÃO'}
                            </span>
                            <span className="text-xs font-extrabold text-rose-700">{editingPromo.discount || '20% OFF'}</span>
                          </div>
                          <h5 className="font-bold text-sm text-stone-900">{editingPromo.title || 'Título da Promoção'}</h5>
                          <p className="text-xs text-stone-600">{editingPromo.subtitle || 'Subtítulo da oferta'}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 self-end sm:self-center">
                        {editingPromo.originalPrice && (
                          <span className="line-through text-xs text-stone-400 block">{editingPromo.originalPrice}</span>
                        )}
                        {editingPromo.promoPrice && (
                          <span className="font-extrabold text-sm text-rose-600">{editingPromo.promoPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingPromo(null)}
                      className="px-4 py-2 text-xs font-bold bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl cursor-pointer hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Salvar Banner</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {promotions.map((p) => {
                  const pImg =
                    p.image ||
                    treatments.find((t) => t.id === p.treatmentId)?.image ||
                    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80';

                  return (
                    <div
                      key={p.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        p.active !== false
                          ? 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700'
                          : 'bg-stone-100/50 dark:bg-stone-900/40 border-stone-200/50 dark:border-stone-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3.5 w-full md:w-auto">
                        <div className="w-20 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-700 shrink-0 border border-stone-200 dark:border-stone-600 shadow-2xs">
                          <img
                            src={pImg}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80';
                            }}
                            className="w-full h-full object-cover object-center select-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-stone-900 px-2 py-0.5 rounded-md">
                              {p.badge}
                            </span>
                            <span className="text-xs font-extrabold text-rose-600">{p.discount}</span>
                            <span className="text-xs text-stone-500 font-mono bg-stone-200 dark:bg-stone-700 px-2 py-0.5 rounded">
                              Cupom: {p.couponCode}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                p.active !== false
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
                              }`}
                            >
                              {p.active !== false ? 'Ativo no Site' : 'Oculto'}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">{p.title}</h4>
                          <p className="text-xs text-stone-500 line-clamp-1">{p.subtitle}</p>
                          <div className="text-xs space-x-2 pt-0.5">
                            {p.originalPrice && <span className="line-through text-stone-400">{p.originalPrice}</span>}
                            {p.promoPrice && <span className="text-rose-600 font-bold">{p.promoPrice}</span>}
                            <span className="text-stone-400 font-medium">({p.expiresInDays} dias de validade)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleTogglePromoActive(p.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          p.active !== false
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200'
                        }`}
                        title={p.active !== false ? 'Ocultar do Carrossel' : 'Exibir no Carrossel'}
                      >
                        {p.active !== false ? 'Ativo' : 'Oculto'}
                      </button>
                      <button
                        onClick={() => setEditingPromo(p)}
                        className="p-2 bg-stone-200 dark:bg-stone-700 hover:bg-rose-600 hover:text-white rounded-xl transition-colors cursor-pointer"
                        title="Editar Banner"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePromo(p.id)}
                        className="p-2 bg-stone-200 dark:bg-stone-700 hover:bg-rose-600 hover:text-white rounded-xl transition-colors cursor-pointer"
                        title="Excluir Banner"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}

          {/* ================= TESTIMONIALS TAB ================= */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold">Depoimentos e Avaliações de Pacientes</h3>
                  <p className="text-xs text-stone-500">Adicione e gerencie avaliações dos clientes</p>
                </div>
                <button
                  onClick={() =>
                    setEditingTestimonial({
                      stars: 5,
                      role: 'Cliente recente',
                    })
                  }
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Depoimento</span>
                </button>
              </div>

              {editingTestimonial && (
                <form
                  onSubmit={handleSaveTestimonialSubmit}
                  className="p-5 bg-rose-50/50 dark:bg-stone-800/80 rounded-2xl border border-rose-200 dark:border-stone-700 space-y-4"
                >
                  <h4 className="font-bold text-sm text-rose-700 dark:text-rose-400">
                    {editingTestimonial.id ? 'Editar Depoimento' : 'Adicionar Depoimento'}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Nome do Paciente</label>
                      <input
                        type="text"
                        required
                        value={editingTestimonial.name || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Relação / Tempo de Cliente</label>
                      <input
                        type="text"
                        value={editingTestimonial.role || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        placeholder="Ex: Cliente há 2 anos"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Avaliação (Estrelas)</label>
                      <select
                        value={editingTestimonial.stars || 5}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, stars: parseInt(e.target.value) || 5 })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-amber-500"
                      >
                        <option value={5}>★★★★★ (5 Estrelas)</option>
                        <option value={4}>★★★★☆ (4 Estrelas)</option>
                        <option value={3}>★★★☆☆ (3 Estrelas)</option>
                        <option value={2}>★★☆☆☆ (2 Estrelas)</option>
                        <option value={1}>★☆☆☆☆ (1 Estrela)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">Relato / Comentário</label>
                      <textarea
                        rows={3}
                        required
                        value={editingTestimonial.text || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingTestimonial(null)}
                      className="px-4 py-2 text-xs font-bold bg-stone-200 dark:bg-stone-700 rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Salvar Depoimento</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm">{t.name}</h4>
                          <p className="text-[11px] text-stone-400">{t.role}</p>
                        </div>
                        <span className="text-amber-400 text-xs">★★★★★</span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 italic">"{t.text}"</p>
                    </div>

                    <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-end gap-1">
                      <button
                        onClick={() => setEditingTestimonial(t)}
                        className="p-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer text-xs"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="p-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= BLOG TAB ================= */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold">Gerenciamento do Blog</h3>
                  <p className="text-xs text-stone-500">Crie, edite ou destaque artigos de saúde estética</p>
                </div>
                <button
                  onClick={() =>
                    setEditingPost({
                      category: 'Tratamentos Faciais',
                      author: 'Dra. Camila Vasconcelos',
                      date: 'Hoje',
                      readTime: '4 min de leitura',
                      featured: false,
                    })
                  }
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Artigo</span>
                </button>
              </div>

              {editingPost && (
                <form
                  onSubmit={handleSaveBlogPostSubmit}
                  className="p-5 bg-rose-50/50 dark:bg-stone-800/80 rounded-2xl border border-rose-200 dark:border-stone-700 space-y-4"
                >
                  <h4 className="font-bold text-sm text-rose-700 dark:text-rose-400">
                    {editingPost.id ? 'Editar Artigo' : 'Publicar Novo Artigo'}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">Título do Artigo</label>
                      <input
                        type="text"
                        required
                        value={editingPost.title || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Categoria</label>
                      <input
                        type="text"
                        required
                        value={editingPost.category || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        placeholder="Ex: Tratamentos Faciais, Skincare"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Autor / Profissional</label>
                      <input
                        type="text"
                        value={editingPost.author || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Data de Publicação</label>
                      <input
                        type="text"
                        value={editingPost.date || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, date: e.target.value })}
                        placeholder="Ex: 15 de Outubro, 2025"
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Tempo de Leitura</label>
                      <input
                        type="text"
                        value={editingPost.readTime || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, readTime: e.target.value })}
                        placeholder="Ex: 4 min de leitura"
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">URL da Imagem de Capa</label>
                      <input
                        type="text"
                        value={editingPost.image || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, image: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">Resumo (Excerpt)</label>
                      <textarea
                        rows={2}
                        required
                        value={editingPost.excerpt || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">Conteúdo Completo (Aceita marcações e parágrafos)</label>
                      <textarea
                        rows={6}
                        required
                        value={editingPost.content || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-sans"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={editingPost.featured || false}
                        onChange={(e) => setEditingPost({ ...editingPost, featured: e.target.checked })}
                        className="rounded accent-rose-600"
                      />
                      <label htmlFor="featured" className="text-xs font-bold cursor-pointer">
                        Destacar este artigo na Página Inicial
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingPost(null)}
                      className="px-4 py-2 text-xs font-bold bg-stone-200 dark:bg-stone-700 rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Publicar Artigo</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex gap-3">
                      <img src={post.image} alt={post.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md">
                            {post.category}
                          </span>
                          {post.featured && (
                            <span className="text-[10px] font-bold bg-amber-400 text-stone-900 px-2 py-0.5 rounded-md">
                              Em Destaque
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm line-clamp-1">{post.title}</h4>
                        <p className="text-xs text-stone-500 line-clamp-1">{post.excerpt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setEditingPost(post)}
                        className="p-2 bg-stone-200 dark:bg-stone-700 hover:bg-rose-600 hover:text-white rounded-xl transition-colors cursor-pointer"
                        title="Editar Artigo"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlogPost(post.id)}
                        className="p-2 bg-stone-200 dark:bg-stone-700 hover:bg-rose-600 hover:text-white rounded-xl transition-colors cursor-pointer"
                        title="Excluir Artigo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= BOOKINGS TAB ================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold">Solicitações de Agendamento</h3>
                <p className="text-xs text-stone-500">Agendamentos solicitados pelos clientes através do formulário</p>
              </div>

              {bookings.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-400 text-xs">
                  Nenhuma solicitação de agendamento recebida até o momento.
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{b.name}</span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {b.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          {b.email} • {b.phone}
                        </p>
                        <p className="text-xs text-rose-600 font-semibold">
                          Data: {b.date} às {b.time}
                        </p>
                        {b.notes && <p className="text-xs text-stone-400 italic">Obs: {b.notes}</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleBookingStatus(b.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            b.status === 'confirmed'
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {b.status === 'confirmed' ? 'Marcar Pendente' : 'Confirmar Agendamento'}
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="p-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-rose-600 hover:text-white rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= CONTACT TAB ================= */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold">Informações de Contato e Redes Sociais</h3>
                <p className="text-xs text-stone-500">
                  Altere telefone, WhatsApp, e-mail, endereço e links de redes sociais exibidos no site
                </p>
              </div>

              <form onSubmit={handleSaveContactSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Fields Column */}
                <div className="lg:col-span-7 bg-stone-50 dark:bg-stone-800/50 p-6 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-4">
                  <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2 pb-2 border-b border-stone-200 dark:border-stone-700">
                    <Phone className="h-4 w-4" />
                    Telefones e Atendimento
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                        Telefone Fixo / Exibição
                      </label>
                      <input
                        type="text"
                        value={contactForm.phonePrimary}
                        onChange={(e) => setContactForm({ ...contactForm, phonePrimary: e.target.value })}
                        placeholder="(11) 3151-2433 / (11) 9468-3765"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                        Número do WhatsApp (link wa.me)
                      </label>
                      <input
                        type="text"
                        value={contactForm.whatsappNumber}
                        onChange={(e) => setContactForm({ ...contactForm, whatsappNumber: e.target.value })}
                        placeholder="551194683765"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono dark:text-white"
                        required
                      />
                      <span className="text-[10px] text-stone-400 block mt-0.5">Apenas números com DDD e país (ex: 551194683765)</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2 pt-2 pb-2 border-b border-stone-200 dark:border-stone-700">
                    <Mail className="h-4 w-4" />
                    E-mail Oficial
                  </h4>

                  <div>
                    <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                      Endereço de E-mail
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="contatocentraldaestetica@gmail.com"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
                      required
                    />
                  </div>

                  <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2 pt-2 pb-2 border-b border-stone-200 dark:border-stone-700">
                    <MapPin className="h-4 w-4" />
                    Endereço Físico
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                        Rua e Número (Linha 1)
                      </label>
                      <input
                        type="text"
                        value={contactForm.addressLine1}
                        onChange={(e) => setContactForm({ ...contactForm, addressLine1: e.target.value })}
                        placeholder="Rua Artur Frazão, 33"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                          Bairro, Cidade e Estado (Linha 2)
                        </label>
                        <input
                          type="text"
                          value={contactForm.addressLine2}
                          onChange={(e) => setContactForm({ ...contactForm, addressLine2: e.target.value })}
                          placeholder="Jardim Paulista, São Paulo - SP"
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                          CEP
                        </label>
                        <input
                          type="text"
                          value={contactForm.cep}
                          onChange={(e) => setContactForm({ ...contactForm, cep: e.target.value })}
                          placeholder="01423-030"
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2 pt-2 pb-2 border-b border-stone-200 dark:border-stone-700">
                    <Share2 className="h-4 w-4" />
                    Redes Sociais
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <Instagram className="h-3.5 w-3.5 text-pink-600" />
                        URL do Instagram
                      </label>
                      <input
                        type="url"
                        value={contactForm.instagramUrl}
                        onChange={(e) => setContactForm({ ...contactForm, instagramUrl: e.target.value })}
                        placeholder="https://instagram.com/centraldaesteticasp"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <Facebook className="h-3.5 w-3.5 text-blue-600" />
                        URL do Facebook
                      </label>
                      <input
                        type="url"
                        value={contactForm.facebookUrl}
                        onChange={(e) => setContactForm({ ...contactForm, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/CENTRALDAESTETICASP"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm py-3 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Save className="h-4 w-4" />
                      <span>Salvar Informações de Contato</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-5 bg-stone-900 text-stone-200 rounded-2xl border border-stone-800 space-y-4 shadow-lg sticky top-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-stone-800 text-rose-400 font-serif font-bold text-sm">
                      <Eye className="h-4 w-4" />
                      <span>Pré-visualização no Rodapé</span>
                    </div>

                    <div className="space-y-3 text-xs leading-relaxed">
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1 font-bold">Endereço</span>
                        <div className="flex items-start gap-2 text-stone-300">
                          <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <p>{contactForm.addressLine1 || 'Rua...'}</p>
                            <p>{contactForm.addressLine2 || 'Bairro/Cidade'}</p>
                            <p>CEP {contactForm.cep || '00000-000'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-800">
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1 font-bold">Telefone</span>
                        <div className="flex items-center gap-2 font-bold text-rose-400">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{contactForm.phonePrimary || '(00) 0000-0000'}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-800">
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1 font-bold">E-mail</span>
                        <div className="flex items-center gap-2 text-stone-300">
                          <Mail className="h-4 w-4 text-rose-500 shrink-0" />
                          <span>{contactForm.email || 'contato@clinica.com'}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-800">
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-2 font-bold">Botão Flutuante do WhatsApp</span>
                        <div className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full font-bold text-xs shadow-md">
                          <MessageCircle className="h-4 w-4" />
                          <span>Mensagem (wa.me/{contactForm.whatsappNumber.replace(/\D/g, '') || '55...'})</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-800">
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-2 font-bold">Redes Sociais</span>
                        <div className="flex items-center gap-3">
                          {contactForm.instagramUrl && (
                            <div className="w-8 h-8 rounded-full border border-stone-700 flex items-center justify-center text-rose-400">
                              <Instagram className="h-4 w-4" />
                            </div>
                          )}
                          {contactForm.facebookUrl && (
                            <div className="w-8 h-8 rounded-full border border-stone-700 flex items-center justify-center text-rose-400">
                              <Facebook className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ================= DATABASE (SUPABASE) TAB ================= */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                    <Database className="h-5 w-5 text-rose-600" />
                    <span>Conexão e Estrutura do Banco de Dados (Supabase)</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Verifique o status em tempo real da conexão com o Supabase e configure as tabelas e permissões.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestDatabase}
                    disabled={isTestingDb}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <RefreshCw className={`h-4 w-4 ${isTestingDb ? 'animate-spin' : ''}`} />
                    <span>{isTestingDb ? 'Testando...' : 'Testar Conexão em Tempo Real'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySqlScript}
                    className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-stone-700 shadow-md"
                  >
                    <Copy className="h-4 w-4 text-rose-400" />
                    <span>{sqlCopied ? 'SQL Copiado!' : 'Copiar Script SQL Completo'}</span>
                  </button>
                </div>
              </div>

              {/* Status Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Status Geral</span>
                    {isSupabaseConfigured() ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        <Check className="h-3 w-3" /> Configurado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        <AlertCircle className="h-3 w-3" /> Modo Local (Offline)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 pt-1">
                    {isSupabaseConfigured()
                      ? 'Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY detectadas.'
                      : 'Nenhuma credencial do Supabase detectada no ambiente.'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Persistência Banners</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950/80 dark:text-rose-300 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="h-3 w-3" /> Local + Cloud Sync
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 pt-1">
                    {promotions.length} banners ativos em memória e sincronizados com a tabela <code>promotions</code>.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Permissões RLS</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 bg-purple-100 dark:bg-purple-950/80 dark:text-purple-300 px-2 py-0.5 rounded-full">
                      <Server className="h-3 w-3" /> Leitura & Gravação
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 pt-1">
                    Políticas configuradas para salvar banners, serviços e formulários via chave pública.
                  </p>
                </div>
              </div>

              {/* Diagnostic Test Output */}
              {dbDiagnostics && (
                <div className="p-5 bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 space-y-3 shadow-lg animate-fade-in">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <h4 className="font-bold text-sm flex items-center gap-2 text-rose-400">
                      <Terminal className="h-4 w-4" />
                      Resultado dos Testes de Conexão das Tabelas
                    </h4>
                    <span className="text-[11px] text-stone-400">
                      {dbDiagnostics.filter((d) => d.status === 'ok').length} de {dbDiagnostics.length} tabelas OK
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {dbDiagnostics.map((diag) => (
                      <div
                        key={diag.table}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                          diag.status === 'ok'
                            ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                            : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                        }`}
                      >
                        {diag.status === 'ok' ? (
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-0.5">
                          <p className="font-bold">{diag.label}</p>
                          <p className="text-[11px] opacity-80">{diag.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions on running the SQL script */}
              <div className="p-6 bg-rose-50/60 dark:bg-stone-800/60 rounded-3xl border border-rose-200 dark:border-stone-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-rose-600" />
                    Como sincronizar e corrigir todas as tabelas no Supabase (Passo a Passo)
                  </h4>
                  <button
                    onClick={handleCopySqlScript}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copiar Script SQL
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-700 dark:text-stone-300">
                  <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2 shadow-sm">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                    <h5 className="font-bold text-stone-900 dark:text-stone-100">Abra o SQL Editor</h5>
                    <p className="text-stone-500">
                      Acesse o painel do seu projeto no Supabase (<strong>app.supabase.com</strong>) e clique em <strong>SQL Editor</strong> no menu lateral.
                    </p>
                  </div>

                  <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2 shadow-sm">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                    <h5 className="font-bold text-stone-900 dark:text-stone-100">Cole o Script SQL</h5>
                    <p className="text-stone-500">
                      Clique no botão <strong>"Copiar Script SQL Completo"</strong> acima, crie uma nova query (New Query) no Supabase e cole todo o conteúdo.
                    </p>
                  </div>

                  <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2 shadow-sm">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                    <h5 className="font-bold text-stone-900 dark:text-stone-100">Clique em RUN</h5>
                    <p className="text-stone-500">
                      Clique no botão verde <strong>Run</strong>. O script criará ou atualizará automaticamente as tabelas (incluindo imagens dos banners) e liberará as permissões RLS.
                    </p>
                  </div>
                </div>

                {/* SQL Code Preview Container */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-600 dark:text-stone-300">
                    <span>Prévia do Script SQL de Migração (Pronto para Execução):</span>
                    <span className="text-[11px] text-stone-400 font-mono">20260813_fix_all_tables.sql</span>
                  </div>
                  <div className="relative">
                    <pre className="p-4 bg-stone-950 text-stone-300 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-64 border border-stone-800 leading-relaxed scrollbar-thin">
                      {SUPABASE_FULL_MIGRATION_SQL}
                    </pre>
                    <button
                      onClick={handleCopySqlScript}
                      className="absolute top-3 right-3 px-3 py-1.5 bg-stone-800/90 hover:bg-stone-700 text-white text-xs font-bold rounded-lg border border-stone-700 flex items-center gap-1.5 transition-all cursor-pointer shadow"
                    >
                      <Copy className="h-3.5 w-3.5 text-rose-400" />
                      <span>{sqlCopied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= SEO & GOOGLE TAB ================= */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                    <Search className="h-5 w-5 text-emerald-500" />
                    Otimização para Busca do Google (SEO)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Configuração completa de indexação, metadados, sitemap e dados estruturados para aparecer no topo do Google
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="h-4 w-4" />
                  SEO 100% Configurado
                </div>
              </div>

              {/* Google Search Live Snippet Simulation */}
              <div className="p-6 bg-stone-50 dark:bg-stone-800/60 rounded-3xl border border-stone-200 dark:border-stone-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    Como seu site aparece nos resultados do Google:
                  </h4>
                  <span className="text-[11px] text-stone-400 font-mono">Prévia em tempo real</span>
                </div>

                <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-1.5 shadow-sm max-w-2xl font-sans">
                  <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                    <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center text-white text-[10px] font-bold">C</div>
                    <span className="truncate">https://centraldaestetica.com.br</span>
                    <span className="text-stone-300 dark:text-stone-600">›</span>
                    <span className="text-stone-500">sao-paulo</span>
                  </div>
                  <h4 className="text-lg text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer leading-snug">
                    Central da Estética | Clínica de Estética em São Paulo - Jardins & Paulista
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    Clínica de Estética de Alta Performance em São Paulo (Jardim Paulista). Especialistas em Secagem de Vasinhos (Laser e PEIM), Botox, Ultraformer MPT, Laser Lavieén, Bioestimuladores de Colágeno e Gordura Localizada.
                  </p>
                  <div className="pt-2 flex items-center gap-3 text-[11px] text-stone-500 border-t border-stone-100 dark:border-stone-800 flex-wrap">
                    <span className="text-amber-500 font-bold">★ 4.9 (91 avaliações no Google)</span>
                    <span>•</span>
                    <span>Jardim Paulista, São Paulo - SP</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Aberto até 20:00</span>
                  </div>
                </div>
              </div>

              {/* Status of Key SEO Assets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sitemap XML Box */}
                <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-rose-600" />
                      Sitemap XML para o Google
                    </h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Ativo
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Arquivo que lista todas as páginas e tratamentos para os robôs do Google indexarem rapidamente.
                  </p>
                  <div className="p-2.5 bg-stone-100 dark:bg-stone-800 rounded-xl font-mono text-xs text-stone-800 dark:text-stone-200 flex items-center justify-between gap-2 overflow-x-auto">
                    <span className="truncate">https://centraldaestetica.com.br/sitemap.xml</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://centraldaestetica.com.br/sitemap.xml');
                        setNotification('Link do Sitemap copiado com sucesso!');
                        setTimeout(() => setNotification(null), 3000);
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-stone-700 hover:bg-stone-200 text-stone-900 dark:text-white rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer shadow-2xs"
                    >
                      Copiar URL
                    </button>
                  </div>
                </div>

                {/* Robots.txt Box */}
                <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Robots.txt & Diretivas de Crawling
                    </h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Liberado
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Instrui o Googlebot e Bingbot a rastrear todas as páginas públicas e imagens da clínica.
                  </p>
                  <div className="p-2.5 bg-stone-100 dark:bg-stone-800 rounded-xl font-mono text-xs text-stone-800 dark:text-stone-200 flex items-center justify-between gap-2 overflow-x-auto">
                    <span className="truncate">https://centraldaestetica.com.br/robots.txt</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://centraldaestetica.com.br/robots.txt');
                        setNotification('Link do Robots.txt copiado com sucesso!');
                        setTimeout(() => setNotification(null), 3000);
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-stone-700 hover:bg-stone-200 text-stone-900 dark:text-white rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer shadow-2xs"
                    >
                      Copiar URL
                    </button>
                  </div>
                </div>
              </div>

              {/* Checklist of Configured Structured Data */}
              <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-700 space-y-4 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Recursos Avançados de SEO Instalados no Site
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      ✓ Schema LocalBusiness & MedicalClinic
                    </span>
                    <p className="text-stone-500">Informa ao Google endereço, horário, telefone, raio de atuação e especialidades.</p>
                  </div>

                  <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      ✓ FAQPage Rich Snippets
                    </span>
                    <p className="text-stone-500">Permite que o Google exiba perguntas e respostas expansíveis direto no resultado da busca.</p>
                  </div>

                  <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      ✓ Local SEO (Geotags SP)
                    </span>
                    <p className="text-stone-500">Coordenadas geográficas exatas (-23.5658, -46.6625) para buscas por "estética perto de mim".</p>
                  </div>

                  <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      ✓ Open Graph & WhatsApp Preview
                    </span>
                    <p className="text-stone-500">Gera card bonito com foto, título e descrição ao compartilhar links no WhatsApp e Instagram.</p>
                  </div>

                  <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      ✓ BreadcrumbList & WebSite
                    </span>
                    <p className="text-stone-500">Estrutura de navegação para sitelinks secundários nos resultados do Google.</p>
                  </div>

                  <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      ✓ Dynamic Head Tags (React)
                    </span>
                    <p className="text-stone-500">Atualiza automaticamente o título e descrição ao abrir cada tratamento e post de blog.</p>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Guide for Google Search Console */}
              <div className="p-6 bg-rose-50/60 dark:bg-stone-800/60 rounded-3xl border border-rose-200 dark:border-stone-700 space-y-4">
                <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-rose-600" />
                  Como enviar seu site ao Google Search Console (Guia Rápido)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-700 dark:text-stone-300">
                  <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2 shadow-sm">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                    <h5 className="font-bold text-stone-900 dark:text-stone-100">Acesse o Search Console</h5>
                    <p className="text-stone-500">
                      Entre em <strong>search.google.com/search-console</strong> com seu e-mail do Google e adicione a propriedade do seu domínio.
                    </p>
                  </div>

                  <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2 shadow-sm">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                    <h5 className="font-bold text-stone-900 dark:text-stone-100">Envie o Sitemap</h5>
                    <p className="text-stone-500">
                      No menu lateral esquerdo, clique em <strong>Sitemaps</strong>, digite <code>sitemap.xml</code> no campo e clique em <strong>Enviar</strong>.
                    </p>
                  </div>

                  <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2 shadow-sm">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                    <h5 className="font-bold text-stone-900 dark:text-stone-100">Indexação Rápida</h5>
                    <p className="text-stone-500">
                      O Google rastreará automaticamente todas as páginas e começará a exibir a clínica nas buscas orgânicas de São Paulo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
