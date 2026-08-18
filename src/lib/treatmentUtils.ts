import { Treatment, TreatmentBeforeAfter } from '../types';

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
 * Extracts Google Drive file ID from various formats:
 * - Direct ID: "1ABCxyz123"
 * - Share URL: "https://drive.google.com/file/d/1ABCxyz123/view?usp=sharing"
 * - Preview URL: "https://drive.google.com/file/d/1ABCxyz123/preview"
 * - Open/UC URL: "https://drive.google.com/uc?id=1ABCxyz123" or "?export=view&id=1ABCxyz123"
 * - Thumbnail URL: "https://drive.google.com/thumbnail?id=1ABCxyz123"
 * - Google UserContent URL: "https://lh3.googleusercontent.com/d/1ABCxyz123"
 * - HTML img/iframe tag: '<img src="https://drive.google.com/uc?export=view&id=1ABCxyz123">' or '<iframe src="https://drive.google.com/file/d/1ABCxyz123/preview">'
 */
export function extractGoogleDriveId(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null;
  let clean = input.trim();
  if (!clean) return null;

  // Extract from HTML img or iframe tag if pasted as <img src="..."> or <iframe src="...">
  const tagMatch = clean.match(/src=["']?([^"'>\s]+)["']?/i);
  if (tagMatch && tagMatch[1]) {
    clean = tagMatch[1].trim();
  }

  // Remove wrapping quotes if present
  clean = clean.replace(/^["']|["']$/g, '').trim();

  // 1. Check for /file/d/ID or /d/ID pattern (standard Google Drive file URL)
  const fileDMatch = clean.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{15,100})/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // 2. Check for [?&]id=ID pattern (e.g. uc?export=view&id=ID or open?id=ID)
  const idParamMatch = clean.match(/[?&]id=([a-zA-Z0-9_-]{15,100})/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // 3. Check for drive.google.com or docs.google.com containing id
  const openIdMatch = clean.match(/(?:drive|docs)\.google\.com\/(?:open|uc|thumbnail|file)\?(?:.*&)?id=([a-zA-Z0-9_-]{15,100})/);
  if (openIdMatch && openIdMatch[1]) {
    return openIdMatch[1];
  }

  // 4. Check for googleusercontent.com/d/ID pattern
  const userContentMatch = clean.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{15,100})/);
  if (userContentMatch && userContentMatch[1]) {
    return userContentMatch[1];
  }

  // 5. Check for /folders/ID pattern
  const folderMatch = clean.match(/\/folders\/([a-zA-Z0-9_-]{15,100})/);
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1];
  }

  // 6. If it's a direct Google Drive ID without URL scheme or slashes
  // Typical Google Drive file IDs are 15-100 characters consisting of letters, digits, dashes, and underscores
  if (!clean.includes('/') && !clean.includes(':') && !clean.includes('?') && !clean.includes('&') && /^[a-zA-Z0-9_-]{15,100}$/.test(clean)) {
    return clean;
  }

  return null;
}

/**
 * Standardizes treatment image URL for high-performance cross-origin display:
 * Uses Google Drive's high-resolution thumbnail endpoint (sz=w1600) and direct CDN
 * which bypasses third-party cookie and 403 anti-hotlinking blocks.
 */
export function formatGoogleDriveImageUrl(input?: string | null): string {
  if (!input || typeof input !== 'string') return '';
  let clean = input.trim();
  if (!clean) return '';

  // Extract from HTML tag if pasted like <img src="...">
  const imgTagMatch = clean.match(/src=["']?([^"'>\s]+)["']?/i);
  if (imgTagMatch && imgTagMatch[1]) {
    clean = imgTagMatch[1].trim();
  }

  const driveId = extractGoogleDriveId(clean);
  if (driveId) {
    // sz=w1600 returns the full high-resolution image via Google CDN without 403 blocks
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
  }

  return clean;
}

/**
 * Alternative Google Drive high-resolution thumbnail URL
 */
export function getGoogleDriveThumbnailUrl(input?: string | null): string {
  const driveId = extractGoogleDriveId(input);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }
  return formatGoogleDriveImageUrl(input);
}

/**
 * Direct UC Export URL (fallback)
 */
export function getGoogleDriveDirectUrl(input?: string | null): string {
  const driveId = extractGoogleDriveId(input);
  if (driveId) {
    return `https://drive.google.com/uc?export=view&id=${driveId}`;
  }
  return formatGoogleDriveImageUrl(input);
}

/**
 * Safely parses and normalizes Before & After image collections from any data source:
 * (JSON string, single object, array of objects, alternative keys).
 */
export function parseBeforeAfterImages(raw: any): TreatmentBeforeAfter[] {
  if (!raw) return [];

  let parsed = raw;

  // Handle JSON string (e.g. from Postgres JSONB, TEXT, or localStorage)
  if (typeof raw === 'string') {
    const clean = raw.trim();
    if (!clean || clean === '[]' || clean === '{}' || clean === 'null') return [];
    try {
      parsed = JSON.parse(clean);
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
    } catch {
      // If it's a raw URL or ID string, treat as image
      const driveId = extractGoogleDriveId(clean);
      if (driveId || clean.startsWith('http')) {
        const formatted = formatGoogleDriveImageUrl(clean);
        return [{ before: formatted, after: formatted, label: 'Resultado do procedimento' }];
      }
      return [];
    }
  }

  // Handle single object: { before: ..., after: ... } or { before_image: ..., after_image: ... }
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const before =
      parsed.before ||
      parsed.beforeImage ||
      parsed.before_image ||
      parsed.antes ||
      parsed.foto_antes ||
      '';
    const after =
      parsed.after ||
      parsed.afterImage ||
      parsed.after_image ||
      parsed.depois ||
      parsed.foto_depois ||
      '';
    const label = parsed.label || parsed.titulo || 'Resultado do procedimento';

    if (before || after) {
      const formattedBefore = formatGoogleDriveImageUrl(before) || before || formatGoogleDriveImageUrl(after);
      const formattedAfter = formatGoogleDriveImageUrl(after) || after || formatGoogleDriveImageUrl(before);
      return [{ before: formattedBefore, after: formattedAfter, label }];
    }
    return [];
  }

  // Handle Array of items
  if (Array.isArray(parsed)) {
    const results: TreatmentBeforeAfter[] = [];
    for (const item of parsed) {
      if (!item) continue;
      if (typeof item === 'string') {
        const formatted = formatGoogleDriveImageUrl(item) || item;
        if (formatted) {
          results.push({ before: formatted, after: formatted, label: 'Resultado do procedimento' });
        }
      } else if (typeof item === 'object') {
        const before =
          item.before ||
          item.beforeImage ||
          item.before_image ||
          item.antes ||
          item.foto_antes ||
          '';
        const after =
          item.after ||
          item.afterImage ||
          item.after_image ||
          item.depois ||
          item.foto_depois ||
          '';
        const label = item.label || item.titulo || 'Resultado do procedimento';

        if (before || after) {
          const formattedBefore = formatGoogleDriveImageUrl(before) || before || formatGoogleDriveImageUrl(after);
          const formattedAfter = formatGoogleDriveImageUrl(after) || after || formatGoogleDriveImageUrl(before);
          results.push({ before: formattedBefore, after: formattedAfter, label });
        }
      }
    }
    return results;
  }

  return [];
}

/**
 * Standardizes video embed URLs for Google Drive, YouTube, and Vimeo:
 * - Google Drive ID or link -> https://drive.google.com/file/d/ID/preview
 * - YouTube link or ID -> https://www.youtube.com/embed/ID
 * - Vimeo link -> https://player.vimeo.com/video/ID
 */
export function formatVideoEmbedUrl(input?: string | null): string {
  if (!input || typeof input !== 'string') return '';
  let clean = input.trim();
  if (!clean) return '';

  // Extract from iframe tag if pasted as <iframe src="...">
  const iframeMatch = clean.match(/src=["']?([^"'>\s]+)["']?/i);
  if (iframeMatch && iframeMatch[1]) {
    clean = iframeMatch[1].trim();
  }

  // 1. Google Drive Video
  const driveId = extractGoogleDriveId(clean);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }

  // 2. YouTube
  if (clean.includes('youtube.com/embed/')) return clean;
  if (clean.includes('youtube.com/watch?v=')) {
    const videoId = clean.split('watch?v=')[1]?.split('&')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  if (clean.includes('youtu.be/')) {
    const videoId = clean.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  // 3. Vimeo
  const vimeoMatch = clean.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return clean;
}

/**
 * Sanitizes treatment object before saving to state or database
 */
export function sanitizeTreatmentObject(treatment: Treatment): Treatment {
  const display = getSanitizedTreatmentDisplay(treatment);
  
  // Format main image if Google Drive ID or URL was provided
  const formattedImage = formatGoogleDriveImageUrl(treatment.image) || treatment.image || '';

  // Parse and format before/after images
  const formattedBeforeAfter = parseBeforeAfterImages(
    treatment.beforeAfterImages || (treatment as any).before_after_images || (treatment as any).beforeAfter
  );

  // Format video url
  const formattedVideo = formatVideoEmbedUrl(treatment.videoUrl) || treatment.videoUrl || '';

  return {
    ...treatment,
    image: formattedImage,
    beforeAfterImages: formattedBeforeAfter,
    videoUrl: formattedVideo,
    price: display.price || treatment.price || '',
    duration: display.duration || '45 min',
  };
}
