import de from './de';
import en from './en';
import es from './es';
import { withBase } from '../lib/url';
import type { Content } from './de';

export type { Content };
export const locales = ['de', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'de';

const dictionaries: Record<Locale, Content> = { de, en, es };

export function getContent(lang: string | undefined): Content {
  return dictionaries[(lang as Locale) ?? defaultLocale] ?? dictionaries[defaultLocale];
}

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Page slugs are shared across languages so the language switch can map 1:1. */
export type PageSlug = '' | 'expertise' | 'academy' | 'curriculum' | 'about' | 'team' | 'contact' | 'news' | 'legal';

export function href(lang: Locale, page: PageSlug = '', hash?: string): string {
  const path = withBase(`/${lang}/${page ? `${page}/` : ''}`);
  return hash ? `${path}#${hash}` : path;
}

export function staticLangPaths() {
  return locales.map((lang) => ({ params: { lang } }));
}

/** Swiss number formatting: 1'250 (apostrophe thousands separator). */
export function swissNumber(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '’');
}
