/* Minimal i18n for MicoPay Rentas.
   Spanish strings are the keys; English is the default language and the
   fallback for any key without a translation.
   Language precedence: ?lang= (URL) > localStorage > English.
   ?lang= always wins, even when localStorage is unavailable (denied storage). */

export type Lang = 'es' | 'en';

const KEY = 'rentas.lang';

export const EN: Record<string, string> = {};

/** Read localStorage without throwing (private mode / denied storage). */
function readStored(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function writeStored(v: Lang): void {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* storage denied: the choice lasts for this page only */
  }
}

/** Resolve the initial language. ?lang= wins regardless of storage state. */
export function initialLang(search: string = typeof location !== 'undefined' ? location.search : ''): Lang {
  const q = new URLSearchParams(search).get('lang');
  if (q === 'es' || q === 'en') return q;
  return readStored() === 'es' ? 'es' : 'en';
}

let current: Lang = initialLang();
const listeners = new Set<() => void>();

export const getLang = (): Lang => current;

export function setLang(l: Lang): void {
  current = l;
  writeStored(l);
  listeners.forEach((fn) => fn());
}

export function onLangChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Translate a Spanish key. English default: returns the key when lang is 'en'
   and no English entry exists; `EN` holds the English text for each key. */
export function t(key: string, vars?: Record<string, string | number>): string {
  let s = current === 'en' ? (EN[key] ?? key) : key;
  if (vars) {
    s = s.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m));
  }
  return s;
}

/** Local message for unknown API errors (never shows the raw server text). */
export const genericError = (): string =>
  t('Algo salió mal. Inténtalo de nuevo.');
