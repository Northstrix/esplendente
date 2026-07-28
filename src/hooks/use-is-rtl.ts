'use client';

import { useApp } from '@/context/AppContext';

/**
 * A client-side hook that determines if the current language
 * is right-to-left (e.g., Hebrew or Arabic).
 */
export function useIsRTL(): boolean {
  const { lang } = useApp();
  return lang === 'he' || lang === 'ar';
}