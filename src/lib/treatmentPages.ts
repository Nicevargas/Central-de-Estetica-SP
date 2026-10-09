/**
 * Páginas dedicadas por tratamento (SEO local).
 * Cada tratamento cadastrado no banco ganha um endereço próprio, ex.: https://centraldaestetica.com.br/secagem-de-vasinhos-sp/
 * O HTML estático dessas páginas é gerado no build a partir do Supabase (ver scripts/treatmentPagesPlugin.ts).
 */
import type { Treatment } from '../types';

export const SITE_URL = 'https://centraldaestetica.com.br';

type TreatmentRef = Pick<Treatment, 'id' | 'name'>;

export interface TreatmentPageSeo {
  slug: string;
  /** Título da aba / resultado do Google (até ~60 caracteres) */
  title: string;
  /** H1 da página */
  heading: string;
  /** Meta description (até ~155 caracteres) */
  description: string;
}

/**
 * Textos de busca escritos à mão para os tratamentos principais (por ID do banco).
 * Tratamentos que não estão aqui recebem endereço e textos gerados a partir do nome.
 */
export const TREATMENT_SEO_OVERRIDES: Record<string, TreatmentPageSeo> = {
  'secagem-vasinhos': {
    slug: 'secagem-de-vasinhos-sp',
    title: 'Secagem de Vasinhos em SP (Laser e PEIM) | Central da Estética',
    heading: 'Secagem de Vasinhos em São Paulo com Laser e PEIM',
    description:
      'Secagem de vasinhos nas pernas com laser vascular e PEIM no Jardim Paulista, SP. Sem repouso e sem cirurgia. Agende sua avaliação pelo WhatsApp.',
  },
  'botox-dysport': {
    slug: 'botox-jardins-sp',
    title: 'Botox nos Jardins, SP (3 Regiões com Retoque) | Central da Estética',
    heading: 'Botox e Dysport nos Jardins, São Paulo',
    description:
      'Aplicação de toxina botulínica em 3 regiões (testa, glabela e pés de galinha) com retoque incluso, no Jardim Paulista, SP. Agende sua avaliação.',
  },
  'radiesse-sculptra': {
    slug: 'bioestimulador-de-colageno-sp',
    title: 'Bioestimulador de Colágeno em SP (Radiesse e Sculptra) | Central da Estética',
    heading: 'Bioestimulador de Colágeno em São Paulo: Radiesse e Sculptra',
    description:
      'Radiesse e Sculptra para firmeza e flacidez facial e corporal no Jardim Paulista, SP. Estímulo natural de colágeno. Agende sua avaliação.',
  },
  'laser-lavieen': {
    slug: 'laser-lavieen-sp',
    title: 'Laser Lavieén em SP (BB Laser) | Central da Estética',
    heading: 'Laser Lavieén em São Paulo: manchas, melasma e viço',
    description:
      'Laser Lavieén (efeito BB Laser) para manchas, melasma, poros e viço da pele no Jardim Paulista, SP. Agende sua avaliação.',
  },
  'co2-hibrido': {
    slug: 'laser-co2-fracionado-sp',
    title: 'Laser CO2 Fracionado em SP (Full Face) | Central da Estética',
    heading: 'Laser CO2 Híbrido Full Face em São Paulo',
    description:
      'Laser CO2 fracionado para rejuvenescimento, cicatrizes de acne e textura da pele no Jardim Paulista, SP. Agende sua avaliação.',
  },
  ultraformer: {
    slug: 'ultraformer-mpt-sp',
    title: 'Ultraformer MPT em SP (Lifting sem Cortes) | Central da Estética',
    heading: 'Ultraformer MPT em São Paulo: lifting facial sem cortes',
    description:
      'Ultraformer MPT para flacidez, papada e contorno do rosto no Jardim Paulista, SP. Lifting sem cortes e sem repouso. Agende sua avaliação.',
  },
  'gordura-localizada': {
    slug: 'gordura-localizada-enzimas-sp',
    title: 'Enzimas para Gordura Localizada em SP | Central da Estética',
    heading: 'Tratamento de Gordura Localizada com Enzimas em São Paulo',
    description:
      'Enzimas (mesclas lipolíticas) para gordura localizada no abdômen, flancos e braços no Jardim Paulista, SP. Agende sua avaliação.',
  },
  'gluteo-max': {
    slug: 'harmonizacao-glutea-sp',
    title: 'Harmonização Glútea em SP (Glúteo Max) | Central da Estética',
    heading: 'Harmonização Glútea (Glúteo Max) em São Paulo',
    description:
      'Glúteo Max: harmonização glútea para volume, firmeza e contorno no Jardim Paulista, SP. Agende sua avaliação.',
  },
  'terapia-capilar': {
    slug: 'tratamento-queda-de-cabelo-sp',
    title: 'Tratamento para Queda de Cabelo em SP | Central da Estética',
    heading: 'Tratamento para Queda de Cabelo em São Paulo',
    description:
      'Terapia capilar com ativos e tecnologia para queda de cabelo no Jardim Paulista, SP. Agende sua avaliação.',
  },
  massagens: {
    slug: 'drenagem-linfatica-sp',
    title: 'Drenagem Linfática e Massagens em SP | Central da Estética',
    heading: 'Drenagem Linfática e Massagens em São Paulo',
    description:
      'Drenagem linfática, massagem relaxante e modeladora no Jardim Paulista, SP. Agende seu horário pelo WhatsApp.',
  },
};

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

/** Título, H1, descrição e endereço da página de um tratamento */
export function getTreatmentSeo(treatment: TreatmentRef & { description?: string }): TreatmentPageSeo {
  const override = TREATMENT_SEO_OVERRIDES[treatment.id];
  if (override) return override;
  const plainName = treatment.name.replace(/\s*\([^)]*\)\s*/g, ' ').trim() || treatment.name;
  const base = slugify(plainName) || slugify(treatment.id) || 'tratamento';
  const summary = (treatment.description || '').replace(/\s+/g, ' ').trim();
  return {
    slug: `${base}-sp`,
    title: `${plainName} em SP | Central da Estética`,
    heading: `${plainName} em São Paulo`,
    description: (summary
      ? `${plainName} no Jardim Paulista, SP. ${summary}`
      : `${plainName} no Jardim Paulista, São Paulo. Agende sua avaliação na Central da Estética.`
    ).slice(0, 155),
  };
}

/** Caminho público do tratamento, ex.: "/botox-jardins-sp/" */
export function getTreatmentPath(treatment: TreatmentRef): string {
  return `/${getTreatmentSeo(treatment).slug}/`;
}

export function getTreatmentUrl(treatment: TreatmentRef): string {
  return `${SITE_URL}${getTreatmentPath(treatment)}`;
}

/** Encontra o tratamento cujo endereço corresponde ao caminho da URL (ex.: "/botox-jardins-sp/") */
export function findTreatmentByPath<T extends TreatmentRef>(pathname: string, treatments: T[]): T | null {
  const slug = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!slug) return null;
  return treatments.find((t) => getTreatmentSeo(t).slug === slug) || null;
}

/** Indica se o caminho parece ser a página de um tratamento (qualquer caminho de um nível só) */
export function isTreatmentLikePath(pathname: string): boolean {
  return /^\/[a-z0-9-]+\/?$/i.test(pathname);
}
