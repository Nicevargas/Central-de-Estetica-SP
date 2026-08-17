import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Video,
  Image as ImageIcon,
  Copy,
  Check,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { Treatment } from '../types';
import { getSanitizedTreatmentDisplay } from '../lib/treatmentUtils';

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
  whatsappNumber = '551194683765',
}: TreatmentDetailModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'visiting' | 'beforeAfter' | 'video' | 'specs' | 'postcare'>('visiting');
  
  // Image URL state with fallback handling
  const [imgSrc, setImgSrc] = useState<string>('');

  useEffect(() => {
    if (treatment) {
      setImgSrc(treatment.image);
      setActiveTab('visiting');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [treatment]);

  if (!treatment) return null;

  const display = getSanitizedTreatmentDisplay(treatment);
  const fallbackImage = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80';

  // Prepare Share URLs specific to this treatment
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : '';
  const treatmentShareUrl = `${baseUrl}?treatment=${encodeURIComponent(treatment.id)}`;
  const shareText = `Confira este procedimento de ${treatment.name} na Central da Estética! ${display.hasPrice ? `Por ${display.price}` : ''}`;
  const rawWhatsappNum = whatsappNumber.replace(/\D/g, '') || '551194683765';
  const whatsappShareUrl = `https://wa.me/${rawWhatsappNum}?text=${encodeURIComponent(`${shareText}\n${treatmentShareUrl}`)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(treatmentShareUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(treatmentShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: treatment.name,
          text: shareText,
          url: treatmentShareUrl,
        });
      } catch (e) {
        console.log('Share cancelled or not supported', e);
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
    return url;
  };

  const embedUrl = getEmbedVideoUrl(treatment.videoUrl);

  return (
    <div className="fixed inset-0 z-50 bg-stone-100 dark:bg-stone-950 overflow-y-auto min-h-screen flex flex-col font-sans text-stone-800 dark:text-stone-100 animate-fade-in">
      {/* Sticky Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-stone-800 dark:text-stone-200 hover:text-rose-600 dark:hover:text-rose-400 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer group border border-stone-200 dark:border-stone-700"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform text-rose-600" />
          <span>Voltar para Todos os Tratamentos</span>
        </button>

        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
          <span className="text-rose-600 font-bold">Central da Estética</span>
          <span>•</span>
          <span className="truncate max-w-xs">{treatment.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl transition-all cursor-pointer border border-stone-200 dark:border-stone-700"
            title="Compartilhar procedimento"
          >
            <Share2 className="h-4 w-4 text-rose-600" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onBook(treatment.id);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Agendar Agora</span>
          </button>
        </div>
      </header>

      {/* Main Document Flow */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-36 space-y-6">
        
        {/* Hero Banner Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="relative h-64 sm:h-80 md:h-[380px] w-full overflow-hidden bg-stone-950">
            <img
              src={imgSrc || fallbackImage}
              onError={() => setImgSrc(fallbackImage)}
              alt={treatment.name}
              className="w-full h-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

            {/* Badges */}
            <div className="absolute top-5 left-5 right-5 z-10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider bg-rose-600 text-white rounded-full shadow-lg">
                  {treatment.category === 'facial'
                    ? 'Tratamento Facial'
                    : treatment.category === 'corporal'
                    ? 'Tratamento Corporal'
                    : treatment.category === 'capilar'
                    ? 'Terapia Capilar'
                    : 'Bem-Estar & SPA'}
                </span>
                {treatment.popular && (
                  <span className="px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider bg-amber-400 text-stone-950 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 fill-current" />
                    Mais Procurado
                  </span>
                )}
                {treatment.highlight && (
                  <span className="px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider bg-emerald-500 text-white rounded-full shadow-lg">
                    Destaque
                  </span>
                )}
              </div>
            </div>

            {/* Title & Price Info at bottom of Hero */}
            <div className="absolute bottom-6 left-6 right-6 z-10 text-white space-y-3">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold leading-tight drop-shadow-md">
                {treatment.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                {display.hasPrice && (
                  <div className="px-4 py-1.5 bg-rose-600/90 backdrop-blur-md text-white font-extrabold text-sm sm:text-base rounded-full shadow-lg border border-rose-400/30">
                    {display.price}
                  </div>
                )}
                {display.hasDuration && (
                  <div className="px-4 py-1.5 bg-black/50 backdrop-blur-md text-stone-200 font-semibold text-xs sm:text-sm rounded-full border border-white/20 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-rose-400" />
                    <span>Duração: {display.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Share Bar */}
          <div className="bg-stone-100 dark:bg-stone-800/90 px-6 py-3 border-t border-stone-200 dark:border-stone-700/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300 font-bold">
              <Share2 className="h-4 w-4 text-rose-600" />
              <span>Compartilhar este tratamento:</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#25D366] text-white hover:bg-[#20ba59] rounded-xl transition-all shadow-sm text-xs font-bold flex items-center gap-1.5"
              >
                WhatsApp
              </a>
              <a
                href={facebookShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#1877F2] text-white hover:bg-[#166fe0] rounded-xl transition-all shadow-sm text-xs font-bold flex items-center gap-1.5"
              >
                Facebook
              </a>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-white dark:bg-stone-900 p-2 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('visiting')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'visiting'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            Visão Geral
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            Ficha Técnica
          </button>

          {treatment.postCareTips && treatment.postCareTips.length > 0 && (
            <button
              onClick={() => setActiveTab('postcare')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'postcare'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              Cuidados Pós-Uso
            </button>
          )}

          {treatment.beforeAfterImages && treatment.beforeAfterImages.length > 0 && (
            <button
              onClick={() => setActiveTab('beforeAfter')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'beforeAfter'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              Antes e Depois ({treatment.beforeAfterImages.length})
            </button>
          )}

          {embedUrl && (
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              Vídeo Explicativo
            </button>
          )}
        </div>

        {/* Content Card Body */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xl space-y-8">
          
          {/* Section: Sobre o Procedimento */}
          {(activeTab === 'visiting' || activeTab === 'specs') && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-rose-600" />
                  Sobre o Procedimento
                </h2>
                <p className="text-stone-700 dark:text-stone-300 text-base sm:text-lg leading-relaxed">
                  {treatment.description}
                </p>
              </div>

              {/* Benefits List */}
              {treatment.benefits && treatment.benefits.length > 0 && (
                <div className="bg-rose-50/80 dark:bg-stone-800/70 p-6 rounded-2xl border border-rose-100 dark:border-stone-700">
                  <h3 className="font-bold text-base text-rose-900 dark:text-rose-300 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-rose-600" />
                    Principais Benefícios & Resultados
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {treatment.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-sm sm:text-base font-medium text-stone-800 dark:text-stone-200">
                        <CheckCircle2 className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section: Ficha Técnica */}
          {(activeTab === 'visiting' || activeTab === 'specs') && treatment.technicalSpecs && (
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-4">
              <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-rose-600" />
                Ficha Técnica do Tratamento
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Duração da Sessão</span>
                  <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">{treatment.technicalSpecs.duration || display.duration || '45 min'}</span>
                </div>
                <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Anestesia</span>
                  <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">{treatment.technicalSpecs.anesthesia || 'Tópica'}</span>
                </div>
                <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Recuperação</span>
                  <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">{treatment.technicalSpecs.recovery || 'Imediata'}</span>
                </div>
                {treatment.technicalSpecs.indicatedFor && (
                  <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60 sm:col-span-2 lg:col-span-1">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Indicado Para</span>
                    <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">{treatment.technicalSpecs.indicatedFor}</span>
                  </div>
                )}
                {treatment.technicalSpecs.resultsIn && (
                  <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Resultados Visíveis Em</span>
                    <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">{treatment.technicalSpecs.resultsIn}</span>
                  </div>
                )}
                {treatment.technicalSpecs.sessionsRequired && (
                  <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Sessões Recomendadas</span>
                    <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">{treatment.technicalSpecs.sessionsRequired}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Cuidados Pós-Procedimento */}
          {(activeTab === 'visiting' || activeTab === 'postcare') && treatment.postCareTips && treatment.postCareTips.length > 0 && (
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-4">
              <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-rose-600" />
                Cuidados Pós-Procedimento
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {treatment.postCareTips.map((tip, idx) => (
                  <div key={idx} className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base font-medium text-stone-800 dark:text-stone-200">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Antes e Depois */}
          {(activeTab === 'visiting' || activeTab === 'beforeAfter') && treatment.beforeAfterImages && treatment.beforeAfterImages.length > 0 && (
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-4">
              <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-rose-600" />
                Resultados Antes & Depois
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {treatment.beforeAfterImages.map((pair, idx) => (
                  <div key={idx} className="space-y-2">
                    {pair.label && <span className="text-xs font-bold text-stone-500 uppercase block mb-1">{pair.label}</span>}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
                        <img src={pair.before || fallbackImage} alt="Antes" className="w-full h-48 object-cover" />
                        <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">ANTES</span>
                      </div>
                      <div className="relative rounded-2xl overflow-hidden border border-rose-300 dark:border-rose-900">
                        <img src={pair.after || fallbackImage} alt="Depois" className="w-full h-48 object-cover" />
                        <span className="absolute bottom-2 left-2 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">DEPOIS</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Vídeo Explicativo */}
          {(activeTab === 'visiting' || activeTab === 'video') && embedUrl && (
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-4">
              <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Video className="h-5 w-5 text-rose-600" />
                Vídeo Explicativo do Procedimento
              </h3>
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-800">
                <iframe
                  src={embedUrl}
                  title={`Vídeo ${treatment.name}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Fixed Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 px-4 sm:px-8 py-3.5 shadow-2xl">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left hidden sm:block">
            <span className="text-xs font-medium text-stone-500 block">Pronta para transformar seu bem-estar?</span>
            <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 truncate max-w-md block">
              {treatment.name} {display.hasPrice ? `— ${display.price}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700"
            >
              <ArrowLeft className="h-4 w-4 text-rose-600" />
              <span>Voltar aos Tratamentos</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onBook(treatment.id);
              }}
              className="flex-1 sm:flex-none px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-lg hover:shadow-rose-500/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="h-4.5 w-4.5" />
              <span>Agendar este Tratamento</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
