'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import locales from './locales.json'

type Locale = 'en' | 'hi'

const I18nContext = createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}>({ locale: 'en', setLocale: () => {}, t: (k) => k })

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) || path
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start with 'en' on both server and client to avoid hydration mismatch.
  // Read localStorage only after mount via useEffect.
  const [locale, setLocale] = useState<Locale>('en')

  // Restore saved locale from localStorage after mount (post-hydration)
  useEffect(() => {
    const stored = localStorage.getItem('marvvn-locale') as Locale
    if (stored && (stored === 'en' || stored === 'hi')) setLocale(stored)
  }, [])

  const handleSetLocale = useCallback((l: Locale) => {
    setLocale(l)
    localStorage.setItem('marvvn-locale', l)
    document.documentElement.lang = l
  }, [])

  const t = useCallback((key: string) => {
    const translations = locales[locale] || locales.en
    return getNestedValue(translations, key)
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
