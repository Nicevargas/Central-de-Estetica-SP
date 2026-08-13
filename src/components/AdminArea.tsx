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
  Share2
} from 'lucide-react';
import { Treatment, Promotion, Testimonial, BlogPost, BookingRequest, ContactInfo } from '../types';

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

  const [activeTab, setActiveTab] = useState<'treatments' | 'promotions' | 'testimonials' | 'blog' | 'bookings' | 'contact'>('treatments');
  const [notification, setNotification] = useState<string | null>(null);

  // Form Editing States
  const [editingTreatment, setEditingTreatment] = useState<Partial<Treatment> | null>(null);
  const [editingPromo, setEditingPromo] = useState<Partial<Promotion> | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [treatmentImageStatus, setTreatmentImageStatus] = useState<'idle' | 'ok' | 'error'>('idle');

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
      const updated = treatments.map((t) => (t.id === editingTreatment.id ? ({ ...t, ...editingTreatment } as Treatment) : t));
      onSaveTreatments(updated);
      notify('Serviço/Tratamento atualizado com sucesso!');
    } else {
      // Create
      const newTreatment: Treatment = {
        id: `treatment-${Date.now()}`,
        name: editingTreatment.name || 'Novo Tratamento',
        description: editingTreatment.description || '',
        category: editingTreatment.category || 'facial',
        price: editingTreatment.price || 'R$ 0,00',
        duration: editingTreatment.duration || '30 min',
        image: editingTreatment.image || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        benefits: editingTreatment.benefits || ['Qualidade garantida', 'Atendimento personalizado'],
        popular: editingTreatment.popular || false,
      };
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
                      <label className="block text-xs font-bold mb-1">Preço</label>
                      <input
                        type="text"
                        value={editingTreatment.price || ''}
                        onChange={(e) => setEditingTreatment({ ...editingTreatment, price: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        placeholder="Ex: R$ 850,00"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Duração Estimada</label>
                      <input
                        type="text"
                        value={editingTreatment.duration || ''}
                        onChange={(e) => setEditingTreatment({ ...editingTreatment, duration: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        placeholder="Ex: 45 min"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">URL da Imagem</label>
                      <input
                        type="text"
                        value={editingTreatment.image || ''}
                        onChange={(e) => {
                          setEditingTreatment({ ...editingTreatment, image: e.target.value });
                          setTreatmentImageStatus('idle');
                        }}
                        placeholder="https://exemplo.com/foto.jpg (link direto, terminando em .jpg/.jpeg/.png/.webp)"
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                      {editingTreatment.image && (
                        <div className="mt-2 flex items-center gap-3">
                          <img
                            key={editingTreatment.image}
                            src={editingTreatment.image}
                            alt="Pré-visualização"
                            className="h-16 w-16 object-cover rounded-lg border border-stone-200 dark:border-stone-700"
                            onLoad={() => setTreatmentImageStatus('ok')}
                            onError={() => setTreatmentImageStatus('error')}
                          />
                          {treatmentImageStatus === 'ok' && (
                            <span className="text-xs font-semibold text-emerald-600">Link carregado com sucesso.</span>
                          )}
                          {treatmentImageStatus === 'error' && (
                            <span className="text-xs font-semibold text-red-600">
                              Este link não carrega uma imagem diretamente (comum em links do Google Drive, Google Fotos,
                              Instagram ou Canva). Use um link direto de imagem ou envie o arquivo para um serviço de
                              hospedagem de imagens, senão o site vai mostrar a foto padrão no lugar dela.
                            </span>
                          )}
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
                    <div className="md:col-span-2 pt-2 border-t border-rose-200 dark:border-stone-700">
                      <label className="block text-xs font-bold mb-1 text-rose-700 dark:text-rose-400">
                        URL do Vídeo do Procedimento (YouTube / Vimeo / MP4)
                      </label>
                      <input
                        type="text"
                        value={editingTreatment.videoUrl || ''}
                        onChange={(e) => setEditingTreatment({ ...editingTreatment, videoUrl: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      />
                    </div>

                    {/* Fotos Antes e Depois */}
                    <div className="md:col-span-2 pt-2 border-t border-rose-200 dark:border-stone-700">
                      <span className="block text-xs font-bold mb-2 text-rose-700 dark:text-rose-400">
                        Fotos Antes e Depois (Caso de Exemplo)
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold mb-1">URL Imagem ANTES</label>
                          <input
                            type="text"
                            value={editingTreatment.beforeAfterImages?.[0]?.before || ''}
                            onChange={(e) => {
                              const existing = [...(editingTreatment.beforeAfterImages || [])];
                              if (!existing[0]) existing[0] = { before: '', after: '' };
                              existing[0].before = e.target.value;
                              setEditingTreatment({ ...editingTreatment, beforeAfterImages: existing });
                            }}
                            className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold mb-1">URL Imagem DEPOIS</label>
                          <input
                            type="text"
                            value={editingTreatment.beforeAfterImages?.[0]?.after || ''}
                            onChange={(e) => {
                              const existing = [...(editingTreatment.beforeAfterImages || [])];
                              if (!existing[0]) existing[0] = { before: '', after: '' };
                              existing[0].after = e.target.value;
                              setEditingTreatment({ ...editingTreatment, beforeAfterImages: existing });
                            }}
                            className="w-full p-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                            placeholder="https://..."
                          />
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

              {/* Treatments List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {treatments.map((t) => (
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
                          <p className="text-xs text-rose-600 font-extrabold">{t.price || 'Sob Consulta'}</p>
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
                ))}
              </div>
            </div>
          )}

          {/* ================= PROMOTIONS TAB ================= */}
          {activeTab === 'promotions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold">Banners de Promoção (Carrossel Hero)</h3>
                  <p className="text-xs text-stone-500">Altere ofertas, cupons de desconto, vinculação a tratamentos e visibilidade no site</p>
                </div>
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
                      treatmentId: treatments.length > 0 ? treatments[0].id : 'botox',
                      active: true,
                    })
                  }
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Banner</span>
                </button>
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
                    <div className="p-4 bg-gradient-to-r from-rose-100/80 via-amber-50 to-white rounded-2xl border border-rose-300/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {editingPromo.badge || 'PROMOÇÃO'}
                          </span>
                          <span className="text-xs font-extrabold text-rose-700">{editingPromo.discount || '20% OFF'}</span>
                        </div>
                        <h5 className="font-bold text-sm text-stone-900">{editingPromo.title || 'Título da Promoção'}</h5>
                        <p className="text-xs text-stone-600">{editingPromo.subtitle || 'Subtítulo da oferta'}</p>
                      </div>
                      <div className="text-right shrink-0">
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
                {promotions.map((p) => (
                  <div
                    key={p.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      p.active !== false
                        ? 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700'
                        : 'bg-stone-100/50 dark:bg-stone-900/40 border-stone-200/50 dark:border-stone-800 opacity-60'
                    }`}
                  >
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
                      <p className="text-xs text-stone-500">{p.subtitle}</p>
                      <div className="text-xs space-x-2 pt-1">
                        {p.originalPrice && <span className="line-through text-stone-400">{p.originalPrice}</span>}
                        {p.promoPrice && <span className="text-rose-600 font-bold">{p.promoPrice}</span>}
                        <span className="text-stone-400 font-medium">({p.expiresInDays} dias de validade)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
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
                ))}
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
        </div>
      </div>
    </div>
  );
};
