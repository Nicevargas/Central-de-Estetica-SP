import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { Treatment } from '../types';

interface TreatmentCardProps {
  treatment: Treatment;
  onSelect: (id: string) => void;
  onViewDetails?: (treatment: Treatment) => void;
}

export default function TreatmentCard({ treatment, onSelect, onViewDetails }: TreatmentCardProps) {
  const isHighlight = treatment.highlight;

  const handleOpenDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(treatment);
    }
  };

  if (isHighlight) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onClick={handleOpenDetails}
        className="col-span-1 md:col-span-2 bg-white rounded-3xl overflow-hidden shadow-premium border border-outline-variant/10 group cursor-pointer hover:shadow-2xl transition-all duration-300"
      >
        <div className="flex flex-col lg:flex-row min-h-[300px]">
          {/* Content side */}
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs">
                  ⭐ Destaque Especial
                </span>
                {treatment.popular && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 rounded-full text-xs font-bold">
                    🔥 Mais Procurado
                  </span>
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {treatment.category === 'facial' ? 'Estética Facial' : treatment.category === 'corporal' ? 'Estética Corporal' : 'Terapia Capilar'}
                </span>
              </div>

              <h3 className="font-serif text-2xl lg:text-3xl font-bold text-primary group-hover:text-rose-600 transition-colors mb-3">
                {treatment.name}
              </h3>

              <p className="text-on-surface-variant text-sm md:text-base mb-6 leading-relaxed">
                {treatment.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {treatment.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs md:text-sm text-on-surface-variant font-medium">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {treatment.price && (
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block">Investimento</span>
                    <span className="font-bold text-primary text-base sm:text-lg">{treatment.price}</span>
                  </div>
                )}
                {treatment.duration && (
                  <div className="hidden sm:flex text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-stone-500" />
                    <span>{treatment.duration}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onViewDetails && (
                  <button
                    onClick={handleOpenDetails}
                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full font-semibold text-xs transition-all cursor-pointer"
                  >
                    Ver Página &amp; Fotos
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(treatment.id);
                  }}
                  className="primary-gradient text-white px-6 py-2.5 rounded-full font-semibold text-xs inline-flex items-center gap-2 shadow-premium hover:scale-105 transition-all cursor-pointer"
                >
                  Agendar Agora
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Image side */}
          <div className="lg:w-2/5 h-64 lg:h-auto relative overflow-hidden shrink-0">
            <img
              src={treatment.image}
              alt={treatment.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={handleOpenDetails}
      className="bg-white rounded-2xl overflow-hidden shadow-premium group hover:-translate-y-1.5 border border-outline-variant/10 transition-all duration-500 flex flex-col justify-between cursor-pointer"
    >
      <div className="h-64 overflow-hidden relative">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          src={treatment.image}
          alt={treatment.name}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {treatment.popular && (
          <div className="absolute top-4 left-4">
            <span className="bg-primary/15 text-primary px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-primary/20">
              Popular
            </span>
          </div>
        )}
        {treatment.duration && (
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-white text-xs font-semibold">
            <Clock className="h-3 w-3" />
            <span>{treatment.duration}</span>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-secondary mb-2 block">
            {treatment.category === 'facial' ? 'Estética Facial' : treatment.category === 'corporal' ? 'Estética Corporal' : 'Bem-estar'}
          </span>
          <h3 className="font-serif text-xl font-semibold mb-2 text-primary group-hover:text-secondary transition-colors duration-300">
            {treatment.name}
          </h3>
          <p className="text-on-surface-variant text-sm mb-4 leading-relaxed line-clamp-2">
            {treatment.description}
          </p>

          <ul className="space-y-2 mb-6">
            {treatment.benefits.slice(0, 2).map((benefit, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-on-surface-variant">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-3 border-t border-outline-variant/10 flex items-center justify-between gap-2">
          {treatment.price && (
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block">Valor</span>
              <span className="font-bold text-primary text-sm">{treatment.price}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5 ml-auto">
            {onViewDetails && (
              <button
                onClick={handleOpenDetails}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full font-semibold text-xs transition-colors cursor-pointer"
              >
                Ver Página
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(treatment.id);
              }}
              className="px-4 py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-full font-semibold text-xs transition-colors duration-300 cursor-pointer"
            >
              Agendar
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
