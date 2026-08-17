import { Treatment } from '../types';

/**
 * Checks if a string looks like a price, installment, or monetary value
 * e.g., "6x399,00", "6x de R$ 365,00", "R$ 499,00", "399,00", "10x 350"
 */
export function isPriceLike(val?: string | null): boolean {
  if (!val || typeof val !== 'string') return false;
  const clean = val.trim();
  if (!clean) return false;

  // If it explicitly mentions time units and not installment 'x', it's likely duration
  const hasTimeUnit = /\b(min|minutos|hora|horas|h|dia|dias|semanas|meses)\b/i.test(clean);
  const isInstallment = /^\s*\d+\s*x\b/i.test(clean); // e.g. "6x", "6x399", "12x"
  const hasCurrency = /\b(r\$|reais|pix|cartão|parcelas?)\b/i.test(clean);
  const hasDecimalPrice = /\b\d+[,.]\d{2}\b/.test(clean);

  if (isInstallment || hasCurrency) return true;
  if (hasDecimalPrice && !hasTimeUnit) return true;

  return false;
}

/**
 * Checks if a price value is empty or dummy/zero like "R$ 0,00"
 */
export function isZeroOrEmptyPrice(price?: string | null): boolean {
  if (!price || typeof price !== 'string') return true;
  const clean = price.trim().toLowerCase();
  return (
    clean === '' ||
    clean === 'r$ 0,00' ||
    clean === 'r$ 0.00' ||
    clean === 'r$ 0' ||
    clean === '0,00' ||
    clean === '0.00' ||
    clean === '0' ||
    clean === 'grátis' ||
    clean === 'gratis' ||
    clean === 'null' ||
    clean === 'undefined'
  );
}

/**
 * Formats installment string nicely
 * e.g., "6x399,00" -> "6x de R$ 399,00"
 */
export function formatPriceString(val: string): string {
  const clean = val.trim();
  if (!clean) return '';
  
  // Format "6x399,00" or "6x 399,00" -> "6x de R$ 399,00"
  const installmentMatch = clean.match(/^(\d+)\s*x\s*(?:de\s*)?(?:r\$\s*)?([\d.,]+)$/i);
  if (installmentMatch) {
    const times = installmentMatch[1];
    let amount = installmentMatch[2];
    if (!amount.includes(',')) {
      amount = `${amount},00`;
    }
    return `${times}x de R$ ${amount}`;
  }

  // Format "399,00" -> "R$ 399,00"
  if (/^\d+[,.]\d{2}$/.test(clean)) {
    return `R$ ${clean.replace('.', ',')}`;
  }

  return clean;
}

export interface SanitizedTreatmentDisplay {
  price: string;
  duration: string;
  hasPrice: boolean;
  hasDuration: boolean;
}

/**
 * Sanitizes and swaps price/duration fields if they were inverted or entered incorrectly.
 */
export function getSanitizedTreatmentDisplay(treatment: Partial<Treatment> | null | undefined): SanitizedTreatmentDisplay {
  if (!treatment) {
    return { price: '', duration: '', hasPrice: false, hasDuration: false };
  }

  let rawPrice = treatment.price?.trim() || '';
  let rawDuration = treatment.duration?.trim() || '';
  const specDuration = treatment.technicalSpecs?.duration?.trim() || '';

  // Check if duration contains price/installment (e.g. "6x399,00" or "6x de R$ 399,00")
  const durationIsActuallyPrice = isPriceLike(rawDuration);
  const priceIsZeroOrEmpty = isZeroOrEmptyPrice(rawPrice);

  let finalPrice = rawPrice;
  let finalDuration = rawDuration;

  if (durationIsActuallyPrice) {
    // Duration is holding the price
    if (priceIsZeroOrEmpty) {
      finalPrice = formatPriceString(rawDuration);
    }
    // Fix duration with technicalSpecs duration or standard estimate
    if (specDuration && !isPriceLike(specDuration)) {
      finalDuration = specDuration;
    } else {
      finalDuration = '45 min';
    }
  } else if (priceIsZeroOrEmpty) {
    finalPrice = '';
  }

  // If finalDuration is still price-like for any reason, don't show it as duration
  if (isPriceLike(finalDuration)) {
    if (!finalPrice || isZeroOrEmptyPrice(finalPrice)) {
      finalPrice = formatPriceString(finalDuration);
    }
    finalDuration = specDuration && !isPriceLike(specDuration) ? specDuration : '45 min';
  }

  return {
    price: finalPrice,
    duration: finalDuration,
    hasPrice: Boolean(finalPrice && !isZeroOrEmptyPrice(finalPrice)),
    hasDuration: Boolean(finalDuration && !isPriceLike(finalDuration)),
  };
}

/**
 * Sanitizes treatment object before saving to state or database
 */
export function sanitizeTreatmentObject(treatment: Treatment): Treatment {
  const display = getSanitizedTreatmentDisplay(treatment);
  return {
    ...treatment,
    price: display.price || treatment.price || '',
    duration: display.duration || '45 min',
  };
}
