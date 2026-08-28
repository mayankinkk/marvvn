'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
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
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('marvvn-locale') as Locale) || 'en'
    }
    return 'en'
  })

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
