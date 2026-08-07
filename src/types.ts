/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TreatmentBeforeAfter {
  before: string;
  after: string;
  label?: string;
}

export interface TechnicalSpecs {
  duration?: string;
  anesthesia?: string;
  recovery?: string;
  indicatedFor?: string;
  resultsIn?: string;
  sessionsRequired?: string;
}

export interface Specialist {
  name: string;
  role: string;
  registration?: string;
  bio?: string;
  avatar?: string;
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  category: 'facial' | 'corporal' | 'capilar' | 'bem-estar';
  popular?: boolean;
  highlight?: boolean;
  duration?: string;
  price?: string;
  image: string;
  benefits: string[];
  // Novos campos detalhados
  beforeAfterImages?: TreatmentBeforeAfter[];
  videoUrl?: string;
  technicalSpecs?: TechnicalSpecs;
  postCareTips?: string[];
  specialist?: Specialist;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  stars: number;
  role: string;
  avatarBg?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface BookingRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  treatmentId: string;
  date: string;
  time: string;
  notes?: string;
  status: 'pending' | 'confirmed';
}

export interface Promotion {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  discount: string;
  originalPrice: string;
  promoPrice: string;
  couponCode: string;
  expiresInDays: number;
  treatmentId?: string;
  active?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

export interface ContactInfo {
  phonePrimary: string;
  whatsappNumber: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  cep: string;
  instagramUrl: string;
  facebookUrl: string;
}


