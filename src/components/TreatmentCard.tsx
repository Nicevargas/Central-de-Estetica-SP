import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { Treatment } from '../types';

interface TreatmentCardProps {
  treatment: Treatment;
  onSelect: (id: string) => void;
}

export default function TreatmentCard({ treatment, onSelect }: TreatmentCardProps) {
  const isHighlight = treatment.highlight;

  if (isHighlight) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="md:col-span-2 bg-white rounded-2xl p-8 shadow-premium border border-outline-variant/10 flex flex-col justify-between overflow-hidden relative group"
      >
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold mb-4">
              Destaque Corporal
            </span>
            <h3 className="font-serif text-2xl lg:text-3xl font-semibold mb-3 text-primary">
              {treatment.name}
            </h3>
            <p className="text-on-surface-variant text-sm md:text-base mb-6 max-w-md leading-relaxed">
              {treatment.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
              {treatment.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => onSelect(treatment.id)}
                className="primary-gradient cursor-pointer text-white px-8 py-3 rounded-full font-semibold text-sm inline-flex items-center gap-2 group/btn shadow-premium transition-all hover:scale-105 active:scale-95"
              >
                Agendar Agora
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative background image or giant symbol */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 md:opacity-100 md:block hidden">
          <img
            src={treatment.image}
            alt={treatment.name}
            className="w-full h-full object-cover rounded-l-3xl group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl overflow-hidden shadow-premium group hover:-translate-y-1.5 border border-outline-variant/10 transition-all duration-500 flex flex-col justify-between"
    >
      <div className="h-64 overflow-hidden relative">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          src={treatment.image}
          alt={treatment.name}
          referrerPolicy="no-referrer"
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
          <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">
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

        <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between">
          {treatment.price && (
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block">Valor</span>
              <span className="font-bold text-primary">{treatment.price}</span>
            </div>
          )}
          <button
            onClick={() => onSelect(treatment.id)}
            className="px-4 py-2 bg-primary/5 hover:bg-primary hover:text-white text-primary rounded-full font-semibold text-xs transition-colors duration-300 ml-auto cursor-pointer"
          >
            Agendar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
