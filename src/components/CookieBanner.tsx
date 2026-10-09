import { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import {
  CookieConsent,
  OPEN_COOKIE_PREFERENCES_EVENT,
  getCookieConsent,
  setCookieConsent,
} from '../lib/analytics';

/**
 * Aviso de cookies (LGPD). Aparece até a visitante escolher; a escolha fica salva no navegador
 * e pode ser alterada pelo link "Privacidade e cookies" do rodapé.
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(() => getCookieConsent() === null);
  const [current, setCurrent] = useState<CookieConsent | null>(() => getCookieConsent());

  useEffect(() => {
    const open = () => {
      setCurrent(getCookieConsent());
      setVisible(true);
    };
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, open);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, open);
  }, []);

  if (!visible) return null;

  const choose = (consent: CookieConsent) => {
    setCookieConsent(consent);
    setCurrent(consent);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-4 bottom-4 z-[45] mx-auto max-w-3xl rounded-3xl border border-outline-variant/30 bg-white p-5 shadow-2xl sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="text-sm leading-relaxed text-on-surface-variant">
            <p className="font-semibold text-on-surface">Sua privacidade é importante para nós</p>
            <p>
              Usamos cookies do Google Analytics para entender como o site é usado e melhorar seu atendimento.
              Não usamos cookies de anúncios. Você pode aceitar ou recusar, e mudar de ideia quando quiser em
              "Privacidade e cookies", no rodapé.
            </p>
            {current && (
              <p className="mt-1 text-xs">
                Sua escolha atual: <strong>{current === 'granted' ? 'cookies aceitos' : 'cookies recusados'}</strong>.
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 sm:flex-col">
          <button
            onClick={() => choose('granted')}
            className="primary-gradient flex-1 cursor-pointer rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90"
          >
            Aceitar
          </button>
          <button
            onClick={() => choose('denied')}
            className="flex-1 cursor-pointer rounded-full border-2 border-primary px-6 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white"
          >
            Recusar
          </button>
        </div>
      </div>
    </div>
  );
}
