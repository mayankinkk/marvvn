'use client'

import { useI18n } from '@/lib/i18n'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === 'en' ? 'hi' : 'en')}
      className="flex items-center gap-1 text-xs font-medium hover:text-marvvn-black transition-colors cursor-pointer"
      title={locale === 'en' ? 'Switch to Hindi' : 'Switch to English'}
    >
      <Globe className="w-3.5 h-3.5" />
      {locale === 'en' ? 'हिंदी' : 'EN'}
    </button>
  )
}
