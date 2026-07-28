
export const supportedLocales = ['en', 'de', 'ar', 'he'] as const;
export type Locale = typeof supportedLocales[number];

type DictionaryModule = { default: Record<string, string> };

const dictionaries: Record<Locale, () => Promise<DictionaryModule>> = {
  en: () => import('@/lib/locales/en.json'),
  de: () => import('@/lib/locales/de.json'),
  ar: () => import('@/lib/locales/ar.json'),
  he: () => import('@/lib/locales/he.json'),
};

export const getDictionary = async (locale: Locale): Promise<Record<string, string>> => {
  const dictionaryModule = await dictionaries[locale]();
  return dictionaryModule.default;
};

// This is a helper type to get strong typing for dictionary keys
// It's generated from the English dictionary as the source of truth
import enDict from './locales/en.json';
export type TranslationKey = keyof typeof enDict;
export type Dictionary = typeof enDict;
