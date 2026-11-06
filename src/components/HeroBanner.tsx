import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type Slide =
  | { type: 'image'; src: string; alt: string; label: string }
  | { type: 'video'; src: string; poster: string; alt: string; label: string };

const SLIDES: Slide[] = [
  { type: 'image', src: '/banner.png', alt: 'Tratamento de estética e cuidados com a pele', label: 'Estética de alta performance' },
  { type: 'image', src: '/clinica/avaliacao-facial.jpg', alt: 'Avaliação facial personalizada', label: 'Avaliação facial personalizada' },
  { type: 'video', src: '/videos/lavieen/laser-lavieen.mp4', poster: '/videos/lavieen/laser-lavieen.jpg', alt: 'Laser Lavieén em procedimento', label: 'Laser Lavieén' },
  { type: 'image', src: '/clinica/tratamento-maca.jpg', alt: 'Cliente em atendimento na sala de tratamento', label: 'Cuidado em cada etapa' },
  { type: 'video', src: '/videos/lavieen/estrias.mp4', poster: '/videos/lavieen/estrias.jpg', alt: 'Tratamento de estrias', label: 'Tratamento de estrias' },
  { type: 'image', src: '/clinica/atendimento-conversa.jpg', alt: 'Conversa de avaliação com a especialista', label: 'Atendimento humanizado' },
  { type: 'video', src: '/videos/lavieen/pernas.mp4', poster: '/videos/lavieen/pernas.jpg', alt: 'Tratamento para pernas', label: 'Tratamento para pernas' },
];

const IMAGE_MS = 5000;
const VIDEO_MAX_MS = 9000;

export default function HeroBanner() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const next = () => setIndex((i) => (i + 1) % SLIDES.length);

  // Fotos avançam por tempo; vídeos avançam ao terminar (ou no limite).
  useEffect(() => {
    // Vídeos também têm limite de tempo, caso o arquivo seja longo.
    const t = setTimeout(next, slide.type === 'image' ? IMAGE_MS : VIDEO_MAX_MS);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {slide.type === 'image' ? (
            <img className="w-full h-full object-cover" src={slide.src} alt={slide.alt} />
          ) : (
            <video
              className="w-full h-full object-cover"
              src={slide.src}
              poster={slide.poster}
              aria-label={slide.alt}
              autoPlay
              muted
              playsInline
              preload="metadata"
              onEnded={next}
              onError={next}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
        <span className="glass-card px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary">
          {slide.label}
        </span>
      </div>
      <div className="absolute bottom-3 right-5 flex gap-1.5 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Ir para o banner ${i + 1}`}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
}
