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
      {/* Main Clean Banner Container */}
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-stone-900 text-white shadow-xl border border-stone-800/80"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[300px]">
          {/* Left Text / Info Area */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between z-10 relative bg-gradient-to-r from-stone-950 via-stone-900 to-stone-900/90">
            <div>
              {/* Badge & Expiration */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <Sparkles className="h-3 w-3" />
                  {currentPromo.badge}
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 bg-stone-800/80 px-2.5 py-1 rounded-full border border-stone-700/50">
                  <Clock className="h-3 w-3 text-amber-400" />
                  Resta(m) {currentPromo.expiresInDays} dias
                </span>
              </div>

              {/* Animated Slide Title and Subtitle */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPromo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-2"
                >
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                    {currentPromo.title}
                  </h3>
                  <p className="text-stone-300 text-xs sm:text-sm max-w-lg leading-relaxed">
                    {currentPromo.subtitle}
                  </p>

                  {/* Price Section */}
                  <div className="flex items-baseline gap-3 pt-3">
                    <span className="text-stone-400 line-through text-xs sm:text-sm">
                      {currentPromo.originalPrice}
                    </span>
                    <span className="text-rose-400 font-extrabold text-2xl sm:text-3xl tracking-tight">
                      {currentPromo.promoPrice}
                    </span>
                    <span className="text-[11px] text-stone-400 bg-stone-800/60 px-2 py-0.5 rounded border border-stone-700/40">
                      Parcele em até 6x
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Actions & Pagination Controls */}
            <div className="pt-6 mt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectPromo(currentPromo.treatmentId, currentPromo.couponCode)}
                  className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Garantir Oferta</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={(e) => handleCopyCoupon(currentPromo.couponCode, e)}
                  className="relative inline-flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs px-3.5 py-2.5 rounded-xl transition-all border border-stone-700/60 cursor-pointer active:scale-95"
                >
                  <Tag className="h-3.5 w-3.5 text-rose-400" />
                  <span>{currentPromo.couponCode}</span>
                  {copiedCode === currentPromo.couponCode ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold ml-1">
                      <Check className="h-3.5 w-3.5" />
                      Copiado!
                    </span>
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-stone-400 ml-1" />
                  )}
                </button>
              </div>

              {/* Navigation Arrows & Dots */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {displayPromos.map((promo, idx) => (
                    <button
                      key={promo.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === currentIndex ? 'w-5 bg-rose-500' : 'w-1.5 bg-stone-700 hover:bg-stone-600'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + displayPromos.length) % displayPromos.length)}
                    className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition-colors border border-stone-700/50 cursor-pointer"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % displayPromos.length)}
                    className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition-colors border border-stone-700/50 cursor-pointer"
                    aria-label="Próximo"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Showcase Column */}
          <div className="lg:col-span-5 relative min-h-[200px] lg:min-h-full overflow-hidden hidden sm:block">
            <img
              src={promoBannerImg}
              alt="Estética Avançada"
              className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-700 hover:scale-105"
            />
            {/* Subtle Gradient blend to seamlessly merge with left text box */}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-stone-950 via-stone-950/40 to-transparent" />

            {/* Floating Discount Tag */}
            <div className="absolute top-4 right-4 bg-rose-600/90 backdrop-blur-md text-white font-extrabold px-3 py-1.5 rounded-xl shadow-lg border border-rose-400/30 text-xs sm:text-sm">
              {currentPromo.discount}
            </div>

            <div className="absolute bottom-4 right-4 text-[10px] text-white/70 bg-stone-950/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Sua avaliação sem custo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;

