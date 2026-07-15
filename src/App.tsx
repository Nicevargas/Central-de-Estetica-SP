/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Send,
  Calendar,
  Clock,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Heart,
  CheckCircle2,
  Trash2,
  Instagram,
  Facebook
} from 'lucide-react';
import { TREATMENTS, TESTIMONIALS, FAQS } from './data';
import { BookingRequest, Treatment } from './types';
import BookingModal from './components/BookingModal';
import TreatmentCard from './components/TreatmentCard';
import ActiveBookingsList from './components/ActiveBookingsList';

import logoUrl from './assets/images/logo.png';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'tratamentos'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preSelectedTreatment, setPreSelectedTreatment] = useState<string>('');
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [showStory, setShowStory] = useState(false);

  // Load bookings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('central_estetica_bookings');
    if (saved) {
      try {
        setBookings(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing bookings', e);
      }
    }
  }, []);

  // Sync scroll on tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleBookingSuccess = (newBooking: BookingRequest) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleCancelBooking = (id: string) => {
    const updated = bookings.filter((b) => b.id !== id);
    setBookings(updated);
    localStorage.setItem('central_estetica_bookings', JSON.stringify(updated));
  };

  const triggerBooking = (treatmentId: string = '') => {
    setPreSelectedTreatment(treatmentId);
    setIsBookingOpen(true);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-outline-variant/10 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo with high-res asset link */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 text-left cursor-pointer focus:outline-none"
          >
            <img
              src={logoUrl}
              alt="Central da Estética Logo"
              className="h-24 md:h-32 lg:h-36 w-auto object-contain max-h-36 transition-all duration-300 hover:scale-[1.02]"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setActiveTab('home')}
              className={`font-semibold text-sm transition-all cursor-pointer pb-1 border-b-2 ${
                activeTab === 'home'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-primary'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => {
                setActiveTab('home');
                setTimeout(() => {
                  document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="font-semibold text-sm text-on-surface-variant hover:text-primary transition-all cursor-pointer"
            >
              Sobre Nós
            </button>
            <button
              onClick={() => setActiveTab('tratamentos')}
              className={`font-semibold text-sm transition-all cursor-pointer pb-1 border-b-2 ${
                activeTab === 'tratamentos'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-primary'
              }`}
            >
              Tratamentos
            </button>
            <button
              onClick={() => {
                setActiveTab('home');
                setTimeout(() => {
                  document.getElementById('depoimentos')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="font-semibold text-sm text-on-surface-variant hover:text-primary transition-all cursor-pointer"
            >
              Depoimentos
            </button>
            <button
              onClick={() => {
                const footer = document.getElementById('contato');
                footer?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-semibold text-sm text-on-surface-variant hover:text-primary transition-all cursor-pointer"
            >
              Contato
            </button>
          </nav>

          {/* Action button */}
          <div className="hidden md:block">
            <button
              onClick={() => triggerBooking()}
              className="primary-gradient text-white px-6 py-2.5 rounded-full font-semibold text-sm shadow-premium transition-all hover:opacity-90 active:scale-95 cursor-pointer"
            >
              Agendar Consulta
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:text-primary"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-outline-variant/10 overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-4">
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setIsMenuOpen(false);
                  }}
                  className={`text-left font-semibold text-sm py-2 ${
                    activeTab === 'home' ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  Início
                </button>
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setIsMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-left font-semibold text-sm py-2 text-on-surface-variant"
                >
                  Sobre Nós
                </button>
                <button
                  onClick={() => {
                    setActiveTab('tratamentos');
                    setIsMenuOpen(false);
                  }}
                  className={`text-left font-semibold text-sm py-2 ${
                    activeTab === 'tratamentos' ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  Tratamentos
                </button>
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setIsMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById('depoimentos')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-left font-semibold text-sm py-2 text-on-surface-variant"
                >
                  Depoimentos
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-left font-semibold text-sm py-2 text-on-surface-variant"
                >
                  Contato
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    triggerBooking();
                  }}
                  className="primary-gradient text-white w-full py-3 rounded-full font-semibold text-sm text-center shadow-premium"
                >
                  Agendar Consulta
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Container */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            /* Home View */
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <section className="relative overflow-hidden pt-12 pb-20 md:py-24">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="h-4 w-4 text-primary" />
                      12 Anos de Excelência no Jardim Paulista
                    </div>
                    <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-tight">
                      Sua melhor versão, com o <span className="gradient-text">cuidado</span> que você merece
                    </h1>
                    <p className="text-on-surface-variant text-base sm:text-lg max-w-lg leading-relaxed">
                      Especialistas em estética facial e corporal com foco em resultados naturais e atendimento humanizado. Transforme sua autoestima hoje mesmo em nosso refúgio de bem-estar.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <button
                        onClick={() => triggerBooking()}
                        className="primary-gradient text-white px-8 py-4 rounded-full font-semibold text-sm shadow-premium transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Agendar Avaliação
                      </button>
                      <button
                        onClick={() => setActiveTab('tratamentos')}
                        className="bg-white border border-primary text-primary px-8 py-4 rounded-full font-semibold text-sm hover:bg-primary/5 transition-all cursor-pointer"
                      >
                        Conhecer Procedimentos
                      </button>
                    </div>
                  </div>

                  {/* Hero Image Side */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-secondary/10 rounded-[40px] rotate-3 -z-10 scale-105" />
                    <div className="w-full aspect-[4/3] sm:aspect-[16/11] lg:h-[480px] rounded-[40px] overflow-hidden shadow-2xl relative">
                      <img
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZO37IGhwP5FFzMDc9vMCFDN1WSuB7x9YaUardfp4LRJ9lcf4ZBjoSoORRaujD3f2_WIk_U-2WwSy8rIyfp8LrISTLfCzJNRToZmYrbQ47M9C6TYwk6lAVBK54rc8epP2muwWL7N8hWtHnHCns-reg5R74JWfXb_0pH-6hGxR3TkF3-lu28LIgi_tZnwLDMKz2Bv5_EWcyT7zZLTE0O71Op1g91nwI-HTEqDVrH4oUnBBQs9CKa5SMmw"
                        alt="Interior luxuoso da clínica com esteticista e paciente"
                        referrerPolicy="no-referrer"
                      />
                      {/* Floating Badge */}
                      <div className="absolute bottom-6 left-6 glass-card p-4 rounded-2xl flex items-center gap-3 animate-bounce-slow shadow-lg">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                          <Star className="h-5 w-5 fill-current" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-primary uppercase tracking-wider">82% de Recomendação</div>
                          <div className="text-[10px] text-on-surface-variant font-semibold">91 avaliações de clientes no Google</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Specialties Bento Grid Section */}
              <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4 text-primary">Nossas Especialidades</h2>
                    <p className="text-on-surface-variant text-sm sm:text-base">
                      Protocolos exclusivos desenhados para realçar sua beleza natural através de alta ciência, conforto e tecnologias avançadas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Specialty Facial */}
                    <div
                      onClick={() => setActiveTab('tratamentos')}
                      className="group relative overflow-hidden rounded-3xl h-[450px] transition-all hover:shadow-premium cursor-pointer"
                    >
                      <img
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP4m6144rNpH3MR3Yd2x65vOZV-K6_zu4pMfn85JHgeuYwzx-k33u-oPr_qsUuNYfdjwEAlC5aVYdAtJWWSGuKOi4Z8Jehfyip7u9zml0VrJ5RcJFL-IJh0EpGv2sHK_25IVngs7AzF607z0ywj2k6z2NLl9qWh8HET3S1KQxUW6vfT8_72Ina_9j3Ewjv_jl183Dxc3OIhnAXtIxdvagDS-gyziVeVDIbz-SCYQRFtRaYDRxBNHQCHg"
                        alt="Estética Facial"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-2">
                          Renovação
                        </span>
                        <h3 className="font-serif text-2xl font-bold mb-1">Estética Facial</h3>
                        <p className="text-white/80 text-xs mb-4">Limpeza de pele, Botox, Microagulhamento e Harmonização.</p>
                        <span className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-wider hover:translate-x-2 transition-transform">
                          Ver Detalhes <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>

                    {/* Specialty Corporal */}
                    <div
                      onClick={() => setActiveTab('tratamentos')}
                      className="group relative overflow-hidden rounded-3xl h-[450px] transition-all hover:shadow-premium cursor-pointer"
                    >
                      <img
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdALPIr_mYm1IpZ7vCO9l1Ig0tpHhxV3V-0HKjFn9mecvFZyxFIyylHXBV5Cz0TWimfvBzTHZ0nmbiEBz5JkCoWJbCOkasFfIIzfs_541sZQS0n7fk332hqrrCuGN0lJei0Iwcvd2sWoE8c1vOUEAAJ655BarsW0f5bgvY0okJpDpZJ0MUvVr8rCak0xGAH6SF1ciLhUB1P9MeTgbUQPRQbVAEqtDa6c_6Y2OGYVmXLqBBfjkNEIrQRw"
                        alt="Estética Corporal"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-2">
                          Modelagem
                        </span>
                        <h3 className="font-serif text-2xl font-bold mb-1">Estética Corporal</h3>
                        <p className="text-white/80 text-xs mb-4">Velashape, Criofrequência, Enzimas e Redução de Medidas.</p>
                        <span className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-wider hover:translate-x-2 transition-transform">
                          Ver Detalhes <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>

                    {/* Specialty Bem-estar */}
                    <div
                      onClick={() => setActiveTab('tratamentos')}
                      className="group relative overflow-hidden rounded-3xl h-[450px] transition-all hover:shadow-premium cursor-pointer"
                    >
                      <img
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlNRER5pcRT8jVZDUAsbU1dE5aj8KHV8-5n7nCvRpJ-Xo-nvz1YbcCyZSvENgxp0MwwwfAcgU1OqcRNLHxzj90fvm5tAX6VoX3QbVBouAmeseo4JB3o2ORLuLwKSxW2pxkluXBBT-hUBeRNTOjEb_17q3h1QK0iGn6p4SQOtxx3pwoHSB8LwyenAIUwgE2qDCpe8i0d9UaMhT67lCPIDZnn73SweBwDlOaYAv0apsiIObncjLC4yUlgw"
                        alt="Bem-estar e Relaxamento"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-container/95 via-primary-container/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-2">
                          Equilíbrio
                        </span>
                        <h3 className="font-serif text-2xl font-bold mb-1">Bem-estar</h3>
                        <p className="text-white/80 text-xs mb-4">Drenagem Linfática, Relaxamento Corporal e Terapias Integrativas.</p>
                        <span className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-wider hover:translate-x-2 transition-transform">
                          Ver Detalhes <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* About Section */}
              <section id="sobre" className="py-20 bg-background overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="relative">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
                    <img
                      className="w-full h-[500px] object-cover rounded-3xl relative z-10 shadow-lg border border-outline-variant/10"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPkP79yfHeUo-2aSlqT3E85RxxjYwPMgle6gcABtq5r-jaLCAoJJRakALwaVp6GnfiOZnRP-ItrW3RuChGKaQQWkbewhX7Wlm2Ri230qovFwpUOm4mY9zbEEwVVV1e1litAmfcdiy1HHQAACfYh2fMjg5ECW8dZ-fLlHnCZyGHtVMLtczNadKzTqDr9x1kVXhVom4Yxvz6oyZK14lRnXZ0kHoRt6xEmo3GfSfBeM_674NTuR_ynyQhIQ"
                      alt="Headshot profissional da esteticista no ambiente clínico"
                      referrerPolicy="no-referrer"
                    />
                    {/* Floating badge */}
                    <div className="absolute -bottom-6 -right-6 glass-card p-6 rounded-2xl z-20 max-w-xs shadow-xl">
                      <div className="font-serif text-primary text-5xl font-bold mb-1">12</div>
                      <div className="text-xs font-bold uppercase tracking-wider text-on-surface">Anos de Mercado</div>
                      <p className="text-xs text-on-surface-variant mt-2 font-medium">
                        Referência consolidada em atendimento estético humanizado em São Paulo.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary leading-tight">
                      Excelência que se sente no <span className="gradient-text">toque</span>
                    </h2>
                    <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed">
                      A Central da Estética nasceu no coração do Jardim Paulista do desejo sincero de proporcionar mais do que apenas tratamentos estéticos isolados. Buscamos resgatar a autoconfiança profunda de cada cliente através de uma escuta genuína e protocolos sob medida de última geração.
                    </p>

                    <ul className="space-y-4 pt-2">
                      <li className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Heart className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-sm text-on-surface">Ambiente acolhedor, altamente privativo e esterilizado</span>
                      </li>
                      <li className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-sm text-on-surface">Equipamentos tecnológicos e agulhas certificadas</span>
                      </li>
                      <li className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-sm text-on-surface">Resultados focados em rejuvenescimento natural (sem exageros)</span>
                      </li>
                    </ul>

                    <div className="pt-2">
                      <button
                        onClick={() => setShowStory(!showStory)}
                        className="bg-white border border-primary text-primary px-6 py-3 rounded-full font-semibold text-sm shadow-sm hover:bg-primary/5 transition-all inline-flex items-center gap-2 cursor-pointer"
                      >
                        {showStory ? 'Recolher nossa história' : 'Conheça nossa história'}
                        <BookOpen className="h-4 w-4" />
                      </button>
                    </div>

                    <AnimatePresence>
                      {showStory && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-white rounded-2xl p-6 border border-outline-variant/15 text-sm text-on-surface-variant space-y-3 leading-relaxed mt-4"
                        >
                          <p>
                            Fundada em 2014, a Central da Estética iniciou com o objetivo de democratizar o acesso à estética de alta qualidade no Jardim Paulista. Acreditamos que a beleza é a expressão exterior de uma saúde equilibrada e do bem-estar mental.
                          </p>
                          <p>
                            Nossos profissionais realizam constantes especializações internacionais para trazer as técnicas de rejuvenescimento facial e remodelagem corporal mais modernas do mundo, garantindo segurança clínica absoluta.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </section>

              {/* User Dynamic Bookings Section */}
              {bookings.length > 0 && (
                <section className="py-12 bg-white px-6">
                  <ActiveBookingsList bookings={bookings} onCancelBooking={handleCancelBooking} />
                </section>
              )}

              {/* Testimonials Section (Depoimentos) */}
              <section id="depoimentos" className="py-20 bg-surface-container-low overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center mb-16">
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-2">O que dizem nossas clientes</h2>
                    <p className="text-on-surface-variant text-sm sm:text-base">Experiências e relatos de transformação real.</p>
                  </div>

                  <div className="flex gap-8 overflow-x-auto pb-10 snap-x scrollbar-hide scroll-smooth cursor-grab">
                    {TESTIMONIALS.map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className="min-w-[300px] sm:min-w-[400px] snap-center bg-white p-8 rounded-3xl shadow-premium border border-outline-variant/10 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex text-amber-500 mb-4">
                            {[...Array(testimonial.stars)].map((_, i) => (
                              <Star key={i} className="h-5 w-5 fill-current" />
                            ))}
                          </div>
                          <p className="italic text-on-surface-variant text-sm sm:text-base leading-relaxed mb-6">
                            "{testimonial.text}"
                          </p>
                        </div>
                        <div className="flex items-center gap-4 border-t border-outline-variant/10 pt-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${testimonial.avatarBg}`}>
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-on-surface">{testimonial.name}</div>
                            <div className="text-xs text-on-surface-variant">{testimonial.role}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            /* Treatments Detailed View */
            <motion.div
              key="tratamentos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="py-12"
            >
              <section className="max-w-7xl mx-auto px-6">
                {/* Treatments Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary mb-4">Nossos Tratamentos</h1>
                  <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
                    Descubra nossa curadoria exclusiva de tratamentos estéticos corporais, faciais e bem-estar. Escolha o ideal para suas necessidades e agende uma avaliação personalizada.
                  </p>
                </div>

                {/* Sub Tab filters */}
                <div className="flex justify-center gap-4 mb-16 overflow-x-auto pb-2 scrollbar-hide">
                  <a
                    href="#facial"
                    className="flex flex-col items-center gap-2 group shrink-0 min-w-[100px]"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('facial')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-sm border border-outline-variant/20 group-hover:border-primary group-hover:bg-primary/5 transition-all duration-300">
                      <Sparkles className="h-7 w-7 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Facial</span>
                  </a>

                  <a
                    href="#corporal"
                    className="flex flex-col items-center gap-2 group shrink-0 min-w-[100px]"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('corporal')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-sm border border-outline-variant/20 group-hover:border-primary group-hover:bg-primary/5 transition-all duration-300">
                      <Heart className="h-7 w-7 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Corporal</span>
                  </a>

                  <a
                    href="#bem-estar"
                    className="flex flex-col items-center gap-2 group shrink-0 min-w-[100px]"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('bem-estar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-sm border border-outline-variant/20 group-hover:border-primary group-hover:bg-primary/5 transition-all duration-300">
                      <MessageSquare className="h-7 w-7 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Bem-estar</span>
                  </a>
                </div>

                {/* User Bookings list in treatments if exists */}
                {bookings.length > 0 && (
                  <div className="mb-16">
                    <ActiveBookingsList bookings={bookings} onCancelBooking={handleCancelBooking} />
                  </div>
                )}

                {/* Facial section */}
                <div id="facial" className="pt-10 scroll-mt-24">
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">Estética Facial</h2>
                    <div className="h-[1px] flex-grow bg-outline-variant/20" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {TREATMENTS.filter((t) => t.category === 'facial').map((t) => (
                      <TreatmentCard key={t.id} treatment={t} onSelect={(id) => triggerBooking(id)} />
                    ))}
                  </div>
                </div>

                {/* Corporal section */}
                <div id="corporal" className="pt-20 scroll-mt-24">
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">Estética Corporal</h2>
                    <div className="h-[1px] flex-grow bg-outline-variant/20" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {TREATMENTS.filter((t) => t.category === 'corporal').map((t) => (
                      <React.Fragment key={t.id}>
                        {t.highlight ? (
                          <div className="md:col-span-2 col-span-1 flex flex-col h-full">
                            <TreatmentCard treatment={t} onSelect={(id) => triggerBooking(id)} />
                          </div>
                        ) : (
                          <div className="md:col-span-1 col-span-1 flex flex-col h-full">
                            <TreatmentCard treatment={t} onSelect={(id) => triggerBooking(id)} />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Wellness section */}
                <div id="bem-estar" className="pt-20 scroll-mt-24">
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">Bem-estar &amp; Relaxamento</h2>
                    <div className="h-[1px] flex-grow bg-outline-variant/20" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {TREATMENTS.filter((t) => t.category === 'bem-estar').map((t) => (
                      <div
                        key={t.id}
                        className="glass-card p-6 sm:p-10 rounded-3xl flex flex-col sm:flex-row gap-6 sm:gap-8 items-center border-white/40 shadow-sm"
                      >
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-xl">
                          <img
                            src={t.image}
                            alt={t.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between h-full text-center sm:text-left">
                          <div>
                            <h3 className="font-serif text-xl font-bold text-primary mb-2">{t.name}</h3>
                            <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">{t.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-auto border-t border-outline-variant/10 pt-4 flex-col sm:flex-row gap-2">
                            <span className="text-primary font-bold text-sm sm:text-base">{t.duration} • {t.price}</span>
                            <button
                              onClick={() => triggerBooking(t.id)}
                              className="px-6 py-2 bg-primary text-white rounded-full font-bold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer"
                            >
                              Agendar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ section */}
                <section className="pt-24 max-w-3xl mx-auto">
                  <h2 className="font-serif text-3xl font-bold text-center text-primary mb-10">Dúvidas Frequentes</h2>
                  <div className="space-y-4">
                    {FAQS.map((faq) => (
                      <div
                        key={faq.id}
                        className="bg-white rounded-xl shadow-sm border border-outline-variant/15 overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                          className="w-full flex justify-between items-center p-6 text-left font-semibold text-on-surface select-none hover:text-primary transition-colors cursor-pointer"
                        >
                          <span>{faq.question}</span>
                          <span className={`material-symbols-outlined transition-transform duration-300 ${
                            openFaqId === faq.id ? 'rotate-180' : ''
                          }`}>
                            expand_more
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {openFaqId === faq.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 pt-0 text-sm sm:text-base text-on-surface-variant border-t border-outline-variant/5 leading-relaxed bg-surface/30">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </section>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call to Action Banner (General template) */}
        <section className="py-20 relative overflow-hidden my-12">
          <div className="absolute inset-0 primary-gradient opacity-95" />
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10 text-white">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Pronta para viver sua transformação?
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto mb-10 opacity-90 leading-relaxed">
              Nossa equipe médica e estética está pronta para desenhar um protocolo exclusivo para a sua pele e biotipo. Agende hoje mesmo sua avaliação personalizada.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => triggerBooking()}
                className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-sm shadow-xl hover:scale-105 transition-all w-full sm:w-auto cursor-pointer"
              >
                Falar com Especialista
              </button>
              <button
                onClick={() => {
                  window.open('https://wa.me/551130521400', '_blank');
                }}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-white hover:text-primary transition-all w-full sm:w-auto cursor-pointer"
              >
                Ver Agenda no WhatsApp
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer component */}
      <footer id="contato" className="pt-20 pb-10 bg-surface-container-lowest border-t border-outline-variant/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 max-w-7xl mx-auto">
          {/* Col 1 - Logo & social links */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <img
              alt="Central da Estética Logo"
              className="h-24 md:h-32 lg:h-36 w-auto object-contain max-h-36 transition-all duration-300 hover:scale-[1.02]"
              src={logoUrl}
              referrerPolicy="no-referrer"
            />
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Sua melhor versão, com o cuidado que você merece. Especialistas em beleza, rejuvenescimento e estética integrada no Jardim Paulista.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="https://instagram.com/CENTRALDAESTETICASP"
                target="_blank"
                rel="noopener noreferrer"
                title="Siga-nos no Instagram"
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com/CENTRALDAESTETICASP"
                target="_blank"
                rel="noopener noreferrer"
                title="Siga-nos no Facebook"
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Col 2 - Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-on-surface uppercase tracking-wider">Links Rápidos</h4>
            <ul className="space-y-3 text-sm text-on-surface-variant font-medium">
              <li>
                <button
                  onClick={() => setActiveTab('home')}
                  className="hover:text-primary transition-colors cursor-pointer text-left"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setTimeout(() => {
                      document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-primary transition-colors cursor-pointer text-left"
                >
                  Sobre Nós
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('tratamentos')}
                  className="hover:text-primary transition-colors cursor-pointer text-left"
                >
                  Todos os Tratamentos
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setTimeout(() => {
                      document.getElementById('depoimentos')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-primary transition-colors cursor-pointer text-left"
                >
                  Depoimentos
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 - Physical Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-on-surface uppercase tracking-wider">Endereço &amp; Contato</h4>
            <div className="space-y-2.5 text-sm text-on-surface-variant leading-relaxed">
              <p className="flex items-start gap-2">
                <MapPin className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                <span>
                  Rua Artur Frazão, 33<br />
                  Jardim Paulista, São Paulo - SP<br />
                  Brasil, CEP 01423-030
                </span>
              </p>
              <p className="flex items-center gap-2 font-bold text-primary">
                <Phone className="h-4.5 w-4.5" />
                <span>(11) 3052-1400 / 3052-1372</span>
              </p>
              <p className="flex items-center gap-2 font-medium text-on-surface">
                <Mail className="h-4.5 w-4.5 text-primary" />
                <span>contatocentraldaestetica@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Col 4 - Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-on-surface uppercase tracking-wider">Newsletter</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Assine nossa newsletter e receba novidades e dicas exclusivas de autocuidado e estética no seu email.
            </p>
            {!newsletterSubscribed ? (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  required
                  className="flex-1 bg-white border border-outline-variant/60 rounded-full px-4 text-xs focus:outline-none focus:border-primary transition-all py-2.5"
                />
                <button
                  type="submit"
                  className="primary-gradient text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all shrink-0 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-3 bg-green-50 text-green-700 text-xs rounded-xl border border-green-200 font-medium"
              >
                Obrigado por se inscrever!
              </motion.div>
            )}
          </div>
        </div>

        {/* Legal area */}
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant font-medium">
          <div>© 2026 Clínica de Estética. Todos os direitos reservados.</div>
          <div className="flex gap-6">
            <button className="hover:text-primary transition-colors cursor-pointer">Privacidade</button>
            <button className="hover:text-primary transition-colors cursor-pointer">Termos de Uso</button>
            <button className="hover:text-primary transition-colors cursor-pointer">Mapa do Site</button>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Action FAB Button */}
      <a
        href="https://wa.me/551130521400"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group"
      >
        <svg
          className="h-5 w-5 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.705 1.456h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="font-bold text-sm hidden sm:inline">Mensagem</span>
      </a>

      {/* Booking Modal Dialog Component */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedTreatmentId={preSelectedTreatment}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
}
