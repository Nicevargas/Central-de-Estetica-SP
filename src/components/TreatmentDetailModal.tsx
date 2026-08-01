import React, { useState } from 'react';
import {
  X,
  Share2,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Video,
  Image as ImageIcon,
  Copy,
  Check,
  Heart,
  FileText,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { Treatment } from '../types';

interface TreatmentDetailModalProps {
  treatment: Treatment | null;
  onClose: () => void;
  onBook: (treatmentId: string) => void;
  whatsappNumber?: string;
}

export default function TreatmentDetailModal({
  treatment,
  onClose,
  onBook,
  whatsappNumber = '551130512433',
}: TreatmentDetailModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'visiting' | 'beforeAfter' | 'video' | 'specs' | 'postcare' | 'specialist'>('visiting');
  const [activeBeforeAfterIdx, setActiveBeforeAfterIdx] = useState(0);

  if (!treatment) return null;

  // Prepare Share URLs
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Confira este procedimento de ${treatment.name} na Central da Estética! ${treatment.price ? `Por ${treatment.price}` : ''}`;
  const rawWhatsappNum = whatsappNumber.replace(/\D/g, '') || '551130512433';
  const whatsappShareUrl = `https://wa.me/${rawWhatsappNum}?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: treatment.name,
          text: shareText,
          url: currentUrl,
        });
      } catch (e) {
        console.log('Shared cancelled or not supported', e);
      }
    } else {
      handleCopyLink();
    }
  };

  // Helper for YouTube embed link parsing
  const getEmbedVideoUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const embedUrl = getEmbedVideoUrl(treatment.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-stone-200 dark:border-stone-800">
        
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all backdrop-blur-md cursor-pointer group"
          title="Fechar janela"
        >
          <X className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Header Hero Banner */}
        <div className="relative h-64 sm:h-72 md:h-80 w-full shrink-0 overflow-hidden bg-stone-950">
          <img
            src={treatment.image}
            alt={treatment.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

          {/* Badge & Category */}
          <div className="absolute top-5 left-5 z-10 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-rose-600 text-white rounded-full shadow-lg">
              {treatment.category === 'facial' ? 'Tratamento Facial' : treatment.category === 'corporal' ? 'Tratamento Corporal' : 'Bem-Estar & SPA'}
            </span>
            {treatment.popular && (
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-400 text-stone-950 rounded-full shadow-lg flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 fill-current" />
                Mais Procurado
              </span>
            )}
            {treatment.highlight && (
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white rounded-full shadow-lg">
                Destaque
              </span>
            )}
          </div>

          {/* Title & Pricing in Hero */}
          <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold leading-tight drop-shadow-md">
              {treatment.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-stone-200 text-sm font-medium">
              {treatment.price && (
                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-amber-300 font-bold text-base border border-white/20">
                  <span>{treatment.price}</span>
                </div>
              )}
              {treatment.duration && (
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-stone-200">
                  <Clock className="h-4 w-4 text-rose-400" />
                  <span>Duração: {treatment.duration}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Share & Quick Actions Bar */}
        <div className="bg-stone-100 dark:bg-stone-800/80 px-6 py-3 border-b border-stone-200 dark:border-stone-700/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300 font-medium">
            <Share2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span>Compartilhar este tratamento:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-[#25D366] text-white hover:bg-[#20ba59] rounded-xl transition-all shadow-sm text-xs font-semibold flex items-center gap-1.5"
              title="Compartilhar no WhatsApp"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <a
              href={facebookShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-[#1877F2] text-white hover:bg-[#166fe0] rounded-xl transition-all shadow-sm text-xs font-semibold flex items-center gap-1.5"
              title="Compartilhar no Facebook"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="hidden sm:inline">Facebook</span>
            </a>

            <button
              onClick={handleCopyLink}
              className="p-2 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Copiar Link"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all shadow-sm text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Mais Opções de Compartilhamento"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Mais</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-6 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex gap-2 py-2">
            <button
              onClick={() => setActiveTab('visiting')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'visiting'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
              }`}
            >
              Visão Geral
            </button>
            
            {treatment.beforeAfterImages && treatment.beforeAfterImages.length > 0 && (
              <button
                onClick={() => setActiveTab('beforeAfter')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'beforeAfter'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Antes e Depois ({treatment.beforeAfterImages.length})</span>
              </button>
            )}

            {embedUrl && (
              <button
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'video'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                <span>Vídeo do Procedimento</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'specs'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Ficha Técnica</span>
            </button>

            {treatment.postCareTips && treatment.postCareTips.length > 0 && (
              <button
                onClick={() => setActiveTab('postcare')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'postcare'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Cuidados Pós-Uso</span>
              </button>
            )}

            {treatment.specialist && (
              <button
                onClick={() => setActiveTab('specialist')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'specialist'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Especialista</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-800 dark:text-stone-200">
          
          {/* TAB: VISÃO GERAL */}
          {activeTab === 'visiting' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold font-serif mb-2 text-stone-900 dark:text-stone-100">
                  Sobre o Procedimento
                </h3>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-sm sm:text-base">
                  {treatment.description}
                </p>
              </div>

              {/* Key Benefits Checklist */}
              {treatment.benefits && treatment.benefits.length > 0 && (
                <div className="bg-rose-50/70 dark:bg-stone-800/60 p-5 rounded-2xl border border-rose-100 dark:border-stone-700/60">
                  <h4 className="font-bold text-sm text-rose-800 dark:text-rose-400 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Principais Benefícios & Resultados
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {treatment.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm font-medium">
                        <CheckCircle2 className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Spec Highlights */}
              {treatment.technicalSpecs && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-center">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Duração</span>
                    <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                      {treatment.technicalSpecs.duration || treatment.duration || '30-60 min'}
                    </span>
                  </div>
                  <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-center">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Anestesia</span>
                    <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                      {treatment.technicalSpecs.anesthesia || 'Tópica / Nenhuma'}
                    </span>
                  </div>
                  <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-center">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Recuperação</span>
                    <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                      {treatment.technicalSpecs.recovery || 'Imediata'}
                    </span>
                  </div>
                  <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-center">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Sessões</span>
                    <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                      {treatment.technicalSpecs.sessionsRequired || 'Personalizada'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ANTES E DEPOIS */}
          {activeTab === 'beforeAfter' && treatment.beforeAfterImages && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold font-serif mb-1 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-rose-600" />
                  Galeria de Resultados Antes & Depois
                </h3>
                <p className="text-xs text-stone-500">
                  Imagens reais de acompanhamento de pacientes tratados em nossa clínica.
                </p>
              </div>

              {/* Selector Tabs if multiple before/after pairs exist */}
              {treatment.beforeAfterImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {treatment.beforeAfterImages.map((pair, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveBeforeAfterIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeBeforeAfterIdx === idx
                          ? 'bg-rose-600 text-white'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      Caso #{idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Current Before & After Pair */}
              {treatment.beforeAfterImages[activeBeforeAfterIdx] && (
                <div className="space-y-3">
                  {treatment.beforeAfterImages[activeBeforeAfterIdx].label && (
                    <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-900 inline-block">
                      {treatment.beforeAfterImages[activeBeforeAfterIdx].label}
                    </span>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Before Image */}
                    <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-md group">
                      <img
                        src={treatment.beforeAfterImages[activeBeforeAfterIdx].before}
                        alt="Resultado Antes"
                        className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-stone-900/80 text-white text-xs font-extrabold px-3 py-1 rounded-lg backdrop-blur-md uppercase tracking-wider">
                        ANTES
                      </span>
                    </div>

                    {/* After Image */}
                    <div className="relative rounded-2xl overflow-hidden border border-rose-300 dark:border-rose-900 shadow-md group">
                      <img
                        src={treatment.beforeAfterImages[activeBeforeAfterIdx].after}
                        alt="Resultado Depois"
                        className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-rose-600/90 text-white text-xs font-extrabold px-3 py-1 rounded-lg backdrop-blur-md uppercase tracking-wider shadow-lg flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        DEPOIS
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: VÍDEO DO PROCEDIMENTO */}
          {activeTab === 'video' && embedUrl && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold font-serif mb-1 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Video className="h-5 w-5 text-rose-600" />
                  Vídeo Demonstrativo do Procedimento
                </h3>
                <p className="text-xs text-stone-500">
                  Assista como o procedimento é realizado com segurança em nossa clínica.
                </p>
              </div>

              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-stone-300 dark:border-stone-800 bg-black">
                <iframe
                  src={embedUrl}
                  title={`Vídeo do procedimento ${treatment.name}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* TAB: FICHA TÉCNICA */}
          {activeTab === 'specs' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold font-serif mb-1 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-rose-600" />
                  Ficha Técnica do Procedimento
                </h3>
                <p className="text-xs text-stone-500">
                  Especificações técnicas e orientações completas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700/80 space-y-1">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    ⏱️ Duração da Sessão
                  </span>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {treatment.technicalSpecs?.duration || treatment.duration || '30 a 60 minutos'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700/80 space-y-1">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    💉 Tipo de Anestesia
                  </span>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {treatment.technicalSpecs?.anesthesia || 'Anestésico tópico / Não necessário'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700/80 space-y-1">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    🩹 Tempo de Recuperação
                  </span>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {treatment.technicalSpecs?.recovery || 'Imediata'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700/80 space-y-1">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    ✨ Visibilidade dos Resultados
                  </span>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {treatment.technicalSpecs?.resultsIn || 'Imediata com evolução em poucos dias'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700/80 space-y-1 sm:col-span-2">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    🎯 Indicado Para
                  </span>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                    {treatment.technicalSpecs?.indicatedFor || treatment.description}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700/80 space-y-1 sm:col-span-2">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    🔄 Sessões Recomendadas
                  </span>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                    {treatment.technicalSpecs?.sessionsRequired || 'Definido em avaliação personalizada'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CUIDADOS PÓS-USO */}
          {activeTab === 'postcare' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold font-serif mb-1 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-rose-600" />
                  Dicas e Cuidados Pós-Procedimento
                </h3>
                <p className="text-xs text-stone-500">
                  Siga rigorosamente estas orientações para garantir o melhor resultado estético com segurança.
                </p>
              </div>

              {treatment.postCareTips && treatment.postCareTips.length > 0 ? (
                <div className="bg-amber-50/70 dark:bg-stone-800/80 p-5 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-3">
                  {treatment.postCareTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-medium">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-stone-950 font-bold text-xs">
                        {idx + 1}
                      </span>
                      <p className="pt-0.5">{tip}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500">Nenhuma recomendação especial cadastrada.</p>
              )}
            </div>
          )}

          {/* TAB: ESPECIALISTA RESPONSÁVEL */}
          {activeTab === 'specialist' && treatment.specialist && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold font-serif mb-1 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-rose-600" />
                  Profissional Responsável
                </h3>
                <p className="text-xs text-stone-500">
                  Conheça a especialista responsável pela realização e supervisão deste tratamento.
                </p>
              </div>

              <div className="p-6 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700/80 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {treatment.specialist.avatar ? (
                  <img
                    src={treatment.specialist.avatar}
                    alt={treatment.specialist.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-rose-200 dark:border-rose-900 shrink-0 shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold text-2xl border-4 border-rose-200 shrink-0">
                    {treatment.specialist.name.charAt(0)}
                  </div>
                )}
                
                <div className="space-y-2 text-center sm:text-left">
                  <div>
                    <h4 className="font-bold text-lg text-stone-900 dark:text-stone-100">
                      {treatment.specialist.name}
                    </h4>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                      {treatment.specialist.role}
                    </span>
                    {treatment.specialist.registration && (
                      <span className="text-[11px] font-mono text-stone-500 bg-stone-200 dark:bg-stone-700 px-2 py-0.5 rounded inline-block mt-1">
                        {treatment.specialist.registration}
                      </span>
                    )}
                  </div>
                  {treatment.specialist.bio && (
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                      {treatment.specialist.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom CTA Bar */}
        <div className="p-4 sm:p-5 bg-stone-100 dark:bg-stone-800/90 border-t border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="hidden sm:block">
            <span className="text-xs font-medium text-stone-500 block">Pronta para transformar seu bem-estar?</span>
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {treatment.price ? `${treatment.name} — ${treatment.price}` : treatment.name}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-3 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Voltar
            </button>

            <button
              onClick={() => {
                onClose();
                onBook(treatment.id);
              }}
              className="flex-1 sm:flex-initial px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Calendar className="h-4 w-4" />
              <span>Agendar este Tratamento</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
