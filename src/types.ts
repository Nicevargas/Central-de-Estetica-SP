/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Treatment {
  id: string;
  name: string;
  description: string;
  category: 'facial' | 'corporal' | 'bem-estar';
  popular?: boolean;
  highlight?: boolean;
  duration?: string;
  price?: string;
  image: string;
  benefits: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  stars: number;
  role: string;
  avatarBg: string;
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
