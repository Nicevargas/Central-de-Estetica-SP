import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Tag, Clock, ChevronLeft, ChevronRight, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import promoBannerImg from '../assets/images/promo_hero_banner_1785344438660.jpg';
import { Promotion } from '../types';

const FALLBACK_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    badge: 'OFERTA DESTAQUE DO MÊS',
    title: 'Combo Brilho & Rejuvenescimento',
    subtitle: 'Botox 3 áreas + Peeling de Diamante para uma pele renovada e radiante.',
    discount: '30% OFF',
    originalPrice: 'R$ 1.200',
    promoPrice: 'R$ 840',
    couponCode: 'ESTETICA30',
    expiresInDays: 5,
    treatmentId: 'botox',
    active: true,
  },
  {
    id: 'promo-2',
    badge: 'ESTÍMULO DE COLÁGENO',
    title: 'Protocolo Contorno & Firmeza',
    subtitle: 'Bioestimulador de Colágeno com Drenagem Facial de cortesia.',
    discount: 'R$ 350 OFF',
    originalPrice: 'R$ 1.950',
    promoPrice: 'R$ 1.600',
    couponCode: 'FIRM2026',
    expiresInDays: 8,
    treatmentId: 'bioestimulador',
    active: true,
  },
  {
    id: 'promo-3',
    badge: 'RENOVAÇÃO FACIAL EXPRESS',
    title: 'Limpeza de Pele HD + LED',
    subtitle: 'Limpeza profunda com hidratação e fototerapia anti-inflamatória.',
    discount: '25% OFF',
    originalPrice: 'R$ 280',
    promoPrice: 'R$ 210',
    couponCode: 'PELEPERFEITA',
    expiresInDays: 3,
    treatmentId: 'limpeza-de-pele',
    active: true,
  },
];

interface PromoBannerProps {
  promotions?: Promotion[];
  onSelectPromo: (treatmentId?: string, couponCode?: string) => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ promotions = FALLBACK_PROMOTIONS, onSelectPromo }) => {
  const activePromos = promotions.filter(p => p.active !== false);
  const displayPromos = activePromos.length > 0 ? activePromos : FALLBACK_PROMOTIONS;

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
        className="relative overflow-hidden rounded-xl sm:rounded-3xl bg-gradient-to-br from-rose-50/90 via-amber-50/30 to-stone-50 text-stone-900 shadow-md border border-rose-200/70"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[260px]">
          {/* Left Text / Info Area */}
          <div className="lg:col-span-7 p-3.5 sm:p-6 lg:p-8 flex flex-col justify-between z-10 relative bg-gradient-to-r from-rose-50/95 via-rose-50/80 to-stone-50/60">
            <div>
              {/* Badge & Expiration */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4 flex-wrap">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-rose-100 text-rose-700 border border-rose-200/80">
                  <Sparkles className="h-3 w-3 text-rose-500" />
                  {currentPromo.badge}
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-stone-600 bg-white/80 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-stone-200 shadow-2xs">
                  <Clock className="h-3 w-3 text-amber-500" />
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
                  className="space-y-1 sm:space-y-2"
                >
                  <h3 className="font-serif text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-stone-900 leading-snug sm:leading-tight">
                    {currentPromo.title}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm max-w-lg leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {currentPromo.subtitle}
                  </p>

                  {/* Price Section */}
                  <div className="flex items-baseline gap-2 sm:gap-3 pt-1.5 sm:pt-3 flex-wrap">
                    <span className="text-stone-400 line-through text-xs sm:text-sm">
                      {currentPromo.originalPrice}
                    </span>
                    <span className="text-rose-600 font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-tight">
                      {currentPromo.promoPrice}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-stone-600 bg-rose-100/80 px-2 py-0.5 rounded border border-rose-200/60 font-medium">
                      Parcele em até 6x
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Actions & Pagination Controls */}
            <div className="pt-3 sm:pt-4 mt-2 sm:mt-4 border-t border-rose-200/60 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectPromo(currentPromo.treatmentId, currentPromo.couponCode)}
                  className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95"
                >
                  <span>Garantir Oferta</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>

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

          {/* Right Image Showcase Column */}
          <div className="lg:col-span-5 relative min-h-[160px] lg:min-h-full overflow-hidden hidden sm:block">
            <img
              src={promoBannerImg}
              alt="Estética Avançada"
              className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-700 hover:scale-105"
            />
            {/* Soft subtle gradient transition to match left light theme */}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-rose-50/90 via-rose-50/20 to-transparent" />

            {/* Floating Discount Tag */}
            <div className="absolute top-4 right-4 bg-rose-600/95 text-white font-extrabold px-3 py-1.5 rounded-xl shadow-md border border-white/40 text-xs sm:text-sm">
              {currentPromo.discount}
            </div>

            <div className="absolute bottom-4 right-4 text-[10px] text-stone-700 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-stone-200/80 flex items-center gap-1 shadow-sm">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>Sua avaliação sem custo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;

