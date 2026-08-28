'use client'

import { useSettings } from '@/components/SettingsProvider'
import { formatPrice } from '@/lib/utils'

export function useCurrency() {
  const settings = useSettings()
  const symbol = settings.currency_symbol || '₹'
  const code = settings.currency || 'INR'

  const format = (amount: number) => {
    return formatPrice(amount, code, symbol)
  }

  const formatRaw = (amount: number) => {
    return amount.toLocaleString('en-IN')
  }

  return { symbol, code, format, formatRaw }
}
