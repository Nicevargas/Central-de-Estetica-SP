import React, { useState, useEffect } from 'react';
import {
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
  MessageCircle,
  Play,
  Award,
  Sliders,
  Columns,
  Maximize2,
  X,
  Info,
  ChevronRight,
  AlertTriangle,
  Sun,
  Droplets,
  HeartHandshake,
  Activity,
} from 'lucide-react';
import { Treatment, TreatmentBeforeAfter } from '../types';
import {
  getSanitizedTreatmentDisplay,
  formatGoogleDriveImageUrl,
  getGoogleDriveThumbnailUrl,
  getGoogleDriveDirectUrl,
  formatVideoEmbedUrl,
  parseBeforeAfterImages,
} from '../lib/treatmentUtils';

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
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide'>('sideBySide');
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);

  // Direct image from database / state
  const [imgSrc, setImgSrc] = useState<string>('');

  useEffect(() => {
    if (treatment) {
      setImgSrc(formatGoogleDriveImageUrl(treatment.image) || treatment.image || '');
      setActiveTab('visiting');
      setViewMode('sideBySide');
      setSliderPos(50);
      setSelectedPairIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [treatment]);

  if (!treatment) return null;

  const display = getSanitizedTreatmentDisplay(treatment);
  const formattedMainImage = formatGoogleDriveImageUrl(treatment.image) || treatment.image || '';

  // Prepare Share URLs specific to this treatment
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : '';
  const treatmentShareUrl = `${baseUrl}?treatment=${encodeURIComponent(treatment.id)}`;
  const shareText = `Confira este procedimento de ${treatment.name} na Central da Estética! ${display.hasPrice ? `Por ${display.price}` : ''}`;
  const rawWhatsappNum = whatsappNumber.replace(/\D/g, '') || '551194683765';
  const whatsappShareUrl = `https://wa.me/${rawWhatsappNum}?text=${encodeURIComponent(`${shareText}\n${treatmentShareUrl}`)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(treatmentShareUrl)}`;
  const whatsappConsultUrl = `https://wa.me/${rawWhatsappNum}?text=${encodeURIComponent(`Olá! Gostaria de tirar dúvidas sobre o procedimento: ${treatment.name}.`)}`;
  const whatsappVideoRequestUrl = `https://wa.me/${rawWhatsappNum}?text=${encodeURIComponent(`Olá! Gostaria de mais detalhes do procedimento ${treatment.name} e agendar uma avaliação.`)}`;

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

  // Helper for Google Drive / YouTube / Vimeo video embed link parsing
  const embedUrl = formatVideoEmbedUrl(treatment.videoUrl);

  // Pull Before & After items directly from database / storage
  const dbBeforeAfterImages: TreatmentBeforeAfter[] = parseBeforeAfterImages(
    treatment.beforeAfterImages ||
      (treatment as any).before_after_images ||
      (treatment as any).beforeAfter ||
      (treatment as any).before_image ||
      (treatment as any).after_image
  );

  const hasBeforeAfter = dbBeforeAfterImages.length > 0;
  const currentPair = dbBeforeAfterImages[selectedPairIndex] || dbBeforeAfterImages[0];
  const hasVideo = Boolean(embedUrl || (treatment.videoUrl && treatment.videoUrl.trim().length > 0));

  return (
    <div className="fixed inset-0 z-50 bg-stone-100 dark:bg-stone-950 overflow-y-auto min-h-screen flex flex-col font-sans text-stone-800 dark:text-stone-100 animate-fade-in">
      {/* Lightbox / Zoom Modal */}
      {selectedImageModal && (
        <div
          onClick={() => setSelectedImageModal(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImageModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-rose-400 p-2 text-sm flex items-center gap-1 font-bold"
            >
              <X className="h-5 w-5" /> Fechar
            </button>
            <img
              src={selectedImageModal}
              alt="Ampliação"
              className="w-auto h-auto max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain border border-white/20"
            />
          </div>
        </div>
      )}

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
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-36 space-y-8">
        
        {/* Hero Banner Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="relative h-64 sm:h-80 md:h-[400px] w-full overflow-hidden bg-stone-950">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={treatment.name}
                referrerPolicy="no-referrer"
                onError={() => {
                  const thumb = getGoogleDriveThumbnailUrl(treatment.image);
                  if (thumb && thumb !== imgSrc) {
                    setImgSrc(thumb);
                  }
                }}
                className="w-full h-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-900 text-stone-600">
                <Sparkles className="h-16 w-16 opacity-30 text-rose-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-stone-950/10" />

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
                    Destaque Clínico
                  </span>
                )}
              </div>

              <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Protocolo Seguro & Certificado</span>
              </div>
            </div>

            {/* Title & Price Info at bottom of Hero */}
            <div className="absolute bottom-6 left-6 right-6 z-10 text-white space-y-3">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-md">
                {treatment.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3">
                {display.hasPrice && (
                  <div className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 backdrop-blur-md text-white font-extrabold text-sm sm:text-base rounded-full shadow-lg border border-rose-400/40 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-rose-200" />
                    <span>{display.price}</span>
                  </div>
                )}
                {display.hasDuration && (
                  <div className="px-4 py-2 bg-black/60 backdrop-blur-md text-stone-200 font-semibold text-xs sm:text-sm rounded-full border border-white/20 flex items-center gap-1.5">
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

        {/* Navigation Section Filter Pills */}
        <div className="bg-white dark:bg-stone-900 p-2 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('visiting')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'visiting'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Visão Completa
          </button>

          {hasBeforeAfter && (
            <button
              onClick={() => setActiveTab('beforeAfter')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'beforeAfter'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Antes e Depois
            </button>
          )}

          {hasVideo && (
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'video'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <Video className="h-4 w-4" />
              Vídeo Explicativo
            </button>
          )}

          <button
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'specs'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <FileText className="h-4 w-4" />
            Ficha Técnica
          </button>

          <button
            onClick={() => setActiveTab('postcare')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'postcare'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Pós-Cuidados
          </button>
        </div>

        {/* Content Card Body */}
        <div className="space-y-8">
          
          {/* SECTION 1: Sobre o Procedimento & Benefícios */}
          {(activeTab === 'visiting' || activeTab === 'specs') && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200/50">
                    Apresentação Clínica
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-rose-600" />
                  Sobre o Procedimento
                </h2>
                <p className="text-stone-700 dark:text-stone-300 text-base sm:text-lg leading-relaxed">
                  {treatment.description}
                </p>
              </div>

              {/* Benefits Grid */}
              {treatment.benefits && treatment.benefits.length > 0 && (
                <div className="bg-gradient-to-br from-rose-50/90 to-amber-50/40 dark:from-stone-800/80 dark:to-stone-800/40 p-6 sm:p-7 rounded-2xl border border-rose-100 dark:border-stone-700">
                  <h3 className="font-bold text-base sm:text-lg text-rose-950 dark:text-rose-300 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-rose-600" />
                    Principais Benefícios & Resultados Esperados
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {treatment.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white/70 dark:bg-stone-900/60 p-3.5 rounded-xl border border-rose-200/40 dark:border-stone-700/60 shadow-xs">
                        <CheckCircle2 className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base font-medium text-stone-800 dark:text-stone-200">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: Resultados de Antes & Depois (Puxado direto do banco de dados) */}
          {hasBeforeAfter && (activeTab === 'visiting' || activeTab === 'beforeAfter') && (
            <div id="section-before-after" className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200/50">
                      Galeria de Resultados
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                      Banco de Dados
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-rose-600" />
                    Resultados de Antes & Depois
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                    {currentPair?.label || 'Evolução e resultados clínicos do procedimento'}
                  </p>
                </div>

                {/* View Mode Controls */}
                <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-100 dark:bg-stone-800 p-1.5 rounded-xl border border-stone-200 dark:border-stone-700">
                  <button
                    onClick={() => setViewMode('sideBySide')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'sideBySide'
                        ? 'bg-white dark:bg-stone-700 text-rose-600 dark:text-rose-400 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    <Columns className="h-3.5 w-3.5" />
                    <span>Lado a Lado</span>
                  </button>
                  <button
                    onClick={() => setViewMode('slider')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'slider'
                        ? 'bg-white dark:bg-stone-700 text-rose-600 dark:text-rose-400 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Slider Interativo</span>
                  </button>
                </div>
              </div>

              {/* Selector for multiple before/after pairs if available */}
              {dbBeforeAfterImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-xs font-bold text-stone-500">Casos Clínicos:</span>
                  {dbBeforeAfterImages.map((pair, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPairIndex(idx)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                        selectedPairIndex === idx
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      Caso {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Before/After Presentation Display */}
              {viewMode === 'sideBySide' && currentPair ? (
                /* Side-by-Side Mode (Default & Preferred) */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Card ANTES */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-stone-500"></span>
                          Antes do Tratamento
                        </span>
                        <span className="text-[11px] text-stone-400">Clique para ampliar</span>
                      </div>
                      <div
                        onClick={() => setSelectedImageModal(currentPair.before)}
                        className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-950 shadow-md cursor-zoom-in flex items-center justify-center"
                      >
                        <img
                          src={currentPair.before}
                          alt="Foto antes do procedimento"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const thumb = getGoogleDriveThumbnailUrl(currentPair.before);
                            const direct = getGoogleDriveDirectUrl(currentPair.before);
                            if (thumb && target.src !== thumb) {
                              target.src = thumb;
                            } else if (direct && target.src !== direct) {
                              target.src = direct;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute bottom-3.5 left-3.5 bg-stone-900/90 backdrop-blur-md text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl shadow-md tracking-wider border border-white/20">
                          ANTES
                        </span>
                        <span className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex items-center gap-1.5 text-xs font-semibold">
                          <Maximize2 className="h-3.5 w-3.5" />
                          <span>Ampliar</span>
                        </span>
                      </div>
                    </div>

                    {/* Card DEPOIS */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          Resultado Obtido
                        </span>
                        <span className="text-[11px] text-stone-400">Clique para ampliar</span>
                      </div>
                      <div
                        onClick={() => setSelectedImageModal(currentPair.after)}
                        className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-rose-300 dark:border-rose-900/60 bg-stone-950 shadow-md cursor-zoom-in flex items-center justify-center"
                      >
                        <img
                          src={currentPair.after}
                          alt="Foto depois do procedimento"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const thumb = getGoogleDriveThumbnailUrl(currentPair.after);
                            const direct = getGoogleDriveDirectUrl(currentPair.after);
                            if (thumb && target.src !== thumb) {
                              target.src = thumb;
                            } else if (direct && target.src !== direct) {
                              target.src = direct;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute bottom-3.5 left-3.5 bg-rose-600/95 backdrop-blur-md text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl shadow-md tracking-wider border border-rose-400/40">
                          DEPOIS
                        </span>
                        <span className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex items-center gap-1.5 text-xs font-semibold">
                          <Maximize2 className="h-3.5 w-3.5" />
                          <span>Ampliar</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : currentPair ? (
                /* Interactive Slider Mode (Alternative) */
                <div className="space-y-3">
                  <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[460px] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 select-none shadow-md bg-stone-950">
                    {/* After Image (Full background) */}
                    <img
                      src={currentPair.after}
                      alt="Resultado Depois"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const thumb = getGoogleDriveThumbnailUrl(currentPair.after);
                        const direct = getGoogleDriveDirectUrl(currentPair.after);
                        if (thumb && target.src !== thumb) {
                          target.src = thumb;
                        } else if (direct && target.src !== direct) {
                          target.src = direct;
                        }
                      }}
                    />
                    <span className="absolute bottom-4 right-4 bg-rose-600/95 backdrop-blur-md text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg z-10 border border-rose-400/40 tracking-wider">
                      DEPOIS
                    </span>

                    {/* Before Image (Clipped overlay with CSS clipPath for 100% distortion-free alignment) */}
                    <div
                      className="absolute inset-0 z-10 pointer-events-none"
                      style={{
                        clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                        WebkitClipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                      }}
                    >
                      <img
                        src={currentPair.before}
                        alt="Resultado Antes"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const thumb = getGoogleDriveThumbnailUrl(currentPair.before);
                          const direct = getGoogleDriveDirectUrl(currentPair.before);
                          if (thumb && target.src !== thumb) {
                            target.src = thumb;
                          } else if (direct && target.src !== direct) {
                            target.src = direct;
                          }
                        }}
                      />
                      <span className="absolute bottom-4 left-4 bg-stone-900/95 backdrop-blur-md text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg z-10 border border-white/20 tracking-wider">
                        ANTES
                      </span>
                    </div>

                    {/* Drag Line Handle */}
                    <div
                      className="absolute inset-y-0 w-1 bg-white shadow-2xl z-20 pointer-events-none"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white text-rose-600 rounded-full shadow-2xl flex items-center justify-center border-2 border-rose-500 hover:scale-110 transition-transform">
                        <Sliders className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Range Input Trigger */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                      aria-label="Arrastar comparativo de antes e depois"
                    />

                    {/* Zoom button */}
                    <button
                      onClick={() => setSelectedImageModal(currentPair.after)}
                      className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-xl z-20 transition-all cursor-pointer backdrop-blur-md"
                      title="Ver em tela cheia"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-center text-xs font-medium text-stone-500 dark:text-stone-400">
                    ↔ Arraste a linha para comparar os resultados de Antes e Depois
                  </p>
                </div>
              ) : null}

              {/* Consultation and Disclaimer Footer */}
              <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-700/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 dark:text-stone-300">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    *Os resultados podem variar conforme características biológicas e o plano de sessões individual definido na avaliação.
                  </span>
                </div>
                <a
                  href={whatsappConsultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Falar no WhatsApp</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* SECTION 3: Vídeo do Procedimento (Puxado direto do banco de dados) */}
          {hasVideo && (activeTab === 'visiting' || activeTab === 'video') && (
            <div id="section-video" className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200/50 block w-max mb-1">
                    Demonstração em Vídeo
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Video className="h-5 w-5 text-rose-600" />
                    Vídeo Explicativo do Procedimento
                  </h3>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  Vídeo Cadastrado no Banco de Dados
                </span>
              </div>

              {embedUrl ? (
                /* Actual Video Embed */
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl border border-stone-200 dark:border-stone-800 bg-black">
                  <iframe
                    src={embedUrl}
                    title={`Vídeo Explicativo - ${treatment.name}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : treatment.videoUrl ? (
                /* Standard HTML5 Video or link */
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl border border-stone-200 dark:border-stone-800 bg-black flex items-center justify-center">
                  <video
                    src={treatment.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  >
                    Seu navegador não suporta a tag de vídeo.
                  </video>
                </div>
              ) : null}

              {/* Step-by-Step Protocol Stages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/70 dark:border-stone-700/60">
                  <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider block mb-1">Passo 1</span>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">Higienização e Assepsia</span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">Preparação detalhada e aplicação de anestésico tópico quando indicado.</span>
                </div>
                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/70 dark:border-stone-700/60">
                  <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider block mb-1">Passo 2</span>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">Execução do Protocolo</span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">Aplicação precisa com tecnologia calibrada e ativos de alta performance.</span>
                </div>
                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/70 dark:border-stone-700/60">
                  <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider block mb-1">Passo 3</span>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">Finalização & Orientações</span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">Selamento com fotoproteção e prescrição de cuidados home care.</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Ficha Técnica & Especificações */}
          {(activeTab === 'visiting' || activeTab === 'specs') && (
            <div id="section-specs" className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6">
              <div className="border-b border-stone-100 dark:border-stone-800 pb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200/50 block w-max mb-1">
                  Parâmetros e Segurança
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-rose-600" />
                  Ficha Técnica do Procedimento
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Duração da Sessão</span>
                  <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                    {treatment.technicalSpecs?.duration || display.duration || '45 min'}
                  </span>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Anestesia Utilizada</span>
                  <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                    {treatment.technicalSpecs?.anesthesia || 'Tópica / Resfriamento em tempo real'}
                  </span>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Tempo de Recuperação</span>
                  <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                    {treatment.technicalSpecs?.recovery || 'Imediata (sem necessidade de repouso)'}
                  </span>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Resultados Visíveis Em</span>
                  <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                    {treatment.technicalSpecs?.resultsIn || 'Desde as primeiras sessões'}
                  </span>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Sessões Recomendadas</span>
                  <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                    {treatment.technicalSpecs?.sessionsRequired || 'Definido após avaliação individual'}
                  </span>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Indicação Principal</span>
                  <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                    {treatment.technicalSpecs?.indicatedFor || treatment.name}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: Cuidados Pós-Procedimento (Ocupando todo o espaço com layout completo e refinado) */}
          {(activeTab === 'visiting' || activeTab === 'postcare') && (
            <div id="section-postcare" className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 md:p-10 border border-stone-200 dark:border-stone-800 shadow-xl space-y-8">
              {/* Header */}
              <div className="border-b border-stone-100 dark:border-stone-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200/50">
                      Protocolo de Recuperação Home Care
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                      Garantia de Resultados
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
                    <ShieldCheck className="h-7 w-7 text-amber-600 shrink-0" />
                    Cuidados Pós-Procedimento
                  </h3>
                  <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 mt-1 max-w-3xl leading-relaxed">
                    Siga rigorosamente as recomendações da clínica para potencializar os resultados do tratamento, garantir uma regeneração tecidual perfeita e prolongar a durabilidade dos efeitos.
                  </p>
                </div>

                <a
                  href={whatsappConsultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start md:self-auto px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0"
                >
                  <MessageCircle className="h-4 w-4 text-amber-600" />
                  <span>Dúvida Pós-Atendimento</span>
                </a>
              </div>

              {/* Destaque das Orientações Específicas do Tratamento */}
              {treatment.postCareTips && treatment.postCareTips.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-rose-600" />
                    Orientações Específicas para {treatment.name}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {treatment.postCareTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-5 bg-gradient-to-br from-amber-50/90 to-rose-50/40 dark:from-stone-800/90 dark:to-stone-800/40 rounded-2xl border border-amber-200/80 dark:border-stone-700 shadow-xs flex items-start gap-3.5 transition-all hover:shadow-md"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-500/15 dark:bg-amber-500/25 flex items-center justify-center shrink-0 mt-0.5 text-amber-700 dark:text-amber-300 font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                            Recomendação #{idx + 1}
                          </span>
                          <span className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed block">
                            {tip}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Grade Completa em Todo o Espaço: Fases e Orientações Fundamentais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card 1: Primeiras 24h a 48h */}
                <div className="bg-stone-50/90 dark:bg-stone-800/50 rounded-2xl p-5 sm:p-6 border border-stone-200 dark:border-stone-700/70 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 block">Fase Inicial</span>
                      <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">Primeiras 24h a 48 Horas</h4>
                    </div>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>Evite tocar ou massagear excessivamente a área tratada.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>Não tome banhos excessivamente quentes nem frequente saunas.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>Higienize suavemente com água e sabonete neutro indicado.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-stone-200/60 dark:border-stone-700/60 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                    *Evite exercícios físicos intensos nas primeiras 24 horas.
                  </div>
                </div>

                {/* Card 2: Proteção e Regeneração Diária */}
                <div className="bg-stone-50/90 dark:bg-stone-800/50 rounded-2xl p-5 sm:p-6 border border-stone-200 dark:border-stone-700/70 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Sun className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block">Rotina Diária</span>
                      <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">Fotoproteção & Hidratação</h4>
                    </div>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Aplicação diária de protetor solar FPS 50+ a cada 3 a 4 horas.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Hidratação intensiva com séruns ou cremes calmantes prescritos.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Beba pelo menos 2 litros de água para estimular o metabolismo celular.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-stone-200/60 dark:border-stone-700/60 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    *Fundamental mesmo em dias nublados ou em ambientes fechados.
                  </div>
                </div>

                {/* Card 3: Restrições e Cuidados Essenciais */}
                <div className="bg-stone-50/90 dark:bg-stone-800/50 rounded-2xl p-5 sm:p-6 border border-stone-200 dark:border-stone-700/70 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 block">Atenção</span>
                      <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">O Que Deve Ser Evitado</h4>
                    </div>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                        <span>Não realize esfoliações ou peelings caseiros sem autorização.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                        <span>Suspenda o uso de ácidos fortes ou retinóides por 3 a 5 dias.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                        <span>Evite exposição solar direta e bronzeamento nas primeiras semanas.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-stone-200/60 dark:border-stone-700/60 text-[11px] font-semibold text-orange-700 dark:text-orange-400">
                    *Em caso de dúvidas sobre dermocosméticos, contate a clínica.
                  </div>
                </div>
              </div>

              {/* Faixa Inferior de Acompanhamento e Suporte */}
              <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 text-white p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="w-11 h-11 rounded-xl bg-rose-600 flex items-center justify-center shrink-0">
                    <HeartHandshake className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm sm:text-base">Acompanhamento Clínico Contínuo</h5>
                    <p className="text-xs sm:text-sm text-stone-300">
                      Nossa equipe está à disposição para acompanhar sua evolução e esclarecer qualquer dúvida do pós-atendimento.
                    </p>
                  </div>
                </div>

                <a
                  href={whatsappConsultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-5 py-2.5 bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4 text-rose-600" />
                  <span>Falar com o Suporte</span>
                </a>
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
            <a
              href={whatsappConsultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Dúvidas WhatsApp</span>
            </a>

            <button
              onClick={() => {
                onClose();
                onBook(treatment.id);
              }}
              className="flex-1 sm:flex-none px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-lg hover:shadow-rose-500/25 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Calendar className="h-4.5 w-4.5" />
              <span>Agendar Avaliação</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

