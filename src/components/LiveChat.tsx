'use client'

import { useEffect } from 'react'
import { useSettings } from '@/components/SettingsProvider'

export default function LiveChat() {
  const settings = useSettings()
  const tawkId = settings.tawk_to_id

  useEffect(() => {
    if (!tawkId) return

    const script = document.createElement('script')
    script.async = true
    script.src = `https://embed.tawk.to/${tawkId}`
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [tawkId])

  return null
}
