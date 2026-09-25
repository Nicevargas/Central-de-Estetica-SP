/**
 * Conversão das linhas do Supabase para os tipos do site.
 * Módulo sem dependência do cliente Supabase: usado pelo site e pelo gerador de páginas no build.
 */
import { Treatment, ContactInfo } from '../types';
import { sanitizeTreatmentObject, formatGoogleDriveImageUrl, formatVideoEmbedUrl, parseBeforeAfterImages } from './treatmentUtils';

export function mapTreatmentRow(row: any): Treatment {
  const rawTreatment: Treatment = {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    popular: row.popular ?? false,
    highlight: row.highlight ?? false,
    duration: row.duration,
    price: row.price,
    image: formatGoogleDriveImageUrl(row.image) || row.image || '',
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    beforeAfterImages: parseBeforeAfterImages(row.before_after_images || row.beforeAfterImages || row.before_image || row.after_image),
    videoUrl: formatVideoEmbedUrl(row.video_url || row.videoUrl || ''),
    technicalSpecs: row.technical_specs || row.technicalSpecs || {},
    postCareTips: Array.isArray(row.post_care_tips) ? row.post_care_tips : (Array.isArray(row.postCareTips) ? row.postCareTips : []),
    specialist: row.specialist || null,
  };
  return sanitizeTreatmentObject(rawTreatment);
}

export function mapContactInfoRow(data: any): ContactInfo {
  return {
    phonePrimary: data.phone_primary,
    whatsappNumber: data.whatsapp_number,
    email: data.email,
    addressLine1: data.address_line1,
    addressLine2: data.address_line2,
    cep: data.cep,
    instagramUrl: data.instagram_url,
    facebookUrl: data.facebook_url,
  };
}
