/**
 * Medição de visitas e conversões.
 *
 * - Vercel Analytics (componente <Analytics /> em main.tsx): visitas e origem, sem cookies.
 *   Ativar em Vercel → projeto → Analytics → Enable.
 * - Google Analytics 4: carregado só quando VITE_GA_MEASUREMENT_ID (ex.: G-XXXXXXXXXX) está definido
 *   nas variáveis de ambiente do Vercel. Registra também os eventos de conversão abaixo.
 */

const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: Record<string, string | number | undefined> = {}): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
}

/** Identifica cliques de conversão pelo destino do link */
function classifyLink(href: string): { event: string; params: Record<string, string> } | null {
  if (/wa\.me|api\.whatsapp\.com/i.test(href)) return { event: 'whatsapp_click', params: {} };
  if (href.startsWith('tel:')) return { event: 'phone_click', params: {} };
  if (href.startsWith('mailto:')) return { event: 'email_click', params: {} };
  if (/\/avaliar\/?$/.test(href) || /g\.page\/r\/.+\/review/.test(href)) return { event: 'review_click', params: {} };
  if (/google\.[^/]+\/maps/i.test(href)) return { event: 'directions_click', params: {} };
  if (/instagram\.com|facebook\.com/i.test(href)) return { event: 'social_click', params: { network: /instagram/i.test(href) ? 'instagram' : 'facebook' } };
  return null;
}

let initialized = false;

export function initAnalytics(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  if (GA_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(script);
  }

  // Um único ouvinte cobre todos os links de WhatsApp, telefone, mapa e avaliação do site,
  // inclusive os abertos via window.open nos botões (ver trackWhatsAppOpen)
  document.addEventListener(
    'click',
    (e) => {
      const anchor = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const match = classifyLink(anchor.href);
      if (match) trackEvent(match.event, { ...match.params, link_text: anchor.textContent?.trim().slice(0, 60) });
    },
    { capture: true }
  );
}

/** Para botões que abrem o WhatsApp com window.open (não são links <a>) */
export function trackWhatsAppOpen(label: string): void {
  trackEvent('whatsapp_click', { link_text: label });
}
