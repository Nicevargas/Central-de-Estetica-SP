/**
 * Medição de visitas e conversões.
 *
 * - Vercel Analytics (componente <Analytics /> em main.tsx): visitas e origem, sem cookies.
 *   Ativar em Vercel → projeto → Analytics → Enable.
 * - Google Analytics 4 (propriedade "Central da Estética", ID G-F6JB9Z88VY). A variável
 *   VITE_GA_MEASUREMENT_ID, se definida no Vercel, substitui o ID padrão. Registra também os eventos de conversão abaixo.
 *   Cookies do GA só são gravados após a visitante aceitar o aviso (components/CookieBanner.tsx).
 * - Google Ads (conta 493-943-0997, tag AW-18571950133): cada clique para falar com a clínica no
 *   WhatsApp vira a conversão "Clique no WhatsApp (site)". Cookies de anúncios também dependem do aceite.
 */

const DEFAULT_GA_ID = 'G-F6JB9Z88VY';
const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || DEFAULT_GA_ID).trim();
const ADS_ID = 'AW-18571950133';
const WHATSAPP_CONVERSION = 'AW-18571950133/yLiICO3tuLcdELXw5ZdF';

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

/** Conversão do Google Ads: só conta conversa com a clínica, não o "compartilhar no WhatsApp" */
function trackWhatsAppConversion(): void {
  trackEvent('conversion', { send_to: WHATSAPP_CONVERSION });
}

/** wa.me/<número> abre conversa com a clínica; wa.me/?text= é só compartilhamento */
function isWhatsAppContact(href: string): boolean {
  return /wa\.me\/\d|api\.whatsapp\.com\/send\?(?:.*&)?phone=\d/i.test(href);
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

// =============================
// Consentimento de cookies (LGPD) — Modo de Consentimento do Google
// =============================
export type CookieConsent = 'granted' | 'denied';

// v2: o aceite passou a incluir a medição do Google Ads, então quem aceitou só a análise vê o aviso de novo
const CONSENT_KEY = 'central_cookie_consent_v2';
export const OPEN_COOKIE_PREFERENCES_EVENT = 'central:open-cookie-preferences';

export function getCookieConsent(): CookieConsent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

function consentState(consent: CookieConsent | null) {
  const granted = consent === 'granted' ? 'granted' : 'denied';
  // Medição de anúncios (Google Ads) segue a mesma escolha; anúncios personalizados (remarketing) ficam sempre negados
  return { analytics_storage: granted, ad_storage: granted, ad_user_data: granted, ad_personalization: 'denied' };
}

export function setCookieConsent(consent: CookieConsent): void {
  try {
    localStorage.setItem(CONSENT_KEY, consent);
  } catch {
    // navegador bloqueia armazenamento: a escolha vale só para esta visita
  }
  window.gtag?.('consent', 'update', consentState(consent));
}

/** Reabre o aviso de cookies (link "Privacidade e cookies" do rodapé) */
export function openCookiePreferences(): void {
  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
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
    // Antes de aceitar, o GA não grava cookies (envia apenas sinais anônimos, sem identificador)
    window.gtag('consent', 'default', consentState(getCookieConsent()));
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    window.gtag('config', ADS_ID);
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
      if (match?.event === 'whatsapp_click' && isWhatsAppContact(anchor.href)) trackWhatsAppConversion();
    },
    { capture: true }
  );
}

/** Para botões que abrem o WhatsApp com window.open (não são links <a>) */
export function trackWhatsAppOpen(label: string): void {
  trackEvent('whatsapp_click', { link_text: label });
  trackWhatsAppConversion();
}
