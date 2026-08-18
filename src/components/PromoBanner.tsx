import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Tag, Clock, ChevronLeft, ChevronRight, Copy, Check, ArrowRight } from 'lucide-react';
import { Promotion, Treatment } from '../types';
import { formatGoogleDriveImageUrl } from '../lib/treatmentUtils';

const FALLBACK_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    badge: 'PACOTE PROMOCIONAL',
    title: 'Secagem de Vasinhos (Laser + PEIM Injetável)',
    subtitle: 'Sessões a laser vascular + aplicações injetáveis a partir de R$ 289,00.',
    discount: 'OFERTA',
    originalPrice: 'R$ 450',
    promoPrice: 'A partir de R$ 289',
    couponCode: 'VASINHOS289',
    expiresInDays: 5,
    treatmentId: 'secagem-vasinhos',
    active: true,
  },
  {
    id: 'promo-2',
    badge: 'OFERTA MÊS DE AGOSTO',
    title: 'Botox Dysport (3 Regiões) com Retoque',
    subtitle: 'Aplicação em 3 regiões do rosto com retoque incluso.',
    discount: '30% OFF',
    originalPrice: 'R$ 1.290',
    promoPrice: 'R$ 899',
    couponCode: 'BOTOXAGOSTO',
    expiresInDays: 7,
    treatmentId: 'botox-dysport',
    active: true,
  },
  {
    id: 'promo-3',
    badge: 'ESTÍMULO DE COLÁGENO',
    title: 'Bioestimulador Radiesse ou Sculptra',
    subtitle: 'Firmeza e combate da flacidez facial e corporal.',
    discount: 'PARCELADO',
    originalPrice: 'R$ 2.390',
    promoPrice: '6x de R$ 365',
    couponCode: 'RADIESSE6X',
    expiresInDays: 8,
    treatmentId: 'radiesse-sculptra',
    active: true,
  },
  {
    id: 'promo-4',
    badge: 'EFEITO BB LASER',
    title: 'Laser Lavieén (Pacote 03 Sessões + Ativos)',
    subtitle: '03 sessões de Lavieén + ativos específicos para melasma.',
    discount: 'SUPER PACOTE',
    originalPrice: 'R$ 1.900',
    promoPrice: '6x de R$ 233',
    couponCode: 'LAVIEEN3X',
    expiresInDays: 4,
    treatmentId: 'laser-lavieen',
    active: true,
  },
  {
    id: 'promo-5',
    badge: 'RENOVADOR FACIAL',
    title: 'CO2 Híbrido - Full Face (02 Sessões)',
    subtitle: '02 sessões completas para rejuvenescimento e textura.',
    discount: 'PROMO FULL',
    originalPrice: 'R$ 3.800',
    promoPrice: '6x de R$ 366',
    couponCode: 'CO2FULLFACE',
    expiresInDays: 6,
    treatmentId: 'co2-hibrido',
    active: true,
  },
];

interface PromoBannerProps {
  promotions?: Promotion[];
  treatments?: Treatment[];
  onSelectPromo: (treatmentId?: string, couponCode?: string) => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ promotions, treatments, onSelectPromo }) => {
  const promoList = promotions !== undefined ? promotions : FALLBACK_PROMOTIONS;
  const displayPromos = promoList.filter(p => p.active !== false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Auto-slide every 7 seconds
  useEffect(() => {
    if (isPaused || displayPromos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayPromos.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, displayPromos.length]);

  const currentPromo = displayPromos[currentIndex] || displayPromos[0];

  if (!currentPromo) return null;

  // Resolve procedure photo dynamically per slide
  const matchedTreatment = currentPromo.treatmentId && treatments
    ? treatments.find((t) => t.id === currentPromo.treatmentId)
    : treatments?.find((t) => {
        const tName = t.name.toLowerCase();
        const pTitle = currentPromo.title.toLowerCase();
        return tName.includes(pTitle) || pTitle.includes(tName);
      });

  const promoImage =
    formatGoogleDriveImageUrl(currentPromo.image) ||
    formatGoogleDriveImageUrl(matchedTreatment?.image) ||
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80';

  const targetTreatmentId = currentPromo.treatmentId || matchedTreatment?.id || currentPromo.title || '';

  const handleCopyCoupon = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="w-full">
      {/* Main Light & Elegant Banner Container */}
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-50/90 via-amber-50/30 to-stone-50 text-stone-900 shadow-md border border-rose-200/70 flex flex-col lg:flex-row"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-[320px] sm:min-h-[300px] lg:min-h-[320px]">
          {/* Left Text / Info Area */}
          <div className="lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col justify-between z-10 relative bg-gradient-to-r from-rose-50/95 via-rose-50/80 to-stone-50/60 order-2 lg:order-1">
            <div className="space-y-2 sm:space-y-3">
              {/* Badge & Expiration */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-rose-100 text-rose-700 border border-rose-200/80">
                  <Sparkles className="h-3 w-3 text-rose-500 shrink-0" />
                  {currentPromo.badge}
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-stone-600 bg-white/80 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-stone-200 shadow-2xs">
                  <Clock className="h-3 w-3 text-amber-500 shrink-0" />
                  Resta(m) {currentPromo.expiresInDays} dias
                </span>
              </div>

              {/* Animated Slide Title and Subtitle */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPromo.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5 sm:space-y-2.5"
                >
                  <h3
                    onClick={() => onSelectPromo(targetTreatmentId, currentPromo.couponCode)}
                    className="font-serif text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-stone-900 leading-snug sm:leading-tight cursor-pointer hover:text-rose-600 transition-colors"
                  >
                    {currentPromo.title}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm max-w-lg leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {currentPromo.subtitle}
                  </p>

                  {/* Price Section */}
                  {(currentPromo.originalPrice || currentPromo.promoPrice) && (
                    <div className="flex items-baseline gap-2 sm:gap-3 pt-1 sm:pt-2 flex-wrap">
                      {currentPromo.originalPrice && (
                        <span className="text-stone-400 line-through text-xs sm:text-sm">
                          {currentPromo.originalPrice}
                        </span>
                      )}
                      {currentPromo.promoPrice && (
                        <span className="text-rose-600 font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-tight">
                          {currentPromo.promoPrice}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Actions & Pagination Controls */}
            <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-rose-200/60 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectPromo(targetTreatmentId, currentPromo.couponCode)}
                  className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95"
                >
                  <span>Garantir Oferta</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>

                {currentPromo.couponCode && (
                  <button
                    onClick={(e) => handleCopyCoupon(currentPromo.couponCode, e)}
                    className="relative inline-flex items-center gap-1 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl transition-all border border-stone-200/90 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Tag className="h-3.5 w-3.5 text-rose-500" />
                    <span className="font-mono font-semibold">{currentPromo.couponCode}</span>
                    {copiedCode === currentPromo.couponCode ? (
                      <span className="flex items-center gap-0.5 text-emerald-600 font-bold ml-1">
                        <Check className="h-3.5 w-3.5" />
                        Copiado!
                      </span>
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-stone-400 ml-0.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Navigation Arrows & Dots */}
              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                <div className="flex items-center gap-1">
                  {displayPromos.map((promo, idx) => (
                    <button
                      key={promo.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === currentIndex ? 'w-4 sm:w-5 bg-rose-600' : 'w-1.5 bg-stone-300 hover:bg-stone-400'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + displayPromos.length) % displayPromos.length)}
                    className="p-1 sm:p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-600 transition-colors border border-stone-200 cursor-pointer shadow-2xs"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % displayPromos.length)}
                    className="p-1 sm:p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-600 transition-colors border border-stone-200 cursor-pointer shadow-2xs"
                    aria-label="Próximo"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Showcase Column (Exact Proportional Standard Frame with Zero Distortion) */}
          <div
            onClick={() => onSelectPromo(targetTreatmentId, currentPromo.couponCode)}
            className="lg:col-span-5 relative w-full h-48 sm:h-56 lg:h-full min-h-[190px] sm:min-h-[220px] lg:min-h-[320px] overflow-hidden order-1 lg:order-2 bg-stone-100 cursor-pointer group"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPromo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full absolute inset-0"
              >
                <img
                  src={promoImage}
                  alt={currentPromo.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-cover object-center select-none transform transition-transform duration-700 group-hover:scale-105"
                />
                {/* Soft subtle gradient transition to blend cleanly with left light theme */}
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-rose-50/90 via-rose-50/20 to-transparent pointer-events-none" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;

